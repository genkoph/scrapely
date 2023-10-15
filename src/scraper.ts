import superagent from "superagent";
import { load, type CheerioAPI, type Cheerio, type AnyNode } from "cheerio";

type Selector = string | Object | (string | Object)[];

interface Context {
  $: CheerioAPI;
  data: Selector | null;
  scope: Cheerio<AnyNode> | null;
}

function scraper(url: string) {
  const _commands: [string, Selector][] = [
    ["init", url], // initial command
  ];

  const _scraper = {
    set(selector: Selector) {
      _commands.push(["set", selector]);
      return this;
    },
    find(selector: string) {
      _commands.push(["find", selector]);
      return this;
    },
    delay(ms: number) {
      _commands.push(["delay", ms]);
      return this;
    },
    async data() {
      const { commands, initialContext } = transformCommands(_commands);
      const { data } = await iterateCommands(commands, initialContext);

      return data;
    },
  };

  return _scraper;
}

async function iterateCommands(
  commands: [Function, Selector][],
  context: unknown
): Promise<Context> {
  const _functions = [...commands];
  const [current, args] = _functions.shift()!;

  const result = await current(context, args);

  if (_functions.length === 0) {
    return result;
  }

  return iterateCommands(_functions, result);
}

function transformCommands(commandsRaw: [string, Selector][]) {
  const commands: [Function, Selector][] = commandsRaw.map(
    ([command, args]) => [commandsFunctions[command], args]
  );
  const initialContext = commandsRaw[0][1];

  return { commands, initialContext };
}

const commandsFunctions: Record<string, Function> = {
  async set(context: Context, selector: string | string[]): Promise<Context> {
    const { $, scope } = context;

    if (Array.isArray(selector)) {
      // case: multiple objects
      if (typeof selector[0] === "object") {
        if (!scope) {
          throw new Error("Can't set an array of objects without a defined scope.")
        }

        const data = scope
          // @ts-expect-error
          .map(function () {
            return Object.fromEntries(
              Object.entries(selector[0]).map(([k, v]) => {
                return [k, $(this).find(v).first().text().trim()];
              })
            );
          })
          .get();

        return { ...context, data };
      }

      // case: multiple strings
      if (!scope) {
        const data = $(selector[0])
          .map(function () {
            return $(this).text().trim();
          })
          .get();

        return { ...context, data };
      }

      const data = scope
        .find(selector[0])
        .map(function () {
          return $(this).text().trim();
        })
        .get();

      return { ...context, data };
    }

    // case: single object
    if (typeof selector === "object") {
      if (!scope) {
        throw new Error("Can't set an object without a defined scope.")
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
    if (!scope) {
      const data = $(selector).first().text().trim();
      return { ...context, data };
    }

    return { ...context, data: scope.find(selector).first().text().trim() };
  },
  async init(url: string): Promise<Context> {
    const { text } = await superagent.get(url);
    return { $: load(text), data: null, scope: null };
  },
  async find(context: Context, selector: string): Promise<Context> {
    const { $ } = context;
    return { ...context, scope: $(selector) };
  },
  async delay(context: Context, ms: number): Promise<Context> {
    await new Promise((resolve) => setTimeout(resolve, ms));
    return context;
  },
};

export default scraper;
