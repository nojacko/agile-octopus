import { DateTime } from "luxon";
import { importColor, exportColor } from "$lib/colors";

class Price {
    validFrom: DateTime;
    validTo: DateTime;
    import: number;
    export: number;

    isNow() {
        const now = DateTime.now();
        return (this.validFrom < now && this.validTo > now);
    }

    readableTime(): string {
        return this.validFrom.toFormat("t");
    }

    fullReadableDate(): string {
        return this.validFrom.toFormat("DDDD");
    }

    isFuture() {
        const now = DateTime.now();
        return (this.validFrom > now);
    }

    diffStr() {
        if (this.isNow()) {
            return "NOW";
        }

        const now = DateTime.now();
        const diff = this.validFrom.diff(now, ['hours', 'minutes']).toObject();
        const hours = Math.round(diff.hours || 0);
        const minutes = Math.round(diff.minutes || 0);
        return `${(hours > 0) ? `${hours}h` : ``} ${minutes.toString().padStart(2, "0")}m`;
    }

    importColor(priceCap: number) {
        return importColor(this.import, priceCap);
    }

    exportColor(priceCap: number) {
        return exportColor(this.export, priceCap)
    }

    importCloseToLowestImport(lowestImport: number, margin = 1) {
        return (this.import <= lowestImport + margin);
    }

    exportCloseToHighestExport(lowestImport: number, margin = 1) {
        return (this.export >= lowestImport - margin);
    }
};

export default Price