import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Log from "@/models/log";
import Users from "@/models/user";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
});

export async function hasSubscription() {
  const session = await getServerSession(authOptions);

  if (session) {
    const user = await Users.findOne({ email: session.user?.email });

    const subscriptions = await stripe.subscriptions.list({
      customer: user?.stripe_customer_id as string,
    });

    return subscriptions.data.length > 0;
  }

  return false;
}

export async function createCheckoutLink(customer: string) {
  const checkout = await stripe.checkout.sessions.create({
    success_url: "http://localhost:3000/dashboard/billing?success=true",
    cancel_url: "http://localhost:3000/dashboard/billing?success=true",
    customer,
    line_items: [
      {
        price: "price_1Ng6dlCJsh0jI35fk1ik4mq0",
      },
    ],
    mode: "subscription",
  });

  return checkout.url;
}

export async function getUser() {
  const session = await getServerSession(authOptions);

  if (session) {
    const user = await Users.findOne({ email: session.user?.email });

    return user;
  }

  return false;
}

export async function getLogs(id: string) {
  const logs = await Log.find({ userId: id });

  return logs;
}

export async function createCustomerIfNull() {
  const session = await getServerSession(authOptions);

  if (session) {
    const user = await Users.findOne({ email: session.user?.email });

    if (!user?.api_key) {
      await Users.findOneAndUpdate(
        {
          email: user?.email,
        },
        {
          api_key: "secret_" + randomUUID(),
        },
        { new: true, upsert: true }
      );
    }
    if (!user?.stripe_customer_id) {
      const customer = await stripe.customers.create({
        email: String(user?.email),
      });

      await Users.findOneAndUpdate(
        {
          _id: user?._id,
        },
        {
          stripe_customer_id: customer.id,
        },
        { new: true, upsert: true }
      );
    }
    const user2 = await Users.findOne({ email: session.user?.email });
    return user2?.stripe_customer_id;
  }
}
