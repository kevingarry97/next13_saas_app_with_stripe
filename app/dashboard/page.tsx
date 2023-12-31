import React from "react";
import {
  createCheckoutLink,
  createCustomerIfNull,
  getLogs,
  getUser,
  hasSubscription,
  stripe,
} from "@/lib/stripe";
import Link from "next/link";

const DashboardPage = async () => {
  const customer = await createCustomerIfNull();
  const hasSub = await hasSubscription();
  const checkoutLink = await createCheckoutLink(String(customer));
  const user = await getUser();
  const logs = await getLogs(user._id as string);

  let current_usage = 0;

  if (hasSub) {
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id as string,
    });

    const invoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscriptions.data.at(0)?.id,
    });

    current_usage = invoice.amount_due;
  }

  return (
    <main>
      {hasSub ? (
        <>
          <div className="flex flex-col gap-4">
            <p className="rounded px-4 py-2 bg-emerald-400 font-medium text-white">
              You have a subscription!
            </p>
            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4 font-medium">
                Current Usage
              </p>
              <p className="text-sm font-mono text-zinc-500 px-6 py-4">
                {current_usage / 100}
              </p>
            </div>
            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4 font-medium">
                API Key
              </p>
              <p className="text-sm font-mono text-zinc-500 px-6 py-4">
                {user?.api_key}
              </p>
            </div>
            <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-md">
              <p className="text-sm text-black px-6 py-4 font-medium">
                Log Events
              </p>

              {logs.map((item, index) => (
                <div className="flex items-center gap-4" key={index}>
                  <p className="text-sm font-mono text-zinc-500 px-6 py-4">
                    {item.method}
                  </p>
                  <p className="text-sm font-mono text-zinc-500 px-6 py-4">
                    {item.status}
                  </p>
                  <p className="text-sm font-mono text-zinc-500 px-6 py-4">
                    {item.created.toDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="min-h-[60vh] grid place-items-center rounded-lg px-6 py-10 bg-slate-100">
          <Link
            href={checkoutLink as string}
            className="font-medium text-base hover:underline"
          >
            You have no subscription, checkout now
          </Link>
        </div>
      )}
    </main>
  );
};

export default DashboardPage;
