import { render, stopAni, renderInit } from "./show.js";
import { drawSolid } from "./drawface.js";
import { Scene } from "./struct.js";
function inputRender() {
    stopAni();
    setTimeout(function () {
        var content = document.querySelector('#input').value;
        var scene = new Scene();
        var objstring;
        try {
            objstring = drawSolid(scene, content);
            document.querySelector('#output').value = objstring;
            render(objstring);
        }
        catch (e) {
            console.log(e);
        }
    }, 500);
}
function main() {
    renderInit();
    inputRender();
    var btn = document.querySelector('#draw');
    btn.addEventListener("click", inputRender);
}
main();
