# RPCanvas
### TODO
- [ ] resizing entities
- [ ] create **Pen** entity
- [ ] button -> to switch tools
- [ ] change inertia based on frame rate
- [ ] change board back to a DIV so that it can contain other elements

### DONE
- [X] move handles into it's own class so that it can dynamically change with the selection
- [X] add rectangle class
- [X] add outlines while drawing selection box
- [X] draw selection bounding box
- [X] drag-n-drop select box
- [X] fix inertia bug (keeps inertia when stopped)
- [X] fix issue with zoom / transform scale() with iOS and firefox
- [X] add render option to entities so they can draw an outline

### [Optimizations](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [ ] draw inactive layers offscreen
- [ ] scale using css transforms instead of canvas scaling
- [ ] stick to integer canvas transforms
- [ ] update notes only if the canvas is moved
- [ ] skip render loop if nothing is happening
- [ ] skip rendering an entity if it's not visible
- [ ] when checking for intersections, limit to on screen entities. Update onscreen entities on pan?
- [ ] remove console logs