/**
 * These need to be xstate services
 *
 * They connect and send data events around.
 *
 * They encapsulate pieces of context and send them to states.
 */

import { Subscription } from "./subscription";

export type Storable = Object | null | string | number | boolean;
export type StorableObject = { [x: string]: Storable };
export type UpdateCallback = (update: StateEvent) => void;
export type UnsubscribeCallback = () => void;
export type PropertyMap = Map<string, Storable> | StorableObject | undefined;

export function getPropertyMap(props: PropertyMap): Map<string, Storable> {
  if (props === undefined) return new Map();
  if (props instanceof Map) {
    return props;
  } else if (props instanceof Object) {
    return new Map(Object.entries(props));
  }
  throw "Getting property map, but input is not a map or an object: " + props;
}

export interface StateService {
  /**
   * Send an update or query, with the given options.
   */
  send(event: StateEvent): void;

  /**
   * Subscribe to all updates on the provider.
   */
  subscribe(callback: UpdateCallback): Subscription;

  /**
   * Starts the service
   */
  start(): void;

  /**
   * Shuts the service down
   */
  stop(): void;
}

export interface StateEvent {
  type: string;
  key: string;
  resolution?: Promise<any>;
}
