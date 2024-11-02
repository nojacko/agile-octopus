# Agile Octopus Price Tracker

Quickly see the upcoming electricity prices for Octopus Energy's Agile Octopus tariff. Visit <https://agile-octopus.datafury.io> to use.

If you want to join [Octopus Energy](https://share.octopus.energy/sunny-river-570) please consider using my [link](https://share.octopus.energy/sunny-river-570) and get £50 free credit free!

## Developing

```bash
npm install
npm run dev
```

### Update Tariffs

* `npx tsx src/lib/script/tariffs.ts`
* Copy output to `src/lib/tariffs.ts`

## Building

To create a production version of your app:

```bash
npm run build
```

## Deploy

```bash
npm run deploy
```
