/**
 * Utils is a collection of useful standalone functions:
*/

 (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = global || self, factory(global.utils = {}));
}(this, (function (exports) {
    'use strict';

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    function throttle(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function () {
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function () {
            var now = Date.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
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
    function generate_ID() {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Rotates a point (x, y) around a center point (cx, cy)
     * a number of radians (rad)
     */
    function rotatePoint(cx, cy, x, y, rad) {
        let cos = Math.cos(rad),
            sin = Math.sin(rad),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return { x: nx, y: ny };
    }

    function pointInRectangle(x, y, rx, ry, rw, rh) {
        return x >= rx && x <= rx + rw &&
            y >= ry && y <= ry + rh;
    }

    // credit: https://yal.cc/rot-rect-vs-circle-intersection/
    function pointInRotatedRectangle(pointX, pointY,
        rectX, rectY, rectOffsetX, rectOffsetY, rectWidth, rectHeight, rectAngle
    ) {
        var relX = pointX - rectX;
        var relY = pointY - rectY;
        var angle = -rectAngle;
        var angleCos = Math.cos(angle);
        var angleSin = Math.sin(angle);
        var localX = angleCos * relX - angleSin * relY;
        var localY = angleSin * relX + angleCos * relY;
        return localX >= -rectOffsetX && localX <= rectWidth - rectOffsetX &&
            localY >= -rectOffsetY && localY <= rectHeight - rectOffsetY;
    }

    exports.pointInRotatedRectangle = pointInRotatedRectangle;
    exports.pointInRectangle = pointInRectangle;
    exports.rotatePoint = rotatePoint;
    exports.generate_ID = generate_ID;
    exports.throttle = throttle;

    Object.defineProperty(exports, '__esModule', { value: true });
})));