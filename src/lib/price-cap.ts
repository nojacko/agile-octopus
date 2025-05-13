import { DateTime } from "luxon";

// https://www.ofgem.gov.uk/energy-price-cap
let priceCap = 27.03;
// if (DateTime.now() > DateTime.fromISO("2024-10-01T12:00:00Z").startOf('day')) {
//     priceCap = 24.50; // New price
// }

export const defaultPriceCap = priceCap;

export const validPriceCap = function(value: number) {
    return (Number.isFinite(value) && value >= 0 && value <= 99)
}
