export type EventCallback = (event: any) => void;

export interface Unsubscribable {
  unsubscribe(callback: Function): void;
}

export class Subscription {
  source: Unsubscribable;
  callback: EventCallback;

  constructor(sub: Unsubscribable, callback: EventCallback) {
    this.source = sub;
    this.callback = callback;
  }

  dispose() {
    this.source.unsubscribe(this.callback);
  }
}

export class EventStream {
  _subscribers: Map<EventCallback, Subscription> = new Map();

  subscribe(callback: EventCallback): Subscription {
    if (this._subscribers.has(callback)) {
      return this._subscribers.get(callback)!;
    }
    let sub = new Subscription(this, callback);
    this._subscribers.set(callback, sub);
    if (this._subscribers.size == 1) {
      this.onFirstSubscriber();
    }
    return sub;
  }

  unsubscribe(callback: EventCallback) {
    if (!this._subscribers.has(callback)) return;
    this._subscribers.delete(callback);
    if (this._subscribers.size == 0) {
      this.onLastSubscriber();
    }
  }

  send(event: any) {
    this._subscribers.forEach((sub, callback) => {
      callback(event);
    });
  }

  onFirstSubscriber() {}
  onLastSubscriber() {}
}

export class EventListenerStream extends EventStream {
  target: EventTarget;
  type: string;
  options: any;
  _event_listener: EventListener = this.send.bind(this);

  constructor(target: EventTarget, type: string, options: any) {
    super();
    this.target = target;
    this.type = type;
    this.options = options;
  }

  onFirstSubscriber() {
    super.onFirstSubscriber();
    this.target.addEventListener(this.type, this._event_listener, this.options);
  }

  onLastSubscriber() {
    super.onLastSubscriber();
    this.target.removeEventListener(this.type, this._event_listener);
  }
}

export class EventStreamProxy extends EventStream {
  _parentSub?: Subscription;
  _parent: EventStream;
  _interceptor?: Function;

  constructor(parent: EventStream, interceptor?: EventCallback) {
    super();
    this._parent = parent;
    this._interceptor = interceptor;
  }

  onParentEvent(event: any) {
    if (this._interceptor) {
      this._interceptor(event, this.send);
    } else {
      this.send(event);
    }
  }

  onFirstSubscriber() {
    super.onFirstSubscriber();
    this._parentSub = this._parent.subscribe(this.onParentEvent.bind(this));
  }

  onLastSubscriber() {
    this._parentSub?.dispose();
  }
}
