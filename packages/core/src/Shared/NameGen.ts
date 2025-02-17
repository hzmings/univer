const include: string[] = [];
let identity: number = 0;

/**
 * Generate unique sheet name
 */
export class NameGen {
    private static _generateName(): string {
        return `sheet${++identity}`;
    }

    private static _checkedName(name: string): boolean {
        const checked = include.includes(name);
        if (!checked) {
            include.push(name);
        }
        return checked;
    }

    static getSheetName(name?: string): string {
        if (name === undefined) {
            name = NameGen._generateName();
        }
        while (NameGen._checkedName(name)) {
            name = NameGen._generateName();
        }
        return name;
    }
}
