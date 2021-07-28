import { PropertyMap, Storable, getPropertyMap, DocProvider, DocumentUpdate, UnsubscribeCallback } from "./provider";
import { EventStream } from "./stream";

class Resource extends EventStream {
  cache: any;
  error: any = undefined;
  loading: boolean = false;
  ready: boolean = false;

  listening: boolean = false;
  _subscriptionUp?: UnsubscribeCallback;

  whenReady: Promise<Resource>;
  _readyResolve?: (self: Resource) => void;

  constructor() {
    super();
    this.whenReady = new Promise((resolve) => {
      this._readyResolve = resolve;
    });
  }
}

export interface Collection extends Resource, DocProvider {
  config: any;
  cache: Map<string, Doc>;
}

class Doc extends Resource {
  collection: Collection; // Our collection / authority
  key: any; // The general key for the doc, might include type
  cache: Map<string, Storable>; // Where the data is stored

  constructor(collection: Collection, key: string, cache?: Map<string, Storable>) {
    super();
    this.collection = collection;
    this.key = key;
    this.cache = cache || new Map();
  }

  get(key: string): Storable | undefined {
    return this.cache.get(key);
  }

  set(key: string, val: Storable) {
    this.cache.set(key, val);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  update(props: PropertyMap): void {
    getPropertyMap(props).forEach((value: Storable, key: string) => {
      this.set(key, value);
    });
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  async save(): Promise<Doc> {
    this.key = await this.collection.docSave(this.key, this.cache);
    return this;
  }

  async load(): Promise<Doc> {
    let data = await this.collection.docLoad(this.key);
    if (data === null) {
      this.cache.clear();
    } else {
      this.cache = data;
    }
    this.send({
      'type': 'sync',
      'doc': this,
      'value': data
    });
    return this;
  }

  async deleteFromCollection(): Promise<Doc> {
    await this.collection.docDelete(this.key);
    this.send({
      'type': 'deleted',
      'doc': this
    });
    return this;
  }

  async load(options?: any): Promise<Doc> {
    let data = await this.collection.docLoad(this.key, options);
    this.cache = getPropertyMap(data);
    this.send();
  }

  onChange(update: DocumentUpdate) {
    this.send(update);
  }

  onFirstSubscriber() {
    this._subscriptionUp = this.collection.docSubscribe(this.key, this.onChange.bind(this))
  }

  onLastSubscriber() {
    if (this._subscriptionUp) {
      this._subscriptionUp();
      this._subscriptionUp = undefined;
    }
  }
}

export interface DocEvent {
  type: string;
  doc: Doc;
  [x: string]: any;
}
