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
      const { data } = await iterateCommands(commandsQueue, initialContext);

      return data;
    },
  };

  return commands;
}

async function iterateCommands(
  commands: [Function, Selector][],
  context: unknown
): Promise<Context> {
  const _commands = [...commands];
  const [current, args] = _commands.shift()!;

  const result = await current(context, args);

  if (_commands.length === 0) {
    return result;
  }

  return iterateCommands(_commands, result);
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
    const _selector = selector[0];

    // case: multiple objects
    if (typeof _selector === "object") {
      if (!scope) {
        throw new Error("Can't set an object without a defined scope.");
      }

      const data = scope
        // @ts-expect-error
        .map(function () {
          return Object.fromEntries(
            Object.entries(_selector).map(([k, v]) => {
              return [
                k,
                $(this)
                  .find(v as string)
                  .first()
                  .text()
                  .trim(),
              ];
            })
          );
        })
        .get();

      return { ...context, data };
    }

    // case: multiple strings
    if (typeof _selector === "string") {
      if (!scope) {
        const data = $(_selector)
          .map(function () {
            return $(this).text().trim();
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

    const data = Object.fromEntries(
      Object.entries(selector).map(([k, s]: any) => [
        k,
        scope.find(s).first().text().trim(),
      ])
    );

    return { ...context, data: { ...(context.data as Object), ...data } };
  }

  // case: single string
  if (typeof selector === "string") {
    if (!scope) {
      const data = $(selector).first().text().trim();
      return { ...context, data };
    }

    return { ...context, data: scope.find(selector).first().text().trim() };
  }

  return context;
}

export default scraper;
