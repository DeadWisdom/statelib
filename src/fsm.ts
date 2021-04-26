

let states = {
  initial(reactor) {
    await reactor.waitFor('go');
  }
}

