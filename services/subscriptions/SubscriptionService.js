import { writeClient } from "@/sanity/lib/serverClient";
import { client as readClient } from "@/sanity/lib/client";
import {
  ALL_PLANS_QUERY,
  PLAN_BY_ID_QUERY,
  SUBSCRIPTION_BY_TENANT_QUERY,
  SUBSCRIPTION_BY_ID_QUERY,
  SUBSCRIPTION_USAGE_QUERY,
  PRICING_PLANS_QUERY,
} from "@/sanity/queries/subscriptions";

/**
 * SubscriptionService - Centralized service for subscription management
 * Follows clean code principles with single responsibility and proper error handling
 */
class SubscriptionService {
  // Plan Methods
  async getAllPlans() {
    try {
      return await readClient.fetch(ALL_PLANS_QUERY);
    } catch (error) {
      this._logError("Error fetching all plans", error);
      return [];
    }
  }

  async getPlanById(planId) {
    this._validateRequired({ planId });

    try {
      return await readClient.fetch(PLAN_BY_ID_QUERY, { planId });
    } catch (error) {
      this._logError(`Error fetching plan ${planId}`, error);
      return null;
    }
  }

  async getPlanByStripePriceId(priceId) {
    this._validateRequired({ priceId });

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
      this._logError(
        `Error fetching plan by Stripe price ID ${priceId}`,
        error
      );
      return null;
    }
  }

  async getPricingPlans() {
    try {
      return await readClient.fetch(PRICING_PLANS_QUERY);
    } catch (error) {
      this._logError("Error fetching pricing plans", error);
      return [];
    }
  }

  // Subscription Methods
  async getCurrentSubscription(tenantType, tenantId) {
    this._validateRequired({ tenantType, tenantId });

    try {
      return await writeClient.fetch(SUBSCRIPTION_BY_TENANT_QUERY, {
        tenantType,
        tenantId,
      });
    } catch (error) {
      this._logError(
        `Error fetching subscription for ${tenantType}:${tenantId}`,
        error
      );
      return null;
    }
  }

  async getSubscriptionById(subscriptionId) {
    this._validateRequired({ subscriptionId });

    try {
      return await writeClient.fetch(SUBSCRIPTION_BY_ID_QUERY, {
        subscriptionId,
      });
    } catch (error) {
      this._logError(`Error fetching subscription ${subscriptionId}`, error);
      return null;
    }
  }

  async createOrUpdateSubscription(data) {
    this._validateRequired({
      tenantType: data.tenantType,
      tenantId: data.tenantId,
      planId: data.planId,
    });

    try {
      const existing = data.stripeSubscriptionId
        ? await this._getSubscriptionByStripeId(data.stripeSubscriptionId)
        : null;

      const tenantRef = await this._getTenantReference(
        data.tenantType,
        data.tenantId
      );

      const subscriptionData = {
        tenantType: data.tenantType,
        tenantId: data.tenantId,
        tenantName:
          data.tenantName ||
          (await this._getTenantName(data.tenantType, data.tenantId)),
        tenant: tenantRef,
        plan: { _type: "reference", _ref: data.planId },
        status: data.status || "active",
        stripeSubscriptionId: data.stripeSubscriptionId,
        stripeCustomerId: data.stripeCustomerId,
      };

      // Only set endDate if explicitly provided (e.g., from Stripe webhook)
      if (data.endDate) {
        subscriptionData.endDate = data.endDate;
      }

      if (existing) {
        return await this._updateSubscription(existing._id, subscriptionData);
      }

      return await this._createSubscription({
        ...subscriptionData,
        startDate: new Date().toISOString(),
        usage: { blogPosts: 0 },
      });
    } catch (error) {
      this._logError("Error creating/updating subscription", error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId) {
    this._validateRequired({ subscriptionId });

    try {
      return await this._updateSubscription(subscriptionId, {
        status: "canceled",
        endDate: new Date().toISOString(),
      });
    } catch (error) {
      this._logError(`Error canceling subscription ${subscriptionId}`, error);
      throw error;
    }
  }

  async getSubscriptionUsage(tenantType, tenantId) {
    this._validateRequired({ tenantType, tenantId });

    try {
      return await writeClient.fetch(SUBSCRIPTION_USAGE_QUERY, {
        tenantType,
        tenantId,
      });
    } catch (error) {
      this._logError(
        `Error fetching usage for ${tenantType}:${tenantId}`,
        error
      );
      return null;
    }
  }

  async checkUsageLimit(tenantType, tenantId, usageType) {
    const subscription = await this.getSubscriptionUsage(tenantType, tenantId);

    if (!subscription) {
      return { canUse: false, usage: 0, limit: 0 };
    }

    const limit = subscription.plan?.limits?.[usageType] || 0;
    const usage = subscription.usage?.[usageType] || 0;

    return {
      canUse: limit === -1 || usage < limit, // -1 means unlimited
      usage,
      limit,
      remaining: limit === -1 ? -1 : Math.max(0, limit - usage),
    };
  }

  // Private helper methods
  async _createSubscription(subscriptionData) {
    const subscription = await writeClient.create({
      _type: "subscription",
      ...subscriptionData,
    });

    await this._updateTenantSubscription(
      subscriptionData.tenantType,
      subscriptionData.tenantId,
      subscription._id
    );

    return subscription;
  }

  async _updateSubscription(subscriptionId, updates) {
    return await writeClient
      .patch(subscriptionId)
      .set({
        ...updates,
        _updatedAt: new Date().toISOString(),
      })
      .commit();
  }

  async _getTenantReference(tenantType, tenantId) {
    try {
      const tenantDoc = await writeClient.fetch(
        `*[_type == $tenantType && tenantId == $tenantId][0]{_id}`,
        { tenantType, tenantId }
      );

      return tenantDoc?._id
        ? { _type: "reference", _ref: tenantDoc._id }
        : null;
    } catch (error) {
      this._logError("Error fetching tenant reference", error);
      return null;
    }
  }

  async _getTenantName(tenantType, tenantId) {
    try {
      const tenant = await writeClient.fetch(
        `*[_type == $tenantType && tenantId == $tenantId][0]{name}`,
        { tenantType, tenantId }
      );
      return tenant?.name || null;
    } catch (error) {
      this._logError("Error fetching tenant name", error);
      return null;
    }
  }

  async _getSubscriptionByStripeId(stripeSubscriptionId) {
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
      this._logError("Error fetching subscription by Stripe ID", error);
      return null;
    }
  }

  async _updateTenantSubscription(tenantType, tenantId, subscriptionId) {
    try {
      const updateQuery = `*[_type == "${tenantType}" && tenantId == $tenantId][0]`;
      const tenant = await writeClient.fetch(updateQuery, { tenantId });

      if (tenant) {
        await writeClient
          .patch(tenant._id)
          .set({
            currentSubscription: {
              _type: "reference",
              _ref: subscriptionId,
            },
          })
          .commit();
      }
    } catch (error) {
      this._logError("Error updating tenant subscription reference", error);
    }
  }

  _validateRequired(fields) {
    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
        throw new Error(`${key} is required`);
      }
    }
  }

  _logError(message, error) {
    console.error(`[SubscriptionService] ${message}:`, error);
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
export default subscriptionService;
