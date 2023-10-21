import type { HTMLElement } from "node-html-parser";

export type Selector = string | object;

export interface Context {
  root: HTMLElement;
  scope: (HTMLElement | HTMLElement[]) | null;
}
