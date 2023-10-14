import superagent from "superagent";
import { load, type CheerioAPI, type Cheerio, type Node } from "cheerio";

type Selector = string | Object | (string | Object)[];

interface Context {
  $: CheerioAPI;
  data: Selector | null;
  scope: Cheerio<Node> | null;
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
    find(selector: Selector) {
      _commands.push(["find", selector]);
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
  // async set(context: Context, selector: string | string[]): Promise<Context> {
  //   const { $, scope } = context;

  //   if (Array.isArray(selector)) {
  //     return context;
  //   }

  //   if (typeof selector === "object") {
  //     const data = Object.fromEntries(
  //       Object.entries(selector).map(([k, s]: any) => [k, $(s).text().trim()])
  //     );

  //     return { ...context, data: { ...context.data, ...data } };
  //   }

  //   return { ...context, data: $(selector).text().trim() };
  // },
  async init(url: string): Promise<Context> {
    const { text } = await superagent.get(url);
    return { $: load(text), data: null, scope: null };
  },
  async find(context: Context, selector: string): Promise<Context> {
    const { $ } = context;
    return { ...context, scope: $(selector) };
  },
};

export default scraper;
