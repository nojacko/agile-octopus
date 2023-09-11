<script lang="ts">
    import { DateTime } from "luxon";
    import { validRegion } from "$lib/regions";
    import { defaultPriceCap } from "$lib/price-cap";
    import type PricingHash from "$lib/PricesHash";
	import IconAboveCap from "$lib/Icons/IconAboveCap.svelte";
    import IconLoading from "$lib/Icons/IconLoading.svelte";
	import PriceCapInput from "$lib/PriceCapInput.svelte";
	import PricingTableFooter from "$lib/PricingTableFooter.svelte";
	import PricingWeekTable from "$lib/PricingWeekTable.svelte";
    import OctopusAd from "$lib/OctopusAd.svelte";
    import Price from "$lib/Price";
    import PricingTable from "$lib/PricingTable.svelte";
    import RegionSelect from "$lib/RegionSelect.svelte";

    const PRICE_TAB_UPCOMING = "upcoming";
    const PRICE_TAB_LAST_WEEK = "last-week";
    const h2Class= "display-1 fs-3 text-light";

    let region: string;
    let priceCap: number = defaultPriceCap;
    let pricing: Price[] = [];
    let pricesUpdating = false;
    let pricesUpdatingError = false;
    let pricingLastUpdated: DateTime;
    let pricingTab = PRICE_TAB_UPCOMING;

    $: region, loadData();

    const loadData = async function() {
        if (!validRegion(region) || pricesUpdating) {
            return;
        }

        pricesUpdating = true;
        pricesUpdatingError = false;

        try {
            const dateTimeNow = DateTime.now();
            const periodFrom = dateTimeNow.minus({day: 14}).startOf("day");
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

<h1 class="text-center display-1 fs-1 text-light mx-1">Agile Octopus Price Tracker</h1>

<div class="container mb-4 mx-auto">
    <p class="text-body-emphasis text-center">
        Quickly see the upcoming electricity prices for Octopus Energy's <a href="#about">Agile Octopus</a> tariff.
    </p>
    <p class="text-center">
        <a href="#about" class="btn btn-outline-light btn-sm">Learn more</a>
    </p>

    <RegionSelect bind:region={region} />
</div>

<div id="pricing-table" class="container mb-4 mx-auto">
    {#if pricing.length == 0}
        <div class="alert alert-dark text-center" role="alert">
            <p class="fs-1 mb-2 text-warning-emphasis"><IconLoading /> Loading Pricing <IconLoading /></p>
            <p class="mb-0">Getting the most recent pricing from Octopus Energy</p>
        </div>
    {:else}
        <ul class="nav nav-underline nav-fill mb-2">
            <li class="nav-item p-0">
                <a href="#pricing-table" class="nav-link p-1 {(pricingTab === PRICE_TAB_UPCOMING) ? "active" : "text-body-emphasis"}"
                    on:click={() => { pricingTab = PRICE_TAB_UPCOMING }}>Upcoming</a>
            </li>
            <li class="nav-item p-0">
                <a href="#pricing-table" class="nav-link p-1 {(pricingTab === PRICE_TAB_LAST_WEEK) ? "active" : "text-body-emphasis"}"
                    on:click={() => { pricingTab = PRICE_TAB_LAST_WEEK }}>Last Week</a>
            </li>
        </ul>

        {#if pricingTab === PRICE_TAB_LAST_WEEK}
            <PricingWeekTable pricing={pricing} priceCap={priceCap} />
        {:else}
            <PricingTable pricing={pricing} priceCap={priceCap} />
            <PricingTableFooter updating={pricesUpdating} error={pricesUpdatingError} />
        {/if}
    {/if}
</div>

<div class="container mb-4 mx-auto">
    <OctopusAd />

    <h2 id="about" class="{h2Class}">What Is Agile Octopus?</h2>
    <p>With Agile Octopus, you get access to half-hourly energy prices, tied to wholesale prices and updated daily. So when wholesale electricity prices drop, so do your bills - and if you can shift your daily electricity use outside of peak times, you can save even more.</p>
    <p>Agile Octopus includes Plunge Pricing that lets you take advantage of these negative price events, and get paid for the electricity you use!</p>

    <h2 class="{h2Class}">How To Get Agile Octopus?</h2>
    <p>Switch to <a href="https://share.octopus.energy/sunny-river-570" target="_blank">Octopus Energy</a> and get £50 free credit!</p>
    <p>After the switch has completed, visit <a href="https://octopus.energy/smart/agile/" target="_blank">Agile Octpus</a> to sign up.</p>

    <OctopusAd />

    <h2 class="{h2Class}">Cheapest Electricity?</h2>
    <p>Generally, weekends are the cheapest. Daily, around <u>12am to 5am</u> is usually cheapest. Early afternoon around <u>12pm to 3pm</u> can be cheap too.</p>
    <p>
        <span class="text-danger-emphasis"><i class="fa-solid fa-triangle-exclamation"></i> Electricity prices can fluctuate!</span>
        Anything from changes in natural gas global prices, power plant maintenance, weather conditions, and many others reasons.
    </p>
    <p>
        <span class="text-info-emphasis"><i class="fa-solid fa-wind text-info-emphasis"></i> Check the weather!</span>
        Wind power is the UK's largest source renewable energy. If it's going to be windy prices <em>should</em> drop.
    </p>

    <h2 class="{h2Class}">Price Cap</h2>
    <p>
        The <u>{defaultPriceCap}p</u> electricity price cap is set by <a href="https://www.ofgem.gov.uk/information-consumers/energy-advice-households/energy-price-cap" target="_blank">Ofgem</a>.
        <span class="text-danger-emphasis">Agile prices can go above the price cap!</span>
        When this happens, you'll see <IconAboveCap />.
        You can change the cap below.
    </p>
    <PriceCapInput bind:priceCap={priceCap} defaultPriceCap={defaultPriceCap}></PriceCapInput>

    <OctopusAd />

    <p class="fs-1 text-center mb-5">🐙</p>
</div>

<div id="nav-bar" class="container-fluid border-top border-secondary-subtle py-1 text-center text-body-secondary">
    <small>
        <a href="#top"><i class="fa-solid fa-house"></i></a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#region">Region</a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#pricing-table">Pricing</a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#about">FAQs</a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#join" class="text-warning-emphasis">Free &pound;50!</a>
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