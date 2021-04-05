import { LwjskApp, LwjskError, LwjskFragment } from ".";
import { LwjskRouterOptions, removePrefix, Route } from "./utils";

export class LwjskRouter {
  path: string = "/";
  el: HTMLElement;
  routes: Route[] = [];
  onreload: (route: Route) => void = () => {};
  app?: LwjskApp;
  constructor(options: LwjskRouterOptions) {
    let hash = removePrefix(location.hash, "#");
    this.path = hash.startsWith("/") ? hash : "/";
    this.el = document.querySelector("router-view") as HTMLElement;
    this.routes = options.routes;
    this.onreload = options.onreload ?? (() => {});
  }
  findRoute(path: string): Route | null {
    for (let i of this.routes) {
      if (i.path === path) return i;
    }
    return null;
  }
  reload() {
    let path = this.path;
    let route = this.findRoute(path);
    if (route === null) {
      throw new LwjskError("Lwjsk router cannot find path " + path + " on routes");
    }
    this.el.innerHTML = route.template;
    if (this.app !== undefined) {
      new LwjskFragment({
        el: this.el,
        data: route.data === undefined ? {} : route.data,
        methods: route.methods === undefined ? {} : route.methods,
        father: this.app,
        mounted: route.mounted,
      });
    } else {
      throw new LwjskError(
        "Lwjsk router cannot find application. Maybe you reloaded the router too early, try to delete code like 'router.reload()'"
      );
    }
    this.onreload.apply(this.app, [route]);
  }
  updateUrl(url: string) {
    location.hash = url;
    this.path = url;
  }
  push(url: string) {
    this.updateUrl(url);
    this.reload();
  }
  replace(url: string) {
    this.updateUrl(url);
    this.reload();
  }
}
