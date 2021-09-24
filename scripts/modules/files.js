/**
 * This module helps manage uploaded files.
 * 
 * new files.Dropzone(dropzone, clickzone, callback, options)   ->  class for creating a dropzone for drag-drop file support
 * files.getImageFromURL(url, callback)                         ->  get an image from a URL 
*/
 (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = global || self, factory(global.files = {}));
}(this, (function (exports) {
    'use strict';

    function preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleFiles(files, callback) {
        for (var i = 0, len = files.length; i < len; i++) {
            if (validateImage(files[i]))
                loadImage(files[i], callback);
        }
    }

    function validateImage(image) {
        // check the type
        var validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (validTypes.indexOf(image.type) === -1) {
            alert("Invalid File Type");
            return false;
        }

        // check the size
        var maxSizeInBytes = 10e6; // 10MB
        if (image.size > maxSizeInBytes) {
            alert("File too large");
            return false;
        }

        return true;
    }

    function loadImage(image, callback) {
        // read the image...
        var img = new Image()
        var reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
            callback(img);
        }
        reader.readAsDataURL(image);
    }

    class Dropzone {
        constructor(dropzone, clickzone, callback, options) {
            if (!options) options = {};
            this.counter = 0; // used to prevent dragleave when hovering over children
            this.dropzone = dropzone;
            this.clickzone = clickzone;
            this.callback = callback; // callback returns the image element
            this.hoverClass = (options.hoverClass) ? options.hoverClass : "";

            // open file selector when clicked on the drop region
            this.fakeInput = document.createElement("input");
            this.fakeInput.type = "file";
            this.fakeInput.accept = "image/*";
            this.fakeInput.multiple = true;

            // bind event handlers
            this.dropHandler = this.dropHandle.bind(this);
            this.dragenterHandler = this.dragenterHandle.bind(this);
            this.dragleaveHandler = this.dragleaveHandle.bind(this);
            this.inputclickHandler = this.inputclickHandle.bind(this);
            this.inputchangeHandler = this.inputchangeHandle.bind(this);


            // enable drag-drop
            this.enable();
        }


        enable() {
            var me = this;
            // add event listeners
            me.dropzone.addEventListener('dragover', preventDefault, { passive: false })
            me.dropzone.addEventListener('dragenter', me.dragenterHandler, { passive: false });
            me.dropzone.addEventListener('dragleave', me.dragleaveHandler, { passive: false });
            me.dropzone.addEventListener('drop', me.dropHandler, { passive: false });
            me.clickzone.addEventListener('click', me.inputclickHandler);
            me.fakeInput.addEventListener('change', me.inputchangeHandler);

        }

        disable() {
            var me = this;
            // remove event listeners
            me.dropzone.removeEventListener('dragover', preventDefault)
            me.dropzone.removeEventListener('dragenter', me.dragenterHandler)
            me.dropzone.removeEventListener('dragleave', me.dragleaveHandler)
            me.dropHandle.removeEventListener('drop', me.dropHandler)
            me.clickzone.removeEventListener('click', me.inputclickHandler)
            me.fakeInput.removeEventListener('change', me.inputchangeHandler)
        }

        dragenterHandle(e) {
            this.counter++;
            if (this.hoverClass) this.dropzone.classList.add(this.hoverClass);
            preventDefault(e);
        }

        dragleaveHandle(e) {
            this.counter--;
            if (this.hoverClass && this.counter <= 0) this.dropzone.classList.remove(this.hoverClass);
            preventDefault(e);
        }

        dropHandle(e) {
            var me = this;

            me.counter = 0;
            if (me.hoverClass) me.dropzone.classList.remove(me.hoverClass);
            preventDefault(e);

            var dt = e.dataTransfer,
                files = dt.files;

            if (files.length) {
                handleFiles(files, me.callback);

            } else {
                // check for img
                var html = dt.getData('text/html'),
                    match = html && /\bsrc="?([^"\s]+)"?\s*/.exec(html),
                    url = match && match[1];
                if (url) {
                    uploadImageFromURL(url);
                    return;
                }
            }

            function uploadImageFromURL(url) {
                var img = new Image;
                var c = document.createElement("canvas");
                var ctx = c.getContext("2d");

                img.onload = function () {
                    c.width = this.naturalWidth;     // update canvas size to match image
                    c.height = this.naturalHeight;
                    ctx.drawImage(this, 0, 0);       // draw in image
                    c.toBlob(function (blob) {        // get content as PNG blob

                        // call our main function
                        handleFiles([blob], me.callback);

                    }, "image/png");
                };
                img.onerror = function () {
                    alert("Error in uploading");
                }
                img.crossOrigin = "";              // if from different origin
                img.src = url;
            }
        }

        inputclickHandle(e) {
            this.fakeInput.click();
        }

        inputchangeHandle(e) {
            handleFiles(this.fakeInput.files, this.callback);
        }
    }

    function getImageFromURL(url, callback) {
        var img = new Image();
        img.onload = function () {
            callback(img);
        };
        img.src = url;
    }

    exports.getImageFromURL = getImageFromURL;
    exports.Dropzone = Dropzone;

    Object.defineProperty(exports, '__esModule', { value: true });
})));