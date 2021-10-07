// entity for rendering html elements "in" the canvas
import { Entity } from "./entity.js";

export class Note extends Entity {
    constructor(elm) {
        // the note entity will be rendered in the canvas
        // and the transforms, position, left and top will be adjusted

        super(); // call entity class constructor

        // set any note specific properties
        this.content = [];
        this.elm = elm;
        this.isLoaded = false;

        // setup the note
        this.elm.style.position = "absolute";
        this.elm.style.transformOrigin = "top left";
    }

    render(ctx) {
        // add note element to the canvas if it is not already there
        if (!this.isLoaded) {
            this.isLoaded = true;
            ctx.canvas.parentNode.insertBefore(this.elm, ctx.canvas.nextSibling);
        }

        // adjust note position by the canvas transformations
        let transforms = ctx.getTransform();
        let x = transforms.e / window.devicePixelRatio;
        let y = transforms.f / window.devicePixelRatio;
        let scale = transforms.a / window.devicePixelRatio;
                
        // update the note's position and scale
        this.elm.style.left = x + "px";
        this.elm.style.top = y + "px";
        this.elm.style.transform = `scale(${scale})`;
    }
}