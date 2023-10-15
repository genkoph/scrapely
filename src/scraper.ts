import set from "./commands/set.command";
import init from "./commands/init.command";
import scope from "./commands/scope.command";
import type { Context, Selector } from "./types";

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

export default scraper;
