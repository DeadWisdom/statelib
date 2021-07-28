import { StateProvider, StateEvent, StateEventType, Storable } from "./state";
import { Observable, Observer, Subscription } from "zen-observable-ts";

export class Collection implements StateProvider {
    send(message:StateEvent): Promise<any> {
        throw "Not Implemented";
    }

    subscribe(observer:Observer<StateEvent>): Subscription {
        throw "Not Implemented";
    }

    stop(): void {}

    query(value: Storable, options?:Storable): Promise<any> {
        return this.send({
            type: StateEventType.Query,
            data: {value, options}
        });
    }
    
    create(value: Storable, options?:Storable): Promise<any> {
        return this.send({
            type: StateEventType.Create,
            data: {value, options}
        });
    }

    save(key: string, value: Storable, options?:Storable): Promise<any> {
        return this.send({
            type: StateEventType.Save,
            data: {key, value, options}
        });
    }

    load(key: string, options?:Storable): Promise<any> {
        return this.send({
            type: StateEventType.Load,
            data: {key, options}
        });
    }
    
    delete(key: string, options?:Storable): Promise<any> {
        return this.send({
            type: StateEventType.Load,
            data: {key, options}
        });
    }

    clear(options?:Storable): Promise<any> {
        return this.send({
            type: StateEventType.Clear,
            data: {options},
        });
    }
}
