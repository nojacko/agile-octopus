<script lang="ts">
    import { onMount } from "svelte";
	import { DateTime } from "luxon";

	import IconAboveCap from "$lib/Icons/IconAboveCap.svelte";
	import IconImportLowest from "$lib/Icons/IconImportLowest.svelte";
	import IconImportPaid from "$lib/Icons/IconImportPaid.svelte";
	import IconLoading from "$lib/Icons/IconLoading.svelte";
	import IconWaiting from "./Icons/IconWaiting.svelte";
	import LoadingPricingAlert from "./LoadingPricingAlert.svelte";
    import { round } from "$lib/maths";
    import type Price from "$lib/Price";

    export let pricing: Price[] = [];
    export let priceCap: number;
    export let updating = true;

    let processTimeout: number;

    $: pricing, processPricing();

    interface ProccessedPrice {
        price: Price;
        heading: boolean;
    }

    let processedPricing: ProccessedPrice[] = [];
    let lowestImport: { [key: string]: number; } = { };
    let highestExport: { [key: string]: number; } = { };

    const processPricing = function() {
        let _processedPricing: ProccessedPrice[] = [];
        let lastDate = "";

        if (Array.isArray(pricing)) {
            for (const price of pricing) {
                const date = price.fullReadableDate();

                // Lowest import price
                if (!lowestImport.hasOwnProperty(date) || price.import < lowestImport[date]) {
                    lowestImport[date] = price.import;
                }

                // Highest export price
                if (!highestExport.hasOwnProperty(date) || price.export > highestExport[date]) {
                    highestExport[date] = price.export;
                }

                // Want to render?
                if (price.isNow() ||  price.isFuture()) {
                    _processedPricing.push({
                        price,
                        heading: (lastDate !== date),
                    });
                    lastDate = date;
                }
            }
        }

        // Force variable updates
        processedPricing = _processedPricing;
        lowestImport = lowestImport;

        // Update table when countdown will change
        const now = DateTime.now().toObject();
        const secs = 60 - (now.second || 0) + 1; // +1 to ensure it runs after the next minute starts
        clearTimeout(processTimeout);
        processTimeout = setTimeout(function() { processPricing() }, secs * 1000)
    }

    onMount(() => {
        processPricing();
    });
</script>

{#if processedPricing.length}
    {#each processedPricing as item}
        {#if item.heading}
            <div class="row justify-content-center">
                <div class="col-12 text-center text-bg-dark p-2 fw-bold">{item.price.fullReadableDate()}</div>
            </div>

            <div class="row justify-content-center text-center">
                <div class="col-2 px-0">Time</div>
                <div class="col-3 px-0 text-end">When</div>
                <div class="col-2 px-0">&nbsp;</div>
                <div class="col-2 px-0">Import</div>
                <div class="col-2 px-0">Export</div>
            </div>
        {/if}

        <div class="row justify-content-center font-monospace">
            <div class="col-2 px-0 text-center">
                {item.price.readableTime()}
            </div>
            <div class="col-3 px-0 text-end">
                {item.price.diffStr()}
            </div>
            <div class="col-2 px-0 text-center">
                {#if item.price.import <= 0}
                    <IconImportPaid />
                {:else if item.price.importCloseToLowestImport(lowestImport[item.price.fullReadableDate()])}
                    <IconImportLowest color={item.price.importColor(priceCap)} />
                {:else if item.price.import > priceCap}
                    <IconAboveCap />
                {/if}
            </div>
            <div class="col-2 px-1 text-end" style="background-color: {item.price.importColor(priceCap)}; color: Black;">
                {round(item.price.import)}p
            </div>
            <div class="col-2 px-1 text-end" style="background-color: {item.price.exportColor(priceCap)}; color: Black;">
                {round(item.price.export)}p
            </div>
        </div>
    {/each}

    <p class="text-center">
        {#if updating}
            <IconLoading /> Checking for new prices...
        {:else}
            <small>Prices become available between 4-8pm</small>
        {/if}
    </p>
{:else if updating}
    <LoadingPricingAlert />
{:else}
    <IconWaiting /> Waiting on data...
{/if}
