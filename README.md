# RPCanvas
### TODO
- [ ] resizing entities
- [ ] create **Drawing** entity
- [ ] create **Pin** entity
- [ ] adjust velocity based on fps
- [ ] verify the board functions when not fullscreen
- [ ] fix gestures issue where it is jumping during the drag event when two fingers are used

### [Optimizations](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- draw inactive layers offscreen
- scale using css transforms instead of canvas scaling
- stick to integer canvas transforms
- update notes only if the canvas is moved
- skip render loop if nothing is happening