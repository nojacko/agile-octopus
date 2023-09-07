<script lang="ts">
    import { onMount } from "svelte";
    import type Price from "./Price";
	import { DateTime } from "luxon";
    export let pricing: Price[] = [];
    export let priceCap: number;

    let processTimeout: number;

    $: pricing && processPricing();

    interface ProccessedPrice {
        price: Price;
        heading: boolean;
    }

    let processedPricing: ProccessedPrice[] = [];
    let lowestImport: { [key: string]: number; } = { };
    let highestExport: { [key: string]: number; } = { };

    const processPricing = function() {
        let newProcessedPricing: ProccessedPrice[] = [];
        let lastFullReadableDate = "";
        
        for (const price of pricing) {
            // Lowest import price
            if (!lowestImport.hasOwnProperty(price.fullReadableDate) || price.import < lowestImport[price.fullReadableDate]) {
                lowestImport[price.fullReadableDate] = price.import;
            }

            // Highest export price
            if (!highestExport.hasOwnProperty(price.fullReadableDate) || price.export > highestExport[price.fullReadableDate]) {
                highestExport[price.fullReadableDate] = price.export;
            }

            // Want to render?
            if (price.isNow() ||  price.isFuture()) {
                newProcessedPricing.push({
                    price,
                    heading: (lastFullReadableDate !== price.fullReadableDate),
                });
                lastFullReadableDate = price.fullReadableDate;
            }
        }

        processedPricing = newProcessedPricing;
        lowestImport = lowestImport;

        // Update table when countdown will change
        const now = DateTime.now().toObject();
        const secs = 60 - (now.second || 0) + 1; // +1 to ensure it runs after the next minute starts
        clearTimeout(processTimeout);
        processTimeout = setTimeout(function() { processPricing() }, secs * 1000)
    }

    onMount(async () => {
        await processPricing();
    });
</script>

{#each processedPricing as item}
    {#if item.heading}
        <div class="row justify-content-center">
            <div class="col-12 text-center text-bg-dark p-2 fw-bold">{item.price.fullReadableDate}</div>
        </div>

        <div class="row justify-content-center text-center">
            <div class="col-3 px-0">Time</div>
            <div class="col-3 px-0 text-end">When</div>
            <div class="col-2 px-0">&nbsp;</div>
            <div class="col-2 px-0">Import</div>
            <div class="col-2 px-0">Export</div>
        </div>
    {/if}

    <div class="row justify-content-center font-monospace">
        <div class="col-3 px-0 text-center">
            {item.price.readableDate} 
        </div>
        <div class="col-3 px-0 text-end">
            {item.price.diffStr()}
        </div>
        <div class="col-2 px-0 text-center">
            {#if item.price.import <= 0}
                <i class="fa-solid fa-coins" style="color: Gold"></i>    
            {:else if item.price.importCloseToLowestImport(lowestImport[item.price.fullReadableDate])}
                <i class="fa-solid fa-arrow-down" style="color: {item.price.importColor(priceCap)};"></i>
            {:else if item.price.import > priceCap}
            <i class="fa-solid fa-fade fa-triangle-exclamation" style="color: Yellow"></i>
            {/if}
        </div>
        <div class="col-2 px-1 text-end" style="background-color: {item.price.importColor(priceCap)}; color: Black;">
            {item.price.import.toFixed(0)}p
        </div>
        <div class="col-2 px-1 text-end" style="background-color: {item.price.exportColor(priceCap)}; color: Black;">
            {item.price.export.toFixed(0)}p
        </div>
    </div>
{/each}