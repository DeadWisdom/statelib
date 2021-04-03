import { expect } from "@esm-bundle/chai";
import { YJSProvider } from "../src/providers/yjs-provider";

it("basic map functions", () => {
  const provider = new YJSProvider("testing");
  let foo = provider.getDoc("foo", { name: "foo" });

  expect(foo.get("name")).to.equal("foo");

  expect(foo.key).to.equal(provider._getInternalDoc(foo.key).guid);
});
