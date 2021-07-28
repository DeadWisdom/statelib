import {ReactiveController, ReactiveControllerHost} from 'lit';
import { Storable } from './state';

export type Callback = (message:any) => void;


function t() {
    let sub = provider.subscribe({
        next(e) {
            
        },
        error(e) {

        },
        complete(e) {

        },
        connect(e) {

        },
        disconnect(e) {

        }
    });
}


class State {
    parent:State|null = null;

    query(value: Storable, options?:Storable): Promise<any> {
        throw "unimplemented";
    }

    load(value: Storable, options?:Storable): Promise<any> {
        throw "unimplemented";
    }

    update(change: Storable, options?:Storable): Promise<any> {
        throw "unimplemented";
    }

    subscribe(config:Object|Callback) {
        
    }
}

export enum StateUpdateType {
    change = "change"
}

class DocumentState {
    parent:State;
    key:Storable = null;
    cache?:Storable;
    _loaded:Boolean = false;

    get loaded() {
        return this._loaded;
    }

    constructor(parent:State, key:Storable = null, cache?:Storable) {
        this.parent = parent;
        this.key = key;
        this.cache = cache;
        this._loaded = !!cache && !!key;
    }

    async load(options?:Storable) {
        let data = await this.parent.load({key:this.key}, options);
        this.cache = data;
        this._loaded = true;
        return this;
    }

    async save(options?:Storable) {
        return await this.parent.update({type:StateUpdateType.change, key: this.key, value:this.cache}, options);
    }
}

export class StateController implements ReactiveController {
  host: ReactiveControllerHost;
  state: State;
  value?: Storable = undefined;
  
  constructor(host: ReactiveControllerHost, state:State, initial?:Storable) {
      this.host = host;
      this.state = state;
      this.value = initial;
  }

  hostConnected() {
    this.state.subscribe((update) => {
        this.value 
    });
  }

  hostDisconnected() {
    
  }
}



/*

The main ways that I want to use a state library are: 

    * Query curent state
    * Subscription to changes in documents, collections, or text-sequences
    * Update changes to documents, collections, or text-sequences

Ways to create changes:
    
    * imperative
    * form submission
    * event streams
    * actor messages

Guards around data:

    * type enforcement
    * wire transformation
    * migration
    * lenses
*/

