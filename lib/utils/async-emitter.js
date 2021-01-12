"use strict";
const events = require("events");
class EventEmitter extends events.EventEmitter {
    constructor() {
        super();
        this._resultFilter = this._resultFilter || undefined;
    }
    get maxListeners() {
        return this.getMaxListeners();
    }
    set maxListeners(n) {
        this.setMaxListeners(n);
    }
    getResultFilter() {
        return this.resultFilter;
    }
    setResultFilter(filter) {
        this.resultFilter = filter;
        return this;
    }
    get resultFilter() {
        return ((this._resultFilter === undefined && EventEmitter.defaultResultFilter) ||
            this._resultFilter);
    }
    set resultFilter(filter) {
        if (filter !== undefined &&
            filter !== null &&
            typeof filter !== "function") {
            throw new TypeError("Filter must be a function");
        }
        this._resultFilter = filter;
    }
    emit(type, ...args) {
        const resultFilter = this.getResultFilter();
        const events = this._events;
        const domain = this._domain;
        const errorMonitor = EventEmitter.errorMonitor;
        const results = [];
        let handlers;
        let needDomainExit = false;
        let doError = type === "error";
        let promise = Promise.resolve();
        if (events) {
            if (doError && events[errorMonitor] !== undefined) {
                promise = promise.then(() => this.emit(errorMonitor, ...args));
            }
            doError = doError && events.error === undefined;
        }
        else if (!doError) {
            return promise.then(() => false);
        }
        if (doError) {
            let er;
            if (args.length > 0) {
                er = args[0];
            }
            if (!er) {
                er = new Error('Uncaught, unspecified "error" event.');
            }
            else if (!(er instanceof Error)) {
                let err = new Error('Uncaught, unspecified "error" event. (' + er + ")");
                err.context = er;
                er = err;
            }
            if (domain) {
                er.domainEmitter = this;
                er.domain = domain;
                er.domainThrown = false;
                promise = promise.then(() => domain.emit("error", er));
            }
            return promise.then(() => {
                throw er;
            });
        }
        handlers = events && events[type];
        if (!handlers) {
            return promise;
        }
        if (domain && this !== process) {
            domain.enter();
            needDomainExit = true;
        }
        if (typeof handlers === "function") {
            handlers = [handlers];
        }
        if (handlers.length) {
            promise = handlers.reduce((p, handler) => p.then(() => handler(...args)).then((result) => results.push(result)), promise);
        }
        if (needDomainExit) {
            promise = promise.then(() => domain.exit(), (err) => {
                domain.exit();
                throw err;
            });
        }
        return promise.then(() => resultFilter ? results.filter(resultFilter) : results);
    }
    addListener(type, listener) {
        return _addListener(this, type, listener, false);
    }
    prependListener(type, listener) {
        return _addListener(this, type, listener, true);
    }
    once(type, listener) {
        if (arguments.length === 1) {
            return new Promise((resolve) => {
                this.once(type, resolve);
            });
        }
        else {
            if (typeof listener !== "function") {
                throw new TypeError('"listener" argument must be a function');
            }
            return this.addListener(type, _onceWrap(this, type, listener));
        }
    }
    prependOnceListener(type, listener) {
        if (typeof listener !== "function") {
            throw new TypeError('"listener" argument must be a function');
        }
        return this.prependListener(type, _onceWrap(this, type, listener));
    }
    removeListener(type, listener) {
        let list, events, position;
        if (typeof listener !== "function") {
            throw new TypeError('"listener" argument must be a function');
        }
        events = this._events;
        list = events && events[type];
        if (!list) {
            return Promise.resolve();
        }
        if (list === listener || (list.listener && list.listener === listener)) {
            if (--this._eventsCount === 0) {
                this._events = {};
            }
            else {
                delete events[type];
                if (events.removeListener) {
                    return this.emit("removeListener", type, listener);
                }
            }
        }
        else if (typeof list !== "function") {
            position = -1;
            for (let i = list.length; i-- > 0;) {
                if (list[i] === listener ||
                    (list[i].listener && list[i].listener === listener)) {
                    position = i;
                    break;
                }
            }
            if (position < 0) {
                return Promise.resolve();
            }
            if (list.length === 1) {
                list[0] = undefined;
                if (this._eventsCount === 1) {
                    this._events = {};
                    this._eventsCount = 0;
                    return Promise.resolve();
                }
                else {
                    delete events[type];
                }
            }
            else {
                list.splice(position, 1);
                if (list.length === 1) {
                    events[type] = list[0];
                }
            }
            --this._eventsCount;
            if (events.removeListener) {
                return this.emit("removeListener", type, listener);
            }
        }
        return Promise.resolve();
    }
    removeAllListeners(type) {
        let listeners, events;
        let promise;
        events = this._events;
        if (!events) {
            return Promise.resolve();
        }
        if (!events.removeListener) {
            if (arguments.length === 0) {
                this._eventsCount = 0;
                this._events = {};
            }
            else if (events[type]) {
                if (this._eventsCount === 1) {
                    this._eventsCount = 0;
                    this._events = {};
                }
                else {
                    this._eventsCount =
                        this._eventsCount -
                            (typeof events[type] === "function" ? 1 : events[type].length);
                    delete events[type];
                }
            }
            return Promise.resolve();
        }
        if (arguments.length === 0) {
            const keys = Object.keys(events);
            for (let i = 0, key; i < keys.length; ++i) {
                key = keys[i];
                if (key === "removeListener")
                    continue;
                promise = promise
                    ? promise.then(this.removeAllListeners(key))
                    : this.removeAllListeners(key);
            }
            promise = promise
                ? promise.then(this.removeAllListeners("removeListener"))
                : this.removeAllListeners("removeListener");
            this._events = {};
            this._eventsCount = 0;
            return promise || Promise.resolve();
        }
        listeners = events[type];
        if (typeof listeners === "function") {
            promise = this.removeListener(type, listeners);
        }
        else if (listeners) {
            for (let i = listeners.length - 1; i >= 0; --i) {
                promise = promise
                    ? promise.then(this.removeListener(type, listeners[i]))
                    : this.removeListener(type, listeners[i]);
            }
        }
        return promise || Promise.resolve();
    }
}
EventEmitter.EventEmitter = EventEmitter;
Object.defineProperties(EventEmitter, {
    defaultMaxListeners: {
        get: function getDefaultMaxListeners() {
            return events.EventEmitter.defaultMaxListeners;
        },
        set: function setDefaultMaxListeners(n) {
            events.EventEmitter.defaultMaxListeners = n;
        },
    },
    usingDomains: {
        get: function getUsingDomains() {
            return events.EventEmitter.usingDomains;
        },
        set: function setUsingDomains(b) {
            events.EventEmitter.usingDomains = b;
        },
    },
});
EventEmitter.defaultResultFilter = undefined;
EventEmitter.prototype.on = EventEmitter.prototype.addListener;
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype._resultFilter = undefined;
function _addListener(target, type, listener, prepend) {
    let m;
    let events;
    let existing;
    let promise;
    if (typeof listener !== "function") {
        throw new TypeError('"listener" argument must be a function');
    }
    events = target._events;
    if (!events) {
        events = target._events = {};
        target._eventsCount = 0;
    }
    else {
        if (events.newListener) {
            promise = target.emit("newListener", type, listener.listener ? listener.listener : listener);
        }
        existing = events[type];
    }
    if (!existing) {
        existing = events[type] = listener;
    }
    else {
        if (typeof existing === "function") {
            existing = events[type] = prepend
                ? [listener, existing]
                : [existing, listener];
        }
        else {
            if (prepend) {
                existing.unshift(listener);
            }
            else {
                existing.push(listener);
            }
        }
        if (!existing.warned) {
            m = target.maxListeners;
            if (m && m > 0 && existing.length > m) {
                existing.warned = true;
                console.error("warning: possible EventEmitter memory " +
                    "leak detected. %d %s listeners added. " +
                    "Use emitter.setMaxListeners() to increase limit.", existing.length, type);
                console.trace();
            }
        }
    }
    ++target._eventsCount;
    return promise || Promise.resolve();
}
function _onceWrap(target, type, listener) {
    let fired = false;
    function g() {
        if (!fired) {
            const args = arguments;
            fired = true;
            return target
                .removeListener(type, g)
                .then(() => listener.apply(target, args));
        }
    }
    g.listener = listener;
    return g;
}
module.exports = EventEmitter;
//# sourceMappingURL=async-emitter.js.map