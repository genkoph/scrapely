import type { Context, Selector } from "@/types";

async function set(context: Context, selector: Selector): Promise<Context> {
  const { $, scope } = context;

  if (Array.isArray(selector)) {
    // case: multiple objects
    if (typeof selector[0] === "object") {
      if (!scope) {
        throw new Error("Can't set an object without a defined scope.");
      }

      const data = scope
        .map(function () {
          const parseSelectorKV = ([k, s]: string[]) => {
            const attr = s.match(/(?<=@)[a-z]+/)?.[0] || "";
            const _s = s.replace(/@[a-z]+/, "");

            if (attr) {
              return [k, $(this).find(_s).first().attr(attr)];
            }

            return [k, $(this).find(_s).first().text().trim()];
          };

          return Object.fromEntries(
            // @ts-expect-error dumb type
            Object.entries(selector[0]).map(parseSelectorKV)
          );
        })
        .get();

      return { ...context, data };
    }

    // case: multiple strings
    if (typeof selector[0] === "string") {
      const attr = selector[0].match(/(?<=@)[a-z]+/)?.[0] || "";
      const _selector = selector[0].replace(/@[a-z]+/, "");

      if (!scope) {
        if (attr) {
          const data = $(_selector)
            .map(function () {
              return $(this).attr(attr);
            })
            .get();

          return { ...context, data };
        }

        const data = $(_selector)
          .map(function () {
            return $(this).text().trim();
          })
          .get();

        return { ...context, data };
      }

      if (attr) {
        const data = scope
          .find(_selector)
          .map(function () {
            return $(this).attr(attr);
          })
          .get();

        return { ...context, data };
      }

      const data = scope
        .find(_selector)
        .map(function () {
          return $(this).text().trim();
        })
        .get();

      return { ...context, data };
    }

    throw new Error(`Unsupported Selector: ${selector[0]}`);
  }

  // case: single object
  if (typeof selector === "object") {
    if (!scope) {
      throw new Error("Can't set an object without a defined scope.");
    }

    const parseSelectorKV = ([k, s]: string[]) => {
      const attr = s.match(/(?<=@)[a-z]+/)?.[0] || "";
      const _s = s.replace(/@[a-z]+/, "");

      if (attr) {
        return [k, scope.find(_s).first().attr(attr)];
      }

      return [k, scope.find(_s).first().text().trim()];
    };

    const data = Object.fromEntries(
      Object.entries(selector).map(parseSelectorKV)
    );

    return { ...context, data: { ...(context.data as object), ...data } };
  }

  // case: single string
  if (typeof selector === "string") {
    const attr = selector.match(/(?<=@)[a-z]+/)?.[0] || "";
    const _selector = selector.replace(/@[a-z]+/, "");

    if (!scope) {
      if (attr) {
        const data = $(_selector).first().attr(attr) || null;
        return { ...context, data };
      }

      const data = $(_selector).first().text().trim();
      return { ...context, data };
    }

    if (attr) {
      const data = scope.find(_selector).first().attr(attr) || null;
      return { ...context, data };
    }

    const data = scope.find(_selector).first().text().trim();
    return { ...context, data };
  }

  throw new Error(`Unsupported Selector: ${selector}`);
}

export default set;
