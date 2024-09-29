export const defaultRegion = "B";

export class Region {
    code: string;
    name: string;

    constructor(code: string, name: string) {
        this.code = code;
        this.name = name;
    }

    get slug() {
        const slug = this.name.toLocaleLowerCase().replace(/[^\w]/gi, "-");
        return `${slug}-${this.code}`;
    }

    get longName() {
        return `${this.name} (${this.code})`;
    }
}

export const regions: Region[] = [
    new Region("A", "Eastern England"),
    new Region("B", "East Midlands"),
    new Region("C", "London"),
    new Region("D", "Merseyside and Northern Wales"),
    new Region("E", "West Midlands"),
    new Region("F", "North Eastern England"),
    new Region("G", "North Western England"),
    new Region("H", "Southern England"),
    new Region("J", "South Eastern England"),
    new Region("K", "Southern Wales"),
    new Region("L", "South Western England"),
    new Region("M", "Yorkshire"),
    new Region("N", "Southern Scotland"),
    new Region("P", "Northern Scotland"),
];


export const getRegionByCode = function(code: string) {
    for (const region of regions) {
        if (region.code === code) {
            return region;
        }
    }

    return null;
}

export const validRegion = function(value: string) {
    return (getRegionByCode(value) !== null)
}
