
class Reactor {
  host: any;
  hostUpdate: Promise<any>;
  hostUpdated: Promise<any>;
  hostDisconnect: Promise<any>;

  constructor(host: any, block?: Function) {
    this.host = host;
    this.hostUpdate = Promise.resolve(host);
    this.hostUpdated = Promise.resolve(host);
    this.hostDisconnect = Promise.resolve(host);
  }

  async once(block: Function) {
    return await Promise.race([
      block(this),
      this.untilHostDisconnect()
    ]);
  }

  async loop(block: Function) {
    let disconnected = false;
    while(!disconnected) {
      await Promise.race([
        block(this),
        this.untilHostDisconnect().then(() => disconnected = true)
      ]);
    }
  }

  async until(promise: any) {
    return await promise;
  }

  async untilHostRender() {

  }

  async untilHostDisconnect() {

  }

  async nextEvent(target:EventTarget, event:string, options:any) : Promise<any> {
    let unsubscribe = null;
    return new Promise((resolve, reject) => {
      unsubscribe = () => target.removeEventListener(event, resolve);
      target.addEventListener(event, resolve, options);
    }).then(unsubscribe);
  }
}

function subscribe() {};
function unsubscribe() {};

class Component {
  reactor = new Reactor(this);
  placement: number = 0;

  async loop({loop, nextEvent, untilHostRender}:Reactor) {
    let mouseClick : MouseEvent = await nextEvent(window, 'click', {passive: true});
    if (mouseClick.clientX < 0) return;

    this.placement = mouseClick.clientX;

    unsubscribe();
  }

  async once({loop, untilHostRender}:Reactor) {
    loop(async () => {
      
    });
  }
}

class FlipComponent {
  reactor = new Reactor(this);
  placement: number = 0;

  async loop({loop, nextEvent, hostUpdate, hostUpdated}:Reactor) {
  }

  async lifetime({loop, untilHostRender, hostUpdated, hostDisconnect}:Reactor) {
    this._measure();

    loop(async () => {
      await hostUpdated;
    });

    await hostDisconnect;

    this.disconnectFlip();
  }

  _measure() {

  }

  disconnectFlip() {

  }
}
