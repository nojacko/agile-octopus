import { DateTime } from "luxon";

const priceCapChange = DateTime.fromISO("2023-10-01T12:00:00Z").startOf('day');

export const defaultPriceCap = (DateTime.now() > priceCapChange) ? 27 : 30;

export const validPriceCap = function(value: number) {
    return (Number.isFinite(value) && value >= 0 && value <= 99)
}
