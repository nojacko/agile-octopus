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

<div class="input-group mb-4">
    <input bind:value={priceCap} type="number" min={min} max={max} class="form-control">
    <span class="input-group-text">pence/kWh</span>
    <button on:click={() => { priceCap = defaultPriceCap }} class="btn btn-outline-secondary" type="button" title="Reset Price Cap">
        <i class="fa-solid fa-arrow-rotate-right"></i>
    </button>
</div>
