import type { AnyNode } from "cheerio";
import type { Context, Selector } from "@/types";

async function set(context: Context, selector: Selector): Promise<Context> {
  const { $, scope } = context;
  const isMultiple = Array.isArray(selector);

  const _selector: string | object = isMultiple ? selector[0] : selector;

  if (!scope && typeof _selector === "object") {
    throw new Error("Can't set an object without a defined scope.");
  }

  if (typeof _selector === "object") {
    if (isMultiple) {
      function mapNodes(i: number, node: AnyNode) {
        return Object.fromEntries(
          Object.entries(_selector).map(([k, s]: string[]) => {
            const attr = s.match(/(?<=@)[a-z]+/)?.[0] || "";
            const _s = s.replace(/@[a-z]+/, "");

            const current = $(node).find(_s).first();

            return attr
              ? [k, current.attr(attr) || null]
              : [k, current.text().trim()];
          })
        );
      }

      // @ts-expect-error dumb error
      const data = scope!.map(mapNodes).get();

      return { ...context, data };
    }

    const data = Object.fromEntries(
      Object.entries(_selector).map(([k, s]: string[]) => {
        const attr = s.match(/(?<=@)[a-z]+/)?.[0] || "";
        const _s = s.replace(/@[a-z]+/, "");

        const node = scope!.find(_s).first();

        return attr ? [k, node?.attr(attr) || null] : [k, node?.text().trim()];
      })
    );

    return { ...context, data };
  }

  if (typeof _selector === "string") {
    const attr = _selector.match(/(?<=@)[a-z]+/)?.[0] || "";
    const selectorClean = _selector.replace(/@[a-z]+/, "");

    if (isMultiple) {
      const nodes = scope ? scope.find(selectorClean) : $(selectorClean);

      function mapNodes(i: number, n: AnyNode) {
        return attr ? $(n).attr(attr) || null : $(n).text().trim();
      }

      const data = nodes.map(mapNodes).get();
      return { ...context, data };
    }

    const node = scope ? scope.find(selectorClean) : $(selectorClean);

    const data = attr ? node.attr(attr) || null : node.first().text().trim();
    return { ...context, data };
  }

  throw new Error(`Unsupported Selector: ${selector}`);
}

export default set;
