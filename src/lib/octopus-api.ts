import { DateTime } from "luxon";

import Price, { type PriceHash } from "$lib/Price"

const API_BASE = "https://api.octopus.energy/v1/products";

export async function fetchAgileData (region: string, periodFrom: DateTime, periodTo: DateTime) {
    let pricing: Price[] = [];

    const importUrl = `${API_BASE}/AGILE-FLEX-22-11-25/electricity-tariffs/E-1R-AGILE-FLEX-22-11-25-${region}/standard-unit-rates/?page_size=1500&period_from=${periodFrom.toUTC().toISO()}&period_to=${periodTo.toUTC().toISO()}`;
    const exportUrl = `${API_BASE}/AGILE-OUTGOING-19-05-13/electricity-tariffs/E-1R-AGILE-OUTGOING-19-05-13-${region}/standard-unit-rates/?page_size=1500&period_from=${periodFrom.toUTC().toISO()}&period_to=${periodTo.toUTC().toISO()}`;

    const importResp = await fetch(importUrl);
    const exportResp = await fetch(exportUrl);
    const importJson = await importResp.json();
    const exportJson = await exportResp.json();

    const PriceHash: PriceHash = {}

    for (const item of importJson.results) {
        const price = new Price();
        price.validFrom = DateTime.fromISO(item.valid_from);
        price.validTo = DateTime.fromISO(item.valid_to);
        price.import = Math.round(item.value_inc_vat * 10) / 10;
        PriceHash[item.valid_from] = price;
    }

    for (const item of exportJson.results) {
        const price = PriceHash[item.valid_from];
        if (price) {
            price.export = Math.round(item.value_inc_vat * 10) / 10;
        }
    }

    // Sort into an array
    pricing = Object.keys(PriceHash).map((key) => PriceHash[key]);
    pricing.sort((a, b) => (a.validFrom.toUnixInteger() - b.validFrom.toUnixInteger()));

    return pricing;
}