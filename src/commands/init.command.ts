import { load } from "cheerio";
import superagent from "superagent";

import type { Context } from "../types";

async function init(url: string): Promise<Context> {
  const { text } = await superagent.get(url);
  return { $: load(text), data: null, scope: null };
}

export default init;
