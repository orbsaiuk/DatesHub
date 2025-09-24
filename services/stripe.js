import { stripe } from "@/lib/stripe";
import {
  getAllPlans,
  updatePlan,
  getPlanByStripePriceId,
  createSubscription,
  getSubscriptionByStripeId,
  updateSubscription,
  createPayment,
} from "@/services/sanity/subscriptions";

export async function createCustomer({ email, name, tenantType, tenantId }) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        tenantType,
        tenantId,
      },
    });
    return customer;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw error;
  }
}

// Create or retrieve customer
export async function getOrCreateCustomer({
  email,
  name,
  tenantType,
  tenantId,
}) {
  try {
    // First try to find existing customer by metadata
    const existingCustomers = await stripe.customers.list({
      limit: 1,
      email: email,
    });

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0];
      // Update metadata if needed
      if (customer.metadata.tenantId !== tenantId) {
        await stripe.customers.update(customer.id, {
          metadata: { tenantType, tenantId },
        });
      }
      return customer;
    }

    // Create new customer if not found
    return await createCustomer({ email, name, tenantType, tenantId });
  } catch (error) {
    console.error("Error getting/creating customer:", error);
    throw error;
  }
}

// Create products and prices in Stripe based on Sanity plans
export async function syncPlansToStripe() {
  try {
    const plans = await getAllPlans();

    for (const plan of plans) {
      // Create or update product
      let product;
      if (plan.stripeProductId) {
        try {
          product = await stripe.products.retrieve(plan.stripeProductId);
          // Update product if needed
          await stripe.products.update(plan.stripeProductId, {
            name: plan.name,
            description: plan.description,
            metadata: { sanityPlanId: plan._id },
          });
        } catch (error) {
          if (error.code === "resource_missing") {
            product = null;
          } else {
            throw error;
          }
        }
      }

      if (!product) {
        product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: { sanityPlanId: plan._id },
        });

        // Update Sanity plan with Stripe product ID
        await updatePlan(plan._id, {
          stripeProductId: product.id,
        });
      }

      // Create or update price
      if (!plan.stripePriceId && plan.price?.amount > 0) {
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(plan.price.amount * 100), // Convert to cents
          currency: plan.price.currency || "usd",
          recurring:
            plan.price.interval !== "one_time"
              ? {
                  interval: plan.price.interval,
                }
              : undefined,
          metadata: { sanityPlanId: plan._id },
        });

        // Update Sanity plan with Stripe price ID
        await updatePlan(plan._id, {
          stripePriceId: price.id,
        });
      }
    }

    console.log("Successfully synced plans to Stripe");
  } catch (error) {
    console.error("Error syncing plans to Stripe:", error);
    throw error;
  }
}

// Create checkout session for subscription
export async function createCheckoutSession({
  priceId,
  customerId,
  tenantType,
  tenantId,
  tenantName,
  successUrl,
  cancelUrl,
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantType,
        tenantId,
        tenantName,
      },
      subscription_data: {
        metadata: {
          tenantType,
          tenantId,
          tenantName,
        },
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

// Create billing portal session
export async function createBillingPortalSession(customerId, returnUrl) {
  try {
    // First, try to create the session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  } catch (error) {
    // If no configuration exists, create a default one
    if (
      error.code === "invalid_request_error" &&
      error.message.includes("No configuration provided")
    ) {
      console.log("Creating default billing portal configuration...");

      // Create a default configuration
      const configuration = await stripe.billingPortal.configurations.create({
        business_profile: {
          headline: "Manage your subscription and billing details",
        },
        features: {
          payment_method_update: { enabled: true },
          invoice_history: { enabled: true },
          customer_update: {
            enabled: true,
            allowed_updates: ["email", "address"],
          },
          subscription_cancel: { enabled: true },
        },
      });

      console.log("Default configuration created:", configuration.id);

      // Now create the session with the new configuration
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
        configuration: configuration.id,
      });

      return session;
    }

    console.error("Error creating billing portal session:", error);
    throw error;
  }
}

