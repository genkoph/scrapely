import superagent from "superagent";
import { load } from "cheerio";

import type { Context } from "../types";

async function init(url: string): Promise<Context> {
  const { text } = await superagent.get(url);
  return { $: load(text), data: null, scope: null };
}

export default init;
