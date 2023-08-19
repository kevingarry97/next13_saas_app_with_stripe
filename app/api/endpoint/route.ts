import { stripe } from "@/lib/stripe";
import Log from "@/models/log";
import Users from "@/models/user";
import { randomUUID } from "crypto";
import { NextApiResponse } from "next";

export const GET = async (req: Request, res: NextApiResponse) => {
  const url = new URL(req.url);

  const api_key = url.searchParams.get("api_key");

  if (!api_key)
    return new Response(
      JSON.stringify({ error: "Must have a valid API Key" }),
      { status: 401 }
    );

  const user = await Users.findOne({ api_key });

  if (!user)
    return new Response(JSON.stringify({ error: "No User with the API Key" }), {
      status: 401,
    });

  await stripe.customers.retrieve(user.stripe_customer_id as string);

  const subscriptions = await stripe.subscriptions.list({
    customer: user.stripe_customer_id as string,
  });

  const item = subscriptions.data.at(0)?.items.data.at(0);

  if (!item)
    return new Response(JSON.stringify({ error: "You have no Subscription" }), {
      status: 403,
    });

  await stripe.subscriptionItems.createUsageRecord(item.id, {
    quantity: 1,
  });

  const data = randomUUID();

  const log = new Log({
    userId: user._id,
    status: 200,
    method: "GET",
  });

  await log.save();

  return new Response(JSON.stringify({ special_key: data, log }), {
    status: 200,
  });
};
