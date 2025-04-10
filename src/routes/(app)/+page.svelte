<script lang="ts">
	import { onMount } from "svelte";
    import { DateTime } from "luxon";

    import SEO from "$lib/SEO.svelte";
	import IconAboveCap from "$lib/Icon/IconAboveCap.svelte";
	import PriceCapInput from "$lib/PriceCapInput.svelte";
	import PricingTable7Days from "$lib/PricingTable7Days.svelte";
    import { defaultPriceCap } from "$lib/price-cap";
    import { defaultRegion, validRegion } from "$lib/regions";
    import { defaultExportTariff, defaultImportTariff } from "$lib/tariffs";
    import { OCTOPUS_LINK } from "$lib/vars";
    import LocalStorage from "$lib/local-storage";
    import AdOctopus from "$lib/AdOctopus.svelte";
    import AdBuyMeACoffee from "$lib/AdBuyMeACoffee.svelte";
    import OctopusApi from "$lib/octopus-api";
    import Price from "$lib/Price";
    import PricingTable from "$lib/PricingTable.svelte";
    import RegionSelect from "$lib/RegionSelect.svelte";
    import ImportTariffSelect from "$lib/ImportTariffSelect.svelte";
    import ExportTariffSelect from "$lib/ExportTariffSelect.svelte";
    import { COLOUR_ABOVE_PRICE_CAP, COLOUR_GOLD } from "$lib/colors";
	import IconImportPaid from "$lib/Icon/IconImportPaid.svelte";
	import PricingTableAverage from "$lib/PricingTableAverage.svelte";

    const PRICE_TAB_UPCOMING = "upcoming";
    const PRICE_TAB_7DAYS = "7-days";
    const PRICE_TAB_AVERAGE = "average";
    const SETTINGS_STATE_OPEN = "open";
    const SETTINGS_STATE_CLOSED = "closed";
    const h2Class = "display-1 fs-3 m-0 mb-3 text-light text-center";

    let region: string;
    let importTariff: string;
    let exportTariff: string;
    let priceCap: number = defaultPriceCap;
    let pricing: { [key: string]: Price[]; } = {};
    let pricesUpdating = true;
    let pricingLastUpdated: DateTime;
    let pricingTab = PRICE_TAB_UPCOMING;
    let settingsState: string;

    $: region, importTariff, exportTariff, loadData();

    const loadData = async function() {
        if (!validRegion(region)) {
            return;
        }

        pricesUpdating = true;

        LocalStorage.setItem("region", region);
        LocalStorage.setItem("importTariff", importTariff);
        LocalStorage.setItem("exportTariff", exportTariff);

        if (!pricing.hasOwnProperty(region)) {
            pricing[region] = [];
            pricing = pricing;
        }

        // No pricing? Load from storage
        let importJsonStr = LocalStorage.getItem(`importJson-${region}-${importTariff}`);
        let exportJsonStr = LocalStorage.getItem(`exportJson-${region}-${exportTariff}`);

        if (importJsonStr && exportJsonStr) {
            pricing[region] = OctopusApi.jsonToPriceArray(JSON.parse(importJsonStr), JSON.parse(exportJsonStr));
            pricing = pricing;
        }

        // Update the data
        try {
            const now = DateTime.now();
            let { importJson, exportJson } = await OctopusApi.fetch(
                region,
                importTariff,
                exportTariff,
                now.minus({day: 7*4}).startOf("day"),
                now.plus({day: 1}).endOf("day")
            );

            LocalStorage.setItem(`importJson-${region}-${importTariff}`, JSON.stringify(importJson));
            LocalStorage.setItem(`exportJson-${region}-${exportTariff}`, JSON.stringify(exportJson));

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
        // Don't try if we've not done an initial load
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

    const setSettings = (state: string) => {
        settingsState = state;
        LocalStorage.setItem("settingsState", state);
    }

    const toggleSettings = () => {
        if (settingsState === SETTINGS_STATE_OPEN) {
            setSettings(SETTINGS_STATE_CLOSED);
        } else {
            setSettings(SETTINGS_STATE_OPEN);
        }
    }

    onMount(() => {
        region = LocalStorage.getItem("region") || defaultRegion;
        importTariff = LocalStorage.getItem("importTariff") || defaultImportTariff;
        exportTariff = LocalStorage.getItem("exportTariff") || defaultExportTariff;
        settingsState = LocalStorage.getItem("settingsState") || SETTINGS_STATE_OPEN;
        setInterval(() => { heartbeat()}, 5 * 1000);
    });
</script>

<svelte:head>
    <SEO />
</svelte:head>

<div class="container mb-4 mx-auto">
    <p class="text-body-emphasis text-center">
        Quickly see the live, upcoming and average electricity prices for Octopus Energy's <a href="#about">Agile Octopus</a> tariff.
    </p>
    <p class="text-center">
        <a href="#about" class="btn btn-outline-light btn-sm btn-inline">Learn more</a>
        <button class="btn btn-outline-light btn-sm btn-inline" on:click={toggleSettings}>
            <i class="fa-solid fa-gear"></i> Settings
        </button>
    </p>
</div>

{#if settingsState === SETTINGS_STATE_OPEN}
    <div id="settings" class="container mb-4 py-2 mx-auto">
        <div class="alert alert-secondary m-0" role="alert">
            <div class="display-1 fs-5 m-0 mb-3 text-light text-center">
                <i class="fa-solid fa-gear"></i> Settings
            </div>
            <div class="pb-2">
                <RegionSelect bind:region={region} />
            </div>
            <div class="pb-2">
                <ImportTariffSelect bind:importTariff={importTariff} />
            </div>
            <div class="pb-2">
                <ExportTariffSelect bind:exportTariff={exportTariff} />
            </div>
            <div class="pb-0 text-center">
                <button class="btn btn-outline-light btn-sm" on:click={() => setSettings(SETTINGS_STATE_CLOSED) }>
                    <i class="fa-solid fa-xmark"></i> Close
                </button>
            </div>
        </div>
    </div>
{/if}

<div id="pricing-table" class="anchor"></div>

<div class="container mb-4 mx-auto">
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
    <AdBuyMeACoffee />
    <div id="about" class="anchor"></div>
    <h2 class="{h2Class}">What Is Agile Octopus?</h2>
    <p>With <a href="{OCTOPUS_LINK}" target="_blank">Agile Octopus</a>, you get access to half-hourly energy prices, tied to wholesale prices and updated daily. So when wholesale electricity prices drop, so do your bills - and if you can shift your daily electricity use outside of peak times, you can save even more.</p>
    <p><a href="{OCTOPUS_LINK}" target="_blank">Agile Octopus</a> includes Plunge Pricing that lets you take advantage of these negative price events, and get paid for the electricity you use!</p>

    <div id="how-to-get-agile" class="anchor"></div>
    <h2 class="{h2Class}">How To Get Agile Octopus?</h2>
    <p>Switch to <a href="{OCTOPUS_LINK}" target="_blank">Octopus Energy</a> by <a href="{OCTOPUS_LINK}" target="_blank">clicking here</a>.</p>
    <p>Existing customers can change their tariff from their Octopus Energy account.</p>

    <AdOctopus />

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

    <AdOctopus />
</div>

<div class="container mb-4 mx-auto">
    <h2 class="{h2Class}">The Energy Price Cap</h2>
    <p>
        The <u>{defaultPriceCap}p</u> electricity price cap is set by <a href="https://www.ofgem.gov.uk/information-consumers/energy-advice-households/energy-price-cap" target="_blank">Ofgem</a>.
        <span class="text-danger-emphasis">Agile prices can go above the price cap!</span>
        When this happens, you'll see an <IconAboveCap /> exclamation icon.
        You can modify the cap below.
    </p>
    <PriceCapInput bind:priceCap={priceCap} defaultPriceCap={defaultPriceCap}></PriceCapInput>
</div>