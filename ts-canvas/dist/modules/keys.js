/* HOW TO USE
keys.bind("Control+r, Control+R", (e: KeyboardEvent, shortcut: string) => {});
keys.unbind("Control+R"); OR keys.unbind();

Example binding "Control+k+o, Shift+o, Control+s" results in:
keybindings = [{
    "o": [
        { down: ["Control", "k"], callback: fn },
        { down: ["Shift"], callback: fn }],
    "s": [
        { down: ["Control"], callback: fn }
    ]
 }]
*/
const SHORTCUT_SEPARATOR = ", ";
const SPLIT_KEY = "+";
;
let keybindings = {}, listening = false;
export let down = {};
export function bind(shortcuts, fn) {
    // resume window event listeners
    if (!listening) {
        window.addEventListener('keydown', keydownHandler, { passive: false });
        window.addEventListener('keyup', keyupHandler);
        window.addEventListener('blur', blurHandler);
        listening = true;
    }
    // split shortcut string into array of shortcuts
    let splitShortcuts = shortcuts.split(SHORTCUT_SEPARATOR);
    // create a keybinding for each shortcut
    splitShortcuts.forEach(s => {
        let keys = s.split(SPLIT_KEY);
        let id = keys.pop();
        if (!keybindings[id])
            keybindings[id] = [];
        keybindings[id].push({ down: keys, callback: fn });
    });
}
export function unbind(shortcuts) {
    // unbind all if no ids are specified
    if (!shortcuts) {
        window.removeEventListener('keydown', keydownHandler);
        window.removeEventListener('keyup', keyupHandler);
        window.removeEventListener('blur', blurHandler);
        listening = false;
        keybindings = {};
        return;
    }
    // split shortcut string into array of shortcuts
    let splitShortcuts = shortcuts.split(SHORTCUT_SEPARATOR);
    // remove keybindings for each shortcut given
    splitShortcuts.forEach(s => {
        let keys = s.split(SPLIT_KEY);
        let id = keys.pop();
        keybindings[id].forEach(k => {
            // if keys matches the keybinding, remove it
            if (k.down.length === keys.length && k.down.every((k, i) => k === keys[i])) {
                delete keybindings[id];
            }
        });
    });
}
function keydownHandler(e) {
    // return if composing
    if (e.isComposing)
        return;
    // update down keys
    down[e.key] = true;
    // check if key is in keybindings
    if (!keybindings[e.key])
        return;
    // loop through each keybinding
    keybindings[e.key].forEach(k => {
        // if every and only the keys are down, call the callback
        // To force shortcuts to be exact, add:
        //      && Object.keys(down).length === (k.down.length+1)
        if (k.down.every(key => down[key]))
            k.callback(e);
    });
}
function keyupHandler(e) { delete down[e.key]; }
function blurHandler() { down = {}; }
