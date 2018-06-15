
export class WorldEvent {
    name: string;
    year: number;
    month: number;
    event_type: string;

    constructor(name: string, year: number, month: number, event_type: string) {
        this.name = name;
        this.year = year;
        this.month = month;
        this.event_type = event_type;
    }
}
