<script lang="ts">
    import { onMount } from "svelte";
	import { DateTime } from "luxon";

    import type Price from "$lib/Price";
    import { round } from "$lib/maths";
    import { importColor } from "$lib/colors";
	import type PricingHash from "$lib/PricesHash";

    export let pricing: Price[] = [];
    export let priceCap: number;

    $: pricing && processPricing();

    let processedPricing: { [key: string]: PricingHash } = {};
    let days = new Set();
    let halfHours = new Set();

    let dayAvg: { [key: string]: number; } = {};
    let dayTotal: { [key: string]: number; } = {};
    let dayHigh: { [key: string]: number; } = {};
    let dayLow: { [key: string]: number; } = {};

    const processPricing = function() {
        const now = DateTime.now();
        const dayOfWeek = parseInt(now.toFormat("c"))
        let start = now.minus({days: 7 - dayOfWeek}).startOf("week");
        let end = start.endOf("week");

        let _days = new Set();
        let _halfHours = new Set();

        for (const price of pricing) {
            const unixInt = price.validFrom.toUnixInteger();
            if (unixInt >= start.toUnixInteger() && unixInt <= end.toUnixInteger()) {
                const day = price.validFrom.toFormat("ccc")
                const halfHour = price.validFrom.toFormat("HH:mm");
                _days.add(day);
                _halfHours.add(halfHour);

                if (!processedPricing[day]) {
                    processedPricing[day] = {};
                }

                processedPricing[day][halfHour] = price;
            }
        }

        // Average, highs and lows
        for (const day of _days) {
            dayTotal[`${day}`] = 0;
            dayHigh[`${day}`] = -Infinity;
            dayLow[`${day}`] = Infinity;

            for (const halfHour of halfHours) {
                const price = processedPricing[`${day}`][`${halfHour}`];
                dayTotal[`${day}`] += price.import;
                dayHigh[`${day}`] = (dayHigh[`${day}`] < price.import ) ? price.import : dayHigh[`${day}`];
                dayLow[`${day}`] = (dayLow[`${day}`] > price.import ) ? price.import : dayLow[`${day}`];
            }
            dayAvg[`${day}`] = dayTotal[`${day}`] / halfHours.size;
        }

        // Force variable updates
        processedPricing = processedPricing;
        days = _days;
        halfHours = _halfHours;
    }

    onMount(() => { processPricing(); });
</script>

<div class="row justify-content-center font-monospace text-end">
    <div class="col ps-0 pe-1">&nbsp;</div>
    {#each days.values() as day}
        <div class="col ps-0 pe-1">{day}</div>
    {/each}
</div>

<div class="row justify-content-center font-monospace text-end">
    <div class="col ps-0 pe-1 text-center"><small>High</small></div>
    {#each days.values() as day}
        {@const val = dayHigh[`${day}`]}
        <div class="col ps-0 pe-1 " style="background-color: {importColor(val, priceCap)}; color: Black;">
            {round(val)}p
        </div>
    {/each}
</div>
<div class="row justify-content-center font-monospace text-end">
    <div class="col ps-0 pe-1 text-center"><small>Avg</small></div>
    {#each days.values() as day}
        {@const val = dayAvg[`${day}`]}
        <div class="col ps-0 pe-1 " style="background-color: {importColor(val, priceCap)}; color: Black;">
            {round(val)}p
        </div>
    {/each}
</div>

<div class="row justify-content-center font-monospace text-end mb-1">
    <div class="col ps-0 pe-1 text-center"><small>Low</small></div>
    {#each days.values() as day}
        {@const val = dayLow[`${day}`]}
        <div class="col ps-0 pe-1 " style="background-color: {importColor(val, priceCap)}; color: Black;">
            {round(val)}p
        </div>
    {/each}
</div>

{#each halfHours.values() as halfHour}
    <div class="row justify-content-center font-monospace text-end">
        <div class="col ps-0 pe-1 text-center"><small>{halfHour}</small></div>

        {#each days.values() as day}
            {@const price = processedPricing[`${day}`][`${halfHour}`]}
            <div class="col ps-0 pe-1" style="background-color: {importColor(price.import, priceCap)}; color: Black;">
                {round(price.import)}p
            </div>
        {/each}
    </div>
{/each}