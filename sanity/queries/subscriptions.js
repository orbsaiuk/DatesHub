// Plan queries
export const ALL_PLANS_QUERY = `
*[_type == "plan" && isActive == true] | order(order asc) {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  features,
  limits,
  isPopular,
  order,
  stripeProductId,
  stripePriceId
}
`;

export const PLAN_BY_SLUG_QUERY = `
*[_type == "plan" && slug.current == $slug && isActive == true][0] {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  features,
  limits,
  isPopular,
  stripeProductId,
  stripePriceId
}
`;

export const PLAN_BY_ID_QUERY = `
*[_type == "plan" && _id == $planId][0] {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  features,
  limits,
  isPopular,
  stripeProductId,
  stripePriceId
}
`;

// Subscription queries
export const SUBSCRIPTION_BY_TENANT_QUERY = `
*[_type == "subscription" && tenantType == $tenantType && tenantId == $tenantId && status == "active"] | order(_createdAt desc)[0] {
  _id,
  plan->{
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    features,
    limits
  },
  status,
  startDate,
  endDate,
  trialStart,
  trialEnd,
  usage,
  stripeSubscriptionId,
  stripeCustomerId
}
`;

export const ALL_SUBSCRIPTIONS_BY_TENANT_QUERY = `
*[_type == "subscription" && tenantType == $tenantType && tenantId == $tenantId] | order(_createdAt desc) {
  _id,
  plan->{
    _id,
    name,
    "slug": slug.current,
    price
  },
  status,
  startDate,
  endDate,
  usage,
  _createdAt
}
`;

export const SUBSCRIPTION_BY_ID_QUERY = `
*[_type == "subscription" && _id == $subscriptionId][0] {
  _id,
  tenantType,
  tenantId,
  tenant->{
    _id,
    name,
    tenantId
  },
  plan->{
    _id,
    name,
    "slug": slug.current,
    description,
    price,
    features,
    limits
  },
  status,
  startDate,
  endDate,
  trialStart,
  trialEnd,
  usage,
  stripeSubscriptionId,
  stripeCustomerId,
  metadata
}
`;

// Payment queries
export const PAYMENTS_BY_SUBSCRIPTION_QUERY = `
*[_type == "payment" && subscription._ref == $subscriptionId] | order(transactionDate desc) {
  _id,
  amount,
  status,
  paymentMethod,
  transactionDate,
  periodCovered,
  invoice,
  refund
}
`;

export const PAYMENTS_BY_TENANT_QUERY = `
*[_type == "payment" && tenantType == $tenantType && tenantId == $tenantId] | order(transactionDate desc) {
  _id,
  subscription->{
    _id,
    plan->{
      name
    }
  },
  amount,
  status,
  paymentMethod,
  transactionDate,
  periodCovered,
  invoice,
  refund
}
`;

export const PAYMENT_BY_ID_QUERY = `
*[_type == "payment" && _id == $paymentId][0] {
  _id,
  subscription->{
    _id,
    tenantType,
    tenantId,
    plan->{
      name,
      price
    }
  },
  amount,
  status,
  paymentMethod,
  transactionDate,
  periodCovered,
  stripePaymentIntentId,
  stripeChargeId,
  invoice,
  refund,
  notes
}
`;

// Usage and limits checking
export const SUBSCRIPTION_USAGE_QUERY = `
*[_type == "subscription" && tenantType == $tenantType && tenantId == $tenantId && status == "active"][0] {
  _id,
  plan->{
    limits
  },
  usage,
  status
}
`;

// Active plans for pricing page
export const PRICING_PLANS_QUERY = `
*[_type == "plan" && isActive == true] | order(order asc) {
  _id,
  name,
  "slug": slug.current,
  description,
  price {
    amount,
    currency,
    interval
  },
  features[] {
    name,
    description,
    included,
    limit
  },
  limits,
  isPopular,
  order
}
`;
