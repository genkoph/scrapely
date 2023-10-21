import init from "@/methods/init.method";
import data from "@/methods/data.method";
import scope from "@/methods/scope.method";

import type { Selector } from "@/types";

function Scrapely() {
  return scrapely;
}

function scrapely(source: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methodQueue: [(...args: any[]) => any, unknown][] = [[init, source]]; // initial method

  return {
    scope(selector: string | string[]) {
      methodQueue.push([scope, selector]);
      return { data: this.data };
    },
    async data(selector: Selector | Selector[]) {
      methodQueue.push([data, selector]);
      return iterateMethods(methodQueue, methodQueue[0][1]);
    },
  };
}

async function iterateMethods(
  // eslint-disable-next-line
  methods: [Function, unknown][],
  context: unknown
): Promise<Selector | null> {
  const _methods = [...methods];
  const [current, args] = _methods.shift()!;

  const result = await current(context, args);

  if (_methods.length === 0) {
    return result;
  }

  return iterateMethods(_methods, result);
}

export default Scrapely;
