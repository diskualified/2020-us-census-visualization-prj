var width = 1024,
    height = 800;

function calc_colors() {
    const toRGBArray = rgbStr => rgbStr.match(/\d+/g).map(Number);
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    function rgbToHex(rgb) {
        return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
    }
    function colorMixer(rgbA, rgbB){
        var r = parseInt(rgbA[0] * 0.5 + rgbB[0] * 0.5);
        var g = parseInt(rgbA[1] * 0.5 + rgbB[1] * 0.5);
        var b = parseInt(rgbA[2] * 0.5 + rgbB[2] * 0.5);
        return [r, g, b];
    }

    var races = ["Asian", "Black", "Native American", "Other", "Pacific Islander", "White"];
    var basecolors = [document.getElementById("asian").style.color, 
                    document.getElementById("black").style.color,
                    document.getElementById("native").style.color,
                    document.getElementById("other").style.color,
                    document.getElementById("pacific").style.color,
                    document.getElementById("white").style.color];
    
    var basecolors = basecolors.map(c => toRGBArray(c));
    var finalcolors = basecolors.map(c => rgbToHex(c));
    finalcolors.push(rgbToHex(toRGBArray(document.getElementById("three").style.color)));

    var div = document.getElementById('colors');
    div.innerHTML = "";
    for (let i = 0; i < basecolors.length - 1; ++i) {
        for (let j = i + 1; j < basecolors.length; ++ j) {
            var color1 = basecolors[i];
            var color2 = basecolors[j];
            var mix = colorMixer(color1, color2);
            var res = rgbToHex(mix);
            finalcolors.push(res);

            var p = document.createElement("p");
            p.innerHTML = races[i] + " + " + races[j] + ": " + res;
            p.style.color = res;
            div.append(p);        
        }
    }
    var p = document.createElement("p");
    p.innerHTML = "\"" + finalcolors.join("\",<br />\"") + "\"";
    div.append(p);
}



