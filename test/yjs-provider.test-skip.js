import { expect } from "@esm-bundle/chai";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

import { YJSProvider } from "../src/providers/yjs-provider";
import { getPropertyMap } from "../src/provider";

/// SKIPPED ///
xit("test out how yjs providers work", async () => {
  let doc = new Y.Doc();
  let provider = new IndexeddbPersistence("doc-a", doc);
  await provider.whenSynced;

  let map = doc.getMap("map");
  map.set("foo", 1);
  expect(map.get("foo")).to.equal(1);

  // Sync a new document with the same name.
  doc = new Y.Doc();
  provider = new IndexeddbPersistence("doc-a", doc);
  await provider.whenSynced;

  map = doc.getMap("map");
  expect(map.get("foo")).to.equal(1);

  // Sync a new document with a different name.
  doc = new Y.Doc();
  provider = new IndexeddbPersistence("something-else", doc);
  await provider.whenSynced;

  map = doc.getMap("map");
  expect(map.get("foo")).to.not.equal(1);
});

it("should support load and save", async () => {
  const provider = new YJSProvider("testing");
  await provider.docSave("key", { name: "foo" });
  let value = await provider.docLoad("key");
  expect(value.get("name")).to.equal("foo");

  let key = await provider.docSave(null, { name: "bar" });
  value = await provider.docLoad(key);
  expect(value.get("name")).to.equal("bar");
});

it("should sync between providers", async () => {
  const a = new YJSProvider("testing");
  const b = new YJSProvider("testing");

  await a.docSave("key", { name: "foo" });
  let value = await b.docLoad("key");
  expect(value.get("name")).to.equal("foo");
});

it("should update changes", async () => {
  const provider = new YJSProvider("testing");

  await provider.docSave("key", { name: "foo", gonnaGetRemoved: true });

  let updates = [];
  let callback = (change) => {
    updates.push(change);
  };
  provider.docSubscribe("key", callback);
  await provider.docSave("key", { name: "bar", newField: 3 });

  expect(updates.length).to.equal(1);

  let update = updates[0];
  expect(update.removed).to.eql(["gonnaGetRemoved"]);
  expect(update.added).to.eql(["newField"]);
  expect(update.value).to.eql(getPropertyMap({ name: "bar", newField: 3 }));
  expect(update.changed).to.eql(getPropertyMap({ name: "foo", newField: undefined, gonnaGetRemoved: true }));
});
