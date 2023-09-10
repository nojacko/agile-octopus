<script lang="ts">
    import { onMount } from "svelte";
	import { DateTime } from "luxon";
    import type Price from "./Price";
    import { round } from "$lib/maths";
	import type PricingHash from "./PricesHash";
    export let pricing: Price[] = [];
    export let priceCap: number;

    $: pricing && processPricing();

    let processedPricing: PricingHash = {};
    let days = new Set();
    let halfHours = new Set();

    const processPricing = function() {
        let _processedPricing: PricingHash = {};
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
                const halfHour = price.validFrom.toFormat("HHmm");
                _days.add(day);
                _halfHours.add(halfHour);
                _processedPricing[`${day} ${halfHour}`] = price;
            }
        }

        // Force variable updates
        processedPricing = _processedPricing;
        days = _days;
        halfHours = _halfHours;
    }

    onMount(() => { processPricing(); });
</script>

<div class="row justify-content-center font-monospace text-end">
    <div class="col px-0">&nbsp;</div>
    {#each days.values() as day}
        <div class="col px-0">{day}</div>
    {/each}
</div>

{#each halfHours.values() as halfHour}
    <div class="row justify-content-center font-monospace text-end">
        <div class="col text-center px-0">{halfHour}</div>

        {#each days.values() as day}
            {@const price = processedPricing[`${day} ${halfHour}`]}
            <div class="col px-0" style="background-color: {price.importColor(priceCap)}; color: Black;">
                {round(price.import)}p
            </div>
        {/each}
    </div>
{/each}