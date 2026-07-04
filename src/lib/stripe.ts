import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not set. Payment routes (checkout, refund, webhook) cannot function without it — add it to .env.local (or the deployment's environment variables).",
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
