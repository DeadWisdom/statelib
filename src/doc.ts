const providerSymbol = Symbol("provider");

export class StateDoc {
  static finalized: boolean = false;

  constructor(provider: unknown) {
    if (!(this.constructor as any).finalized) (this.constructor as any).finalize();
    Object.defineProperty(this, providerSymbol, {
      value: provider,
      writable: false,
      configurable: false,
      enumerable: false,
    });
  }

  static getProvider(doc: StateDoc) {
    return (doc as any)[providerSymbol];
  }

  static finalize() {
    this.finalized = true;
  }
}

export function field(options: any) {
  return function (prototype: any, propertyKey: string) {
    const key = Symbol(propertyKey);

    const getter = function (this: any) {
      console.log("get field", this, options);
      return this[key];
    };
    const setter = function (this: any, newVal: unknown) {
      newVal = newVal + " world";
      this[key] = newVal;
    };
    Object.defineProperty(prototype, propertyKey, {
      get: getter,
      set: setter,
      configurable: true,
      enumerable: true,
    });
  };
}
