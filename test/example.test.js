import { expect } from "@esm-bundle/chai";

import { createBehavior, createSystem } from "xactor";

it("xactor works", async () => {
  let counter = createBehavior((state, event, ctx) => {
    return state;
  }, { count: 0 });

  let counterSystem = createSystem(counter, 'counter');

  counterSystem.subscribe(state => {
    console.log(state);
  });

  counterSystem.send({ type: 'add', value: 3 });
});