// Handle webhook events
export async function handleWebhook(event) {
  try {
    console.log(`[Stripe Webhook] Handling event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed":
        console.log("[Stripe Webhook] Processing checkout.session.completed");
        await handleCheckoutCompleted(event.data.object);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        console.log(`[Stripe Webhook] Processing ${event.type}`);
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        console.log(
          "[Stripe Webhook] Processing customer.subscription.deleted"
        );
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        console.log("[Stripe Webhook] Processing invoice.payment_succeeded");
        await handlePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        console.log("[Stripe Webhook] Processing invoice.payment_failed");
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        break;
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    throw error;
  }
}

// Handle checkout completed
export async function handleCheckoutCompleted(session) {
  console.log(
    "[Stripe] Processing checkout completed for session:",
    session.id
  );

  let { tenantType, tenantId, tenantName } = session.metadata;
  console.log("[Stripe] Session metadata:", {
    tenantType,
    tenantId,
    tenantName,
  });

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription
  );
  console.log(
    "[Stripe] Retrieved subscription:",
    subscription.id,
    "status:",
    subscription.status
  );

  // Update or create subscription in Sanity
  const priceId = subscription.items.data[0].price.id;
  console.log("[Stripe] Price ID:", priceId);

  const plan = await getPlanByStripePriceId(priceId);
  console.log("[Stripe] Found plan:", plan?.name, "ID:", plan?._id);

  if (plan && plan.price.amount > 0) {
    const subscriptionData = {
      tenantType,
      tenantId,
      planId: plan._id,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: session.customer,
      status: subscription.status,
      endDate: new Date(subscription.current_period_end * 1000).toISOString(),
      tenantName,
    };

    console.log(
      "[Stripe] Creating/updating subscription with data:",
      subscriptionData
    );
    const result = await createSubscription(subscriptionData);
    console.log("[Stripe] Subscription created/updated:", result?._id);
  }
}

// Handle subscription updated
export async function handleSubscriptionUpdated(subscription) {
  console.log(
    "[Stripe] Processing subscription updated:",
    subscription.id,
    "status:",
    subscription.status
  );

  const { tenantType, tenantId, tenantName } = subscription.metadata;
  console.log("[Stripe] Subscription metadata:", {
    tenantType,
    tenantId,
    tenantName,
  });

  const existingSubscription = await getSubscriptionByStripeId(subscription.id);
  console.log(
    "[Stripe] Found existing subscription:",
    existingSubscription?._id
  );

  if (existingSubscription) {
    // Get the updated plan from the subscription
    const priceId = subscription.items.data[0].price.id;
    console.log("[Stripe] Price ID:", priceId);

    const plan = await getPlanByStripePriceId(priceId);
    console.log("[Stripe] Found plan:", plan?.name, "ID:", plan?._id);

    const updateData = {
      status: subscription.status,
      endDate: new Date(subscription.current_period_end * 1000).toISOString(),
      ...(tenantName && { tenantName }),
      ...(tenantType && { tenantType }),
      ...(tenantId && { tenantId }),
    };

    // Update plan reference if plan was found
    if (plan && plan._id) {
      updateData.plan = { _type: "reference", _ref: plan._id };
      console.log("[Stripe] Updating plan reference to:", plan._id);
    }

    console.log("[Stripe] Updating subscription with data:", updateData);
    const result = await updateSubscription(
      existingSubscription._id,
      updateData
    );
    console.log("[Stripe] Subscription updated successfully:", result?._id);
  }
}

// Handle subscription deleted
export async function handleSubscriptionDeleted(subscription) {
  const existingSubscription = await getSubscriptionByStripeId(subscription.id);
  if (existingSubscription) {
    await updateSubscription(existingSubscription._id, {
      status: "canceled",
      endDate: new Date().toISOString(),
    });
  }
}

// Handle payment succeeded
export async function handlePaymentSucceeded(invoice) {
  try {
    // Check if invoice has a subscription
    if (!invoice.subscription) {
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription
    );

    if (!subscription) {
      return;
    }

    const { tenantType, tenantId } = subscription.metadata || {};

    if (!tenantType || !tenantId) {
      return;
    }

    // Create payment record in Sanity
    const existingSubscription = await getSubscriptionByStripeId(
      subscription.id
    );
    if (existingSubscription) {
      await createPayment({
        subscription: { _type: "reference", _ref: existingSubscription._id },
        tenantType,
        tenantId,
        amount: {
          total: invoice.amount_paid / 100, // Convert from cents
          currency: invoice.currency,
          tax: (invoice.tax || 0) / 100,
          discount: (invoice.discount?.amount || 0) / 100,
        },
        status: "succeeded",
        stripePaymentId: invoice.payment_intent,
        stripeInvoiceId: invoice.id,
        transactionDate: new Date(invoice.created * 1000).toISOString(),
        paymentMethod: {
          type: "card",
        },
      });
    } else {
      // No subscription found in Sanity for this Stripe subscription
    }
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
    throw error;
  }
}

// Handle payment failed
export async function handlePaymentFailed(invoice) {
  try {
    // Check if invoice has a subscription
    if (!invoice.subscription) {
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription
    );

    if (!subscription) {
      return;
    }

    const { tenantType, tenantId } = subscription.metadata || {};

    if (!tenantType || !tenantId) {
      return;
    }

    // Update subscription status and create failed payment record
    const existingSubscription = await getSubscriptionByStripeId(
      subscription.id
    );
    if (existingSubscription) {
      await createPayment({
        subscription: { _type: "reference", _ref: existingSubscription._id },
        tenantType,
        tenantId,
        amount: {
          total: invoice.amount_due / 100, // Convert from cents
          currency: invoice.currency,
          tax: (invoice.tax || 0) / 100,
          discount: 0,
        },
        status: "failed",
        stripePaymentId: invoice.payment_intent,
        stripeInvoiceId: invoice.id,
        transactionDate: new Date(invoice.created * 1000).toISOString(),
        paymentMethod: {
          type: "card",
        },
        notes: "Payment failed - subscription may be at risk",
      });
    } else {
      // No subscription found in Sanity for this Stripe subscription
    }
  } catch (error) {
    console.error("Error handling payment failed:", error);
    throw error;
  }
}
