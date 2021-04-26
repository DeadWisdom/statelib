import { expect } from "@esm-bundle/chai";

/*
  A ReactorStream holds the latest event like a value, and gives you a promise
  for the next value.

  A Reactor listens, runs a callback, and then ends.
  Or listens, runs a callback over and over, and then ends.
*/

class Reactor {
  _listening = false;
  _trash = new Set();     // Call all functions and clear this when we dispose, some might be subscriptions, some might be reject()s in the promises.

  constructor(target, events, listenerOptions) {
    this._streams = [];
    this._target = target;

    events.forEach((typeName) => {
      this[typeName] = new ReactorStream(target, typeName, listenerOptions);
      this._streams.push(this[typeName]);
    });
  }

  listen() {
    if (this._listening) return;
    this._listening = true;
    this._streams.forEach((s) => {
      s.listen();
    });
  }

  dispose() {
    this._last_event = undefined;
    this._listening = true;
    this._streams.forEach((s) => {
      s.dispose();
    });
  }

  once(callback) {
    this.listen();
    return new Promise((resolve, reject) => {
      this._trash.add(reject);
      callback(this).then(resolve).catch(reject);
      this.dispose();
    });
    try {
      return await callback(this);
    } finally {
      this.dispose();
    }
  }

  async loop(callback) {
    this.listen();
    try {
      while (this._listening) {
        await callback(this);
      }
    } finally {
      this.dispose();
    }
  }
}

class ReactorStream {
  _last_event = undefined;
  _target = null;
  _eventType = null;
  _listenerOptions = undefined;
  _eventCallback = null;
  _nextPromise = null;
  _next = null;

  constructor(target, eventType, listenerOptions) {
    this._target = target;
    this._eventType = eventType;
    this._listenerOptions = listenerOptions;
    this._eventCallback = this.onEvent.bind(this);
  }

  listen() {
    this._target.addEventListener(this._eventType, this._eventCallback, this._listenerOptions);
    return this.next();
  }

  dispose() {
    this._last_event = undefined;
    this._target.removeEventListener(this._eventType, this._eventCallback);
  }

  onEvent(e) {
    let [resolve, error] = this._nextPromise;
    resolve(e);

    this._last_event = e;
    this._next = null;
  }

  next() {
    if (this._next) {
      return this._next;
    }

    this._next = new Promise((resolve, error) => {
      this._nextPromise = [resolve, error];
    });

    return this._next;
  }

  detail() {
    if (this._last_event) {
      return Promise.resolve(this._last_event.detail);
    }
    return this.next().then((e) => e.detail);
  }

  get latest() {
    return this._last_event;
  }

  get happened() {
    return this._last_event !== undefined;
  }
}

class Signal {
  /* Things to test: 
        - do promises really get garbage collected
        - is adding and removing an event listener faster than just ignoring events  
  */
  constructor(target, ...types) {

  }

  async next() {

  }

  async details() {

  }
}

class Reactor {
  constructor() {}

  next(stream) {
    return new Promise((resolve, reject) => {
      this._reject = reject;
      let cleanUp = null;
      try {
        cleanUp = stream.subscribe(resolve);
      } finally {
        if (cleanUp) {
          if (typeof cleanUp.unsubscribe) { cleanUp.unsubscribe() }
          else { cleanUp(); }
        }
      }
    });
  }

  loopUntil(stream, callback) {
    let listening = false;
    this.next(stream).then(value => {
      listening = false;
    });
    while(listening) {
      callback(this);
    }
  }

  async delay() {
    await true;
  }

  dispose() {
    if (this._reject) {
      this._reject();
    }
  }

  static once(callback) {
    callback(new this());
  }
}

class EventStream {
  constructor(target, ...types) {

  }
}


function promiseEvent(target, type) {
  return new Promise((resolve, reject) => {
    let callback = (evt) => {
      resolve(evt);
      target.removeEventListener(type, callback);
    };
    target.addEventListener(type, callback);
  });
}

function createStream(target, eventType, listenerOptions) {
  let stream = new ReactorStream(target, eventType, listenerOptions);
  stream.listen();
  return stream;
}

function sendWindowEvent(eventType, detail) {
  let send = new CustomEvent(eventType, { detail: detail });
  window.dispatchEvent(send);
}

/// SKIPPED ///
xit("reactor works", async () => {
  let reactor = new EventReactor(element, ["mousedown", "mousemove", "mouseup"]);
  reactor.once(async (reactor) => {
    let path = new Path((await reactor.mousedown.detail()).position);

    while (!reactor.mouseup.happened) {
      let m = await reactor.mousemove.detail();
      path.lineTo(m.position);
      draw(path);
    }

    path.close();
    draw(path);
  });
});

it("await event", async () => {
  let testEvent = new ReactorStream(window, "test");
  testEvent.listen();

  let send = new CustomEvent("test", { detail: { name: "test" } });
  window.dispatchEvent(send);

  let detail = await testEvent.detail();

  expect(detail.name).to.equal("test");

  testEvent.dispose();
});

it("createStream", async () => {
  let testEvent = createStream(window, "test");

  let send = new CustomEvent("test", { detail: { name: "test" } });
  window.dispatchEvent(send);

  let detail = await testEvent.detail();

  expect(detail.name).to.equal("test");

  testEvent.dispose();
});

it("reactor works", async () => {
  let reactor = new Reactor(window, ["test"]);

  let detail = null;

  let p = reactor.once(async () => {
    detail = await reactor.test.detail();
  });

  sendWindowEvent("test", { name: "test" });

  await p;

  expect(detail.name).to.equal("test");
});

it("reactor lifecycle", async () => {
  class TestEl extends HTMLElement {
    connectedCallback() {
      super.connectedCallback();

      this.whenDisconnected(() => {});
      let reactor = new Reactor(window, ["test"]);
      reactor.once(this.lifecycle.bind(this));
      reactor.loop(this.lifetime.bind(this));
    }

    async lifecycle(reactor) {
      await reactor.test.next();
    }

    async lifetime(reactor) {
      await new Promise();
    }
  }

  let reactor = new Reactor(window, ["test"]);

  let detail = null;

  let p = reactor.once(async () => {
    detail = await reactor.test.next();
    reactor.test.happened();
  });

  sendWindowEvent("test", { name: "test" });

  await p;

  expect(detail.name).to.equal("test");
});

xit("reactor as a controller", () => {
  class ReactorController {
    constructor(host) {
      this.host = host;
      host.addController(this);
    }

    hostConnected() {}
  }
});
