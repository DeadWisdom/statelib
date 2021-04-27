import { Provider, Storable } from "./provider";
import { EventStream } from "./reactor";

export interface ControllerHost {
  addController(controller: BaseController): void;
}

export interface SyncPropOptions {
  provider: Provider;
  keyProp: string;
  syncProp: string;
}

export interface Doc extends EventStream {
  collection: Collection;
  key: any;
  cache: Map<string, Storable>;

  constructor(collection: Collection, key: any): Doc;

  get(key: string): Storable;
  set(key: string, val: Storable): void;
  update(props: Object): void;
  update(props: Map<string, Storable>): void;
  has(key: string): boolean;

  save(options: any): Promise<Doc>;
  load(options: any): Promise<Doc>;
  delete(options: any): Promise<Doc>;
}

export interface Collection extends EventStream {
  changes: EventStream;
  provider: any;
  filter: any;
  cache: Map<string, Doc>;

  constructor(): Collection;
}

export class BaseController {
  _host: ControllerHost;

  constructor(host: ControllerHost) {
    this._host = host;
    this._host.addController(this);
  }

  hostConnected(): void {}
  hostDisconnected(): void {}
  hostUpdate(changedProps: Map<string, any>): void {}
  hostUpdated(changedProps: Map<string, any>): void {}
}

export class DocController extends BaseController {
  _provider: Provider;
  _keyProp: string;

  constructor(host: ControllerHost, provider: Provider, keyProp: string) {
    super(host);
    this._provider = provider;
    this._keyProp = keyProp;
  }

  get key(): any {
    return (this._host as any)[this._keyProp];
  }

  hostUpdate(changedProps: Map<string, any>): void {
    if (changedProps.has(this._keyProp)) {
      // this.unsubscribe();
      //this.subscribe();
    }
  }

  hostConnected() {
    // Start listening
  }

  hostDisconnected() {
    // Stop listening
  }

  get(key: string): Storable {
    return this._host;
  }
}

export class SyncPropController extends DocController {
  hostConnected(): void {
    // Start listening
  }

  hostDisconnected() {
    // Stop listening
  }

  hostUpdate(changedProps: Map<string, any>) {}

  hostUpdated(changedProps: Map<string, any>) {
    // Save...
  }
}
