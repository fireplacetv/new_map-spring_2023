import "./styles.css";
import "mapbox-gl/dist/mapbox-gl.css";
import * as mapboxgl from "mapbox-gl";
import settings from "./settings.json";
import custom from "./custom-style.json";

let map;

async function init() {
    const neighborhoods = await import("../data/output.json");
    const style = map.getStyle();

    style.sources = {
        ...style.sources,
        ...custom.sources
    };
    style.layers.push(...custom.layers);
    map.setStyle(style);
    map.getSource("neighborhoods").setData(neighborhoods);
    
    initLegend();
    initPopup();
}

function initLegend() {
    const legend = document.querySelector("#legend");
    const template = document.querySelector("#legend-entry")
    const fillColorStyle = map.getPaintProperty("neighborhoods-fill-extrusion", "fill-extrusion-color");
    
    fillColorStyle.splice(0,2); // remove first two elements: ["step", ["get","count"]]
    let lowerBound = 1;
    for (let index = 0; index < fillColorStyle.length; index+=2) {
        const legendEntry = document.importNode(template.content, true);
        const entrySpans = legendEntry.querySelectorAll("span");
        const hexColorCode = fillColorStyle[index];
        const upperBound = fillColorStyle[index+1];

        entrySpans[0].style.backgroundColor = hexColorCode;
        if (upperBound) {
            entrySpans[1].textContent = lowerBound + " - " + (upperBound - 1) + " sites";
        } else {
            entrySpans[1].textContent = ">=" + lowerBound + " sites";
        }

        lowerBound = upperBound;
        legend.appendChild(legendEntry);
    }

}

let hovered;
const popup = document.querySelector("#popup");
const neighborhoodName = popup.querySelector(".neighborhood-name");
const nieghborhoodSiteCount = popup.querySelector(".neighborhood-site-count");
function initPopup() {
    map.on('mousemove', 'neighborhoods-fill', function(event) {
        clearHover();
        if (event.features.length > 0) {
            hovered = event.features[0];
            neighborhoodName.textContent = hovered.properties.name;
            nieghborhoodSiteCount.textContent = hovered.properties.count;
            popup.style.display = "block";
            map.setFeatureState(hovered, {
                hover: true
             })
        }
    });
    map.on('mouseleave', 'neighborhoods-fill', clearHover);
}

function clearHover() {
    popup.style.display = "none";
    if (hovered) {
        map.setFeatureState(hovered, {
            hover: false
        })
    }
}

mapboxgl.accessToken = settings.accessToken;
map = new mapboxgl.Map(settings);
map.on("load", init);
