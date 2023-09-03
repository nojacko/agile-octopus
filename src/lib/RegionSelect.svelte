<script>
    import regions from "./regions";
    export let region = "B";
</script>

<select bind:value={region}> 
    {#each Object.keys(regions) as key}
        <option value={key}>
            {regions[key]}
        </option>
    {/each}
</select>

