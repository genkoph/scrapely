import type { AnyNode } from "cheerio";
import type { Context, Selector } from "@/types";

async function set(context: Context, selector: Selector): Promise<Context> {
  const { $, scope } = context;
  const isMultiple = Array.isArray(selector);

  const _selector: string | object = isMultiple ? selector[0] : selector;

  if (!scope && isMultiple && typeof _selector === "object") {
    throw new Error("To set an array of objects, you must have a defined scope");
  }

  if (typeof _selector === "object") {
    // case: multiple object
    if (isMultiple) {
      function mapNodes(_: number, node: AnyNode) {
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

    // case: single object
    const data = Object.fromEntries(
      Object.entries(_selector).map(([k, s]: string[]) => {
        const attr = s.match(/(?<=@)[a-z]+/)?.[0] || "";
        const _s = s.replace(/@[a-z]+/, "");

        const node = scope ? scope.find(_s).first() : $(_s).first();

        return attr ? [k, node?.attr(attr) || null] : [k, node?.text().trim()];
      })
    );

    return { ...context, data };
  }

  if (typeof _selector === "string") {
    const attr = _selector.match(/(?<=@)[a-z]+/)?.[0] || "";
    const __selector = _selector.replace(/@[a-z]+/, "");

    // case: multiple strings
    if (isMultiple) {
      const nodes = scope ? scope.find(__selector) : $(__selector);

      function mapNodes(i: number, n: AnyNode) {
        return attr ? $(n).attr(attr) || null : $(n).text().trim();
      }

      const data = nodes.map(mapNodes).get();
      return { ...context, data };
    }

    // case: single string
    const node = scope ? scope.find(__selector).first() : $(__selector).first();
    const data = attr ? node.attr(attr) || null : node.text().trim();

    return { ...context, data };
  }

  throw new Error(`Selector must be of type "string" or "object".`);
}

export default set;
