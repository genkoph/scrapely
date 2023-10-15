import { load } from "cheerio";
import superagent from "superagent";

import type { Context } from "@/types";

async function init(source: string): Promise<Context> {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

  if (urlRegex.test(source)) {
    const { text } = await superagent.get(source);
    return { $: load(text), data: null, scope: null };
  }

  return { $: load(source), data: null, scope: null };
}

export default init;
