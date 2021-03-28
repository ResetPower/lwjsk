export class LwjskError extends Error {
  constructor(msg: string) {
    super(msg);
    this.message = msg;
    this.name = "LwjskError";
  }
}