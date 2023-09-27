<script lang="ts">
	export let data;
</script>

<svelte:head>
    <title>About - {data.site.name}</title>
    <meta name="description" content="Quickly see the upcoming electricity prices for Octopus Energy's Agile Octopus tariff." />
</svelte:head>

<h2>About</h2>

<p><a href="https://agile-octopus.datafury.io">{data.site.name}</a> is your premier destination for tracking half-hourly electricity prices on Octopus Energy's Agile tariff. We are passionate about helping you make informed decisions about your energy consumption and managing their energy bills more efficiently.</p>
