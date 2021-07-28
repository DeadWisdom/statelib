import { Observable, Observer, Subscription } from "zen-observable-ts";

export type Storable = Object | null | string | number | boolean;
export type StorableObject = { [x: string]: Storable };

export interface StateProvider {
    send(message:StateEvent): Promise<any>;
    subscribe(observer:Observer<StateEvent>): Subscription;
    stop(): void;
}

export enum StateEventType {
    Create,
    Save,
    Load,
    Delete,
    Query,
    Connected,
    Disconnected
}

export interface StateEvent {
    type:StateEventType;
    data:any;
}
