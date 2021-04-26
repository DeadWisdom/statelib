import { expect } from "@esm-bundle/chai";
import { ReactiveElement } from "@lit/reactive-element";
import { fixture, defineCE } from "@open-wc/testing";
import { DocController } from "../src/statecontroller";

it("custom element", async () => {
  class MyElement extends ReactiveElement {
    static properties = {
      docId: { type: String },
    };

    constructor() {
      super();
      this.doc = new DocController(this, null, "docId");
    }

    update(changedProperties) {
      super.update(changedProperties);
    }
  }

  const tag = defineCE(MyElement);
  const el = await fixture(`<${tag} name="attr"></${tag}>`);

  expect(el.getAttribute("name")).to.equal("attr");
  expect(el.doc.get("key")).to.eql(el);
});
