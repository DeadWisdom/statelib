import { SubscriptionManager } from "../subscription";
import { StateService, StateEvent, PropertyMap, Storable, getPropertyMap } from "../service";

import { DocumentEvent, DocumentEventCallback } from "./yjs-service";

export type MessageCallback = (message: any) => void;

export class SchemaService implements StateService {
  key: string;
  dispatch: MessageCallback; // Send copies of all queries / commands / replicate updates
  _yMap: Y.Map<Storable>;
  _yDoc: Y.Doc;
  _subs: SubscriptionManager<DocumentEventCallback>;

  constructor({ doc, key, dispatch }: DocumentServiceOpts) {
    this.key = key;
    this.dispatch = dispatch || (() => {});
    this._yDoc = doc;
    this._yMap = doc.getMap(key);
    this._subs = this._buildSubs();

    this.send = this.send.bind(this);
  }

  _buildSubs() {
    return new SubscriptionManager({
      start: (next: Function) => this._yMap.observe(next as YMapEventHandler),
      end: (next: Function) => this._yMap.unobserve(next as YMapEventHandler),
      adapter: this._onUpdate.bind(this),
    });
  }

  _onUpdate(send: DocumentEventCallback, event: Y.YMapEvent<Storable>, transaction: Y.Transaction) {
    let entries = (event.target as any).entries();
    let value = Object.fromEntries(entries);
    let changes: Map<string, Storable | undefined> = new Map(entries);
    event.changes.keys.forEach((change: any, key: string) => {
      if (change.action == "add") {
        changes.set(key, undefined);
      } else {
        changes.set(key, change.oldValue);
      }
    });

    return send({ type: "document-update", key: this.key, value, changes });
  }

  start() {}

  stop() {
    this._subs.dispose();
  }

  subscribe(callback: DocumentEventCallback) {
    return this._subs.subscribe(callback);
  }

  send(event: DocumentEvent): void {
    this.dispatch(event);
    if (event.key !== this.key) return;
    if (event.type == "document-patch") {
      this._yDoc.transact(() => {
        getPropertyMap(event.value).forEach((v, k) => {
          this._yMap.set(k, v);
        });
      });
    }
  }
}

/**
 * Creates a DocumentService for a Y.Doc using an IndexeddbPersistence provider
 *
 * @param storageName Name of the local database to store this document
 * @param key The name of the Y.Map on the Y.Doc, like a table name
 * @param opts Options to give to the Y.Doc instance
 */
export async function localDocumentService(storageName: string, key: string, opts: any) {
  opts = opts || {};
  opts.guid = opts.guid || storageName;
  let doc = new Y.Doc(opts);
  let provider = new IndexeddbPersistence(storageName, doc);
  await provider.whenSynced;
  return new DocumentService({ doc, key });
}

//export const yDocCache:Map<string, Y.Doc> = new Map();
