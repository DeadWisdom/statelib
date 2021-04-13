== Issues ==

Subscribing across an abstraction is weird because the abstraction has to also
manage its callbacks.

doc
doc.subscribe(callback)
callbackWrapper = () => callback();
this.provider.subscribe(this.id, callbackWrapper)

subscribe(callback);

subscribe(callback) {
start();
return subscribe(() => {
callback;
}, () => {

};
}

subscribe(callback, onUnsubscribe) {

}

new Promise((callback, complete, error) => {

});

function\* subscription() {
yield
}

let reactor = new EventReactor(element, ['mousedown', 'mousemove', 'mouseup']);
reactor.once(async (reactor) => {
reactor.subscribe();
let path = new Path((await reactor.mouseDown.eventually).position)

while (!reactor.mouseUp.happened()) {
val m = await reactor.mouseMove;
path.lineTo(m.position);
draw(path);
}

path.close();
draw(path);
});

Lavender.lifetime(element, async (reactor) => {

});

@customElement('provider-thing')
function providerThing() {
async lifecycle(reactor) {
attach thing

    while (!reactor.disconnect) {

    }

}

render() {

}
}
