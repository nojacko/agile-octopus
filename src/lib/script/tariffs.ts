import axios from 'axios';
import { EXPORT, IMPORT } from '$lib/tariffs';

const response = await axios.get("https://api.octopus.energy/v1/products/");
const { data } = response;
const { results } = data;

for (const t of results) {
    if (t.full_name.includes("Agile") && t.direction === IMPORT) {
        console.log(`new Tariff("${t.code}", "${t.full_name}", ${t.direction}),`)
    }
}

console.log();

for (const t of results) {
    if (t.full_name.includes("Agile") && t.direction === EXPORT) {
        console.log(`new Tariff("${t.code}", "${t.full_name}", ${t.direction}),`)
    }
}
