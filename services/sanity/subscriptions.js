import { writeClient } from "@/sanity/lib/serverClient";
import { client as readClient } from "@/sanity/lib/client";
import {
  ALL_PLANS_QUERY,
  PLAN_BY_SLUG_QUERY,
  PLAN_BY_ID_QUERY,
  SUBSCRIPTION_BY_TENANT_QUERY,
  ALL_SUBSCRIPTIONS_BY_TENANT_QUERY,
  SUBSCRIPTION_BY_ID_QUERY,
  PAYMENTS_BY_SUBSCRIPTION_QUERY,
  PAYMENTS_BY_TENANT_QUERY,
  SUBSCRIPTION_USAGE_QUERY,
  PRICING_PLANS_QUERY,
} from "@/sanity/queries/subscriptions";

export async function getAllPlans() {
  try {
    return await readClient.fetch(ALL_PLANS_QUERY);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return [];
  }
}

export async function getPlanBySlug(slug) {
  try {
    return await readClient.fetch(PLAN_BY_SLUG_QUERY, { slug });
  } catch (error) {
    console.error("Error fetching plan by slug:", error);
    return null;
  }
}

export async function getPlanById(planId) {
  try {
    return await readClient.fetch(PLAN_BY_ID_QUERY, { planId });
  } catch (error) {
    console.error("Error fetching plan by ID:", error);
    return null;
  }
}

// Find a plan by its Stripe price ID
export async function getPlanByStripePriceId(priceId) {
  try {
    const query = `*[_type == "plan" && stripePriceId == $priceId][0]{
      _id,
      name,
      "slug": slug.current,
      description,
      price,
      features,
      limits,
      stripeProductId,
      stripePriceId
    }`;
    return await readClient.fetch(query, { priceId });
  } catch (error) {
    console.error("Error fetching plan by Stripe price ID:", error);
    return null;
  }
}

export async function getPricingPlans() {
  try {
    return await readClient.fetch(PRICING_PLANS_QUERY);
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return [];
  }
}

// Subscription methods
export async function getCurrentSubscription(tenantType, tenantId) {
  try {
    return await writeClient.fetch(SUBSCRIPTION_BY_TENANT_QUERY, {
      tenantType,
      tenantId,
    });
  } catch (error) {
    console.error("Error fetching current subscription:", error);
    return null;
  }
}

