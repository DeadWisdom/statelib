// What we really want is to set up a schema

// Therefore we need migrations / lenses?
// A lens is a way of looking at old (different) data in a new way
// A migration is a way of changing old data to the new way

/*
  Example: 

  const state = new StateStore({
    name: 'appData-v2',
    schema: 
        {username: string,
         isAdmin: {type: Boolean, default: true},
         tags: Array,
         likes: LikeTable},
    persist: 'indexdb',
    migrations: [appDataV2]
  });

  state.transaction(() => {
    state.username.set('deadwisdom');
    state.isAdmin.set(true);
    state.tags.push('owner');
  });
  
  state.likes.subscribe(snapshot => {
    likesComponent.update(snapshot.value);
  });

  state.get('likes', snapshot => {
    likesComponent.update(snapshot.value);
  });

  state.withContext((ctx) => {
    ctx.username = 'deadwisdom';
    ctx.isAdmin = true;
    ctx.tags.push('owner');
  });

  const provider = new IndexedDBProvider('data');

  users = new Table('users', provider);
  users.update()

  currentUser = new Map('currentUser', provider);
 */

interface StateConfiguration {
  name: string;
  schema: Object;
  persist: string;
}

class State {
  name: string;
  schema: Object;
  persist: string;

  constructor(config: StateConfiguration) {
    Object.assign(this, config);
  }
}

class Schema {
  constructor() {}

  subscribe(callback) {}
  unsubscribe(callback) {}
  unsubscribeAll() {}
}

class StateNode {
  constructor(schema) {}

  get() {}
  update(value: any) {}

  setSchema(schema) {}
  getSchema() {}
}

class MapNode extends StateNode {}

class SetNode extends StateNode {}

class TableNode extends StateNode {}

class DocumentCollectionNode extends StateNode {}

class TextNode extends StateNode {}

class ObjectNode extends StateNode {}

class Lens {
  constructor() {}
}

class Migration {
  constructor() {}
}

class StateStore {
  persist(strategy: string = "indexdb") {
    // Persists this state with the given strategy
  }

  get(path: string, callback?: Function) {
    // Return a promise that gets the value at the given path,
    // optionally subscribe with the callback
  }

  put(path: string, value: any) {
    // Updates the path with the given value
  }

  delete(path: string) {
    // Delete the path from the state store
  }

  // Map /////////////////////
  patch(path: string, partialValue: Map<string, any>) {
    // Patches the path with the given mapping of string to value
  }

  // Array ///////////////////
  push(path: string, value: any) {
    // Pushes the value to the end of the array
  }

  pop(path: string, index: number = -1) {
    // Pops a value off the array at the index
  }

  // Table ///////////////////
  query(path: string, query: any, callback?: Function) {
    // Query all items a table, optionally subscribe to it
  }

  add(path: string, item: any) {
    // Adds an item
  }

  remove(path: string, query: any) {
    // Removes all items matching the query
  }

  update(path: string, query: any) {
    // Updates all items matching the query
  }

  // Subscription ///////////////////
  subscribe(path: string, callback: Function) {
    // Subscribe to changes on the path with the callback function.
  }

  unsubscribe(path: string, callback: Function) {
    // Removes the subscription previously made with the callback function.
  }

  unsubscribeAll(path: string) {
    // Removes all subscriptions for the given path
  }
}

class TableView {
  store: StateStore;
  path: string;
  keyFn: Function;

  constructor(store: StateStore, path: string, keyFn: Function) {
    this.store = store;
    this.path = path;
    this.keyFn = keyFn;
  }

  // Table
  query(path: string, query: any, callback?: Function) {
    // Query all items a table, optionally subscribe to it
  }

  add(path: string, item: any) {
    // Adds an item
  }

  remove(path: string, query: any) {
    // Removes all items matching the query
  }

  update(path: string, query: any) {
    // Updates all items matching the query
  }
}
