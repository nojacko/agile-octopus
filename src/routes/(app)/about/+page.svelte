<script lang="ts">
    import BreadcrumbAbout from "$lib/Breadcrumb/BreadcrumbAbout.svelte";
    import SEO from "$lib/SEO.svelte";

	export let data;
</script>

<svelte:head>
    <SEO title="About"/>
</svelte:head>

<BreadcrumbAbout h2="About"/>

<p><a href="https://agile-octopus.datafury.io">{data.site.name}</a> is your premier destination for tracking half-hourly electricity prices on Octopus Energy's Agile tariff. We are passionate about helping you make informed decisions about your energy consumption and managing their energy bills more efficiently.</p>
