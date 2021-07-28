let provider;

provider.subscribe(updateCallback);
provider.query();
provider.update();

provider.addLens({
  thing: {
    alias: "object",
    bringIn: (val) => val.name,
    sendOut: (val) => Values.get(val),
  },
});

provider.addLens({
  bringIn(val) {},
  sendOut(val) {},
});
