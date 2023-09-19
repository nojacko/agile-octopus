const GREEN = "#28B463";
const GREEN_LIGHT = "#58D68D";
const YELLOW = "#F7DC6F";
const ORANGE = "#E59866";
const RED = "#E74C3C";
const PURPLE = "#BF40BF";

const IMPORT_SCALE = [
    GREEN_LIGHT,
    "#96db78", // https://colordesigner.io/gradient-generator
    "#c9dd6d",
    YELLOW,
    "#f5c469",
    "#efad66",
    ORANGE,
    "#e68253",
    "#e76a45",
    RED,
];

const EXPORT_SCALE = [
    GREEN_LIGHT,
    YELLOW,
    ORANGE,
    RED,
];

export const COLOUR_ABOVE_PRICE_CAP = PURPLE;
export const PAID_TO_IMPORT = GREEN;
export const COLOUR_GOLD = "gold";

export const importColor = function(price: number, cap: number) {
    if (price <= 0) {
        return GREEN;
    } else if (price > cap) {
        return PURPLE;
    }

    // Auto selct the color
    const scaleSteps = IMPORT_SCALE.length;
    const ratio = scaleSteps/cap;
    const step = Math.min(scaleSteps-1, Math.floor(price * ratio));
    return IMPORT_SCALE[step];
}

export const exportColor = function(price: number, cap: number) {
    // Export tends to be about half import
    const adjustedCap = cap / 2;

    // Auto selct the color
    const scaleSteps = EXPORT_SCALE.length;
    const ratio = scaleSteps/adjustedCap;
    const step = (scaleSteps - 1) - Math.min(scaleSteps-1, Math.floor(price * ratio));
    return EXPORT_SCALE[step];
}
