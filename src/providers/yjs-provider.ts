import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import {
  Provider,
  DocumentState,
  PropertyMap,
  getPropertyMap,
  DocumentUpdateCallback,
  UnsubscribeCallback,
} from "../state";
import { writeDocumentStateVector } from "yjs/dist/src/internals";

export class YJSProvider implements Provider {
  name: string;
  _internalDocs: Map<string, Y.Doc>;
  _subscriptions: Map<string, DocumentUpdateCallback[]>;

  constructor(name: string) {
    this.name = name;
    this._internalDocs = new Map();
    this._subscriptions = new Map();
  }

  _getInternalDoc(guid?: string): Y.Doc {
    let yDoc = this._internalDocs.get(guid);
    if (yDoc === undefined) {
      yDoc = new Y.Doc({ guid });
      this._internalDocs.set(yDoc.guid, yDoc);
    }
    return yDoc;
  }

  // Documents
  async documentLoad(state: DocumentState): Promise<DocumentState> {
    if (state.loaded) return state;
    let yDoc = this._getInternalDoc(state.key);
    state.key = yDoc.guid;
    let p = new IndexeddbPersistence(this.name, yDoc);
    await p.whenSynced;
    state.loaded = true;
    return state;
  }

  documentUnload(state: DocumentState): void {
    let yDoc = this._internalDocs.get(state.key);
    if (yDoc !== undefined) yDoc.destroy();
    state.loaded = false;
  }

  async documentCreate(props: PropertyMap, key?: string): Promise<DocumentState> {
    let yDoc = this._getInternalDoc(key);
    return new DocumentState(this, yDoc.guid, props);
  }

  async documentSave(state: DocumentState, props: PropertyMap): Promise<DocumentState> {
    await this.documentLoad(state);
    let yDoc = this._getInternalDoc(state.key);
    let yMap = yDoc.getMap("properties");
    let propertyMap = getPropertyMap(props);
    propertyMap.forEach((v, k) => {
      yMap.set(k, v);
    });

    let remove = [];
    for (const key of yMap) {
      if (!propertyMap.has(key)) {
        remove.push(key);
      }
    }
    remove.forEach((k) => yMap.delete(k));
  }

  async documentDelete(doc: DocumentState): Promise<DocumentState> {
    let provider = new IndexeddbPersistence(doc.key, this._getInternalDoc(doc.key));
    provider.clearData();
    this.documentUnload(doc);
    return doc;
  }

  documentSubscribe(doc: DocumentState, callback: DocumentUpdateCallback): UnsubscribeCallback {
    this.documentLoad(doc).then(() => {
      callback({ document: doc, updated: doc.value, added: [], removed: [] });
    });
    let sub = this._subscriptions.get(doc.key) || [];
    this._subscriptions.set(doc.key, sub.filter((v) => v !== callback).concat([callback]));
    return () => {
      this.documentUnsubscribe(doc, callback);
    };
  }

  documentUnsubscribe(doc: DocumentState, callback: DocumentUpdateCallback): void {
    let sub = this._subscriptions.get(doc.key);
    if (sub === undefined) return;
    this._subscriptions.set(
      doc.key,
      sub.filter((v) => v !== callback)
    );
  }

  getDoc(key: string, props?: PropertyMap): DocumentState {
    let yDoc = this._getInternalDoc(key);
    return new DocumentState(this, key, props);
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
