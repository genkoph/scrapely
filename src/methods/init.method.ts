import { parse } from "node-html-parser";

import type { Context } from "@/types";

async function init(source: string): Promise<Context> {
  const urlPattern =
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

  if (urlPattern.test(source)) {
    const response = await fetch(source);
    const text = await response.text();

    return { root: parse(text), scope: null };
  }

  return { root: parse(source), scope: null };
}

export default init;
