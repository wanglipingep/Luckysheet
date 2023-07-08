import { seriesLoadScripts, loadLinks, $$ } from "../../utils/util";
import { luckysheetPrint } from "./print";
import Store from "../../store";

// Dynamically load dependent scripts and styles
const dependScripts = [
    './expendPlugins/print/print.js'
];

const dependLinks = [
    './expendPlugins/print/print.css'
];

// Initialize the chart component
function print(options, config, isDemo) {
    loadLinks(dependLinks);
    seriesLoadScripts(dependScripts, null, function() {});
    if (luckysheetPrint) {
        Store.luckysheetPrint = luckysheetPrint;
        // const link = document.createElement("link");
        // link.setAttribute("rel", "stylesheet");
        // link.setAttribute("type", "text/css");
        // link.setAttribute("href", "./expendPlugins/print/print.css");
        // document.head.appendChild(link);
    }
}

export { print };
