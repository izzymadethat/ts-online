export const pricingInformation = {
  monthly: [
    {
      plan: "professional",
      billingPeriod: "monthly",
      price: 1999,
      priceId: process.env.NEXT_TRAKSYNC_PRO_MONTHLY_PRICE_ID,
    },
    {
      plan: "enterprise",
      billingPeriod: "monthly",
      price: 3999,
      priceId: process.env.NEXT_TRAKSYNC_ENTERPRISE_MONTHLY_PRICE_ID,
    },
  ],

  yearly: [
    {
      plan: "professional",
      billingPeriod: "yearly",
      price: 19999,
      priceId: process.env.NEXT_TRAKSYNC_PRO_YEARLY_PRICE_ID,
    },

    {
      plan: "enterprise",
      billingPeriod: "yearly",
      price: 35999,
      priceId: process.env.NEXT_TRAKSYNC_ENTERPRISE_YEARLY_PRICE_ID,
    },
  ],
};
