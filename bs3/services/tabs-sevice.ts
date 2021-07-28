/**
 * Tabs service sends updates across browser tabs via
 */
import { SubscriptionManager } from "../subscription";
import { StateService, StateEvent, PropertyMap, Storable, getPropertyMap } from "../service";
import { DocumentEventCallback } from "./yjs-service";

export function createBroadcastChannel(key: string) {
  return new BroadcastChannel("tabs-service-" + key);
}

export class TabsService implements StateService {
  key: string;
  channel: BroadcastChannel;
  _subs: SubscriptionManager<DocumentEventCallback>;

  constructor(key: string, channelFactory: Function = createBroadcastChannel) {
    this.key = key;
    this.channel = channelFactory(key);
    this._subs = this._buildSubs();
    this.send = this.send.bind(this);
  }

  _buildSubs() {
    let subs = new SubscriptionManager({
      start: (send: any) => {
        this.channel.addEventListener("message", send);
      },
      end: (send: any) => {
        this.channel.removeEventListener("message", send);
      },
      adapter: this._onUpdate,
    });
    return subs;
  }

  _onUpdate(send: DocumentEventCallback, event: any) {
    return send(event.data);
  }

  start() {}

  stop() {
    this._subs.dispose();
  }

  subscribe(callback: DocumentEventCallback) {
    return this._subs.subscribe(callback);
  }

  send(event: any): void {
    this.channel.postMessage(event);
  }
}
