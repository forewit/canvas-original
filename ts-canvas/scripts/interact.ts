import * as gestures from "../modules/gestures.js";
import * as keys from "../modules/keys.js";

import { Board } from "./board.js";
import { Layer } from "./layer.js";
import { Entity } from "./entity.js";


export interface Tool {
    gestureHandler: (e: CustomEvent) => void;
    enable: (board: Board, layer: Layer) => void;
    disable: () => void;
}



const setupKeybindings = () => {
    // Prevent reloading the page
    keys.bind("Control+r, Control+R, Meta+r, Meta+R", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Prevented reload.")
    });

    // Select all entities
    keys.bind("Control+a, Control+A, Meta+a, Meta+A", (e) => {
        // TODO: select all entities
        console.log("TODO: select all entities");
    });
}