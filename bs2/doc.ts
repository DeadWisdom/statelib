import { Provider, Storable } from "./provider";

interface StateDocInterface {
  provider: any;
  key: any;
  cache: Map<string, Storable>;

  constructor(provider:Provider, key:any): StateDoc;

  get(key: string): Storable;
  set(key: string, val: Storable): void;
  deleteKey(key: string): boolean;
  update(props:Object): void;
  update(props:Map<string, Storable>): void;
  has(key: string): boolean;
  save(options:any): Promise<StateDoc>;
  load(options:any): Promise<StateDoc>;
  deleteDoc(options:any): Promise<StateDoc>;
  
  subscribe(callback:any): Function;
}


export class StateDoc implements StateDocInterface {
  set(key: string, value: Storeable): this {
    return this;
  }
  get(key: string): Storeable {
    return "a";
  }
  has(key: string): boolean {
    return false;
  }
  get size(): number {
    return 0;
  }
  delete(key: string): boolean {
    return false;
  }
  clear() {}
  forEach(callback: Function) {}
  map(callback: Function) {}

  entries() : IterableIterator<[string, Storeable]> {
  
  }
  keys() : IterableIterator<string> {

  }
  values() : IterableIterator<Storeable> {

  }

  [Symbol.iterator]() {
    return this.entries();
  }

  get [Symbol.toStringTag]() : string {
    return 'hi'
  }
}