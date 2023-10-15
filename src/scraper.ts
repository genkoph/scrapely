import set from "@/commands/set.command";
import init from "@/commands/init.command";
import scope from "@/commands/scope.command";
import type { Context, Selector } from "@/types";

function scraper(url: string) {
  // eslint-disable-next-line
  const commandsQueue: [(...args: any[]) => Promise<Context>, Selector][] = [
    [init, url], // initial command
  ];

  const commands = {
    set(selector: Parameters<typeof set>[1]) {
      commandsQueue.push([set, selector]);
      return this;
    },
    scope(selector: Parameters<typeof scope>[1]) {
      commandsQueue.push([scope, selector]);
      return this;
    },
    async data() {
      const initialContext = commandsQueue[0][1];
      return executeCommands(commandsQueue, initialContext);
    },
  };

  return commands;
}

async function executeCommands(
  // eslint-disable-next-line
  commands: [(...args: any[]) => Promise<Context>, Selector][],
  context: unknown
): Promise<Selector | null> {
  const _commands = [...commands];
  const [current, args] = _commands.shift()!;

  const result = await current(context, args);

  if (_commands.length === 0) {
    return result.data;
  }

  return executeCommands(_commands, result);
}

export default scraper;
