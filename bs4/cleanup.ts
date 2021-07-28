
class CallbackSet {
    callbacks:Set<Function> = new Set();

    add(callback:Function) {
        this.callbacks.add(callback);
    }

    remove(callback:Function) {
        this.callbacks.delete(callback);
    }

    call(...args:any[]) {
        this.callbacks.forEach(fn => fn(...args));
    }
}

class Reactor {
    _updateCallbacks = new CallbackSet();
    _cleanupCallbacks = new CallbackSet();

    observe(callback:Function, handlers:any) {
        // Handlers:
        // connect / disconnect
        // teardown
        // update
        this._updateCallbacks.add(callback);
    }
    
    loop(callback) {

    }

    once(callback) {

    }

    cleanup() {
        this._cleanupCallbacks.call(this);
    }
}


// Callback: [function ->] [<- invocation]
// Subscription: [function ->] [<- invocation] [remove function ->]
// RXJs Observable: [observer{next, error, complete} ->] [<- next] [<- error] [<- complete] [remove observer ->] 
// tc39 Observable: 
// XState Service: [send ->, registerCallbackHook ->] [<- message] [<- callback] [message ->]
// Actor:


function test() {
    let actor = new Actor();
    actor.hook((sub:any) => {
        actor.handle('hello');
            
        return {
            next() {

            },
            error() {
                
            },
            teardown() {

            }
        }
    })
}