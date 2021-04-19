import { Provider, Storable } from "./provider";

interface ControllerHost {
  addController(controller:Controller): void;
}

interface StateDoc {
  provider: any;
  key: any;
  cache: Map<string, Storable>;

  constructor(provider:Provider, key:any): StateDoc;

  get(key: string): Storable;
  set(key: string, val: Storable): void;
  update(props:Object): void;
  update(props:Map<string, Storable>): void;
  has(key: string): boolean;
  save(options:any): Promise<StateDoc>;
  load(options:any): Promise<StateDoc>;
  delete(options:any): Promise<StateDoc>;
  subscribe(callback:any): Function;
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