Canvas App

Optimizations: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
- draw inactive layers offscreen
- scale using css transforms instead of canvas scaling
- stick to integer canvas transforms


TODO: 
- Setup canvas elements for each layer
- add active layer to canvas so that interact.js can see into the active layer
- transition interact.js to a class (pass a canvas to it's constructor) MAYBE: add changeCanvas() function
- layers and entities CAN be edited separately (but do not hold onto entity objects)
- create handle entity that renders handles and includes a list of entities that it modifies


Structure:
- WINDOW
  - interact.js (given a canvas)
  - Assets (images)
  - 1 or more Canvases
    - visible canvas
    - player and game data
    - 1 or more Layers
      - renders to offscreen canvas
      - 0 or more Entities (accesses Assets)