export async function getAllSubscriptions(tenantType, tenantId) {
  try {
    return await writeClient.fetch(ALL_SUBSCRIPTIONS_BY_TENANT_QUERY, {
      tenantType,
      tenantId,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }
}

export async function getSubscriptionById(subscriptionId) {
  try {
    return await writeClient.fetch(SUBSCRIPTION_BY_ID_QUERY, {
      subscriptionId,
    });
  } catch (error) {
    console.error("Error fetching subscription by ID:", error);
    return null;
  }
}

export async function createSubscription(subscriptionData) {
  try {
    // Derive tenantName if not provided
    let tenantName = subscriptionData.tenantName;

    // Resolve tenant reference
    let tenantRef = undefined;
    if (subscriptionData.tenantType && subscriptionData.tenantId) {
      const tenantDocId = await writeClient.fetch(
        `*[_type == $tenantType && tenantId == $tenantId][0]._id`,
        {
          tenantType: subscriptionData.tenantType,
          tenantId: subscriptionData.tenantId,
        }
      );
      if (tenantDocId) {
        tenantRef = { _type: "reference", _ref: tenantDocId };
      }
    }

    const subscription = await writeClient.create({
      _type: "subscription",
      ...subscriptionData,
      tenantName,
      tenant: tenantRef,
      startDate: subscriptionData.startDate || new Date().toISOString(),
      endDate: subscriptionData.endDate,
      usage: subscriptionData.usage || {
        blogPosts: 0,
      },
    });

    // Update the tenant's subscription reference
    await updateTenantSubscription(
      subscriptionData.tenantType,
      subscriptionData.tenantId,
      subscription._id
    );

    return subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

// Create or update a subscription record based on Stripe IDs
export async function createOrUpdateSubscription(data) {
  try {
    const {
      tenantType,
      tenantId,
      tenantName,
      planId,
      stripeSubscriptionId,
      stripeCustomerId,
      status,
      endDate,
    } = data;

    const existing = stripeSubscriptionId
      ? await getSubscriptionByStripeId(stripeSubscriptionId)
      : null;

    // Get tenant document reference
    let tenantRef = null;
    if (tenantType && tenantId) {
      try {
        const tenantDoc = await writeClient.fetch(
          `*[_type == $tenantType && tenantId == $tenantId][0]{_id}`,
          { tenantType, tenantId }
        );
        if (tenantDoc?._id) {
          tenantRef = { _type: "reference", _ref: tenantDoc._id };
        }
      } catch (error) {
        console.error(
          "[subscriptions] error fetching tenant doc for reference:",
          error
        );
      }
    }

    const baseFields = {
      tenantType,
      tenantId,
      tenantName,
      tenant: tenantRef,
      plan: planId ? { _type: "reference", _ref: planId } : undefined,
      status,
      endDate,
      stripeSubscriptionId,
      stripeCustomerId,
    };

    if (existing && existing._id) {
      return await updateSubscription(existing._id, baseFields);
    }

    const created = await writeClient.create({
      _type: "subscription",
      ...baseFields,
      startDate: new Date().toISOString(),
      usage: {
        blogPosts: 0,
      },
    });

    await updateTenantSubscription(tenantType, tenantId, created._id);

    return created;
  } catch (error) {
    console.error("Error creating/updating subscription:", error);
    throw error;
  }
}

export async function updateSubscription(subscriptionId, updates) {
  try {
    return await writeClient
      .patch(subscriptionId)
      .set({
        ...updates,
        _updatedAt: new Date().toISOString(),
      })
      .commit();
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
}

// Update plan document fields
export async function updatePlan(planId, updates) {
  try {
    return await writeClient
      .patch(planId)
      .set({
        ...updates,
        _updatedAt: new Date().toISOString(),
      })
      .commit();
  } catch (error) {
    console.error("Error updating plan:", error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId) {
  try {
    const updates = {
      status: "canceled",
      endDate: new Date().toISOString(),
    };

    return await updateSubscription(subscriptionId, updates);
  } catch (error) {
    console.error("Error canceling subscription:", error);
    throw error;
  }
}

// Usage tracking methods
export async function getSubscriptionUsage(tenantType, tenantId) {
  try {
    return await writeClient.fetch(SUBSCRIPTION_USAGE_QUERY, {
      tenantType,
      tenantId,
    });
  } catch (error) {
    console.error("Error fetching subscription usage:", error);
    return null;
  }
}

export async function updateUsage(tenantType, tenantId, usageUpdates) {
  try {
    const subscription = await getCurrentSubscription(tenantType, tenantId);
    if (!subscription) {
      throw new Error("No active subscription found");
    }

    const currentUsage = subscription.usage || {};
    const newUsage = { ...currentUsage, ...usageUpdates };

    return await updateSubscription(subscription._id, {
      usage: newUsage,
    });
  } catch (error) {
    console.error("Error updating usage:", error);
    throw error;
  }
}

export async function incrementUsage(
  tenantType,
  tenantId,
  usageType,
  increment = 1
) {
  try {
    const subscription = await getCurrentSubscription(tenantType, tenantId);
    if (!subscription) {
      throw new Error("No active subscription found");
    }

    const currentUsage = subscription.usage || {};
    const currentValue = currentUsage[usageType] || 0;
    const newUsage = {
      ...currentUsage,
      [usageType]: currentValue + increment,
    };

    return await updateSubscription(subscription._id, {
      usage: newUsage,
    });
  } catch (error) {
    console.error("Error incrementing usage:", error);
    throw error;
  }
}

export async function checkUsageLimit(tenantType, tenantId, usageType) {
  try {
    const subscription = await getCurrentSubscription(tenantType, tenantId);
    if (!subscription) {
      return { allowed: false, reason: "No active subscription" };
    }

    const limits = subscription.plan?.limits || {};
    const usage = subscription.usage || {};

    const limit = limits[usageType];
    const current = usage[usageType] || 0;

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, current, limit: "unlimited" };
    }

    const allowed = current < limit;
    return {
      allowed,
      current,
      limit,
      remaining: Math.max(0, limit - current),
    };
  } catch (error) {
    console.error("Error checking usage limit:", error);
    return { allowed: false, reason: "Error checking limits" };
  }
}

// Payment methods
export async function getPaymentsBySubscription(subscriptionId) {
  try {
    return await writeClient.fetch(PAYMENTS_BY_SUBSCRIPTION_QUERY, {
      subscriptionId,
    });
  } catch (error) {
    console.error("Error fetching payments by subscription:", error);
    return [];
  }
}

export async function getPaymentsByTenant(tenantType, tenantId) {
  try {
    return await writeClient.fetch(PAYMENTS_BY_TENANT_QUERY, {
      tenantType,
      tenantId,
    });
  } catch (error) {
    console.error("Error fetching payments by tenant:", error);
    return [];
  }
}

export async function createPayment(paymentData) {
  try {
    return await writeClient.create({
      _type: "payment",
      ...paymentData,
      transactionDate: paymentData.transactionDate || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

export async function updatePayment(paymentId, updates) {
  try {
    return await writeClient
      .patch(paymentId)
      .set({
        ...updates,
        _updatedAt: new Date().toISOString(),
      })
      .commit();
  } catch (error) {
    console.error("Error updating payment:", error);
    throw error;
  }
}

// Helper methods
export async function updateTenantSubscription(
  tenantType,
  tenantId,
  subscriptionId
) {
  try {
    // Find the tenant document
    const tenantQuery = `*[_type == "${tenantType}" && tenantId == $tenantId][0]._id`;
    const tenantDocId = await writeClient.fetch(tenantQuery, { tenantId });

    if (!tenantDocId) {
      throw new Error(`${tenantType} with tenantId ${tenantId} not found`);
    }

    // Update the tenant's subscription reference
    return await writeClient
      .patch(tenantDocId)
      .set({
        subscription: {
          _type: "reference",
          _ref: subscriptionId,
        },
      })
      .commit();
  } catch (error) {
    console.error("Error updating tenant subscription:", error);
    throw error;
  }
}

export async function formatPrice(amount, currency = "usd") {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
  return formatter.format(amount);
}

export async function formatUsagePercentage(current, limit) {
  if (limit === -1) return 0; // Unlimited
  return Math.min((current / limit) * 100, 100);
}

// Find a subscription by Stripe subscription ID
export async function getSubscriptionByStripeId(stripeSubscriptionId) {
  try {
    const query = `*[_type == "subscription" && stripeSubscriptionId == $stripeSubscriptionId][0]{
      _id,
      tenantType,
      tenantId,
      tenantName,
      status,
      endDate,
      stripeSubscriptionId,
      stripeCustomerId,
      plan->{ _id },
      usage
    }`;
    return await writeClient.fetch(query, { stripeSubscriptionId });
  } catch (error) {
    console.error("Error fetching subscription by Stripe ID:", error);
    return null;
  }
}
