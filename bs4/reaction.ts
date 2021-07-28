

// A reaction is a small loop

function reactor(any:any) {

}

const somethingElse:any = null;

let observable = reactor(async (self:any) => {
    // SETUP
    self.subscribe(somethingElse);

    self.connect(async () => {

    });
    
    self.disconnect(async () => {
        
    });

    self.loop(async () => {
        let next = await self.receive();
        self.send(next);
    });

    self.teardown(() => {
        self.unsubscribe(somethingElse);
    });
});

const obs = new Reactor();
obs.subscribe();    // Manage a subscription that will be disposed at teardown
obs.connected(...); // Register a function to run on connection
obs.loop(...);
obs.teardown(...);

reactor(async (self:any) => {
    self.subscribeTo(obs);

    self.teardown(() {
        
    });
});

reactor(async (self:any) => {
    self.subscribeTo(obs, (e:any) => {
        self.send(e);
    });

    self.loop(async () => {
        await self.next(obs);
    })
});

