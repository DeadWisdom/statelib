export type Storable = Object | null | string | number | boolean;
export type StorableObject = { [x: string]: Storable };
export type DocumentUpdateCallback = (update: DocumentUpdate) => void;
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

export interface DocumentUpdate {
  key: string;
  value: PropertyMap;
  changed: PropertyMap;
  added: string[];
  removed: string[];
}

//prettier-ignore
export interface DocProvider {
  /**
   * Destroys the provider data, probably not able to be undone.
   * The state of this provider will thereafter be undefined.
   */
  destroyAll(): void;

  /**
   * Save a document with the given key, or if null, a key is generated.
   * 
   * @returns a promise with the final key
   */
  docSave(key: any, props: PropertyMap): Promise<string>;

  /**
   * Load the data of the document.
   * 
   * @returns a promise with the properties as a Map, or null if the document
   *          does not yet exist. Some providers will not be able to tell if
   *          the document exists, so may just return an empty map.
   */
  docLoad(key: any): Promise<Map<string, Storable> | null> 

  /**
   * Delete a document with the given key
   * 
   * @returns A promise which indicates if it was deleted or not
   */
  docDelete(key: any): Promise<boolean>;

  /**
   * Subscribe to the document with the given key. Will immediately call the 
   * callback with the current value unless `warm` is set to false.
   * 
   * @param warm set to false to disable updating the callback on subscription
   * @returns a function that will cancel the subscription
   */
  docSubscribe(key: any, callback: DocumentUpdateCallback, warm?:boolean): UnsubscribeCallback;

  /**
   * Unsubscribe from updates for the key with the callback
   */
  docUnsubscribe(key: any, callback: DocumentUpdateCallback): void;
}

/*
  // TextState
  textLoad(TextState: TextState): Promise<TextState>;
  textUpdate(delta: Delta): Promise<Delta>;
  textSubscribe(callback: DeltaCallback): UnsubscribeCallback;
  textUnsubscribe(callback: DeltaCallback): void;

  getText(key: string, content?: any): TextState;

  // Collection
  collectionLoad(collection: Collection): Promise<Collection>;
  collectionQuery(collection: Collection, query: any): Promise<SubCollection>;
  collectionCreateDocument(collection: Collection, properties: any): Promise<[DocumentState, Collection]>;
  collectionAddDocument(collection: Collection, DocumentState: DocumentState): Promise<[DocumentState, Collection]>;
  collectionRemoveDocument(collection: Collection, DocumentState: DocumentState): Promise<[DocumentState, Collection]>;
  collectionGetDocument(collection: Collection, identifier: any): Promise<[DocumentState, Collection]>;
  collectionSubscribe(callback: CollectionUpdateCallback): UnsubscribeCallback;
  collectionUnsubscribe(callback: CollectionUpdateCallback): void;

  getCollection(key: string): Collection;
  */
