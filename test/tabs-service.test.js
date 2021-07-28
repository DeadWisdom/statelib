import { expect } from "@esm-bundle/chai";
import { gatherEvents, assertLastEvent } from "../src/testing";
import { TabsService } from "../src/services/tabs-sevice";

export class FakeBroadcastChannel {
  constructor() {
    this.listeners = new Set();
    this.factory = () => this;
  }

  addEventListener(type, callback) {
    this.listeners.add(callback);
  }

  removeEventListener(type, callback) {
    this.listeners.delete(callback);
  }

  postMessage(data) {
    this.listeners.forEach((c) => {
      c({ type: "message", data: data });
    });
  }
}

it("can create services", async () => {
  let key = "testKey";
  let service = new TabsService(key);
  expect(service.constructor).to.equal(TabsService);
});

it("service patches create updates", async () => {
  let key = "testKey";
  let bc = new FakeBroadcastChannel();
  let service = new TabsService(key, () => bc);
  let events = gatherEvents(service);

  service.send({
    type: "document-update",
    key: key,
    value: { a: 1 },
    changes: { a: undefined },
  });

  assertLastEvent(events, {
    type: "document-update",
    key: key,
    value: { a: 1 },
    changes: { a: undefined },
  });

  service.send({
    type: "document-update",
    key: key,
    value: { a: 2, b: 1 },
    changes: { a: 1, b: undefined },
  });

  assertLastEvent(events, {
    type: "document-update",
    key: key,
    value: { a: 2, b: 1 },
    changes: { a: 1, b: undefined },
  });

  service.stop();
});
