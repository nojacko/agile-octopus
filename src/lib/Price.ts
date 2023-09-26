import { DateTime } from "luxon";
import { importColor, exportColor } from "$lib/colors";

export interface PriceHash { [key: string]: Price; };

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
        let hours = diff.hours || 0;
        let minutes = Math.round(diff.minutes || 0);

        // Ensure we don't show "60m" (as that's 1 hour) due to rounding
        if (minutes === 60) {
            hours += 1;
            minutes = 0;
        }

        if (hours === 0 && minutes === 0) {
            return "<1m";
        } else if (hours === 0) {
            return `${minutes}m`
        }

        return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
    }

    importColor(priceCap: number) {
        return importColor(this.import, priceCap);
    }

    exportColor(priceCap: number) {
        return exportColor(this.export, priceCap)
    }

    importCloseToLowestImport(lowestImport: number, margin = 2) {
        return (this.import <= lowestImport + margin);
    }

    exportCloseToHighestExport(lowestImport: number, margin = 2) {
        return (this.export >= lowestImport - margin);
    }
};

export default Price