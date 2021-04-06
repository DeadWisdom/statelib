import * as Y from "yjs";
import { uuidv4 as randomId } from "lib0/random.js";
import { IndexeddbPersistence } from "y-indexeddb";
import {
  Provider,
  PropertyMap,
  getPropertyMap,
  DocumentUpdateCallback,
  UnsubscribeCallback,
  Storable,
} from "../provider";

function setYMap(map: Y.Map<Storable>, newState: PropertyMap) {
  if (newState === undefined) return;
  let props = getPropertyMap(newState);

  props.forEach((v, k) => {
    map.set(k, v);
  });

  let remove = [];
  for (const key of map.keys()) {
    if (!props.has(key)) {
      remove.push(key);
    }
  }

  remove.forEach((k) => map.delete(k));
}

export type MapEventCallback = (arg0: any, arg1: Y.Transaction) => void;

export class YJSProvider implements Provider {
  name: string;
  private _yDoc: Y.Doc;
  private _yProviders: any[];
  private _subscriptions: Map<string, Map<DocumentUpdateCallback, MapEventCallback>>;

  constructor(name: string, yDoc?: Y.Doc, yProviders?: any[]) {
    this.name = name;
    this._yDoc = yDoc || new Y.Doc();
    if (yProviders !== undefined) {
      this._yProviders = yProviders;
    } else {
      this._yProviders = [new IndexeddbPersistence(this.name, this._yDoc)];
    }
    this._subscriptions = new Map();
  }

  // Internal
  private _getSubscriptions(key: string) {
    let subs = this._subscriptions.get(key);
    if (subs === undefined) {
      subs = new Map();
      this._subscriptions.set(key, subs);
    }
    return subs;
  }

  // Meta
  async whenReady() {
    for (let provider of this._yProviders) {
      if (!provider.synced) await provider.whenSynced;
    }
  }

  destroyAll() {
    this._yDoc.destroy();
  }

  // Documents
  async docSave(key: string | null, props: PropertyMap): Promise<string> {
    await this.whenReady();
    if (key === null) {
      key = randomId();
    }
    let map = this._yDoc.getMap(key as string);
    this._yDoc.transact((transaction: Y.Transaction) => {
      setYMap(map, props);
    });
    return key as string;
  }

  async docLoad(key: string): Promise<Map<string, Storable> | null> {
    await this.whenReady();
    let map = this._yDoc.getMap(key);
    if (map === undefined) null;
    return new Map(map.entries());
  }

  async docDelete(key: string): Promise<boolean> {
    // Doesn't delete the key, unfortunately.
    let map = this._yDoc.getMap(key);
    if (map === undefined) return false;
    this._yDoc.transact((transaction: Y.Transaction) => {
      setYMap(map, new Map());
    });
    return true;
  }

  docSubscribe(key: string, callback: DocumentUpdateCallback, warm: boolean = false): UnsubscribeCallback {
    if (warm) {
      this.whenReady().then(() => {
        let value: PropertyMap = new Map(this._yDoc.getMap(key).entries());
        callback({ key: key, value: value, changed: undefined, added: [], removed: [] });
      });
    }

    let map = this._yDoc.getMap(key);
    let subs = this._getSubscriptions(key);
    if (subs.has(callback))
      return () => {
        this.docUnsubscribe(key, callback);
      };

    let callbackWrapper = (event: any, transaction: Y.Transaction) => {
      // Getting the info we want is complicated...
      let changed = new Map();
      let removed: string[] = [];
      let added: string[] = [];
      let value: PropertyMap = new Map(event.target.entries());
      event.changes.keys.forEach((change: any, key: string) => {
        if (change.action == "add") {
          added.push(key);
          changed.set(key, undefined);
        } else if (change.action == "delete") {
          removed.push(key);
          changed.set(key, change.oldValue);
        } else {
          changed.set(key, change.oldValue);
        }
      });
      return callback({ key, value, changed, added, removed });
    };
    subs.set(callback, callbackWrapper);
    map.observe(callbackWrapper);
    return () => {
      this.docUnsubscribe(key, callback);
    };
  }

  docUnsubscribe(key: string, callback: DocumentUpdateCallback): void {
    let sub = this._subscriptions.get(key);
    if (sub === undefined) return;
    let wrapper = sub.get(callback);
    if (wrapper === undefined) return;

    this._yDoc.get(key).unobserve(wrapper);
    sub.delete(callback);
  }

  /*
  // TextState
  textLoad(TextState: TextState): Promise<TextState>;
  textUnload(TextState: TextState): Promise<TextState>;
  textUpdate(delta: Delta): Promise<Delta>;
  textSubscribe(callback: DeltaCallback): UnsubscribeCallback;
  textUnsubscribe(callback: DeltaCallback): void;
  getText(key: string, content?: any): TextState;

  // Collection
  collectionLoad(collection: Collection): Promise<Collection>;
  collectionQuery(collection: Collection, query: any): Promise<SubCollection>;
  collectionCreateDocument(collection: Collection, properties: any): Promise<[DocumentState, Collection]>;
  collectionAddDocument(collection: Collection, DocumentState: DocumentState): Promise<[DocumentState, Collection]>;
  collectionRemoveDocument(collection: Collection, DocumentState: DocumentState): Promise<[DocumentState, Collection]>;
  collectionGetDocument(collection: Collection, identifier: any): Promise<[DocumentState, Collection]>;
  collectionSubscribe(callback: CollectionUpdateCallback): UnsubscribeCallback;
  collectionUnsubscribe(callback: CollectionUpdateCallback): void;
  getCollection(key: string): Collection;
  */
}
