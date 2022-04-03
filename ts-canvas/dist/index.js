import * as utils from './modules/utils.js';
utils.log("Hello World!", { olor: "green", bold: true });
// see utils.ts for more info
window.addEventListener('orientationchange', utils.setNotchCssProperties);
utils.setNotchCssProperties();
utils.log("Goodbye 👋", { olor: "green", bold: true });
