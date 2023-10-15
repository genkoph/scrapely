import superagent from "superagent";
import { load, type CheerioAPI, type Cheerio, type AnyNode } from "cheerio";

type Selector = string | Object | (string | Object)[];

interface Context {
  $: CheerioAPI;
  data: Selector | null;
  scope: Cheerio<AnyNode> | null;
}

function scraper(url: string) {
  const commandsQueue: [Function, Selector][] = [
    [init, url], // initial command
  ];

  const commands = {
    set(selector: Selector) {
      commandsQueue.push([set, selector]);
      return this;
    },
    scope(selector: string) {
      commandsQueue.push([scope, selector]);
      return this;
    },
    async data() {
      const initialContext = commandsQueue[0][1];
      const { data } = await executeCommands(commandsQueue, initialContext);

      return data;
    },
  };

  return commands;
}

async function executeCommands(
  commands: [Function, Selector][],
  context: unknown
): Promise<Context> {
  const _commands = [...commands];
  const [current, args] = _commands.shift()!;

  const result = await current(context, args);

  if (_commands.length === 0) {
    return result;
  }

  return executeCommands(_commands, result);
}

// ------ commands ------

async function init(url: string): Promise<Context> {
  const { text } = await superagent.get(url);
  return { $: load(text), data: null, scope: null };
}

async function scope(context: Context, selector: string): Promise<Context> {
  const { $ } = context;
  return { ...context, scope: $(selector) };
}

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
            // @ts-expect-error
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

    return context;
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

    return { ...context, data: { ...(context.data as Object), ...data } };
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

  return context;
}

export default scraper;
