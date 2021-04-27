import { EventStream } from "./reactor";
import { Collection } from "./statecontroller";

/**
 * Information Surface
 *
 * Doc:
 *  type / key / path
 *  data
 *  collection / provider
 *  error
 *  state: listening
 *  state: loading / error / ready
 *  subscribers
 *
 * Collection:
 *  documents
 *  configuration / filter / provider
 *  error
 *  state: listening
 *  state: loading / error / ready
 *  subscribers
 *
 * Common:
 *  error
 *  state: listening
 *  state: loading / error / ready
 *  subscribers
 *  data?
 *  collection / provider? - authority
 */

class Resource extends EventStream {
  cache: any;
  error: any;
  listening: boolean = false;
  loading: boolean = false;
  ready: boolean = false;
}

class Collection extends Resource {
  config: any;
  cache: Map<string, Doc> = new Map();
}

class Doc extends Resource {
  key: any;
  collection: Collection;
  cache: Map<string, any> = new Map();

  constructor(collection: Collection, key: string) {
    super();
    this.collection = collection;
    this.key = key;
  }
}

let collection = new MemoryCollection();

let user = collection.create("user", {
  name: "ted",
});
user.set("name", "bob");

class User {
  key: any;
  doc: Doc;
  name: String = "";

  constructor(key: any) {
    this.doc = collection.get(key);
  }

  save() {
    this.doc.save(this);
  }

  load() {
    this.doc.load(this);
  }
}

user = new User("user");
user.load();
user.save();
user.live();
user.dispose();
user.subscribe();
user.unsubscribe();

class Subscriber {}

class YDocCollection implements Collection {
  constructor() {}

  sync(state: any): EventStream {
    return new EventStream();
  }

  store(key: any, props: any) {
    return {
      set(name: string, val: any) {},
    };
  }
}

let localCollection = new YDocCollection();

let userStore = localCollection.store("users/ted", {
  name: String,
});

userStore.set("name", "ted");
userStore.live();
userStore.dispose();

class DocLoader {
  constructor(host, collection, property, type) {}

  hostUpdated() {}
  hostUpdate() {}
}

class Component {
  @property
  userId: String;

  user: User = localCollection.provideContext(this, "userId");
}
