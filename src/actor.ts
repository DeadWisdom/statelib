import { EventStream, IEventStream, ISubscribable, PromiseStream } from "./stream";

export interface IActor extends IEventStream {
  handle(message: any): void;
}

export class Actor extends EventStream implements IActor {
  constructor(onMessage?:MessageHandler) {
    super();
    if (onMessage !== undefined) {
      this.handle = onMessage;
    }
  }
  
  handle(message: any) {}
}

export class PromiseActor extends Actor {
  constructor(promise:Promise<any>) {
    super();
    promise.then(this.handle);
  }
}

/**
 * DelegateActor sends messages it is told to handle
 * to subscribers on its incoming stream
 */
export class DelegateActor extends Actor {
  incoming: EventStream = new EventStream();

  constructor(...handlers:any[]) {
    super();
    handlers.forEach(h => this.incoming.subscribe(h));
  }

  handle(message:any) {
    this.incoming.send(message);
  }

  dispose() {
    this.incoming.dispose();
    super.dispose();
  }
}

export type MessageHandler = (message: any) => void;
export type MessageHook = (handler: MessageHandler) => void;
export type ActorLikeCallback = (send:MessageHandler, onMessage:MessageHook) => void;

export type ActorLike =
  | ISubscribable
  | IActor
  | Actor
  | IEventStream
  | EventStream
  | Promise<any>
  | ActorLikeCallback;

export function adaptActor(actorLike:ActorLike): EventStream {
  if (actorLike instanceof Actor || actorLike instanceof EventStream) return actorLike;
  if (actorLike instanceof Promise) return new PromiseActor(actorLike);
  if (actorLike instanceof Function) {
    // curry no, weave yes
    let handler:MessageHandler | null = null;
    let actor = new Actor((msg) => handler!(msg));
    actorLike(actor.send.bind(actor), (h) => handler = h);
    return actor;
  }
}
