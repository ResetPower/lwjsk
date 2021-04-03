import { isEmpty, getObjectData } from "../src/utils";

test("isEmpty", () => {
  expect(isEmpty(undefined)).toBe(true);
  expect(isEmpty(null)).toBe(true);
  expect(isEmpty("undefined")).toBe(false);
  expect(isEmpty("")).toBe(false);
});

test("getObjectData", () => {
  expect(
    getObjectData({ i: { j: { k: { l: { m: { n: "o" } } } } } }, ["i", "j", "k", "l", "m", "n"])
  ).toBe("o");
});
