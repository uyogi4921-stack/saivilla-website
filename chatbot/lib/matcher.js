import properties from '@/data/properties.json';

// Budget ranges keyed by chip id. Sale values in lakhs, rent in ₹/month.
// Project pricing is "Contact for Pricing", so budget is captured for the
// sales team (logged with bookings/handoffs) rather than used as a hard filter.
export const BUY_BUDGETS = {
  under50: { label: 'Under ₹50 Lakh', min: 0, max: 50 },
  '50to100': { label: '₹50L – ₹1 Cr', min: 50, max: 100 },
  '100to200': { label: '₹1 Cr – ₹2 Cr', min: 100, max: 200 },
  above200: { label: 'Above ₹2 Cr', min: 200, max: Infinity },
};

export const RENT_BUDGETS = {
  under15k: { label: 'Under ₹15,000/mo', min: 0, max: 15000 },
  '15to30k': { label: '₹15k – ₹30k/mo', min: 15000, max: 30000 },
  above30k: { label: 'Above ₹30,000/mo', min: 30000, max: Infinity },
};

/**
 * Score and return the top 3 matching properties.
 * prefs = { intent: 'buy'|'rent'|'invest', budget: {min,max}, location, type }
 * Returns { matches: [...], exact: boolean }
 */
export function matchProperties(prefs) {
  const { intent, budget, location, type } = prefs;

  const isRent = intent === 'rent';

  // Hard filter: purpose must support the intent
  const pool = properties.filter((p) => p.purpose.includes(intent));

  const locationMatches = (p) => location === 'any' || p.location.toLowerCase() === location;

  const score = (p) => {
    let s = 0;
    if (p.type === type) s += 4;
    if (locationMatches(p)) s += 3;
    // Budget only contributes when the property has a concrete price
    const price = isRent ? p.rentPerMonth : p.priceLakhs;
    if (price != null && budget) {
      if (price >= budget.min && price <= budget.max) s += 5;
      else if (price <= budget.max * 1.2 && price >= budget.min * 0.8) s += 2;
    }
    return s;
  };

  const ranked = pool
    .map((p) => ({ ...p, _score: score(p) }))
    .sort((a, b) => b._score - a._score);

  const top = ranked[0];
  const exact = !!top && top.type === type && locationMatches(top);

  return { matches: ranked.slice(0, 3), exact };
}
