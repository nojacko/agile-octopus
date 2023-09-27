<script lang="ts">
    import OctopusAd from "$lib/OctopusAd.svelte";
</script>

<h1 class="text-center display-1 fs-1 text-light mx-1 my-2">Agile Octopus Price Tracker</h1>

<div class="container mb-4 mx-auto">
    <slot />
</div>

<div class="container mb-4 mx-auto">
    <OctopusAd />
    <p class="fs-1 text-center mb-5">🐙</p>
</div>

<div id="nav-bar" class="container-fluid border-top border-secondary-subtle py-1 text-center text-body-secondary">
    <small>
        <a href="#top"><i class="fa-solid fa-house"></i></a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#region">Region</a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#pricing-table">Pricing</a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#about">FAQs</a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#how-to-get-agile" class="text-warning-emphasis">Free &pound;50!</a>
    </small>
</div>

<style>
    .container {
        max-width: 36rem;
    }

    #nav-bar {
        position: fixed;
        bottom: 0rem;
        left: 0rem;
        right: 0rem;
        z-index: 10;
        background-color: rgb(33, 37, 41);
    }

    #nav-bar a {
        color: White;
    }
</style>