import type { Context, Selector } from "@/types";
import type { HTMLElement } from "node-html-parser";

async function data(context: Context, selectorRaw: Selector | Selector[]) {
  const { root, scope } = context;

  const isScopeArray = Array.isArray(scope);
  const isSelectorArray = Array.isArray(selectorRaw);

  const selector: Selector = isSelectorArray ? selectorRaw[0] : selectorRaw;

  function handleAttribute(attr: string, node: HTMLElement | null) {
    const value = node?.getAttribute(attr);

    if (!value) {
      return null;
    }

    if (attr === "href") {
      const isAbsoluteRegex = new RegExp('^(?:[a-z+]+:)?//', 'i');

      if (isAbsoluteRegex.test(value)) {
        return value;
      }

      return `${context.origin}${value}`;
    }

    return value;
  }

  if (typeof selector === "string") {
    const { attr, selector: _selector } = parseString(selector);

    function parseSelector(sourceNode: HTMLElement) {
      function parseNode(node: HTMLElement | null) {
        return attr ? handleAttribute(attr, node) : node?.text.trim();
      }

      return isSelectorArray
        ? sourceNode.querySelectorAll(_selector).map(parseNode)
        : parseNode(sourceNode.querySelector(_selector));
    }

    if (!scope) {
      return parseSelector(root);
    }

    if (isScopeArray) {
      return scope.map((node) => parseSelector(node));
    }

    return parseSelector(scope);
  }

  if (typeof selector === "object") {
    if (isSelectorArray) {
      return null; // TODO: throw error
    }

    function parseSelector(sourceNode: HTMLElement) {
      return Object.fromEntries(
        Object.entries(selector).map(([k, s]) => {
          const { attr, selector } = parseString(s);
          const node = sourceNode.querySelector(selector);
          return [k, attr ? handleAttribute(attr, node) : node?.text.trim()];
        })
      );
    }

    if (!scope) {
      return parseSelector(root);
    }

    if (isScopeArray) {
      return scope.map((element) => parseSelector(element));
    }

    return parseSelector(scope);
  }

  return null; // TODO: throw error
}

function parseString(selector: string) {
  return {
    attr: selector.match(/(?<=@)[a-z]+/)?.[0] || null,
    selector: selector.replace(/@[a-z]+/, ""),
  };
}

export default data;
