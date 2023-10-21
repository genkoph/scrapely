import { Context } from "@/types";

function scope(context: Context, selector: string | string[]): Context {
  const scope = Array.isArray(selector)
    ? context.root.querySelectorAll(selector[0]!)
    : context.root.querySelector(selector);

  return { ...context, scope };
}

export default scope;
