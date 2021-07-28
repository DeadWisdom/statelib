//prettier-ignore
export type CallbackAdapter<CallbackSignature> = (next: CallbackSignature, ...args: any[]) => void;

export interface Subscription {
  unsubscribe(): void;
}

export interface SubscriptionManagerOpts<CallbackSignature> {
  adapter?: CallbackAdapter<CallbackSignature>;
  start?: (sub: Function) => void;
  end?: (sub: Function) => void;
}

export class SubscriptionManager<CallbackSignature extends Function> {
  callbacks: Set<CallbackSignature>;
  subscribers: number = 0;
  adapter?: CallbackAdapter<CallbackSignature>;
  start?: (send: Function) => void;
  end?: (send: Function) => void;
  _boundSend: (...args: any[]) => void;

  constructor(opts: SubscriptionManagerOpts<CallbackSignature> = {}) {
    this.callbacks = new Set();
    this.adapter = opts.adapter;
    this.start = opts.start;
    this.end = opts.end;
    this._boundSend = this.send.bind(this);
  }

  send(...args: any[]) {
    this.callbacks.forEach((callback: CallbackSignature) => {
      if (this.adapter) {
        this.adapter(callback, ...args);
      } else {
        callback(...args);
      }
    });
  }

  subscribe(callback: CallbackSignature): Subscription {
    if (this.subscribers == 0 && this.start) {
      this.start(this._boundSend);
    }
    this.subscribers = this.callbacks.size;
    this.callbacks.add(callback);
    return {
      unsubscribe: () => this.unsubscribe(callback),
    };
  }

  unsubscribe(callback: CallbackSignature): void {
    if (this.subscribers == 0) return;

    this.callbacks.delete(callback);
    this.subscribers = this.callbacks.size;

    if (this.subscribers == 0 && this.end) {
      this.end(this._boundSend);
    }
  }

  has(callback: CallbackSignature): boolean {
    return this.callbacks.has(callback);
  }

  dispose() {
    let subscribers = Array.from(this.callbacks);
    subscribers.forEach((c) => this.unsubscribe(c));
  }
}
