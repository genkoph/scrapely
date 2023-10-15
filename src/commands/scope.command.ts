import type { Context } from "../types";

async function scope(context: Context, selector: string): Promise<Context> {
  const { $ } = context;
  return { ...context, scope: $(selector) };
}

export default scope;
