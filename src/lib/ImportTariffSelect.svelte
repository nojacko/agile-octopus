<script lang="ts">
	import { tariffs } from "$lib/tariffs";

    export let importTariff: string;

    let showInfo = false;

    const importTariffs = tariffs.filter(t => t.isImport());
</script>

<div class="input-group">
    <label class="input-group-text" for="import-tariff-select">Import</label>
    <select bind:value={importTariff} class="form-select" id="import-tariff-selectt">
        {#each importTariffs as tariff}
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
            <p>Your import tariff can be found on your bill.</p>
        </div>
    </div>
{/if}