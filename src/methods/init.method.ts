import { parse } from "node-html-parser";

import type { Context } from "@/types";

const urlPattern =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

async function init(source: string): Promise<Context> {
  if (urlPattern.test(source)) {
    const response = await fetch(source);
    const text = await response.text();

    const { origin } = new URL(source);

    return { root: parse(text), origin, scope: null };
  }

  return { root: parse(source), origin: null, scope: null };
}

export default init;
