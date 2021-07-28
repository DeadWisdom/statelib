import { expect } from "@esm-bundle/chai";
import { DocumentService, localDocumentService } from "../src/services/yjs-service";
import { gatherEvents, assertLastEvent } from "../src/testing";

it("can create services", async () => {
  let key = "testKey";
  let doc = await localDocumentService("test0", key);
  expect(doc.constructor).to.equal(DocumentService);
});

it("service patches create updates", async () => {
  let key = "testKey";
  let doc = await localDocumentService("test1", key);
  let events = gatherEvents(doc);

  doc.send({
    type: "document-patch",
    key: key,
    value: { a: 1 },
  });

  assertLastEvent(events, {
    type: "document-update",
    key: key,
    value: { a: 1 },
    changes: { a: undefined },
  });

  doc.send({
    type: "document-patch",
    key: key,
    value: { a: 2, b: 1 },
  });

  assertLastEvent(events, {
    type: "document-update",
    key: key,
    value: { a: 2, b: 1 },
    changes: { a: 1, b: undefined },
  });

  doc.stop();
});

it("same doc / key all get updates", async () => {
  let key = "testKey";
  let doc = await localDocumentService("test2", key);
  let same = new DocumentService({ doc: doc._yDoc, key });
  let events = gatherEvents(same);

  doc.send({
    type: "document-patch",
    key: key,
    value: { a: 1 },
  });

  assertLastEvent(events, {
    type: "document-update",
    key: key,
    value: { a: 1 },
    changes: { a: undefined },
  });
});
