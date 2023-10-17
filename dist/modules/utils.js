// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
export const throttle = (fn, wait, options) => {
    options = options || {};
    let context, args, result, timeout, previous = 0;
    let later = function () {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = fn.apply(context, args);
    };
    return function () {
        let now = Date.now();
        if (!previous && options.leading === false)
            previous = now;
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
        }
        else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};
/**
 * Creates a psudo random unique identifier string
 *
 * @returns {string} randomized unique ID
 */
export function generate_ID() {
    return '_' + Math.random().toString(36).substring(2, 9);
}
export function log(...args) {
    let msg = [], css = '', last = args[args.length - 1] || {}, options = {};
    // check if options have been provided
    if (last.color || last.background || last.bold || last.stringify) {
        options = args.pop();
    }
    // add css
    if (options.color)
        css += `color: ${options.color};`;
    if (options.background)
        css += `background: ${options.background};`;
    if (options.bold)
        css += `font-weight: bold;`;
    // build console message
    for (let arg of args) {
        if (typeof arg === 'string') {
            msg.push(`%c${arg}`, css);
        }
        else if (options.stringify) {
            msg.push(`%c${JSON.stringify(arg)}`, css);
        }
        else
            msg.push(arg);
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
export function setNotchCssProperties() {
    document.documentElement.style.setProperty('--notch-top', '0');
    document.documentElement.style.setProperty('--notch-right', '0');
    document.documentElement.style.setProperty('--notch-left', '0');
    if (window.orientation == 0) {
        document.documentElement.style.setProperty('--notch-top', '1');
    }
    else if (window.orientation == 90) {
        document.documentElement.style.setProperty('--notch-left', '1');
    }
    else if (window.orientation == -90) {
        document.documentElement.style.setProperty('--notch-right', '1');
    }
}
// promise to load an image from a url
export function loadImage(url) {
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
    // getters
    get w() { return this._w; }
    get h() { return this._h; }
    get halfw() { return this._halfw; }
    get halfh() { return this._halfh; }
    get x() { return this._x; }
    get y() { return this._y; }
    get left() { return this._left; }
    get right() { return this._right; }
    get top() { return this._top; }
    get bottom() { return this._bottom; }
    // setters
    set x(x) {
        this._x = x;
        this._left = x - this._halfw;
        this._right = x + this._halfw;
    }
    set y(y) {
        this._y = y;
        this._top = y - this._halfh;
        this._bottom = y + this._halfh;
    }
    set w(w) {
        this._w = w;
        this._halfw = w / 2;
        this._left = this._x - this._halfw;
        this._right = this._x + this._halfw;
    }
    set h(h) {
        this._h = h;
        this._halfh = h / 2;
        this._top = this._y - this._halfh;
        this._bottom = this._y + this._halfh;
    }
    // setting left will change the size of the rectangle
    set left(left) {
        if (left <= this._right) {
            this._left = left;
            this._w = this._right - this._left;
            this._halfw = this._w / 2;
            this._x = this._left + this._halfw;
        }
        else {
            console.error('left must be less than right');
        }
    }
    // setting right will change the size of the rectangle
    set right(right) {
        if (right >= this._left) {
            this._right = right;
            this._w = this._right - this._left;
            this._halfw = this._w / 2;
            this._x = this._left + this._halfw;
        }
        else {
            console.error('right must be greater than left');
        }
    }
    // setting top will change the size of the rectangle
    set top(top) {
        if (top <= this._bottom) {
            this._top = top;
            this._h = this._bottom - this._top;
            this._halfh = this._h / 2;
            this._y = this._top + this._halfh;
        }
        else {
            console.error('top must be less than bottom');
        }
    }
    // setting bottom will change the size of the rectangle
    set bottom(bottom) {
        if (bottom >= this._top) {
            this._bottom = bottom;
            this._h = this._bottom - this._top;
            this._halfh = this._h / 2;
            this._y = this._top + this._halfh;
        }
        else {
            console.error('bottom must be greater than top');
        }
    }
    constructor(x, y, w, h, rad) {
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
export function rotatePoint(x, y, pivotX, pivotY, rad) {
    if (!rad)
        return { x: x, y: y };
    let cos = Math.cos(rad), sin = Math.sin(rad), nx = (cos * (x - pivotX)) + (sin * (y - pivotY)) + pivotX, ny = (cos * (y - pivotY)) - (sin * (x - pivotX)) + pivotY;
    return { x: nx, y: ny };
}
export function pointInRect(x, y, rect) {
    // rotate point around the rect's center
    let rotatedPoint = rotatePoint(x, y, rect.x, rect.y, rect.rad);
    return (rotatedPoint.x >= rect.x - rect.halfw && rotatedPoint.x <= rect.x + rect.halfw) &&
        (rotatedPoint.y >= rect.y - rect.halfh && rotatedPoint.y <= rect.y + rect.halfh);
}
