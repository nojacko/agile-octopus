<script lang="ts">
	import IconLoading from "$lib/Icons/IconLoading.svelte";

    export let updating = false;
    export let error = false;
</script>

<p class="text-center">
    {#if updating}
        <IconLoading /> Loading...
    {:else if error}
        <i class="fa-solid fa-bug"></i> Sorry. Couldn't load data. Try again later.
    {:else}
        <small>Prices become available between 4-8pm</small>
    {/if}
</p>