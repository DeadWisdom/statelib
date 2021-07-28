import { FakeBroadcastChannel } from "./tabs-service.test";
import { DocumentService, localDocumentService } from "../src/services/yjs-service";
import { TabsService } from "../src/services/tabs-sevice";
import { gatherEvents, assertLastEvent } from "../src/testing";

it("service patches create updates across tabs", async () => {
  let key = "testKey";
  let bc = new FakeBroadcastChannel();

  let tabsA = new TabsService(key, () => bc);
  let tabsB = new TabsService(key, () => bc);
  let docA = await localDocumentService("test1", key);
  let docB = await localDocumentService("test1", key);
  let eventsTab = gatherEvents(tabsB);
  let eventsDoc = gatherEvents(docB);

  // Doc A updates tabsA / vice versa
  docA.subscribe(tabsA.send);
  tabsA.subscribe(docA.send);

  // Doc B updates tabsB / vice versa
  docB.subscribe(tabsA.send);
  tabsB.subscribe(docB.send);

  // Tabs A
  tabsA.send({
    type: "document-patch",
    key: key,
    value: { a: 1 },
  });

  assertLastEvent(eventsTab, {
    type: "document-update",
    key: key,
    value: { a: 1 },
    changes: { a: undefined },
  });

  assertLastEvent(eventsDoc, {
    type: "document-update",
    key: key,
    value: { a: 1 },
    changes: { a: undefined },
  });
});
