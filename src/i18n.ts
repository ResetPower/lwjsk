import { getObjectData, LwjskI18nOptions } from "./utils";

export class LwjskI18n {
  language: string = "";
  messages: { [key: string]: any } = {};
  constructor(options: LwjskI18nOptions) {
    this.language = options.language;
    this.messages = options.messages;
  }
  t(key: string, args: string[] = []): string {
    let ret = getObjectData(this.messages[this.language], key.split("."));
    for (let i in args) {
      ret = ret.replace("{" + i + "}", args[i]);
    }
    return ret;
  }
  changeLanguage(language: string) {
    this.language = language;
  }
}