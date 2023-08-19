import React from "react";
import {
  createCheckoutLink,
  createCustomerIfNull,
  hasSubscription,
} from "@/lib/stripe";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const customer = await createCustomerIfNull();

  await hasSubscription();
  await createCheckoutLink(customer as string);

  return <div className="max-w-5xl m-auto w-full px-4">{children}</div>;
};

export default DashboardLayout;
