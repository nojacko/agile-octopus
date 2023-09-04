const regions: { [key: string]: string; } = {
    "A": "Eastern England",
    "B": "East Midlands",
    "C": "London",
    "D": "Merseyside and Northern Wales",
    "E": "West Midlands",
    "F": "North Eastern England",
    "G": "North Western England",
    "H": "Southern England",
    "J": "South Eastern England",
    "K": "Southern Wales",
    "L": "South Western England",
    "M": "Yorkshire",
    "N": "Southern Scotland",
    "P": "Northern Scotland"
}

export default regions;

export const validRegion = function(value: string) {
    return (value && value.length && typeof value === "string" && regions.hasOwnProperty(value));
}
