import { load } from "cheerio";
import superagent from "superagent";

import type { Context } from "@/types";


function isUrl(str: string) {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return urlRegex.test(str);
}

async function init(source: string): Promise<Context> {
  if (isUrl(source)) {
    const { text } = await superagent.get(source);
    return { $: load(text), data: null, scope: null };
  }

  return { $: load(source), data: null, scope: null };
}

export default init;
