// import React, {Component} from 'react';

// class Load extends Component {

// }
        var width = 1024,
        height = 800;
        let canvas = document.querySelector("canvas");
        let cx = canvas.getContext("2d");
        var projection = d3.geoAlbersUsa();
        var globalUS;
        let path = d3.geoPath().projection(projection).context(cx);
        let dots;

        function redraw(transform) {
            cx.save();
            if (transform) {
            cx.clearRect(0, 0, width, height);
            cx.translate(transform.x, transform.y);
            cx.scale(transform.k, transform.k);
            }
            cx.beginPath();
            // context.stroke(path2D);
            path(topojson.mesh(globalUS));
            cx.stroke();
            for (let i = 0; i < dots.length; i++) {
                cx.beginPath();
                cx.fillStyle = dots[i][2];
                let coord  = (projection(dots[i].slice(0,2)));
                cx.arc(coord[0], coord[1], 1, 0, 7);
                cx.fill();
            }
            cx.restore();
            console.log("zoom");
          }
          
        d3.select(cx.canvas).call(d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", function () { redraw(d3.event.transform); }), 
        );

        // var svg = d3.select("body")
        //         .append("svg")
        //         .attr("width", width)
        //         .attr("height", height);    

        // testing with smaller county json file
        d3.json("tl_2020_us_county.json", function(error, us) {
        // d3.json("tl_2020_25MA_tabblock20.json", function(error, us) {
            if (error) return console.error(error);
            globalUS = us;
            // subunits is all county/block boundaries
            var subunits = topojson.feature(us, us.objects.tl_2020_us_county).features;
            // var subunits = topojson.feature(us, us.objects.tl_2020_25_tabblock20).features;
            // choose which counties/blocks to display
            var tmpunits = [];
            for (let i = 0; i < subunits.length; i++) {
                if (parseInt(subunits[i].properties["STATEFP"]) <= 56) {
                // if (parseInt(subunits[i].properties["STATEFP"]) == 78) {
                    tmpunits.push(subunits[i]);
                }
            }
            tmpunits.sort(function(s1, s2) {
                // right to left
                return parseFloat(s1.properties["INTPTLON"].slice(1)) - parseFloat(s2.properties["INTPTLON"].slice(1));
                // return parseFloat(s1.properties["INTPTLON20"].slice(1)) - parseFloat(s2.properties["INTPTLON20"].slice(1))
            });
            // subunits = subunits.slice(13);
            // subunits = subunits.slice(0, 3221);
            console.log("len", tmpunits.length);
            // var projection = d3.geoAlbersUsa();
                // .translate([width/2 - 2000, height/2 + 400])
                // .scale(6000);
                //.translate([width/2-2000, height/2 + 300]) // +700 for CA
                //.scale(5000);  
            // var map_coord = d3.geoPath();
                // .projection(projection);
            // let path = d3.geoPath().projection(projection).context(cx);
            
            cx.beginPath();
            path(topojson.mesh(us));
            cx.stroke();

            // redraw(d3.transform);
            // svg.selectAll("path")
            //     .data(tmpunits)
            //     .enter()
            //     .append("path")
            //     .attr("d", map_coord); // map_coord same as: d => map_coord(d)

            console.log('rendered boundaries');


            // racial demographic data & dots for select counties
            let csvdemographics = [];
            dots = [];
            function genDotCoord (d, maxx, maxy, minx, miny, c, ind) {
                let coordx = Math.random() * (maxx - minx) + minx;
                let coordy = Math.random() * (maxy - miny) + miny;
                while (!d3.geoContains(d, [coordx, coordy])) {
                    // console.log('nay');
                    coordx = Math.random() * (maxx - minx) + minx;
                    coordy = Math.random() * (maxy - miny) + miny;
                }
                let color = c;
                // console.log('yay');
                return [coordx, coordy, color, ind];
            };

            let load = function(error, data) {
                // TODO: handle error case 
                if (error) return console.warn(error);
                // filtering race demographic data for now for select counties
                for (var i = 0; i < data.length; i++) {
                    // if (data[i]["STATE"] == "Alabama") {
                    csvdemographics.push(data[i]);
                    // }                     
                }
                // sort to match subunit order
                csvdemographics.sort(function(s1, s2) {
                    // right to left
                    return parseFloat(s1["INTPTLON"].slice(1)) - parseFloat(s2["INTPTLON"].slice(1));
                    // return parseFloat(s1.properties["INTPTLON20"].slice(1)) - parseFloat(s2.properties["INTPTLON20"].slice(1))
                });
                // check same length
                console.log("len2", csvdemographics.length);

                // note to self: change tmpunits later to subunits
                for (let i = 0; i < tmpunits.length; i++) {
                    // county is used to get coordinates
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
                    const TWO_PLUS = "U7B009";

                    function getColor(race) {
                        switch(race) {
                            case WHITE:
                                // light gray
                                return "light gray";
                            case BLACK:
                                // yellow
                                return "yellow";
                            case NATIVE_AMER:
                                // light blue
                                return "light blue";
                            case ASIAN:
                                // red
                                return "red";
                            case PACIFIC_ISL:
                                // green
                                return "green";
                            case OTHER: 
                                // blue
                                return "blue";
                            case TWO_PLUS: 
                                // lavender
                                return "lavender";
                            default:
                                return "black";
                        }
                    }
                    let races = [WHITE, BLACK, NATIVE_AMER, ASIAN, PACIFIC_ISL, OTHER, TWO_PLUS];
                    for (let r = 0; r < races.length; r++) {
                        for (let j = 0; j < parseInt(csvdemographics[i][races[r]])/100000; j++) {
                            let coord = genDotCoord(county, maxx, maxy, minx, miny, getColor(races[r]), r);
                            dots.push(coord);
                        }
                        
                    }
                }
                // plot dots
                for (let i = 0; i < dots.length; i++) {
                    // cx.fillStyle = "red";
                    // cx.arc(50, 50, 40, 0, 7);
                    // cx.fill();
                    // cx.fillStyle = dots[i][2];
                    cx.beginPath();
                    cx.fillStyle = dots[i][2];
                    let coord  = (projection(dots[i].slice(0,2)));
                    cx.arc(coord[0], coord[1], 1, 0, 7);
                    cx.fill();
                }

                console.log("circles");
                
                // svg.selectAll('circle')
                // .data(dots)
                // .enter()
                // .append('circle')
                // .style('fill', data => data[2])
                // .attr('class', data => data[3])
                // .attr('r', 1)
                // .attr('transform', function(data) {return "translate(" + projection(data) + ")";});
            }

            d3.csv("county.csv", load);
           
            // notes:
            // give coord to get pixel
            // console.log(projection([-141.190,52.4739]));
            // pixel to coord
            // console.log(projection.invert([241.20395864818516, 649.6497666026178]));
        });   