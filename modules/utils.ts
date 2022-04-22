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

// promise to load an image from a url
export function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
    });
}

/*
A rectangle is defined by it's center, width, and height
        w
┌─────────────────┐
│                 │
│       *(x, y)   | h
│                 |
└─────────────────┘
*/
export class Rect {
    rad: number;

    private _w: number;
    private _halfw: number;
    private _halfh: number;
    private _h: number;
    private _x: number;
    private _y: number;
    private _left: number;
    private _right: number;
    private _top: number;
    private _bottom: number;

    // getters
    get w(): number { return this._w; }
    get h(): number { return this._h; }
    get halfw(): number { return this._halfw; }
    get halfh(): number { return this._halfh; }
    get x(): number { return this._x; }
    get y(): number { return this._y; }
    get left(): number { return this._left; }
    get right(): number { return this._right; }
    get top(): number { return this._top; }
    get bottom(): number { return this._bottom; }

    // setters
    set x(x: number) {
        this._x = x;
        this._left = x - this._halfw;
        this._right = x + this._halfw;
    }
    set y(y: number) {
        this._y = y;
        this._top = y - this._halfh;
        this._bottom = y + this._halfh;
    }
    set w(w: number) {
        this._w = w;
        this._halfw = w / 2;
        this._left = this._x - this._halfw;
        this._right = this._x + this._halfw;
    }
    set h(h: number) {
        this._h = h;
        this._halfh = h / 2;
        this._top = this._y - this._halfh;
        this._bottom = this._y + this._halfh;
    }
    set left(left: number) {
        this._left = left;
        this._x = left + this._halfw;
        this._right = left + this._w;
    }
    set right(right: number) {
        this._right = right;
        this._x = right - this._halfw;
        this._left = right - this._w;
    }
    set top(top: number) {
        this._top = top;
        this._y = top + this._halfh;
        this._bottom = top + this._h;
    }
    set bottom(bottom: number) {
        this._bottom = bottom;
        this._y = bottom - this._halfh;
        this._top = bottom - this._h;
    }

    constructor(x: number, y: number, w: number, h: number, rad?: number) {
        this.rad = rad || 0;
        this._w = w;
        this._h = h;
        this._halfw = w / 2;
        this._halfh = h / 2;
        this._x = x;
        this._y = y;
        this._left = x - this._halfw;
        this._right = x + this.halfw;
        this._top = y - this._halfh;
        this._bottom = y + this._halfh;
    }
}

export function rotatePoint(
    x: number, y: number,
    pivotX: number, pivotY: number,
    rad: number
): { x: number, y: number } {
    if (!rad) return { x: x, y: y };
    let cos = Math.cos(rad),
        sin = Math.sin(rad),
        nx = (cos * (x - pivotX)) + (sin * (y - pivotY)) + pivotX,
        ny = (cos * (y - pivotY)) - (sin * (x - pivotX)) + pivotY;
    return { x: nx, y: ny };
}

export function pointInRect( x: number, y: number, rect: Rect): boolean {
    // rotate point around the rect's center
    let rotatedPoint = rotatePoint(x, y, rect.x, rect.y, rect.rad);
    return (rotatedPoint.x >= rect.x - rect.w / 2 && rotatedPoint.x <= rect.x + rect.w / 2) &&
        (rotatedPoint.y >= rect.y - rect.h / 2 && rotatedPoint.y <= rect.y + rect.h / 2);
}