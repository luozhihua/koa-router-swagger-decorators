export = EventEmitter;
declare class EventEmitter extends events.EventEmitter {
    _resultFilter: any;
    set maxListeners(arg: number);
    get maxListeners(): number;
    getResultFilter(): any;
    setResultFilter(filter: any): EventEmitter;
    set resultFilter(arg: any);
    get resultFilter(): any;
    _events: {} | undefined;
    _eventsCount: any;
}
declare namespace EventEmitter {
    export { EventEmitter };
    export const defaultResultFilter: any;
}
import events = require("node/events");
