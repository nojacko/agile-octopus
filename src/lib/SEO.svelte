<script lang="ts">
// https://www.reddit.com/r/sveltejs/comments/1e1bcb6/how_you_guys_manage_metadataseo_in_svelte_kit/?rdt=34504

const defaultTitle = "Agile Octopus Price Tracker";
const defaultDescription = "Quickly see the upcoming electricity prices for Octopus Energy's Agile Octopus tariff.";

export let title = "";
export let description = "";
</script>

<title>{title.length ? `${title} | ${defaultTitle}` : defaultTitle }</title>
<meta name="description" content={description.length ? `${description} | ${defaultDescription}` : defaultDescription } />

<!-- Website-->
{@html `<script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Agile Octopus Price Tracker",
        "url": "https://agile-octopus.datafury.io/"
    }
</script>`}