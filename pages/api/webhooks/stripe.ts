import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import { updateUserInfo } from "@/utils/api/db/updateUser";

const endpointSecret = process.env.STRIPE_WEBHOOK as string; // YOUR ENDPOINT SECRET copied from the Stripe CLI start-up earlier, should look like 'whsec_xyz123...'

export const config = {
  api: {
    bodyParser: false, // don't parse body of incoming requests because we need it raw to verify signature
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("event.type");
    const requestBuffer = await buffer(req);
    const sig = req.headers["stripe-signature"] as string;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2022-11-15",
    });

    let event;

    try {
      // Use the Stripe SDK and request info to verify this Webhook request actually came from Stripe
      event = stripe.webhooks.constructEvent(
        requestBuffer.toString(), // Stringify the request for the Stripe library
        sig,
        endpointSecret
      );
    } catch (err: any) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook signature verification failed.`);
    }

    // Handle the event
    switch (event.type) {
      // Handle successful subscription creation
      case "customer.subscription.created": 
      case "invoice.payment_succeeded": {
        const subscription = event.data.object as Stripe.Subscription;

        const bodyN = {
          isActive: true,
          planId: subscription.items.data[0].plan.id,
          planProduct: subscription.items.data[0].plan.product as string,
        };

        await updateUserInfo(
          bodyN,
          "stripeCustomerId",
          "==",
          subscription.customer as string
        );

        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.resumed": {
        const subscription = event.data.object as Stripe.Subscription;

        const bodyN = {
          isActive: true,
          planId: subscription.items.data[0].plan.id,
          planProduct: subscription.items.data[0].plan.product as string,
        };

        await updateUserInfo(
          bodyN,
          "stripeCustomerId",
          "==",
          subscription.customer as string
        );

        break;
      }
      case "customer.subscription.deleted":
      case "invoice.payment_failed":
      case "customer.subscription.paused": {
        const subscription = event.data.object as Stripe.Subscription;

        const bodyN = {
          isActive: false,
          planId: null,
          planProduct: null,
        };

        await updateUserInfo(
          bodyN,
          "stripeCustomerId",
          "==",
          subscription.customer as string
        );

        break;
      }
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (err) {
    // Return a 500 error
    console.log(err);
    res.status(500).end();
  }
}