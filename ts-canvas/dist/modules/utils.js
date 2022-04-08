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
/**
 * Rotates a point (x, y) around a center point (cx, cy)
 * a number of radians (rad)
 */
export function rotatePoint(cx, cy, x, y, rad) {
    let cos = Math.cos(rad), sin = Math.sin(rad), nx = (cos * (x - cx)) + (sin * (y - cy)) + cx, ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return { x: nx, y: ny };
}
/**
 *
 *
 * @param {number} x
 * @param {number} y
 * @param {number} rectX rect left edge
 * @param {number} rectY rect top edge
 * @param {number} w rect width
 * @param {number} h rect height
 * @returns {boolean}
 */
export function pointInRectangle(x, y, rectX, rectY, w, h) {
    return x >= rectX && x <= rectX + w &&
        y >= rectY && y <= rectY + h;
}
// credit: https://yal.cc/rot-rect-vs-circle-intersection/
export function pointInRotatedRectangle(x, y, rectX, rectY, pivotOffsetX, pivotOffsetY, w, h, angle) {
    let relX = x - rectX, relY = y - rectY, cos = Math.cos(-angle), sin = Math.sin(-angle), localX = cos * relX - sin * relY, localY = sin * relX + cos * relY;
    return localX >= -pivotOffsetX && localX <= w - pivotOffsetX &&
        localY >= -pivotOffsetY && localY <= h - pivotOffsetY;
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
