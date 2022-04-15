# RPCanvas
### TODO
- [ ] resizing entities
- [ ] create **Drawing** entity
- [ ] create **Pin** entity
- [ ] adjust velocity based on fps
- [ ] verify the board functions when not fullscreen
- [ ] fix issue with zoom / transform scale() with iOS and firefox

### [Optimizations](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- draw inactive layers offscreen
- scale using css transforms instead of canvas scaling
- stick to integer canvas transforms
- update notes only if the canvas is moved
- skip render loop if nothing is happening


TODO: revert board.layers and layer.entities to arrays (so they can be rendered in order)

Board:
* add layer
* destroy layer

* add entity > to active layer
* destroy entity > on active layer

* enable tool
    - on active layer
    - disable previous tool
* disable tool

* set active layer
    - renable tool



    tool()
    - disables previous tool
    - sets a new tool if given
    - if no tool is given, removes the active tool
