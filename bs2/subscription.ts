export type CallbackAdapter<CallbackSignature> = (next: CallbackSignature, ...args: any[]) => void;

export class SubscriptionService<CallbackSignature> {
  callbacks: Set<CallbackSignature>;
  adapter?: CallbackAdapter<CallbackSignature>;
  start?: (send: Function) => void;
  end?: (send: Function) => void;
  subscribers: number = 0;

  constructor(
    adapter?: CallbackAdapter<CallbackSignature>,
    start?: (sub: Function) => void,
    end?: (sub: Function) => void
  ) {
    console.log("CONSTRUCTION");
    this.callbacks = new Set();
    this.adapter = adapter;
    this.start = start;
    this.end = end;
    this.send = this.send.bind(this);
  }

  send(...args: any[]) {
    this.callbacks.forEach((callback: any) => {
      if (this.adapter) {
        this.adapter(callback, ...args);
      } else {
        callback(...args);
      }
    });
  }

  subscribe(callback: CallbackSignature): () => void {
    if (this.subscribers == 0 && this.start) {
      console.log("SUB CRI", JSON.stringify(this.send));
      this.start(this.send);
    }
    this.subscribers = this.callbacks.size;
    this.callbacks.add(callback);
    return () => {
      this.unsubscribe(callback);
    };
  }

  unsubscribe(callback: CallbackSignature): void {
    if (this.subscribers == 0) return;

    this.callbacks.delete(callback);
    this.subscribers = this.callbacks.size;

    if (this.subscribers == 0 && this.end) {
      this.end(this.send);
    }
  }

  has(callback: CallbackSignature): boolean {
    return this.callbacks.has(callback);
  }
}
