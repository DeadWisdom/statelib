import { PropertyMap, Storable, getPropertyMap } from "./provider";
import { EventStream } from "./stream";

class Resource extends EventStream {
  cache: any;
  error: any = undefined;
  listening: boolean = false;
  loading: boolean = false;
  ready: boolean = false;
}

class Collection extends Resource {
  config: any;
  cache: Map<string, Doc>;

  constructor(config: any, cache?: Map<string, Doc>) {
    super();
    this.config = config;
    this.cache = cache || new Map();
  }
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

  save(options?: any): Promise<Doc> {
    return this.collection.docSave(this.key, options);
  }

  load(options?: any): Promise<Doc> {
    return this.collection.docLoad(this.key, options);
  }

  deleteFromCollection(options?: any): Promise<Doc> {
    return this.collection.docDelete(this.key, options);
  }
}
