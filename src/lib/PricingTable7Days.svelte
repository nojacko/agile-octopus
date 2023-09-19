<script lang="ts">
    import { onMount } from "svelte";
	import { DateTime } from "luxon";

	import LoadingPricingAlert from "./LoadingPricingAlert.svelte";
    import { importColor } from "$lib/colors";
    import { round } from "$lib/maths";
    import IconWaiting from "$lib/Icons/IconWaiting.svelte";
    import Price, { type PriceHash } from "$lib/Price"

    export let pricing: Price[] = [];
    export let priceCap: number;
    export let updating = false;

    $: pricing, processPricing();

    let processedPricing: PriceHash = {};
    let days: string[];
    let halfHours: string[];

    let dayAvg: { [key: string]: number; } = {};
    let dayTotal: { [key: string]: number; } = {};
    let dayHigh: { [key: string]: number; } = {};
    let dayLow: { [key: string]: number; } = {};

    const key = (day: string, halfHour: string) => `${day}-${halfHour}`;

    const processPricing = function() {
        const now = DateTime.now();
        let start = now.minus({days: 7}).startOf("day");
        let end = now.minus({days: 1}).endOf("day");

        let _days = new Set();
        let _halfHours = new Set();

        for (const price of pricing) {
            const unixInt = price.validFrom.toUnixInteger();
            if (unixInt >= start.toUnixInteger() && unixInt <= end.toUnixInteger()) {
                const day = price.validFrom.toFormat("ccc")
                const halfHour = price.validFrom.toFormat("HH:mm");
                _days.add(day);
                _halfHours.add(halfHour);

                processedPricing[key(day, halfHour)] = price;
            }
        }

        // Average, highs and lows
        for (const day of _days.values()) {
            dayTotal[`${day}`] = 0;
            dayHigh[`${day}`] = -Infinity;
            dayLow[`${day}`] = Infinity;

            for (const halfHour of _halfHours.values()) {
                const price = processedPricing[key(day as string, halfHour as string)];
                if (price) {
                    dayTotal[`${day}`] += price.import;
                    dayHigh[`${day}`] = (dayHigh[`${day}`] < price.import ) ? price.import : dayHigh[`${day}`];
                    dayLow[`${day}`] = (dayLow[`${day}`] > price.import ) ? price.import : dayLow[`${day}`];
                }
            }
            dayAvg[`${day}`] = dayTotal[`${day}`] / _halfHours.size;
        }

        // Force variable updates
        processedPricing = processedPricing;
        days = Array.from(_days).map(item => `${item}`);
        halfHours = Array.from(_halfHours).map(item => `${item}`);
    }

    onMount(() => {
        processPricing();
    });
</script>

{#if processedPricing && halfHours.length && days.length}
    <div class="row justify-content-center font-monospace text-end">
        <div class="col p-0 pe-1">&nbsp;</div>
        {#each days.values() as day}
            <div class="col p-0 pe-1">{day}</div>
        {/each}
    </div>

    <div class="row justify-content-center font-monospace text-end">
        <div class="col p-0 pe-1 text-center"><small>High</small></div>
        {#each days.values() as day}
            {@const val = dayHigh[`${day}`]}
            <div class="col p-0 pe-1 " style="background-color: {importColor(val, priceCap)}; color: Black;">
                {round(val)}p
            </div>
        {/each}
    </div>
    <div class="row justify-content-center font-monospace text-end">
        <div class="col p-0 pe-1 text-center"><small>Avg</small></div>
        {#each days.values() as day}
            {@const val = dayAvg[`${day}`]}
            <div class="col p-0 pe-1 " style="background-color: {importColor(val, priceCap)}; color: Black;">
                {round(val)}p
            </div>
        {/each}
    </div>

    <div class="row justify-content-center font-monospace text-end mb-1">
        <div class="col p-0 pe-1 text-center"><small>Low</small></div>
        {#each days.values() as day}
            {@const val = dayLow[`${day}`]}
            <div class="col p-0 pe-1 " style="background-color: {importColor(val, priceCap)}; color: Black;">
                {round(val)}p
            </div>
        {/each}
    </div>

    {#each halfHours.values() as halfHour}
        <div class="row justify-content-center font-monospace text-end">
            <div class="col p-0 pe-1 text-center"><small>{halfHour}</small></div>

            {#each days.values() as day}
                {@const price = processedPricing[key(day, halfHour)]}
                {#if price}
                    <div class="col p-0 pe-1" style="background-color: {importColor(price.import, priceCap)}; color: Black;">
                        {round(price.import)}p
                    </div>
                {:else}
                    <div class="col p-0 pe-1">&nbsp;</div>
                {/if}
            {/each}
        </div>
    {/each}
{:else if updating}
    <LoadingPricingAlert />
{:else}
    <IconWaiting /> Waiting on data...
{/if}