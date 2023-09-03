<script lang="ts">
    import { onMount } from "svelte";
    import type Price from "./Price";
    export let pricing: Price[] = [];
    export let priceCap: number;

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
    }

    onMount(async () => {
        await processPricing();
    });
</script>

<div class="container d-block">
    {#each processedPricing as item}
        {#if item.heading}
            <div class="row justify-content-center">
                <div class="col-12 text-center text-bg-dark p-2 fw-bold">{item.price.fullReadableDate}</div>
            </div>
        {/if}

        <div class="row justify-content-center font-monospace">
            <div class="col-2 text-start">
                {#if item.price.closeToLowestImport(lowestImport[item.price.fullReadableDate])}IMPORT{/if}
                {#if item.price.closeToHighestExport(highestExport[item.price.fullReadableDate])}EXPORT{/if}
                {#if item.price.import < 0}🟢{/if}
            </div>
            <div class="col-3 text-center">
                {item.price.readableDate} 
            </div>
            <div class="col-3 text-end">
                {item.price.diffStr()}
            </div>
            <div class="col-2 text-end" style="background-color: {item.price.importColor(priceCap)}; color: Black;">
                {item.price.import.toFixed(0)}p
            </div>
            <div class="col-2 text-end" style="background-color: {item.price.exportColor(priceCap)}; color: Black;">
                {item.price.export.toFixed(0)}p
            </div>
        </div>
    {/each}
</div>