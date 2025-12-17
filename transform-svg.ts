import {type Plugin} from "vite";
import {readFileSync} from "fs";
import {XMLParser} from "fast-xml-parser";

export default function transformSvg(): Plugin {
    const svgRegex = /\.svg$/;

    return {
        name: "svg-resource",
        async transform(source, id) {
            const result = id.match(svgRegex);

            if (result) {
                const code = readFileSync(id, "utf-8");

                const parser = new XMLParser({
                    ignoreAttributes: false,
                    attributeNamePrefix: "",
                });
                const jsonObj = parser.parse(code);

                if (jsonObj && jsonObj.svg) {
                    const viewBox = jsonObj.svg.viewBox;
                    const d = jsonObj.svg.path.d;

                    return `export default ${JSON.stringify({
                        viewBox,
                        d,
                    })};`;
                } else {
                    this.error(`Invalid SVG resource file: ${id}`);
                }
            }
        },
    };
}
