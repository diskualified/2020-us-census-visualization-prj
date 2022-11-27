document.addEventListener("DOMContentLoaded", function() {
    var data1 = document.getElementById("white");
    var data2 = document.getElementById("black");
    var data3 = document.getElementById("native");
    var data4 = document.getElementById("asian");
    var data5 = document.getElementById("pacific");
    var data6 = document.getElementById("other");
    var data7 = document.getElementById("three");

    // initialization
    var colorPicker = function(c) {
        this.color = c;
        // Other customization:
        // this.message = "dat.guiのンプル";
        // this.fontSize = 24;
        // this.border = false;
        // this.fontFamily = "sans-serif";
    };

    //GUI
    window.onload = function() {
        white = new colorPicker("#5d83d9");
        black = new colorPicker("#eb3232");
        native = new colorPicker("#5ec59b");
        asian = new colorPicker("#ed61bd");
        pacific = new colorPicker("#de8446");
        other = new colorPicker("#c2d24d");
        three = new colorPicker("#d179ff");
        setValue();
        var gui = new dat.GUI();
        gui.addColor(white, 'color').onChange(setValue);
        gui.addColor(black, 'color').onChange(setValue);
        gui.addColor(native, 'color').onChange(setValue);
        gui.addColor(asian, 'color').onChange(setValue);
        gui.addColor(pacific, 'color').onChange(setValue);
        gui.addColor(other, 'color').onChange(setValue);
        gui.addColor(three, 'color').onChange(setValue);

        // gui.add(text, 'message').onChange(setValue);
        // gui.add(text, 'fontSize', 6, 48).onChange(setValue);
        // gui.add(text, 'border').onChange(setValue);
        // gui.add(text, 'fontFamily',["sans-serif", "serif", "cursive", "ＭＳ 明朝", "monospace"]).onChange(setValue);
    };

    function setValue() {
        data1.style.color = white.color;
        data2.style.color = black.color;
        data3.style.color = native.color;
        data4.style.color = asian.color;
        data5.style.color = pacific.color;
        data6.style.color = other.color;
        data7.style.color = three.color;

        // data.innerHTML = text.message;
        // if (data.length == 0) {
        //     data = document.getElementsByClassName('6');
        // }
        // data.style.fontSize = text.fontSize+"px";
        // data.style.fontFamily = text.fontFamily;
        // if(text.border) {
        // data.style.border = "solid 1px black";
        // data.style.padding = "10px";
        // }
        // else {
        // data.style.border = "none";
        // data.style.padding = "0px";
        // }
    }
});