// data processing script
//
// Run this script manually to create the desired geoJSON output file
// which can then be checked in to git; does not execute at runtime.
// 
// Run with:
//     npm run process

import { collect } from "@turf/turf"; // turf documentation: https://turfjs.org/docs/
import fs from "fs"; // default module that comes with node
import sites from "../data/sites.json" assert {type: "json"};
import neighborhoods from "../data/neighborhoods.json" assert {type: "json"};

sites.features.forEach(function(feature) {
    feature.properties = {
        count: 1
    }
});

let output = collect(neighborhoods, sites, "count", "count");
output.features.forEach(function(feature, index) {
    feature.properties.count = feature.properties.count.length;
    feature.id = index;
});

output = JSON.stringify(output);
fs.writeFile("../data/output.json", output, function(error) {
    if (error) throw error;

    console.log("success. 👍");
});
