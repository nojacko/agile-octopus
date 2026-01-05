import { DateTime } from "luxon";

// https://www.ofgem.gov.uk/energy-price-cap
let priceCap = 27.69;
// if (DateTime.now() >= DateTime.fromISO("2025-07-01T00:00:00Z").startOf('day')) {
//     priceCap = 25.73; // New price
// }

export const defaultPriceCap = priceCap;

export const validPriceCap = function(value: number) {
    return (Number.isFinite(value) && value >= 0 && value <= 99)
}
