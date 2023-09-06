import { DateTime } from "luxon";

class Price {
    validFrom: DateTime;
    validTo: DateTime;
    readableDate: string;
    fullReadableDate: string;
    import: number;
    export: number;

    isNow() {
        const now = DateTime.now();
        return (this.validFrom < now && this.validTo > now);
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
        // Color
        let bgColor = "#28B463"; // Green
        if (this.import > priceCap) {
            bgColor = "#BF40BF"; // Purple
        } else if (this.import > priceCap/4*3) {
            bgColor = "#E74C3C"; // Red
        } else if (this.import > priceCap/4*2) {
            bgColor = "#E59866"; // Orange
        } else if (this.import > priceCap/4*1) {
            bgColor = "#F7DC6F"; // Yellow
        } else if (this.import > 0) {
            bgColor = "#58D68D"; // Light green
        }

        return bgColor
    }

    exportColor(priceCap: number) {
        const priceCapAdj = priceCap/2;
        // Color
        let bgColor = "#BF40BF"; // Purple 
        if (this.export > priceCapAdj) {
            bgColor = "#28B463"; // Green
        } else if (this.export > priceCapAdj/4*3) {
            bgColor = "#58D68D"; // Light green
        } else if (this.export > priceCapAdj/4*2) {
            bgColor = "#F7DC6F"; // Yellow
        } else if (this.export > priceCapAdj/4*1) {
            bgColor = "#E59866"; // Orange
        } else if (this.export > 0) {
            bgColor = "#E74C3C"; // Red
        }

        return bgColor
    }

    importCloseToLowestImport(lowestImport: number, margin = 1) {
        return (this.import <= lowestImport + margin);
    }

    exportCloseToHighestExport(lowestImport: number, margin = 1) {
        return (this.export >= lowestImport - margin);
    }
};

export default Price