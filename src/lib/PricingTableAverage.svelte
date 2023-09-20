<script lang="ts">
    import { onMount } from "svelte";
	import LoadingPricingAlert from "$lib/LoadingPricingAlert.svelte";
    import { importColor } from "$lib/colors";
    import { round } from "$lib/maths";
    import IconWaiting from "$lib/Icons/IconWaiting.svelte";
    import Price from "$lib/Price";

    export let pricing: Price[] = [];
    export let priceCap: number;
    export let updating = false;

    $: pricing, processPricing();

    let days: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" ];
    let halfHours: string[] = [];
    for (const hour of [...Array(24).keys()]) {
        const h = `${hour.toString().padStart(2, "0")}`;
        halfHours.push(`${h}:00`);
        halfHours.push(`${h}:30`);
    }
    halfHours = halfHours;

    let processedPricing: { [key: string]: Price[]; } = {};
    let dayAvg: { [key: string]: number; } = {};
    let dayTotal: { [key: string]: number; } = {};
    let dayItems: { [key: string]: number; } = {};
    let dayHigh: { [key: string]: number; } = {};
    let dayLow: { [key: string]: number; } = {};
    let dayHalfHourlyAvg: { [key: string]: number; } = {};

    const key = (day: string, halfHour: string) => `${day}-${halfHour}`;

    const processPricing = function() {
        for (const price of pricing) {
            const k = key(price.validFrom.toFormat("ccc"), price.validFrom.toFormat("HH:mm"));
            if (!Array.isArray(processedPricing[k])) {
                processedPricing[k] = [];
            }
            processedPricing[k].push(price);
        }

        // Average, highs and lows
        for (const day of days) {
            dayTotal[`${day}`] = 0;
            dayItems[`${day}`] = 0;
            dayHigh[`${day}`] = -Infinity;
            dayLow[`${day}`] = Infinity;

            let halfHourTotal: { [key: string]: number; } = {};
            let halfHourHigh: { [key: string]: number; } = {};
            let halfHourLow: { [key: string]: number; } = {};

            for (const halfHour of halfHours) {
                const k2 = key(day, halfHour);
                halfHourTotal[k2] = 0;
                halfHourHigh[k2] = -Infinity;
                halfHourLow[k2] = Infinity;

                const prices = processedPricing[k2];
                for (const price of prices) {
                    halfHourTotal[k2] += price.import;
                    halfHourHigh[k2] = (halfHourHigh[k2] < price.import ) ? price.import : halfHourHigh[k2];
                    halfHourLow[k2] = (halfHourLow[k2] > price.import ) ? price.import : halfHourLow[k2];
                }

                dayHalfHourlyAvg[k2] = halfHourTotal[k2] / prices.length;

                // Dailys
                dayTotal[`${day}`] += halfHourTotal[k2];
                dayItems[`${day}`] += prices.length;
                dayHigh[`${day}`] = (dayHigh[`${day}`] < halfHourHigh[k2]) ? halfHourHigh[k2] : dayHigh[`${day}`];
                dayLow[`${day}`] = (dayLow[`${day}`] > halfHourLow[k2]) ? halfHourLow[k2] : dayLow[`${day}`];
            }

            dayAvg[`${day}`] = dayTotal[`${day}`] / dayItems[`${day}`];
        }

        dayHalfHourlyAvg = dayHalfHourlyAvg;
    }

    onMount(() => {
        processPricing();
    });
</script>

{#if Object.keys(dayHalfHourlyAvg).length && halfHours.length && days.length}
    <div class="row justify-content-center font-monospace text-end">
        <div class="col p-0 pe-1">&nbsp;</div>
        {#each days as day}
            <div class="col p-0 pe-1">{day}</div>
        {/each}
    </div>

    <div class="row justify-content-center font-monospace text-end">
        <div class="col p-0 pe-1 text-center"><small>Low</small></div>
        {#each days as day}
            {@const val = dayLow[`${day}`]}
            <div class="col p-0 pe-1" style="background-color: {importColor(val, priceCap)}; color: Black;">
                {round(val)}p
            </div>
        {/each}
    </div>

    <div class="row justify-content-center font-monospace text-end">
        <div class="col p-0 pe-1 text-center"><small>Avg</small></div>
        {#each days as day}
            {@const val = dayAvg[`${day}`]}
            <div class="col p-0 pe-1" style="background-color: {importColor(val, priceCap)}; color: Black;">
                {round(val)}p
            </div>
        {/each}
    </div>

    <div class="row justify-content-center font-monospace text-end mb-2">
        <div class="col p-0 pe-1 text-center"><small>High</small></div>
        {#each days as day}
            {@const val = dayHigh[`${day}`]}
            <div class="col p-0 pe-1" style="background-color: {importColor(val, priceCap)}; color: Black;">
                {round(val)}p
            </div>
        {/each}
    </div>

    <h3 class="h6 text-center">Average Half-Hourly Pricing</h3>

    {#each halfHours as halfHour}
        <div class="row justify-content-center font-monospace text-end">
            <div class="col p-0 pe-1 text-center"><small>{halfHour}</small></div>

            {#each days as day}
                {@const val = dayHalfHourlyAvg[key(day, halfHour)]}
                {#if val}
                    <div class="col p-0 pe-1" style="background-color: {importColor(val, priceCap)}; color: Black;">
                        {round(val)}p
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