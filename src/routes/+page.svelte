<script lang="ts">
    import { onMount } from "svelte";
    import { DateTime } from "luxon";
    import type PricingHash from "$lib/PricesHash";
    import Price from "$lib/Price";
    import RegionSelect from "$lib/RegionSelect.svelte";
    import PricingTable from "$lib/PricingTable.svelte";
	import PriceCapInput from "$lib/PriceCapInput.svelte";

    const priceCapChange = DateTime.fromISO("2023-10-01T12:00:00Z").startOf('day');

    let region: string;
    let priceCap = (DateTime.now() > priceCapChange) ? 27 : 30;
    let pricing: Price[] = [];

    $: region && loadData();

    const loadData = async function() {
        try {
            const dateTimeNow = DateTime.now();
            const periodFrom = dateTimeNow.minus({day: 7});
            const periodTo = dateTimeNow.plus({day: 1}).endOf("day");
            const baseUrl = "https://api.octopus.energy/v1/products";
            const importUrl = `${baseUrl}/AGILE-FLEX-22-11-25/electricity-tariffs/E-1R-AGILE-FLEX-22-11-25-${region}/standard-unit-rates/?page_size=1500&period_from=${periodFrom.toUTC().toISO()}&period_to=${periodTo.toUTC().toISO()}`;
            const exportUrl = `${baseUrl}/AGILE-OUTGOING-19-05-13/electricity-tariffs/E-1R-AGILE-OUTGOING-19-05-13-${region}/standard-unit-rates/?page_size=1500&period_from=${periodFrom.toUTC().toISO()}&period_to=${periodTo.toUTC().toISO()}`;

            const importResp = await fetch(importUrl);
            const exportResp = await fetch(exportUrl);
            const importJson = await importResp.json();
            const exportJson = await exportResp.json();

            const pricingHash: PricingHash = {}

            for (const item of importJson.results) {
                const price = new Price();
                price.validFrom = DateTime.fromISO(item.valid_from);
                price.validTo = DateTime.fromISO(item.valid_to);
                price.readableDate = price.validFrom.toFormat("t");
                price.fullReadableDate = price.validFrom.toFormat("DDDD");
                price.import = Math.round(item.value_inc_vat * 10) / 10;
                pricingHash[item.valid_from] = price;
            }
            for (const item of exportJson.results) {
                const price = pricingHash[item.valid_from];
                if (price) {
                    price.export = Math.round(item.value_inc_vat * 10) / 10;
                }
            }

            // Sort into an array
            let newPricing: Price[] = [];
            for (const item of Object.keys(pricingHash)) {
                newPricing.push(pricingHash[item]);
            }
            newPricing.sort((a, b) => (a.validFrom.toUnixInteger() - b.validFrom.toUnixInteger()));
            pricing = newPricing;
        } catch (e) {
            setTimeout(() => loadData(), 5*1000);
            return;
        }


        setTimeout(() => loadData(), 60 * 1000);
    }

    onMount(async () => {
        await loadData();
    });
</script>

<svelte:head>
    <title>Agile Octopus Price Tracker</title>
    <meta name="description" content="This is where the description goes for SEO" />
</svelte:head>

<h1>Agile Octopus Price Tracker</h1>

<RegionSelect bind:region={region}></RegionSelect>
<PricingTable pricing={pricing} priceCap={priceCap}></PricingTable>
<PriceCapInput bind:priceCap={priceCap}></PriceCapInput>


