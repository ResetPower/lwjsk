import { LwjskApp } from ".";
import { LwjskI18n } from "./i18n";
import { LwjskRouter } from "./router";

export function isEmpty(e: any): boolean {
  return e === undefined || e === null || typeof e === "undefined";
}

export function getObjectData(obj: any, path: string[]): string {
  if (obj === undefined) return "";
  let next = obj[path[0]];
  if (path.length === 1) return next;
  return getObjectData(next, path.slice(1));
}

export function readAttr(e: any, key: string) {
  let ret = e[key];
  if (isEmpty(ret)) return e.getAttribute(key);
  else return ret;
}

export function writeAttr(e: any, key: string, value: string) {
  let ret = e[key];
  if (isEmpty(ret)) e.setAttribute(key, value);
  else e[key] = value;
}

export function removePrefix(str: string, pre: string): string {
  if (str.startsWith(pre)) return str.substr(pre.length, str.length);
  return str;
}

export function removeSuffix(str: string, suf: string): string {
  if (str.endsWith(suf)) return str.substr(0, str.length - suf.length);
  return str;
}

export interface Binding {
  e: HTMLElement;
  attr: string;
}

export interface Expression {
  value: any;
  shouldMap: boolean;
  key: string;
}

export interface LwjskFragmentOptions {
  data: { [key: string]: any };
  methods?: { [key: string]: Function };
  el: HTMLElement;
  father: LwjskApp;
}

export interface LwjskAppOptions {
  data: { [key: string]: any };
  methods?: { [key: string]: Function };
  i18n?: LwjskI18n;
  router?: LwjskRouter;
}

export interface LwjskI18nOptions {
  language: string;
  messages: { [key: string]: any };
}

export interface Route {
  path: string;
  template: string;
  data?: { [key: string]: any };
  methods?: { [key: string]: Function };
}

export interface LwjskRouterOptions {
  mode?: string; // unusable now
  routes: Route[];
}
