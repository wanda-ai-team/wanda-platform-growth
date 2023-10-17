import getDBEntry from "@/utils/api/db/getDBEntry";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Stripe from "stripe";

const productIdS = [
  {
    name: "Pro-Month",
    productId: process.env.STRIPE_PRODUCT_ID_PRO_MONTH as string,
    mode: "subscription",
  },
  {
    name: "Pro-Year",
    productId: process.env.STRIPE_PRODUCT_ID_PRO_YEAR as string,
    mode: "subscription",
  },
  {
    name: "3-Year",
    productId: process.env.STRIPE_PRODUCT_ID_PRO_MONTH as string,
    mode: "payment",
  },
];



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2022-11-15",
  });

  console.log("event.type");
  console.log(req.query);

  // This object will contain the user's data if the user is signed in
  const session = await getSession({ req });
  // Error handling
  if (!session?.user) {
    return res.status(401).json({
      error: {
        code: "no-access",
        message: "You are not signed in.",
      },
    });
  }
  let user = null;
  if (!session?.user.stripeCustomerId) {
    user = await getDBEntry("users", ["email"], ["=="], [session.user.email], 1);
    session.user.stripeCustomerId = user[0].data.stripeCustomerId;
  }

  const productId = <string>req.query.productId;
  if (
    productId === undefined ||
    productIdS.filter((product) => product.name === productId).length === 0
  ) {
    return res.status(400).end();
  }

  let subscription_data;

  if (
    productIdS.filter((product) => product.name === productId)[0].mode ===
    "subscription"
  ) {
    subscription_data = {
      metadata: {
        // This isn't 100% required, but it helps to have so that we can manually check in Stripe for whether a customer has an active subscription later, or if our webhook integration breaks.
        payingUserId: session.user.id,
      },
      trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
      trial_period_days: 14,
    };
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode:
      productIdS.filter((product) => product.name === productId)[0].mode ===
        "subscription"
        ? "subscription"
        : "payment",
    /* This is where the magic happens - this line will automatically link this Checkout page to the existing customer we created when the user signed-up, so that when the webhook is called our database can automatically be updated correctly.*/
    customer: session.user.stripeCustomerId,
    line_items: [
      {
        price: productIdS.filter((product) => product.name === productId)[0]
          .productId, // THE PRICE ID YOU CREATED EARLIER,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    // {CHECKOUT_SESSION_ID} is a string literal which the Stripe SDK will replace; do not manually change it or replace it with a variable!
    success_url:
      (process.env.ENV_URL as string) + `/stripeSession/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: (process.env.ENV_URL as string) + "/payment",
    subscription_data: subscription_data as any,
    payment_method_collection:
      productIdS.filter((product) => product.name === productId)[0].mode ===
        "subscription"
        ? "if_required"
        : "always",
  });

  if (!checkoutSession.url) {
    return res.status(500).json({
      cpde: "stripe-error",
      error: "Could not create checkout session",
    });
  }

  // Return the newly-created checkoutSession URL and let the frontend render it
  return res.status(200).json({ redirectUrl: checkoutSession.url });
}