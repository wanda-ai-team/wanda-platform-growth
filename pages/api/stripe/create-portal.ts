import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Stripe from "stripe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2022-11-15",
  });

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

  const sessionStripe = await stripe.billingPortal.sessions.create({
    customer: session.user.stripeCustomerId,
    return_url: process.env.ENV_URL as string + '/documentGeneration/repo',
  });


  if (!sessionStripe.url) {
    return res.status(500).json({
      cpde: "stripe-error",
      error: "Could not create checkout session",
    });
  }

  // Return the newly-created checkoutSession URL and let the frontend render it
  return res.status(200).json({ redirectUrl: sessionStripe.url });
}