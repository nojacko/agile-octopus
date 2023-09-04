<script>
    import { DateTime } from "luxon";
    const priceCapChange = DateTime.fromISO("2023-10-01T12:00:00Z").startOf('day');
    const defaultPriceCap = (DateTime.now() > priceCapChange) ? 27 : 30;
    export let priceCap = defaultPriceCap;

    const max = 99;
    const min = 1;

    $: priceCap && sanitisePriceCap();

    const sanitisePriceCap = () => {
        if (priceCap < min) {
            priceCap = min;
        } else if (priceCap > max) {
            priceCap = max;
        }
    }
</script>

<strong>Price Cap</strong>
<p>
    The energy price cap is the maximum amount energy suppliers can charge you for each unit of energy if you're on a standard variable tariff.
    Ofgrem's website has more information about the <a href="https://www.ofgem.gov.uk/information-consumers/energy-advice-households/energy-price-cap" target="_blank">energy price cap</a>.
    You can customise the price cap value below.
</p>

<div class="input-group mb-4">
    <span class="input-group-text">Price cap</span>
    <input bind:value={priceCap} type="number" min={min} max={max} class="form-control">
    <span class="input-group-text">pence kWh</span>
    <button on:click={() => {priceCap = defaultPriceCap}} class="btn btn-outline-secondary" type="button">Reset</button>
</div>

