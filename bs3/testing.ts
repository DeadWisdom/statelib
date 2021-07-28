import { StateEvent, StateService } from "./service";
import { expect } from "@esm-bundle/chai";

export function gatherEvents(service: StateService): StateEvent[] {
  let events: StateEvent[] = [];
  service.subscribe((e) => {
    events.push(e);
  });
  return events;
}

export function assertLastEvent(events: any[], opts: any) {
  let e = events[events.length - 1];

  expect(e).is.not.undefined;

  if (opts.type) {
    expect(e.type).to.equal(opts.type);
  }

  if (opts.key) {
    expect(e.key).to.equal(opts.key);
  }

  if (opts.value) {
    expect(e.value).to.deep.equal(opts.value);
  }

  if (opts.changes) {
    let e_changes = e.changes instanceof Map ? Object.fromEntries(e.changes.entries()) : e.changes;
    expect(e_changes).to.deep.equal(opts.changes);
  }
}
