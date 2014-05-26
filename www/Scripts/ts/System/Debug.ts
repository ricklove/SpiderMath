declare var _gaq;
declare var ga;

module Told.Debug {

    export interface LogEntry {
        message: string;
        time: Date;
    }

    export class Logger {

        private _elementId: string = "";
        public entries: LogEntry[] = [];

        public log(message: string) {
            this.entries.push({ message: message, time: new Date() });
            console.log(message);

            // Google analytics
            //if (window["_gaq"]) {
            //    var wasOk = _gaq.push(['_trackEvent', 'Debug', 'Log', message]);
            //    var breakdance = true;
            //}

            if (window["ga"]) {
                ga('send', 'event', 'log', message);
            }

            if (this._elementId !== "") {
                this.writeMessages(this._elementId);
            }
        }

        public setElement(elementId: string) {
            this._elementId = elementId;
        }

        private writeMessages(elementId: string) {
            var element = document.getElementById(elementId);

            var text = this.entries.map(e=> {
                return this.formatDateTime(e.time, true) + " : " + e.message;
            }).join("\r\n");
            element.textContent = text;
        }

        // http://stackoverflow.com/questions/4744299/how-to-get-datetime-in-javascript
        formatDateTime(date: Date, ignoreDate: boolean = false) {

            var padZero = this.padZero;

            var dateStr = [
                date.getFullYear(),
                padZero(date.getMonth() + 1),
                padZero(date.getDate()),
            ].join("-");

            var timeStr = [
                [
                    padZero(date.getHours()),
                    padZero(date.getMinutes()),
                    padZero(date.getSeconds()) + "." + padZero(date.getMilliseconds(), 3),
                ].join(":"),
                //date.getHours() >= 12 ? " PM" : " AM"
            ].join();

            if (ignoreDate) {
                return timeStr;
            } else {
                return dateStr + " " + timeStr;
            }
        }

        //Pad given value to the left with "0"
        padZero(num: number, digitCount: number = 2) {
            if (digitCount === 2) {
                return (num >= 0 && num < 10) ? "0" + num : num + "";
            } else if (digitCount === 3) {
                return (num >= 0 && num < 10) ? "00" + num
                    : (num >= 10 && num < 100) ? "0" + num : num + "";
            }
        }
    }

    export var loggerInstance = new Logger();
}

module Told {

    export function log(message: string) {
        Debug.loggerInstance.log(message);
    }

    export function enableLogging(elemendId: string) {
        Debug.loggerInstance.setElement(elemendId);
    }
}