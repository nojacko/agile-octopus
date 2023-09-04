<script lang="ts">
    import { DateTime } from "luxon";
	import { slide } from 'svelte/transition';
    import type PricingHash from "$lib/PricesHash";
    import Price from "$lib/Price";
    import RegionSelect from "$lib/RegionSelect.svelte";
    import PricingTable from "$lib/PricingTable.svelte";
	import PriceCapInput from "$lib/PriceCapInput.svelte";
    import { validRegion } from "$lib/regions";

    let region: string;
    let priceCap: number;
    let pricing: Price[] = [];

    $: region && loadData();

    const loadData = async function() {
        if (!validRegion(region)) {
            return;
        }

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

        // Update data once an hour
        setTimeout(() => loadData(), 60 * 60 * 1000);
    }
</script>

<svelte:head>
    <title>Agile Octopus Price Tracker</title>
    <meta name="description" content="Quickly see the upcoming electricity prices for Octopus Energy's Agile Octopus tariff." />
</svelte:head>

<div class="container mb-4">
    <h1 class="text-center">Agile Octopus Price Tracker</h1>

    <strong>What Is This Website?</strong>
    <p>Quickly see the upcoming electricity prices for Octopus Energy's <em>Agile Octopus</em> tariff.</p>

    <strong>What Is Agile Octopus?</strong>
    <p>With Agile Octopus, you get access to half-hourly energy prices, tied to wholesale prices and updated daily. So when wholesale electricity prices drop, so do your bills - and if you can shift your daily electricity use outside of peak times, you can save even more.</p>
    <p>Agile Octopus includes Plunge Pricing that lets you take advantage of these negative price events, and get paid for the electricity you use!</p>

    <strong>How To Join?</strong>
    <p>Firstly, you need to be an Octpus customer. <a href="https://share.octopus.energy/sunny-river-570" target="_blank">Sign up here and get £50 free credit!</a> Once the switch has completed, head over to the <a href="https://octopus.energy/smart/agile/" target="_blank">Agile Octpus</a> page and sign up.</p>

    <RegionSelect bind:region={region}></RegionSelect>
    <PricingTable pricing={pricing} priceCap={priceCap}></PricingTable>
</div>
<div class="container">
    <PriceCapInput bind:priceCap={priceCap} ></PriceCapInput>
</div>


