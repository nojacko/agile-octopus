<script lang="ts">
    import '../../app.css';
    import OctopusAd from "$lib/OctopusAd.svelte";

    const navItemClass = "nav-link link-light"
</script>

<h1 id="top" class="text-center display-1 fs-1 text-light mx-1 mt-2 mb-3">
    <a href="/" class="link-light link-underline link-underline-opacity-0 link-underline-opacity-100-hover">Agile Octopus Price Tracker</a>
</h1>

<div class="container mb-4 mx-auto">
    <slot />
</div>

<div class="container mb-5 mx-auto">
    <OctopusAd />
    <p class="fs-1 text-center">🐙</p>

    <ul class="nav justify-content-center">
        <li class="nav-item">
            <a class="{navItemClass}" href="/">Home</a>
        </li>
        <li class="nav-item">
            <a class="{navItemClass}" href="/about">About</a>
        </li>
    </ul>
</div>

<div id="nav-bar" class="container-fluid border-top border-secondary-subtle py-1 text-center text-body-secondary">
    <small>
        <a href="#top"><i class="fa-solid fa-house"></i></a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#pricing-table">Pricing</a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#about">FAQs</a>
        <i class="fa-solid fa-bolt fa-2xs"></i>
        <a href="#how-to-get-agile" class="text-warning-emphasis">Free &pound;50!</a>
    </small>
</div>