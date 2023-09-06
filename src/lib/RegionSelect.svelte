<script lang="ts">
	import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import regions, { validRegion } from "./regions";
    export let region: string;

    const defaultRegion = "B";

    $: region, updatePriceCap();

    const updatePriceCap = function() {
        if (validRegion(region)) {
            if (browser && localStorage) {
                localStorage.setItem("priceCap", region);
            }
        } else {
            region = defaultRegion;
        }
    }

    onMount(() => {
        // Load region or set to default
        let localRegion = "";
        if (browser && localStorage) {
            localRegion = localStorage.getItem("priceCap") || "";
        }
        region = (validRegion(localRegion)) ? localRegion : defaultRegion;
    });
</script>

<div class="input-group mb-3">
    <label class="input-group-text" for="region-select">Region</label>
    <select bind:value={region} class="form-select" id="region-select"> 
        <option value="">Select your region...</option>
        {#each Object.keys(regions) as key}
            <option value={key}>{regions[key]} ({key})</option>
        {/each}
    </select>
</div>

  



