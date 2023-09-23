<script lang="ts">
	import { onMount } from "svelte";
    import { DateTime } from "luxon";

	import IconAboveCap from "$lib/Icons/IconAboveCap.svelte";
	import PriceCapInput from "$lib/PriceCapInput.svelte";
	import PricingTable7Days from "$lib/PricingTable7Days.svelte";
    import { defaultPriceCap } from "$lib/price-cap";
    import { defaultRegion } from "$lib/regions";
    import { OCTOPUS_LINK } from "$lib/vars";
    import { validRegion } from "$lib/regions";
    import LocalStorage from "$lib/local-storage";
    import OctopusAd from "$lib/OctopusAd.svelte";
    import OctopusApi from "$lib/octopus-api";
    import Price from "$lib/Price";
    import PricingTable from "$lib/PricingTable.svelte";
    import RegionSelect from "$lib/RegionSelect.svelte";
    import { COLOUR_ABOVE_PRICE_CAP, COLOUR_GOLD } from "$lib/colors";
	import IconImportPaid from "$lib/Icons/IconImportPaid.svelte";
	import PricingTableAverage from "$lib/PricingTableAverage.svelte";

    const PRICE_TAB_UPCOMING = "upcoming";
    const PRICE_TAB_7DAYS = "7-days";
    const PRICE_TAB_AVERAGE = "average";
    const h2Class = "display-1 fs-3 my-3 text-light";

    let region: string;
    let priceCap: number = defaultPriceCap;
    let pricing: { [key: string]: Price[]; } = {};
    let pricesUpdating = true;
    let pricingLastUpdated: DateTime;
    let pricingTab = PRICE_TAB_UPCOMING;

    $: region, loadData();

    const loadData = async function() {
        if (!validRegion(region)) {
            return;
        }

        pricesUpdating = true;

        LocalStorage.setItem("region", region);

        if (!pricing.hasOwnProperty(region)) {
            pricing[region] = [];
            pricing = pricing;
        }

        // No pricing? Load from storage
        let importJsonStr = LocalStorage.getItem(`importJson-${region}`);
        let exportJsonStr = LocalStorage.getItem(`exportJson-${region}`);

        if (importJsonStr && exportJsonStr) {
            pricing[region] = OctopusApi.jsonToPriceArray(JSON.parse(importJsonStr), JSON.parse(exportJsonStr));
            pricing = pricing;
        }

        // Update the data
        try {
            const now = DateTime.now();
            let { importJson, exportJson } = await OctopusApi.fetch(
                region,
                now.minus({day: 7*4}).startOf("day"),
                now.plus({day: 1}).endOf("day")
            );

            LocalStorage.setItem(`importJson-${region}`, JSON.stringify(importJson));
            LocalStorage.setItem(`exportJson-${region}`, JSON.stringify(exportJson));

            pricing[region] = OctopusApi.jsonToPriceArray(importJson, exportJson);
            pricing = pricing;

            pricingLastUpdated = now;
        } catch (e) {
            // Nothing
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
        const lastPrice = pricing[region].at(-1);
        if (lastPrice) {
            const { hours } = lastPrice.validFrom.diff(now, 'hours').toObject();
            if (hours && hours < 8) {
                loadData();
            }
        } else {
            loadData();
        }
    }

    onMount(() => {
        region = LocalStorage.getItem("region") || defaultRegion;
        setInterval(() => { heartbeat()}, 10 * 1000);
    });
</script>

<svelte:head>
    <title>Agile Octopus Price Tracker</title>
    <meta name="description" content="Quickly see the upcoming electricity prices for Octopus Energy's Agile Octopus tariff." />
</svelte:head>

<h1 class="text-center display-1 fs-1 text-light mx-1 my-2">Agile Octopus Price Tracker</h1>

<div class="container mb-4 mx-auto">
    <p class="text-body-emphasis text-center">
        Quickly see the live, upcoming and average electricity prices for Octopus Energy's <a href="#about">Agile Octopus</a> tariff.
    </p>
    <p class="text-center">
        <a href="#about" class="btn btn-outline-light btn-sm">Learn more</a>
    </p>

    <RegionSelect bind:region={region} />
</div>

<div id="pricing-table" class="container mb-4 mx-auto">
    <ul class="nav nav-underline nav-fill mb-2">
        <li class="nav-item p-0">
            <a href="#pricing-table" class="nav-link p-1 {(pricingTab === PRICE_TAB_UPCOMING) ? "active" : "text-body-emphasis"}"
                on:click={() => { pricingTab = PRICE_TAB_UPCOMING }}>Live Pricing</a>
        </li>
        <li class="nav-item p-0">
            <a href="#pricing-table" class="nav-link p-1 {(pricingTab === PRICE_TAB_7DAYS) ? "active" : "text-body-emphasis"}"
                on:click={() => { pricingTab = PRICE_TAB_7DAYS }}>Last 7 Days</a>
        </li>
        <li class="nav-item p-0">
            <a href="#pricing-table" class="nav-link p-1 {(pricingTab === PRICE_TAB_AVERAGE) ? "active" : "text-body-emphasis"}"
                on:click={() => { pricingTab = PRICE_TAB_AVERAGE }}>4 Weeks</a>
        </li>
    </ul>

    {#if pricingTab === PRICE_TAB_7DAYS}
        <PricingTable7Days pricing={pricing[region]} priceCap={priceCap} updating={pricesUpdating} />
    {:else if pricingTab === PRICE_TAB_AVERAGE}
        <PricingTableAverage pricing={pricing[region]} priceCap={priceCap} updating={pricesUpdating} />
    {:else}
        <PricingTable pricing={pricing[region]} priceCap={priceCap} updating={pricesUpdating} />
    {/if}
</div>

<div class="container mb-4 mx-auto">
    <h2 id="about" class="{h2Class}">What Is Agile Octopus?</h2>
    <p>With <a href="{OCTOPUS_LINK}" target="_blank">Agile Octopus</a>, you get access to half-hourly energy prices, tied to wholesale prices and updated daily. So when wholesale electricity prices drop, so do your bills - and if you can shift your daily electricity use outside of peak times, you can save even more.</p>
    <p><a href="{OCTOPUS_LINK}" target="_blank">Agile Octopus</a> includes Plunge Pricing that lets you take advantage of these negative price events, and get paid for the electricity you use!</p>

    <h2 id="how-to-get-agile" class="{h2Class}">How To Get Agile Octopus?</h2>
    <p>Switch to <a href="{OCTOPUS_LINK}" target="_blank">Octopus Energy</a> and get £50 free credit!</p>
    <p>After the switch has completed, visit <a href="https://octopus.energy/smart/agile/" target="_blank">Agile Octopus</a> to sign up.</p>

    <OctopusAd />

    <h2 class="{h2Class}">Cheapest Electricity and Plunge Pricing!</h2>

    <h3 class="h6 text-light"><i class="fa-regular fa-clock"></i> Weekends are cheaper than weekdays, usually.</h3>
    <p>
        On a day-to-day basis, around <u>12am to 5am</u> is usually cheapest with early afternoon around <u>12pm to 3pm</u> often having a price drop too.
    </p>

    <h3 class="h6" style="color: aqua;"><i class="fa-solid fa-wind"></i> Wind power is the UK's largest source of renewable energy!</h3>
    <p>
        If it's going to be windy prices <em>should</em> drop.
    </p>

    <h3 class="h6" style="color:orange"><i class="fa-regular fa-sun"></i> When the sunshines, prices fall!</h3>
    <p>
        The UK has less solar than wind but on sunny days, between 11am and 3pm, it can make a big difference.
    </p>

    <h3 class="h6" style="color:{COLOUR_GOLD}"><IconImportPaid /> Plunge Pricing!</h3>
    <p>
        Given the right time and conditions we get <em>plunge pricing</em>.
        That means you get paid to use electricity!
        So put the washing on, tumble dry your clothes, turn the dishwasher on, turn on an electric heater, ... and get paid!
    </p>

    <h3 class="h6" style="color:{COLOUR_ABOVE_PRICE_CAP}"><IconAboveCap /> Beware of Higher Prices!</h3>
    <p>
        Prices tend to peak between <u>4pm and 7pm</u> every day, with a morning spike between <u>6:30am and 9am</u>.
        However, electricity prices can fluctuate for many reasons.
        Anything from changes in global natural gas prices, power plant maintenance, weather conditions, and many more... so keep an eye on prices.
    </p>

    <OctopusAd />

    <h2 class="{h2Class}">The Energy Price Cap</h2>
    <p>
        The <u>{defaultPriceCap}p</u> electricity price cap is set by <a href="https://www.ofgem.gov.uk/information-consumers/energy-advice-households/energy-price-cap" target="_blank">Ofgem</a>.
        <span class="text-danger-emphasis">Agile prices can go above the price cap!</span>
        When this happens, you'll see an <IconAboveCap /> exclamation icon.
        You can modify the cap below.
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
        <a href="#how-to-get-agile" class="text-warning-emphasis">Free &pound;50!</a>
    </small>
</div>

<style>
    .container {
        max-width: 36rem;
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