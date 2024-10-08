<script lang="ts">
	import IconLoading from "$lib/Icon/IconLoading.svelte";
    import { Region, regions, validRegion, getRegionByCode } from "$lib/regions";

    export let region: string;

    let showLookup = false;
    let lookupLoading = false;
    let lookupNotFound = false;
    let lookupError = false;
    let postcode = "";
    let userRegion: Region|null;
    let userPostcode = "";

    $: showLookup, resetLookup();

    const resetLookup = function() {
        lookupError = false;
        lookupNotFound = false;
    }

    const lookupRegion = async function() {
        if (postcode && postcode.length < 3 && postcode.length > 20) {
            return;
        }

        resetLookup();

        try {
            lookupLoading = true;
            userPostcode = postcode;
            const lookupResp = await fetch(`https://api.octopus.energy/v1/industry/grid-supply-points/?postcode=${userPostcode}`);
            const lookupJson = await lookupResp.json();

            let suggestedRegion = "";
            if (lookupJson && lookupJson.results.length === 1) {
                suggestedRegion = lookupJson.results[0].group_id.replace(/[^a-z0-9]/gi, '');
                const _userRegion = getRegionByCode(suggestedRegion);
                if (_userRegion) {
                    userRegion = _userRegion;
                    region = userRegion.code;
                }
            }

            if (suggestedRegion === "") {
                lookupNotFound = true;
            }
        } catch (err) {
            lookupError = true;
        }

        lookupLoading = false;
    }
</script>

<div class="input-group">
    <label class="input-group-text" for="region-select">Region</label>
    <select bind:value={region} class="form-select" id="region-select">
        {#each regions as reg}
            <option value={reg.code}>{reg.longName}</option>
        {/each}
    </select>
    <button on:click={() => { showLookup = !showLookup }} class="btn btn-outline-secondary" type="button">
        <i class="fa-solid fa-circle-question"></i>
    </button>
</div>

{#if showLookup}
    <div class="card mt-2">
        <div class="card-body">
            <button type="button" class="btn btn-outline-secondary btn-sm float-end" on:click={() => { showLookup = false; }}><i class="fa-solid fa-xmark"></i></button>

            <p class="card-title fw-bold">Lookup Your Region</p>
            <p>Enter your postcode to find your region.</p>

            {#if lookupLoading}
                <div class="alert alert-secondary" role="alert">
                    <IconLoading /> Loading...
                </div>
            {:else if userRegion && userPostcode === postcode}
                <div class="alert alert-secondary" role="alert">
                    <i class="fa-solid fa-location-dot"></i> The region for <strong>{postcode.toUpperCase()}</strong> is <strong>{userRegion.longName}</strong>.
                </div>
            {:else if lookupError}
                <div class="alert alert-warning" role="alert">
                    <i class="fa-solid fa-bug"></i> Something went wrong. Try again later.
                </div>
            {:else if lookupNotFound}
                <div class="alert alert-warning" role="alert">
                    <i class="fa-regular fa-circle-question"></i> Could not find region for postcode. Please
                </div>
            {/if}

            <form on:submit|preventDefault={lookupRegion}>
                <div class="input-group">
                    <label class="input-group-text" for="region-select">Postcode</label>
                    <input type="text" class="form-control" bind:value={postcode} maxlength="10">
                    <button class="btn btn-outline-secondary" type="submit">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}