function dload() {
    document.getElementById("loading").innerHTML = "Loading...";

    let canvas = document.querySelector("canvas");
    let cx = canvas.getContext("2d");
    var projection = d3.geoAlbersUsa();
    var globalUS;
    let path = d3.geoPath().projection(projection).context(cx);
    let dots = [["export default `Longitude","Latitude","Race","Race Num","Alt"]];
    // with county json file
    d3.json("tl_2020_us_county.json", function(error, us) {
    // d3.json("tl_2020_25MA_tabblock20.json", function(error, us) {
        if (error) return console.error(error);
        globalUS = us;
        // subunits is all county boundaries
        var subunits = topojson.feature(us, us.objects.tl_2020_us_county).features;

        // choose which counties/blocks to display
        var tmpunits = [];
        for (let i = 0; i < subunits.length; i++) {
            if (parseInt(subunits[i].properties["STATEFP"]) <= 56) {
                tmpunits.push(subunits[i]);
            }
        }
        tmpunits.sort(function(s1, s2) {
            // sorts right to left
            return parseFloat(s1.properties["INTPTLON"].slice(1)) - parseFloat(s2.properties["INTPTLON"].slice(1));
            // return parseFloat(s1.properties["INTPTLON20"].slice(1)) - parseFloat(s2.properties["INTPTLON20"].slice(1))
        });
        console.log("len", tmpunits.length);
        cx.beginPath();
        path(topojson.mesh(us));
        cx.stroke();

        console.log('rendered boundaries');

        // racial demographic data & dots for select counties
        let csvdemographics = [];

        function genDotCoord (d, maxx, maxy, minx, miny, c, ind, num) {
            let coordx = Math.random() * (maxx - minx) + minx;
            let coordy = Math.random() * (maxy - miny) + miny;
            while (!d3.geoContains(d, [coordx, coordy])) {
                // console.log('nay');
                coordx = Math.random() * (maxx - minx) + minx;
                coordy = Math.random() * (maxy - miny) + miny;
            }
            let color = c;
            return [coordx, coordy, color, ind, Math.floor(Math.random() * num)];
        };


        let load = function(error, data) {
            // handle error case 
            if (error) return console.warn(error);
            
            // filtering race demographic data for now for select counties
            for (var i = 0; i < data.length; i++) {
                // if (data[i]["STATE"] == "Massachussetts") {
                if (!data[i]["COUNTY"].includes("Municipio")) {
                    csvdemographics.push(data[i]);
                }
            }
            // sort to match subunit order
            csvdemographics.sort(function(s1, s2) {
                // sorts right to left
                return parseFloat(s1["INTPTLON"].slice(1)) - parseFloat(s2["INTPTLON"].slice(1));
                // return parseFloat(s1.properties["INTPTLON20"].slice(1)) - parseFloat(s2.properties["INTPTLON20"].slice(1))
            });
            // check same length as above
            console.log("len2", csvdemographics.length);

            for (let i = 0; i < tmpunits.length; i++) {
                // county is used to get coordinates
                // console.log(i, tmpunits[i]["properties"]["NAMELSAD"]);
                let county = tmpunits[i];    
                // // get length of this for index 7
                // console.log("index", i);
                // console.log(county.geometry.coordinates);
                let maxx = Math.max(...county.geometry.coordinates["0"].map(o => o[0]));
                let maxy = Math.max(...county.geometry.coordinates["0"].map(o => o[1]));
                let minx = Math.min(...county.geometry.coordinates["0"].map(o => o[0]));
                let miny = Math.min(...county.geometry.coordinates["0"].map(o => o[1]));
                if (!maxx) {
                    maxx = -Infinity;
                    maxy = -Infinity;
                    minx = Infinity;
                    miny = Infinity;
                    for (let i = 0; i < county.geometry.coordinates.length; i++) {
                        let newmaxx = Math.max(...county.geometry.coordinates[i.toString()][0].map(o => o[0]));
                        if (newmaxx > maxx) {
                            maxx = newmaxx;
                        }
                        let newmaxy = Math.max(...county.geometry.coordinates[i.toString()][0].map(o => o[1]));
                        if (newmaxy > maxy) {
                            maxy = newmaxy;
                        } 
                        let newminx = Math.min(...county.geometry.coordinates[i.toString()][0].map(o => o[0]));
                        if (newminx < minx) {
                            minx = newminx;
                        }
                        let newminy = Math.min(...county.geometry.coordinates[i.toString()][0].map(o => o[1]));
                        if (newminy < miny) {
                            miny = newminy;
                        }
                    }
                }

                // get corresponding racial demographic data
                const WHITE = "U7B003";
                const BLACK = "U7B004";
                const NATIVE_AMER = "U7B005";
                const ASIAN = "U7B006";
                const PACIFIC_ISL = "U7B007";
                const OTHER = "U7B008";
                // const TWO_PLUS = "U7B009";
                const WHITE_BLACK = "U7B011";
                const WHITE_NATIVE = "U7B012";
                const WHITE_ASIAN = "U7B013";
                const WHITE_PACIFIC = "U7B014";
                const WHITE_OTHER = "U7B015";
                const BLACK_NATIVE = "U7B016";
                const BLACK_ASIAN = "U7B017";
                const BLACK_PACIFIC = "U7B018";
                const BLACK_OTHER = "U7B019";
                const NATIVE_ASIAN = "U7B020";
                const NATIVE_PACIFIC = "U7B021";
                const NATIVE_OTHER = "U7B022";
                const ASIAN_PACIFIC = "U7B023";
                const ASIAN_OTHER = "U7B024";
                const PACIFIC_OTHER = "U7B025";
                const THREE_PLUS = "U7B026";


                function getRace(race) {
                    switch(race) {
                        case WHITE:
                            // light gray
                            return "1White";
                        case BLACK:
                            // yellow
                            return "1Black";
                        case NATIVE_AMER:
                            // light blue
                            return "1Native American";
                        case ASIAN:
                            // red
                            return "1Asian";
                        case PACIFIC_ISL:
                            // green
                            return "1Pacific Islander";
                        case OTHER: 
                            // blue
                            return "1Other Single Race";
                        case WHITE_BLACK:
                            return "Black and White";
                        case WHITE_NATIVE: 
                            return "Native American and White";
                        case WHITE_ASIAN:
                            return "Asian and White";
                        case WHITE_PACIFIC:
                            return "Pacific Islander and White"; 
                        case WHITE_OTHER:
                            return "Other and White";
                        case BLACK_NATIVE:
                            return "Black and Native American";
                        case BLACK_ASIAN:
                            return "Asian and Black"; 
                        case BLACK_PACIFIC:
                            return "Black and Pacific Islander";
                        case BLACK_OTHER:
                            return "Black and Other";
                        case NATIVE_ASIAN:
                            return "Asian and Native American";
                        case NATIVE_PACIFIC:
                            return "Native American and Pacific Islander";
                        case NATIVE_OTHER:
                            return "Native American and Other";
                        case ASIAN_PACIFIC:
                            return "Asian and Pacific Islander";
                        case ASIAN_OTHER:
                            return "Asian and Other";
                        case PACIFIC_OTHER:
                            return "Other and Pacific Islander";
                        case THREE_PLUS: 
                            // lavender
                            return "3+ races";
                        default:
                            return "Unknown";
                    }
                }
                let races = [WHITE, BLACK, NATIVE_AMER, ASIAN, PACIFIC_ISL, OTHER, 
                    WHITE_BLACK, WHITE_NATIVE, WHITE_ASIAN, WHITE_PACIFIC, WHITE_OTHER,
                    BLACK_NATIVE, BLACK_ASIAN, BLACK_PACIFIC, BLACK_OTHER,
                    NATIVE_ASIAN, NATIVE_PACIFIC, NATIVE_OTHER, 
                    ASIAN_PACIFIC, ASIAN_OTHER, PACIFIC_OTHER, THREE_PLUS];

                console.log(csvdemographics[i]["COUNTY"]);
                for (let r = 0; r < races.length; r++) {
                    for (let j = 0; j < parseInt(csvdemographics[i][races[r]])/1000; j++) {
                                                                                    // string, index, number
                        let coordinfo = genDotCoord(county, maxx, maxy, minx, miny, getRace(races[r]), r, races.length);
                        if (i == tmpunits.length - 1 && r == races.length - 1 && j == Math.ceil(parseInt(csvdemographics[i][races[r]])/1000) - 1) {
                            coordinfo[4] = (coordinfo[4].toString() + "`;");
                        }
                        dots.push(coordinfo);
                    }
                }
            }

            // download dots data file
            let csvContent = "data:text/csv;charset=utf-8," 
                + dots.map(e => e.join(",")).join("\n");
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "dot_data.csv.js");
            document.body.appendChild(link); // Required for FF

            link.click();

            // plot dots
            console.log("dots len", dots.length);
            for (let i = 0; i < dots.length; i++) {
                cx.beginPath();
                // no longer filling color
                // cx.fillStyle = dots[i][2];
                let coord = (projection(dots[i].slice(0,2)));
                // for Hawaii errors
                if (coord == null) {
                    console.log(i, dots[i]);
                    continue;
                }
                // x, y, radius, 0-7 is about 2pi
                cx.arc(coord[0], coord[1], 1, 0, 7);
                cx.fill();
            }
            console.log("circles");
        }
        d3.csv("county.csv", load);
        
        // notes:
        // give coord to get pixel
        // console.log(projection([-141.190,52.4739]));
        // pixel to coord
        // console.log(projection.invert([241.20395864818516, 649.6497666026178]));
    });   
}