<script lang="ts">
    import { DateTime } from "luxon";
    import { validRegion } from "$lib/regions";
    import { defaultPriceCap } from "$lib/price-cap";
    import type PricingHash from "$lib/PricesHash";

	import PriceCapInput from "$lib/PriceCapInput.svelte";
    import OctopusAd from "$lib/OctopusAd.svelte";
    import Price from "$lib/Price";
    import PricingTable from "$lib/PricingTable.svelte";
    import RegionSelect from "$lib/RegionSelect.svelte";
	import PricingTableFooter from "$lib/PricingTableFooter.svelte";

    let region: string;
    let priceCap: number = defaultPriceCap;
    let pricing: Price[] = [];
    let pricesUpdating = false;
    let pricesUpdatingError = false;
    let pricingLastUpdated: DateTime;

    $: region, loadData();

    const loadData = async function() {
        if (!validRegion(region) || pricesUpdating) {
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
            let _pricing: Price[] = Object.keys(pricingHash).map((key) => pricingHash[key]);
            _pricing.sort((a, b) => (a.validFrom.toUnixInteger() - b.validFrom.toUnixInteger()));
            pricing = _pricing;

            pricingLastUpdated = dateTimeNow;
        } catch (e) {
            pricesUpdatingError = true;
        }

        pricesUpdating = false;
    }

    /**
     * Update pricing when...
     * - there could be new data
     * - there's been an error
     * - page has been idle in background
     */
    const heartbeat = function() {
        // Don't try if we've not done an inital load
        if (!pricingLastUpdated) {
            return;
        }

        const now = DateTime.now();

        // Don't update more than once every few minutes
        const { minutes } = pricingLastUpdated.diff(now, 'hours').toObject();
        if (minutes && minutes < 10) {
            return;
        }

        // Only update if last future price is less than 8 hours away
        // 8 comes from the price update window being from 16:00 and a day being 24 hours
        const lastPrice = pricing.at(-1);
        if (lastPrice) {
            const { hours } = lastPrice.validFrom.diff(now, 'hours').toObject();
            if (hours && hours < 8) {
                loadData();
            }
        } else {
            loadData();
        }
    }

    // Heartbeat once a minute
    setInterval(() => { heartbeat()}, 10 * 1000);

</script>

<svelte:head>
    <title>Agile Octopus Price Tracker</title>
    <meta name="description" content="Quickly see the upcoming electricity prices for Octopus Energy's Agile Octopus tariff." />
</svelte:head>

<div class="container mt-2 mx-auto">
    <h1 class="text-center">Agile Octopus Price Tracker</h1>
    <p>
        Quickly see the upcoming electricity prices for Octopus Energy's <a href="#about">Agile Octopus</a> tariff.
        <a href="#about">More information</a>.
    </p>

    <RegionSelect bind:region={region}></RegionSelect>
    <PricingTable pricing={pricing} priceCap={priceCap}></PricingTable>
    <PricingTableFooter initialLoad={pricing.length == 0} updating={pricesUpdating} error={pricesUpdatingError} />

    <hr class="mx-5">

    <h2 id="about">What Is Agile Octopus?</h2>
    <p>With Agile Octopus, you get access to half-hourly energy prices, tied to wholesale prices and updated daily. So when wholesale electricity prices drop, so do your bills - and if you can shift your daily electricity use outside of peak times, you can save even more.</p>
    <p>Agile Octopus includes Plunge Pricing that lets you take advantage of these negative price events, and get paid for the electricity you use!</p>

    <h2>How To Get Agile Octopus?</h2>
    <ol>
        <li><a href="https://share.octopus.energy/sunny-river-570" target="_blank">Switch to Octopus Energy</a> and get £50 free credit!</li>
        <li>After the switch has completed, visit <a href="https://octopus.energy/smart/agile/" target="_blank">Agile Octpus</a> to sign up.</li>
    </ol>

    <OctopusAd />
    <PriceCapInput bind:priceCap={priceCap} defaultPriceCap={defaultPriceCap}></PriceCapInput>

    <p class="fs-1 text-center mb-5">🐙</p>
</div>


<div id="nav-bar" class="container-fluid border-top border-secondary-subtle py-1 text-center text-body-secondary">
    <small>
        <a href="#top" class="text-body-secondary"><i class="fa-solid fa-house"></i></a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#region" class="text-body-secondary">Region</a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#pricing-table" class="text-body-secondary">Pricing</a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#about" class="text-body-secondary">FAQs</a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#price-cap" class="text-body-secondary">Price Cap</a>
    </small>
</div>

<style>
    .container {
        max-width: 30rem;
    }

    #nav-bar {
        position: fixed;
        bottom: 0rem;
        left: 0rem;
        right: 0rem;
        z-index: 10;
        background-color: rgb(33, 37, 41);
    }

    #nav-bar a {
        color: White;
    }
</style>