import { LwjskApp, LwjskError } from ".";
import {
  Binding,
  Expression,
  getObjectData,
  isEmpty,
  LwjskFragmentOptions,
  readAttr,
  writeAttr,
} from "./utils";

export class LwjskFragment {
  el: HTMLElement;
  mappings: { [key: string]: HTMLElement[] } = {};
  bindings: { [key: string]: Binding } = {};
  data: { [key: string]: any } = {};
  methods: { [key: string]: Function } = {};
  father: LwjskApp;
  constructor(options: LwjskFragmentOptions) {
    this.el = options.el;
    this.father = options.father;
    let frag = this;
    this.data = new Proxy(options.data ?? {}, {
      get(target, key) {
        if (frag.bindings.hasOwnProperty(key)) {
          let binding = frag.bindings[key as string];
          return readAttr(binding.e, binding.attr);
        }
        return Reflect.get(target, key);
      },
      set(target, key, value) {
        if (frag.bindings.hasOwnProperty(key)) {
          let binding = frag.bindings[key as string];
          writeAttr(binding.e, binding.attr, value);
        }
        frag.update(key as string);
        return Reflect.set(target, key, value);
      },
    });
    this.methods = options.methods ?? {};
    this.render();
  }

  addMapping(key: string, el: HTMLElement) {
    let m = this.mappings[key];
    m === undefined ? (m = [el]) : m.indexOf(el) === -1 ? m.push(el) : undefined;
  }

  addBinding(key: string, binding: Binding) {
    this.bindings[key] = binding;
  }

  expression(exp: string, temp: { [key: string]: any }): Expression {
    if (exp.startsWith("!")) {
      // reverse boolean
      let e = this.expression(exp.substr(1), temp);
      e.value = !(e.value as boolean);
      return e;
    } else if (exp.startsWith("*")) {
      // parse null
      let e = this.expression(exp.substr(1), temp);
      e.value = isEmpty(e.value);
      return e;
    } else if (exp.startsWith("$")) {
      // i18n string
      let split = exp.split(" ");
      let name = split[0].substr(1);
      let buff = [];
      for (let i of split.slice(1)) {
        buff.push(this.expression(i, temp).value);
      }
      return { value: this.father.i18n?.t(name, buff), shouldMap: false, key: "" };
    } else if (exp.indexOf(".") !== -1) {
      // object item
      let split = exp.split(".");
      let e = this.expression(split[0], temp);
      return { value: getObjectData(e.value, split.slice(1)), shouldMap: e.shouldMap, key: e.key };
    }
    let ret = this.data[exp];
    if (ret === undefined) {
      let tem = temp[exp];
      return { value: temp[exp], shouldMap: tem === undefined, key: exp };
    }
    return { value: ret, shouldMap: true, key: exp };
  }

  renderElement(e: HTMLElement, mapping: boolean = true, temp: { [key: string]: any } = {}) {
    let lt = e.getAttribute("l-text") || e.getAttribute("lt");
    let lo = e.getAttribute("l-onclick");
    let li = e.getAttribute("l-if");
    let lf = e.getAttribute("l-for");
    let lb = e.getAttribute("l-bind");
    if (lo !== null) {
      // l-onclick (no data mapping)
      e.onclick = () => this.methods[lo!].apply(this, []);
    } else if (lf !== null) {
      // l-for (with data mapping)
      let k = lf!;
      let split = k.split(" in ");
      let name = split[0];
      let list = split[1];
      let listObj = this.data[list];
      let firstEl = e.firstElementChild;
      if (firstEl === null) {
        throw new LwjskError(
          "Lwjsk application rendering error. Unable to resolve an empty 'l-for' block."
        );
      }
      let next = e.nextElementSibling;
      if (next?.hasAttribute("l-for-result")) next.remove();
      let fragment = document.createDocumentFragment();
      let wrapper = document.createElement("div");
      wrapper.toggleAttribute("l-for-result");
      fragment.appendChild(wrapper);
      for (let i in listObj) {
        let n = e.cloneNode(true) as HTMLElement;
        n.removeAttribute("l-for");
        n.hidden = false;
        let dict: { [key: string]: any } = {};
        dict[name] = listObj[i];
        this.render(n, dict);
        wrapper.appendChild(n);
      }
      e.hidden = true;
      let parent = e.parentNode;
      if (parent === null) {
        throw new LwjskError(
          "Lwjsk application rendering error. Unable to find a parent node for 'l-for' block"
        );
      }
      parent.insertBefore(fragment, e.nextElementSibling);
      // add to mapping
      if (list !== null && mapping === true) {
        this.addMapping(list, e);
      }
    } else if (lb !== null) {
      // l-bind
      let split = lb.split(" on ");
      let attr = split[0];
      let name = split[1];
      let nameData = this.data[name];
      if (!isEmpty(nameData)) {
        writeAttr(e, attr, nameData);
      }
      this.addBinding(name, {
        e: e,
        attr: attr,
      });
    } else {
      // l-text & l-if (with data mapping)
      let k: string = "";
      let shouldMap = false;
      if (lt !== null) {
        let exp = this.expression(lt, temp);
        shouldMap = exp.shouldMap;
        e.innerText = exp.value;
        k = exp.key;
      }
      if (li !== null) {
        let exp = this.expression(li, temp);
        shouldMap = exp.shouldMap;
        let rs = exp.value as boolean;
        e.hidden = !rs;
        let next = e.nextElementSibling as HTMLElement; // resolve l-else
        next.hidden = next.getAttribute("l-else") !== null && rs;
        k = exp.key;
      }
      // add to mapping
      if (k !== null && mapping === true && shouldMap === true) {
        this.addMapping(k, e);
      }
    }
  }

  render(element = this.el, temp?: { [key: string]: any }) {
    for (let i of element.querySelectorAll(
      "[l-text], [lt], [l-onclick], [l-if], [l-for], [l-bind]"
    )) {
      this.renderElement(i as HTMLElement, temp === undefined, temp);
    }
  }

  update(key: string) {
    for (let i of this.mappings[key]) {
      this.renderElement(i as HTMLElement);
    }
  }
}
