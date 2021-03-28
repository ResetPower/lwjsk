import { LwjskFragment } from ".";
import { LwjskError } from "./error";
import { LwjskI18n } from "./i18n";
import { LwjskRouter } from "./router";
import { LwjskAppOptions } from "./utils";

export class LwjskApp {
  el: HTMLElement;
  frag: LwjskFragment;
  data: { [key: string]: any } = {};
  methods: { [key: string]: any } = {};
  i18n?: LwjskI18n;
  router?: LwjskRouter;
  constructor(options: LwjskAppOptions) {
    this.el = document.querySelector("[l-app]") as HTMLElement;
    if (this.el === null) {
      throw new LwjskError(
        "Lwjsk application not found. You can add attribute 'l-app' to the element."
      );
    }
    if (options.i18n !== undefined) {
      this.i18n = options.i18n;
    }
    if (options.router !== undefined) {
      this.router = options.router;
      this.router.app = this;
    }
    this.frag = new LwjskFragment({
      data: options.data,
      methods: options.methods,
      el: this.el,
      father: this,
    });
    this.data = this.frag.data;
    this.methods = this.frag.methods;
    this.router?.reload();
  }
  update(key: string) {
    this.frag.update(key);
  }
}
