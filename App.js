document.addEventListener("DOMContentLoaded", function() {
    var dataarr = new Array(document.getElementById("asian"),
                            document.getElementById("black"), 
                            document.getElementById("hispanic"),
                            document.getElementById("native"),
                            document.getElementById("other"),
                            document.getElementById("pacific"),
                            document.getElementById("white"), 
                            document.getElementById("three"));

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
        arr = new Array (
                new colorPicker("#ed61bd"), //asian
                new colorPicker("#eb3232"), //black
                new colorPicker("#2aa6bb"), //hispanic
                new colorPicker("#5ec59b"), //native
                new colorPicker("#c2d24d"), //other
                new colorPicker("#de8446"), //pacific
                new colorPicker("#5d83d9"), // white
                new colorPicker("#d179ff"), // three
        ); 
        setValue();
        var gui = new dat.GUI();
        for (let i = 0; i < arr.length; i++) {
            gui.addColor(arr[i], 'color').onChange(setValue);
        }

        // gui.add(text, 'message').onChange(setValue);
        // gui.add(text, 'fontSize', 6, 48).onChange(setValue);
        // gui.add(text, 'border').onChange(setValue);
        // gui.add(text, 'fontFamily',["sans-serif", "serif", "cursive", "ＭＳ 明朝", "monospace"]).onChange(setValue);
    };

    function setValue() {
        for (let i = 0; i < arr.length; i++) { 
            dataarr[i].style.color = arr[i].color;
        }
        // data1.style.color = white.color;
        // data2.style.color = black.color;
        // data8.style.color = hispanic.color;
        // data3.style.color = native.color;
        // data4.style.color = asian.color;
        // data5.style.color = pacific.color;
        // data6.style.color = other.color;
        // data7.style.color = three.color;

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