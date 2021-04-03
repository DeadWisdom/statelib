export type Storable = Object | null | string | number | boolean;
export type StorableObject = { [x: string]: Storable };
export type DocumentUpdateCallback = (update: DocumentUpdate) => void;
export type CollectionUpdateCallback = (update: CollectionUpdate) => void;
export type DeltaCallback = (delta: Delta) => void;
export type UnsubscribeCallback = () => void;
export type TextFormat = { [x: string]: Storable };
export type Delta = any;
export type PropertyMap = Map<string, Storable> | Object | undefined;

//prettier-ignore
export type DocumentIterCallback = (value: Storable, key: string, map: DocumentState) => void;

export function getPropertyMap(props: PropertyMap): Map<string, Storable> | undefined {
  if (props === undefined) return;
  if (props instanceof Map) {
    return props;
  } else if (props instanceof Object) {
    return new Map(Object.entries(props));
  }
  throw "Getting property map, but input is not a map or an object: " + props;
}

export interface StateManager {
  provider: Provider;
  key: any;
  loaded: boolean;

  load(): Promise<DocumentState | null>;
  unload(): void;
  toJSON(): string;
}

export class DocumentState implements StateManager {
  provider: Provider;
  key: any;
  loaded: boolean;
  schema: any;
  value: Map<string, Storable>;

  constructor(provider: Provider, key: any, props?: PropertyMap) {
    this.provider = provider;
    this.key = key;
    this.value = new Map();
    if (props !== undefined) {
      getPropertyMap(props).forEach((value, key) => this.value.set(key, value));
    }
  }

  get [Symbol.toStringTag](): string {
    return "DocumentState";
  }

  get size(): number {
    return this.value.size;
  }

  subscribe(callback: DocumentUpdateCallback): UnsubscribeCallback {
    return this.provider.documentSubscribe(this, callback);
  }
  unsubscribe(callback: DocumentUpdateCallback): void {
    this.provider.documentUnsubscribe(this, callback);
  }

  get(key: string): Storable | undefined {
    return this.value.get(key);
  }
  set(key: string, value: Storable): void {
    this.value.set(key, value);
  }
  has(key: string): boolean {
    return this.value.has(key);
  }
  delete(key: string): boolean {
    return this.value.delete(key);
  }
  clear(): void {
    return this.value.clear();
  }

  forEach(callback: DocumentIterCallback): void {
    this.value.forEach((value: Storable, key: string, map: Map<string, Storable>) => callback(value, key, this));
  }
  entries(): IterableIterator<[string, Storable]> {
    return this.value.entries();
  }
  keys(): IterableIterator<string> {
    return this.value.keys();
  }
  values(): IterableIterator<Storable> {
    return this.value.values();
  }

  [Symbol.iterator](): IterableIterator<[string, Storable]> {
    return this.value[Symbol.iterator]();
  }

  update(...objects: Object[]): void {
    Object.assign(this.value, ...objects);
  }

  save(): Promise<DocumentState> {
    return this.provider.documentSave(this, this.value);
  }

  deleteSelf(): Promise<DocumentState> {
    return this.provider.documentDelete(this);
  }

  async load(): Promise<DocumentState | null> {
    await this.provider.documentLoad(this);
    this.loaded = true;
    return this;
  }

  unload(): void {
    this.provider.documentUnload(this);
    this.loaded = false;
  }

  getValue(): Object {
    const obj: StorableObject = {};
    this.value.forEach((value: Storable, key: string) => {
      obj[key] = value;
    });
    return obj;
  }

  toJSON(): string {
    return JSON.stringify(this.getValue());
  }
}

export interface DocumentUpdate {
  document: DocumentState;
  added: string[];
  removed: string[];
  updated: PropertyMap;
}

export interface Collection {
  provider: any;
  key: any;

  subscribe(callback: CollectionUpdateCallback): UnsubscribeCallback;
  unsubscribe(callback: CollectionUpdateCallback): void;

  create(properties: any): Promise<DocumentState>;
  query(config: any): Promise<any>;
  add(DocumentState: DocumentState): void;
  remove(DocumentState: DocumentState): void;
  get(identifier: any): Promise<any>;
}

export interface SubCollection extends Collection {
  parent: Collection;
  query: any;
}

export interface TextState extends StateManager {
  length: number;

  insert(index: number, ...content: Storable[]): void;
  format(index: number, length: number, format: TextFormat): void;
  delete(index: number, length: number): void;
  toDelta(): Delta;
  applyDelta(delta: Delta): void;

  subscribe(callback: DeltaCallback): UnsubscribeCallback;
  unsubscribe(callback: DeltaCallback): void;
}

export interface CollectionUpdate {
  added: DocumentState[];
  removed: DocumentState[];
  updated: DocumentState[];
}

//prettier-ignore
export interface Provider {
  // Documents
  documentLoad(doc: DocumentState): Promise<DocumentState | null>;
  documentUnload(doc: DocumentState): void;
  documentCreate(props: PropertyMap, key?: string): Promise<DocumentState>;
  documentSave(doc: DocumentState, props: PropertyMap): Promise<DocumentState>;
  documentDelete(doc: DocumentState): Promise<DocumentState>;
  documentSubscribe(doc: DocumentState, callback: DocumentUpdateCallback): UnsubscribeCallback;
  documentUnsubscribe(doc: DocumentState, callback: DocumentUpdateCallback): void;

  getDoc(key: string, properties?: PropertyMap): DocumentState;

  // XXX: Figured out that we don't need to pass the whole document state into
  // the provider.

  // ???: How do we pass things like the 'properties' key to the provider? 
  // Do we?

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
