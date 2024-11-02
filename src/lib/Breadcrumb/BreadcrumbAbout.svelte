<script lang="ts">
    export let name = "";
    export let h2 = ""
</script>

<nav aria-label="breadcrumb">
    <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="/">Price Tracker</a></li>

        {#if name.length}
            <li class="breadcrumb-item"><a href="/about">About</a></li>
            <li class="breadcrumb-item active" aria-current="page">{name}</li>
        {:else}
            <li class="breadcrumb-item active" aria-current="page">About</li>
        {/if}
    </ol>
</nav>

{#if h2.length}
    <h2 class="display-6 text-center">{h2}</h2>
{/if}