import type { CheerioAPI, Cheerio, AnyNode } from "cheerio";

export type Selector = string | Object | (string | Object)[];

export interface Context {
  $: CheerioAPI;
  data: Selector | null;
  scope: Cheerio<AnyNode> | null;
}
