import type { HTMLElement } from "node-html-parser";

export type Selector = string | object;

export interface Context {
  url: string | null;
  root: HTMLElement;
  scope: (HTMLElement | HTMLElement[]) | null;
}
