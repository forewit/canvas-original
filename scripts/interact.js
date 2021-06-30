import { Entity } from "./entity.js";

export let interact = function (cnvs) {

    // PREFERENCES
    let zoomIntensity = 0.05;
    let inertiaFriction = 0.8; // 0 = infinite friction, 1 = no friction
    let inertiaMemory = 0.2; // 0 = infinite memory, 1 = no memory
    let inertiaDropOff = 5 // in milliseconds
    let epsilon = 0.001; // replacement for 0 to prevent divide-by-zero errors
    let handleSize = 5;

    // STATE MANAGEMENT
    let selected = [];
    let dndcanvas = cnvs;
    let isPanning = false;
    let isResizing = false;
    let isMoving = false;
    let lastPanTime;
    let lastPoint = { x: 0, y: 0 };
    let vx = 0, vy = 0;
    let log = document.getElementById('log');

    gestures.track(dndcanvas.elm);
    dndcanvas.elm.addEventListener("gesture", function (e) {
        log.innerHTML = e.detail.name;
        // convert points to canvas coordinates

        // SELECT TOOL
        switch (e.detail.name) {
            case "click":
            case "tap":
                // 1. clear selection if shift is not being held
                // 2. select point
                break;

            case "touch-drag-start":
            case "mouse-drag-start":
            case "pinch-start":
                // 1. start panning
                break;
            default:
                break;
        }

    });

    // KEYBOARD SHORTCUTS
    keys.start()
    keys.on('17 82', function (e) {
        e.preventDefault();
        alert('Prevented reload!');
    });

    /*
    // SELECT TOOL GESTURES
    log.innerHTML = 'Select';
    gestures.on('click tap', (x, y) => {
        // convert to canvas coordinates
        var point = dndcanvas.screenToCanvas({ x: x, y: y });

        // clear selection if shift is not being held
        if (!keys.down[16]) clearSelection();

        selectPoint(point.x, point.y);
    });
    gestures.on('touchDragStart mouseDragStart pinchStart', (x, y) => {
        // convert to canvas coordinates
        var point = dndcanvas.screenToCanvas({ x: x, y: y });

        mouseDragStart(point);
    });
    gestures.on('touchDragging mouseDragging', (x, y) => {
        // convert to canvas coordinates
        var point = dndcanvas.screenToCanvas({ x: x, y: y });

        mouseDragging(point);
    });
    gestures.on('touchDragEnd mouseDragEnd pinchEnd', () => {
        mouseDragEnd();
    });
    gestures.on('pinching', (x, y, zoom) => {
        // convert to canvas coordinates
        var point = dndcanvas.screenToCanvas({ x: x, y: y });

        dndcanvas.zoomOnPoint(point, zoom);
        panning(point);
    });
    gestures.on('wheel', (x, y, event) => {
        // convert to canvas coordinates
        var point = dndcanvas.screenToCanvas({ x: x, y: y });

        wheel(point, event);
    });
    gestures.start();
    */




    // **************** PANNING FUNCTIONS ***************
    function panStart(point) {
        console.log("PAN START")

        isPanning = true;
        lastPoint.x = point.x;
        lastPoint.y = point.y;

        vx = 0;
        vy = 0;
    }
    function panning(newPoint) {
        let dx = newPoint.x - lastPoint.x;
        let dy = newPoint.y - lastPoint.y;

        dndcanvas.translate(dx, dy);

        vx = dx * inertiaMemory + vx * (1 - inertiaMemory);
        vy = dy * inertiaMemory + vy * (1 - inertiaMemory);

        lastPoint.x = newPoint.x;
        lastPoint.y = newPoint.y;

        lastPanTime = new Date();
    }
    function panEnd() {
        console.log("PAN END")

        isPanning = false;
        let elapsed = new Date() - lastPanTime;

        vx *= Math.min(1, inertiaDropOff / elapsed);
        vy *= Math.min(1, inertiaDropOff / elapsed);
        requestAnimationFrame(panInertia);
    }
    function panInertia() {
        if (isPanning || (Math.abs(vx) < epsilon && Math.abs(vy) < epsilon)) return;
        requestAnimationFrame(panInertia);

        dndcanvas.translate(vx, vy);

        vx *= inertiaFriction;
        vy *= inertiaFriction;
    }
    // **************************************************



    // **************** ZOOMING FUNCTIONS ***************
    function wheel(point, event) {
        let delta = event.deltaY;

        // Normalize wheel to +1 or -1.
        let direction = delta < 0 ? 1 : -1;

        // Compute zoom factor.
        let zoom = Math.exp(direction * zoomIntensity);

        // zoom
        dndcanvas.zoomOnPoint(point, zoom);
    }
    // **************************************************



    // ************ RESIZE HANDLE FUNCTIONS *************
    let handles = new Entity()

    let outerX, outerY, outerW, outerH,
        innerX, innerY, innerW, innerH,
        localPoint,
        activeHandles = [];

    handles.render = function (ctx) {
        let size = handleSize / dndcanvas.scale;

        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.beginPath();
        ctx.rect(-this.halfw, -this.halfh, this.w, this.h);
        ctx.rect(-size - this.halfw, -size - this.halfh, this.w + size * 2, this.h + size * 2);
        ctx.rect(size - this.halfw, size - this.halfh, this.w - size * 2, this.h - size * 2);
        ctx.stroke();

        ctx.rotate(-this.rotation);
        ctx.translate(-this.x, -this.y);
    }
    function getHandleIntersection(x, y) {
        //returns [x, y] where x or y can be -1, 0, or 1. Examples:
        //* [-1, 0] is the Left edge
        //* [1, 1] is the bottom right corner
        //* [] intersects but not on handle
        //* undefined = no intersections
        if (selected.length <= 0) return undefined;

        activeHandles = [];
        localPoint = utils.rotatePoint(handles.x, handles.y, x, y, handles.rotation);

        outerX = handles.x - handles.halfw - handleSize;
        outerY = handles.y - handles.halfh - handleSize;
        outerW = handles.w + handleSize * 2;
        outerH = handles.h + handleSize * 2;

        // return if point is outside the outer rect
        if (!utils.pointInRectangle(localPoint.x, localPoint.y, outerX, outerY, outerW, outerH)) return undefined;

        innerX = handles.x - handles.halfw + handleSize;
        innerY = handles.y - handles.halfh + handleSize;
        innerW = handles.w - handleSize * 2;
        innerH = handles.h - handleSize * 2;

        // return if point is inside the inner rect
        if (utils.pointInRectangle(localPoint.x, localPoint.y, innerX, innerY, innerW, innerH)) return activeHandles;

        activeHandles = [0, 0];
        // check left and right handles
        if (localPoint.x <= innerX) activeHandles[0] = -1;
        else if (localPoint.x >= innerX + innerW) activeHandles[0] = 1;

        // check top and bottom handles
        if (localPoint.y <= innerY) activeHandles[1] = -1;
        else if (localPoint.y >= innerY + innerH) activeHandles[1] = 1;
        return activeHandles;
    }
    function showHandles() {
        let boundingLeft = selected[0].x,
            boundingRight = selected[0].x,
            boundingTop = selected[0].y,
            boundingBottom = selected[0].y;

        for (let len = selected.length, i = 0; i < len; i++) {
            let entity = selected[i];

            let angle = entity.rotation % (Math.PI);
            if (angle > Math.PI / 2) angle = Math.PI - angle;

            let halfW = (Math.sin(angle) * entity.h + Math.cos(angle) * entity.w) / 2,
                halfH = (Math.sin(angle) * entity.w + Math.cos(angle) * entity.h) / 2;

            let left = entity.x - halfW,
                right = entity.x + halfW,
                top = entity.y - halfH,
                bottom = entity.y + halfH;

            if (left < boundingLeft) boundingLeft = left;
            if (right > boundingRight) boundingRight = right;
            if (top < boundingTop) boundingTop = top;
            if (bottom > boundingBottom) boundingBottom = bottom;
        }

        handles.w = boundingRight - boundingLeft;
        handles.h = boundingBottom - boundingTop;
        handles.x = boundingLeft + handles.w / 2;
        handles.y = boundingTop + handles.h / 2;
        handles.rotation = 0;

        // show handles
        dndcanvas.UILayer.addEntity(handles);
    }
    function hideHandles() {
        dndcanvas.UILayer.removeEntity(handles);
    }
    function resizeStart(x, y) {

    }
    function resizing(x, y) {

    }
    function resizeEnd() {

    }
    // **************************************************



    // ************** SELECTION FUNCTIONS ***************
    function selectPoint(x, y) {
        // check for entity intersections
        let intersectedEntity = dndcanvas.activeLayer.getFirstIntersection(x, y);
        if (!intersectedEntity) return;

        // check for duplicate selections
        for (let len = selected.length, i = 0; i < len; i++) {
            if (selected[i].ID == intersectedEntity.ID) {
                return;
            }
        }

        // Add intersectedEntity to selected[]
        selected.push(intersectedEntity);
        showHandles();

        //TEMP CODE -------------------------------
        let activeHandle = getHandleIntersection(x, y);
        console.log(activeHandle, selected);
        //END TEMP CODE ---------------------------
    }
    function clearSelection() {
        selected.length = 0;
        hideHandles();
    }
    function moveStart(x, y) {
        isMoving = true;
    }
    function moving(x, y) {

    }
    function moveEnd() {
        isMoving = false;
    }
    // **************************************************
}

