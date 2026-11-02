/**
 * Deterministic Carbon Emissions Calculation Utility
 * Implements activity-based GHG calculations in kilograms of CO2 equivalent (kg CO2e).
 * Formula: emissions_kg_co2e = activity_quantity * emission_factor_kg_co2e_per_unit
 */

function calculateEmissions(quantity, factorValue) {
  const numQuantity = parseFloat(quantity);
  const numFactor = parseFloat(factorValue);

  if (isNaN(numQuantity) || numQuantity <= 0) {
    throw new Error('Quantity must be a positive number');
  }
  if (isNaN(numFactor) || numFactor < 0) {
    throw new Error('Factor value must be non-negative');
  }

  // Decimal-safe multiplication with rounding to 4 decimals
  const result = Math.round((numQuantity * numFactor) * 10000) / 10000;
  return Number(result.toFixed(4));
}

module.exports = {
  calculateEmissions,
};
