import { DateTime } from "luxon";
import Price, { type PriceHash } from "$lib/Price"

const API_BASE = "https://api.octopus.energy/v1/products";

export default class OctopusApi {

    static async fetch (region: string, periodFrom: DateTime, periodTo: DateTime) {
        const importUrl = `${API_BASE}/AGILE-FLEX-22-11-25/electricity-tariffs/E-1R-AGILE-FLEX-22-11-25-${region}/standard-unit-rates/?page_size=1500&period_from=${periodFrom.toUTC().toISO()}&period_to=${periodTo.toUTC().toISO()}`;
        const exportUrl = `${API_BASE}/AGILE-OUTGOING-19-05-13/electricity-tariffs/E-1R-AGILE-OUTGOING-19-05-13-${region}/standard-unit-rates/?page_size=1500&period_from=${periodFrom.toUTC().toISO()}&period_to=${periodTo.toUTC().toISO()}`;

        const importResp = await fetch(importUrl);
        const exportResp = await fetch(exportUrl);

        return {
            importJson: await importResp.json(),
            exportJson: await exportResp.json()
        }
    }

    static jsonToPriceArray(importJson: object, exportJson: object) {
        const priceHash: PriceHash = {}

        for (const item of importJson.results) {
            const price = new Price();
            price.validFrom = DateTime.fromISO(item.valid_from);
            price.validTo = DateTime.fromISO(item.valid_to);
            price.import = Math.round(item.value_inc_vat * 10) / 10;
            priceHash[item.valid_from] = price;
        }

        for (const item of exportJson.results) {
            const price = priceHash[item.valid_from];
            if (price) {
                price.export = Math.round(item.value_inc_vat * 10) / 10;
            }
        }

        // Sort into an array
        const pricing: Price[] = Object.keys(priceHash).map((key) => priceHash[key]);
        pricing.sort((a, b) => (a.validFrom.toUnixInteger() - b.validFrom.toUnixInteger()));

        return pricing;
    }
}