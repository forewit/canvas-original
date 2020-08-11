# app.canvas.gg

- I am NOT designing this to have multiple instances of "canvas".
  - but don't search for global elements when possible (i.e. element by id)

- Camera...
  - Just use ctx.scale() and ctx.translate()
  - Optimizations:
