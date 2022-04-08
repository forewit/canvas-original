// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
export const throttle = (fn: Function, wait: number, options?: { [name: string]: any }) => {
    options = options || {};
    let context: any,
        args: any,
        result: any,
        timeout: any,
        previous = 0;

    let later = function () {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = fn.apply(context, args);
    };

    return function () {
        let now = Date.now();
        if (!previous && options.leading === false) previous = now;
        let remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = fn.apply(context, args);
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    }
};

/**
 * Creates a psudo random unique identifier string
 * 
 * @returns {string} randomized unique ID
 */
export function generate_ID(): string {
    return '_' + Math.random().toString(36).substring(2, 9);
}

//Rotates a point (x, y) around a pivot in radians
export function rotatePoint(
    x: number, y: number,
    pivotX: number, pivotY: number,
    rad: number
): { x: number, y: number } {
    let cos = Math.cos(rad),
        sin = Math.sin(rad),
        nx = (cos * (x - pivotX)) + (sin * (y - pivotY)) + pivotX,
        ny = (cos * (y - pivotY)) - (sin * (x - pivotX)) + pivotY;

    return { x: nx, y: ny };
}

/*
A rectangle is defined by it's center, width, and height, and angle in radians
        w
┌─────────────────┐
│                 │
│       *(x, y)   | h
│                 |
└─────────────────┘
*/
export function pointInRectangle(
    x: number, y: number,
    centerX: number, centerY: number,
    w: number, h: number
): boolean {
    return (x >= centerX - w / 2 && x <= centerX + w / 2) &&
        (y >= centerY - h / 2 && y <= centerY + h / 2);
}

export function pointInRotatedRectangle(
    x: number, y: number,
    centerX: number, centerY: number,
    w: number, h: number,
    rad: number
): boolean {
    let rotatedPoint = rotatePoint(x, y, centerX, centerY, rad);
    return pointInRectangle(rotatedPoint.x, rotatedPoint.y, centerX, centerY, w, h);
}

// Function for creating formatted logs
interface LogOptions {
    color?: string, 
    background?: string, 
    bold?: boolean, 
    stringify?: boolean, // print objects as JSON
}

export function log(...args: any[]) {
    let msg: any[] = [],
        css: string = '',
        last = args[args.length - 1] || {},
        options: LogOptions = {};

    // check if options have been provided
    if (last.color || last.background || last.bold || last.stringify) {
        options = args.pop();
    }

    // add css
    if (options.color) css += `color: ${options.color};`;
    if (options.background) css += `background: ${options.background};`;
    if (options.bold) css += `font-weight: bold;`;

    // build console message
    for (let arg of args) {
        if (typeof arg === 'string') {
            msg.push(`%c${arg}`, css);
        }
        else if (options.stringify) {
            msg.push(`%c${JSON.stringify(arg)}`, css);
        }
        else msg.push(arg);
    }

    console.log(...msg);
}

/* 
Set notch css properties based on window orientation.
These properties can be used to determine if there is a notch
and which side of the screen the notch is on.

add ths to your JS:
    window.addEventListener('orientationchange', utils.setNotchCssProperties);
    utils.setNotchCssProperties();

then you can use these properties in your CSS:
    var(--notch-left) 
    var(--notch-right) 
    var(--notch-top) 
*/
export function setNotchCssProperties(): void {
    document.documentElement.style.setProperty('--notch-top', '0');
    document.documentElement.style.setProperty('--notch-right', '0');
    document.documentElement.style.setProperty('--notch-left', '0');

    if (window.orientation == 0) {
        document.documentElement.style.setProperty('--notch-top', '1');
    } else if (window.orientation == 90) {
        document.documentElement.style.setProperty('--notch-left', '1');
    } else if (window.orientation == -90) {
        document.documentElement.style.setProperty('--notch-right', '1');
    }
}