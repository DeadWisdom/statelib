import { expect } from "@esm-bundle/chai";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

import { YJSProvider } from "../src/providers/yjs-provider";
import { StateDoc } from "../src/doc";

it("properties should work", async () => {
  const provider = new YJSProvider("testing");

  class Deck extends StateDoc {
    static properties = {
      id: { type: String },
    };

    constructor(provider) {
      super(provider);
      this.id = "yo";
    }
  }

  let a = new Deck(provider);
  let b = new Deck(provider);
});
