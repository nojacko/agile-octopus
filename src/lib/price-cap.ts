// import { DateTime } from "luxon";
//
// // https://www.ofgem.gov.uk/energy-price-cap
// let priceCap = 28.62;
// if (DateTime.now() > DateTime.fromISO("2023-10-01T12:00:00Z").startOf('day')) {
//     priceCap = 28.62; // New price
// }

export const defaultPriceCap = 24.50;

export const validPriceCap = function(value: number) {
    return (Number.isFinite(value) && value >= 0 && value <= 99)
}
