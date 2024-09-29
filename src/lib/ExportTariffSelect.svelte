<script lang="ts">
	import { tariffs } from "$lib/tariffs";

    export let exportTariff: string;

    let showInfo = false;

    const exportTariffs = tariffs.filter(t => t.isExport());
</script>

<div class="input-group">
    <label class="input-group-text" for="export-tariff-select">Export</label>
    <select bind:value={exportTariff} class="form-select" id="export-tariff-select">
        {#each exportTariffs as tariff}
            <option value={tariff.code}>{tariff.name} ({tariff.code})</option>
        {/each}
    </select>
    <button on:click={() => { showInfo = !showInfo }} class="btn btn-outline-secondary" type="button">
        <i class="fa-solid fa-circle-question"></i>
    </button>
</div>

{#if showInfo}
    <div class="card mt-2">
        <div class="card-body">
            <button type="button" class="btn btn-outline-secondary btn-sm float-end" on:click={() => { showInfo = false; }}><i class="fa-solid fa-xmark"></i></button>
            <p>Your export tariff can be found on your bill.</p>
        </div>
    </div>
{/if}