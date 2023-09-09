<script lang="ts">
	import { onMount } from "svelte";

    export let defaultPriceCap: number;
    export let priceCap: number;

    const max = 99;
    const min = 1;

    $: priceCap && sanitisePriceCap();

    const sanitisePriceCap = () => {
        if (priceCap < min) {
            priceCap = min;
        } else if (priceCap > max) {
            priceCap = max;
        }
    }

    onMount(() => {
        priceCap = defaultPriceCap;
    });
</script>

<h2 id="price-cap">Price Cap</h2>
<p>
    The energy price cap is the maximum amount energy suppliers can charge you for each unit of energy if you're on a standard variable tariff.
    Ofgrem's website has more information about the <a href="https://www.ofgem.gov.uk/information-consumers/energy-advice-households/energy-price-cap" target="_blank">energy price cap</a>.
    You can customise the price cap value below.
</p>

<div class="input-group mb-4">
    <input bind:value={priceCap} type="number" min={min} max={max} class="form-control">
    <span class="input-group-text">pence/kWh</span>
    <button on:click={() => { priceCap = defaultPriceCap }} class="btn btn-outline-secondary" type="button" title="Reset Price Cap">
        <i class="fa-solid fa-arrow-rotate-right"></i>
    </button>
</div>

