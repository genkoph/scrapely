import { parse } from "node-html-parser";

import type { Context } from "@/types";

const urlPattern =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

async function init(source: string): Promise<Context> {
  if (urlPattern.test(source)) {
    const response = await fetch(source);
    const text = await response.text();

    return { root: parse(text), scope: null, url: source };
  }

  return { root: parse(source), scope: null, url: null };
}

export default init;
