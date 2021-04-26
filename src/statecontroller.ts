import { Provider, Storable } from "./provider";
import { EventStream } from "./reactor";

interface ControllerHost {
  addController(controller:Controller): void;
}

interface Doc extends EventStream {
  collection: Collection;
  key: any;
  cache: Map<string, Storable>;

  constructor(collection:Collection, key:any): Doc;

  get(key: string): Storable;
  set(key: string, val: Storable): void;
  update(props:Object): void;
  update(props:Map<string, Storable>): void;
  has(key: string): boolean;

  save(options:any): Promise<Doc>;
  load(options:any): Promise<Doc>;
  delete(options:any): Promise<Doc>;
}

interface Collection extends EventStream {
  changes: EventStream;
  provider: any;
  filter: any;
  cache: Map<string, Doc>;

  constructor(): Collection;
}

export class BaseController {
  _host: ControllerHost;

  constructor(host:ControllerHost) {
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

  constructor(host:ControllerHost, provider:Provider) {
    super(host);
    this._provider = provider;
  }

  hostConnected() {

    // Start listening
  }

  hostDisconnected() {
    // Stop listening
  }

  get(key: string): Storable {
    
  }
}

export class PropController extends DocController {
  host: ControllerHost

  hostConnected(): void {
    // Start listening
  }

  hostDisconnected() {
    // Stop listening
  }

  hostUpdate(changedProps: Map<string, any>) {
    
  }

  hostUpdated(changedProps: Map<string, any>) {
    // Save...
  }
}

