
export const defaultImportTariff = "AGILE-BB-23-12-06";
export const defaultExportTariff = "AGILE-OUTGOING-19-05-13";

export const IMPORT = "IMPORT";
export const EXPORT = "EXPORT";

export class Tariff {
    name: string;
    code: string;
    type: string;

    constructor(code: string, name: string, type: string) {
        this.code = code;
        this.name = name;
        this.type = type;
    }

    isImport = () => this.type === IMPORT;
    isExport = () => this.type === EXPORT;
}

export const tariffs: Tariff[] = [
    new Tariff("AGILE-24-04-03", "Agile Octopus April 2024 v1", IMPORT),
    new Tariff("AGILE-BB-24-04-03",  "Agile Octopus April 2024 v1", IMPORT),
    new Tariff("AGILE-23-12-06", "Agile Octopus December 2023 v1", IMPORT),
    new Tariff("AGILE-BB-23-12-06", "Agile Octopus December 2023 v1", IMPORT),
    new Tariff("AGILE-FLEX-BB-23-02-08", "Agile Octopus February 2023 v1", IMPORT),
    new Tariff("AGILE-FLEX-22-11-25", "Agile Octopus November 2022 v1", IMPORT),
    new Tariff("AGILE-22-08-31", "Agile Octopus August 2022 v1", IMPORT),
    new Tariff("AGILE-22-07-22", "Agile Octopus July 2022 v1", IMPORT),
    new Tariff("AGILE-18-02-21", "Agile Octopus February 2018", IMPORT),

    new Tariff("AGILE-OUTGOING-19-05-13", "Agile Outgoing Octopus May 2019", EXPORT),
    new Tariff("AGILE-OUTGOING-BB-23-02-28", "Agile Outgoing Octopus February 2023", EXPORT),
];

export const getTariffByCode = function(code: string) {
    for (const tariff of tariffs) {
        if (tariff.code === code) {
            return tariff;
        }
    }

    return null;
}

export const validTariff = function(value: string) {
    return (getTariffByCode(value) !== null)
}
