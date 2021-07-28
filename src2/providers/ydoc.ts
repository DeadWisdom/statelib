import { Observer, Subscription } from "zen-observable-ts";
import { Collection } from "../collection";
import { StateEvent } from "../state";

export class YCollection implements Collection {
    send(message:StateEvent): Promise<any> {
        throw "Not Implemented";
    }

    subscribe(observer:Observer<StateEvent>): Subscription {
        throw "Not Implemented";
    }

    stop(): void {}
}