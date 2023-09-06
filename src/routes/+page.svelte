<script lang="ts">
    import { DateTime } from "luxon";
    import { validRegion } from "$lib/regions";
    import { defaultPriceCap } from "$lib/price-cap";
    import type PricingHash from "$lib/PricesHash";

    import Price from "$lib/Price";
    import RegionSelect from "$lib/RegionSelect.svelte";
    import PricingTable from "$lib/PricingTable.svelte";
	import PriceCapInput from "$lib/PriceCapInput.svelte";
    import OctopusAd from "$lib/OctopusAd.svelte";
    
    let region: string;
    let priceCap: number = defaultPriceCap;
    let pricing: Price[] = [];
    let pricesUpdating = true;
    let pricesUpdatingError = false;

    $: region, loadData();

    const loadData = async function() {
        if (!validRegion(region)) {
            return;
        }

        pricesUpdating = true;
        pricesUpdatingError = false;

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

            // Update data once an hour
            setTimeout(() => loadData(), 60 * 60 * 1000);
        } catch (e) {
            pricesUpdatingError = true;

            // Update data in a few seconds
            setTimeout(() => loadData(), 10*1000);
        }

        pricesUpdating = false; 
    }
</script>

<svelte:head>
    <title>Agile Octopus Price Tracker</title>
    <meta name="description" content="Quickly see the upcoming electricity prices for Octopus Energy's Agile Octopus tariff." />
</svelte:head>

<div class="container">
    <h1 class="text-center">Agile Octopus Price Tracker</h1>
    <p>
        Quickly see the upcoming electricity prices for Octopus Energy's <a href="#learn-more">Agile Octopus</a> tariff.
        <a href="#learn-more">More information</a>.
    </p>

    <RegionSelect bind:region={region}></RegionSelect>
</div>

<div class="container mx-0">
    <PricingTable pricing={pricing} priceCap={priceCap}></PricingTable>
</div>

<div class="container">
    <p class="text-center my-2">
        {#if pricesUpdating} 
            <i class="fa-solid fa-bolt fa-beat" style="color: Gold"></i> Loading...
        {:else if pricesUpdatingError}
            <i class="fa-solid fa-bug"></i> Sorry. Couldn't load data. Try again later.
        {:else}
            Tomorrow's prices available between 4-8pm.
        {/if} 
    </p>

    <h2 id="learn-more">What Is Agile Octopus?</h2>
    <p>With Agile Octopus, you get access to half-hourly energy prices, tied to wholesale prices and updated daily. So when wholesale electricity prices drop, so do your bills - and if you can shift your daily electricity use outside of peak times, you can save even more.</p>
    <p>Agile Octopus includes Plunge Pricing that lets you take advantage of these negative price events, and get paid for the electricity you use!</p>

    <h2>How To Get Agile?</h2>
    <ol>
        <li><a href="https://share.octopus.energy/sunny-river-570" target="_blank">Switch to Octopus Energy</a> and get £50 free credit!</li> 
        <li>After the switch has completed, visit <a href="https://octopus.energy/smart/agile/" target="_blank">Agile Octpus</a> to sign up.</li>
    </ol>

    <OctopusAd />

    <PriceCapInput bind:priceCap={priceCap} defaultPriceCap={defaultPriceCap}></PriceCapInput>
</div>

<p class="text-center">🐙</p>