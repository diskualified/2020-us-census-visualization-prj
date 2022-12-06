var width = 1024,
    height = 800;

function calc_colors() {
    // color conversion helper functions:
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
    finalcolors.splice(2, 0, rgbToHex(toRGBArray(document.getElementById("hispanic").style.color)));
    finalcolors.push(rgbToHex(toRGBArray(document.getElementById("three").style.color)));

    // reset color display/print out
    var div = document.getElementById('colors');
    div.innerHTML = "";

    // calc afro-latino color outside of loop
    // var m = colorMixer(toRGBArray(document.getElementById("hispanic").style.color), basecolors[1]);
    // var afrolatin = rgbToHex(m);
    // finalcolors.push(afrolatin);
    // var p = document.createElement("p");
    // p.innerHTML = "Afro-Latino" + ": " + afrolatin;
    // p.style.color = afrolatin;
    // div.append(p);      
    // hard-coding afro-latino color for now:
    let c = "#806ede";
    finalcolors.push(c);
    var p = document.createElement("p");
    p.innerHTML = "Afro-Latino" + ": " + c;
    p.style.color = c;
    div.append(p);      
    

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
    // display calculated color in kepler legend order
    var p = document.createElement("p");
    p.innerHTML = "\"" + finalcolors.join("\",<br />\"") + "\"";
    div.append(p);
}



function dload() {
    document.getElementById("loading").innerHTML = "Loading...";
    let canvas = document.querySelector("canvas");

    let cx = canvas.getContext("2d");
    var projection = d3.geoAlbersUsa();
    let path = d3.geoPath().projection(projection).context(cx);

    var globalUS;
    let dots = [["export default `Longitude","Latitude","Race","Race Num","Alt"]];

    // use county json file
    d3.json("tl_2020_us_county.json", function(error, us) {
    // d3.json("tl_2020_25MA_tabblock20.json", function(error, us) {
        if (error) return console.error(error);
        globalUS = us;
        // bounds = all county boundaries in topojson
        var bounds = topojson.feature(us, us.objects.tl_2020_us_county).features;

        // select to display only counties in US States to display 
        var USbounds = [];
        for (let i = 0; i < bounds.length; i++) {
            if (parseInt(bounds[i].properties["STATEFP"]) <= 56) {
                USbounds.push(bounds[i]);
            }
        }
        USbounds.sort(function(s1, s2) {
            // sorts right to left
            return parseFloat(s1.properties["INTPTLON"].slice(1)) - parseFloat(s2.properties["INTPTLON"].slice(1));
            // return parseFloat(s1.properties["INTPTLON20"].slice(1)) - parseFloat(s2.properties["INTPTLON20"].slice(1))
        });
        // console.log("len", USbounds.length);
        cx.beginPath();
        path(topojson.mesh(us));
        cx.stroke();

        console.log('rendered boundaries');

        // racial demographic data & dots for select counties
        let csvdemographics = [];

        // helper for getting/formatting dot data
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

            for (let i = 0; i < USbounds.length; i++) {
                // county is used to get coordinates
                // console.log(i, USbounds[i]["properties"]["NAMELSAD"]);
                let county = USbounds[i];    
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
                const THREE = "U7B026";
                const FOUR = "U7B047";
                const FIVE = "U7B063";
                const SIX = "U7B070";

                const LWHITE = "U7C005";
                const LBLACK = "U7C006";
                const LNATIVE_AMER = "U7C007";
                const LASIAN = "U7C008";
                const LPACIFIC_ISL = "U7C009";
                const LOTHER = "U7C010";
                // const TWO_PLUS = "U7C009";
                const LWHITE_BLACK = "U7C013";
                const LWHITE_NATIVE = "U7C014";
                const LWHITE_ASIAN = "U7C015";
                const LWHITE_PACIFIC = "U7C016";
                const LWHITE_OTHER = "U7C017";
                const LBLACK_NATIVE = "U7C018";
                const LBLACK_ASIAN = "U7C019";
                const LBLACK_PACIFIC = "U7C020";
                const LBLACK_OTHER = "U7C021";
                const LNATIVE_ASIAN = "U7C022";
                const LNATIVE_PACIFIC = "U7C023";
                const LNATIVE_OTHER = "U7C024";
                const LASIAN_PACIFIC = "U7C025";
                const LASIAN_OTHER = "U7C026";
                const LPACIFIC_OTHER = "U7C027";
                const LTHREE = "U7C028";
                const LFOUR = "U7C049";
                const LFIVE = "U7C065";
                const LSIX = "U7C072";


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
                        case THREE: 
                            // lavender
                            return "3+ races";
                        case FOUR: 
                            // lavender
                            return "3+ races";
                        case FIVE: 
                            // lavender
                            return "3+ races";
                        case SIX: 
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
                    ASIAN_PACIFIC, ASIAN_OTHER, PACIFIC_OTHER, THREE, FOUR, FIVE, SIX];
                let lraces = [LWHITE, LBLACK, LNATIVE_AMER, LASIAN, LPACIFIC_ISL, LOTHER, 
                    LWHITE_BLACK, LWHITE_NATIVE, LWHITE_ASIAN, LWHITE_PACIFIC, LWHITE_OTHER,
                    LBLACK_NATIVE, LBLACK_ASIAN, LBLACK_PACIFIC, LBLACK_OTHER,
                    LNATIVE_ASIAN, LNATIVE_PACIFIC, LNATIVE_OTHER, 
                    LASIAN_PACIFIC, LASIAN_OTHER, LPACIFIC_OTHER, LTHREE, LFOUR, LFIVE, LSIX];

                console.log(csvdemographics[i]["COUNTY"]);
                for (let r = 0; r < races.length; r++) {
                    let racecount_per_county = parseInt(csvdemographics[i][races[r]]);
                    let nonhispanic_count = parseInt(csvdemographics[i][lraces[r]]);
                    let hispanic_count = racecount_per_county - nonhispanic_count;
                    // console.log("total", racecount_per_county);
                    // console.log("hispanic", hispanic_count);
                    // console.log("nonhispanic", nonhispanic_count);

                    for (let j = 0; j < nonhispanic_count/1000; j++) {
                                                                                    // string, index, number for random alt
                        let coordinfo = genDotCoord(county, maxx, maxy, minx, miny, getRace(races[r]), r, races.length + 2);
                        dots.push(coordinfo);
                    }
                    for (let j = 0; j < hispanic_count/1000; j++) {
                                                                                                     // string, index, number for random alt
                        let coordinfo = (r != 1) ? genDotCoord(county, maxx, maxy, minx, miny,"1Hispanic/Latino", r, races.length + 2) : genDotCoord(county, maxx, maxy, minx, miny,"Afro-Latino", r, races.length + 2);

                        dots.push(coordinfo);
                    }
                    // if (i == USbounds.length - 1 && r == races.length - 1) {
                    //     dots.at(-1)[4] = (dots.at(-1)[4].toString() + "`;");
                    // }
                }
            }
            dots.at(-1)[4] = (dots.at(-1)[4].toString() + "`;");

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
        d3.csv("countywhispanic.csv", load);
        
        // notes:
        // give coord to get pixel
        // console.log(projection([-141.190,52.4739]));
        // pixel to coord
        // console.log(projection.invert([241.20395864818516, 649.6497666026178]));
    });   
}