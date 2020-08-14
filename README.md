# app.canvas.gg

- I am NOT designing this to have multiple instances of "canvas".
  - but don't search for global elements when possible (i.e. element by id)

- Camera...
  - Just use ctx.scale() and ctx.translate()
  - Optimizations: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
    - draw inactive layers offscreen
    - scale using css transforms instead of canvas scaling
      - if used, stick to integer canvas transforms

TODO: draw select box and allow resizing

Add a rotate