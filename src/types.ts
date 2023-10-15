import type { CheerioAPI, Cheerio, AnyNode } from "cheerio";

export type Selector = string | object | (string | object)[];

export interface Context {
  $: CheerioAPI;
  data: Selector | null;
  scope: Cheerio<AnyNode> | null;
}
