import { Docref, CollectionRef, Query } from './firestoreTypes'
import { Ref, ComputedRef } from '@vue/composition-api'

export interface ReturnBase {
  /** The loading state of the data fetch. Will be true when an async data fetch operation is happening. Works reactively as expected. */
  loading: Ref<boolean>
  /** A reactive boolean value to indicate if data has been recieved yet. Will be false as soon as data has been recieved and will stay false thereafter. */
  recieved: Ref<boolean>
  /** A reactive string of the path with $variables replaced with the true variable value from the 'variables' input object */
  pathReplaced: ComputedRef<string>
}

export interface ReturnColl<T, M> extends ReturnBase {
  /** The data returned from the collection as a reactive array or an ampty array if no data has been fetched yet */
  data: Ref<T[]>
  /** Reactive mutated data returned from the mutate() function. If no mutate function is passed, will be equal to 'data'. Will be null until initialised and 'recieved' === true */
  mutatedData: Ref<M | null>
  /** A reactive computed prop that returns the firestore collection reference query */
  firestoreRef: ComputedRef<CollectionRef>
  /** A reactive computed prop that returns the firestore Query if the 'query' input function is used, else it will be null */
  firestoreQuery: ComputedRef<Query>
}

export interface ReturnDoc<T, M> extends ReturnBase {
  /** The data returned from the doc as a reactive object or null if no data has been fetched yet */
  data: Ref<T | null>
  /** Reactive mutated data returned from the mutate() function. If no mutate function is passed, will be equal to 'data'. Will be null until initialised and 'recieved' === true */
  mutatedData: Ref<M | null>
  /** A reactive computed prop that returns the firestore DocumentReference */
  firestoreRef: ComputedRef<Docref>
  /** Exposes a method for updating the doc via the current firestore DocumentReference. Uses the firestore().doc(pathReplaced).set() function with the { merge: true } options. This way, it can be used to set a new doc as well as update an existing */
  updateDoc: (updates: Partial<T>) => Promise<void>
  /** Exposes a method for deleting the doc via the current firestore DocumentReference - firestore().doc(pathReplaced).delete() */
  deleteDoc: () => Promise<void>
}

export interface ReturnWatch extends ReturnBase {
  /** Exposes a function to initiate a firestore document/collection listener via the onSnapshot method. */
  watchData: () => void
  /** Exposes a function for tearing down a firestore onSnapshot listener. Will be called on the onUnmounted hook of this component regardless of the manual mode setting. */
  stopWatchData: () => void
}

export interface ReturnGetColl<T, M> extends ReturnBase {
  /** Exposes a function for getting data from firestore. firestore().collection(${path}).get */
  getData: () => Promise<{
    data: T[]
    mutatedData: M | null
  }>
}

export interface ReturnGetDoc<T, M> extends ReturnBase {
  /** getData provides a function for getting data from firestore. firestore().doc(${path}).get */
  getData: () => Promise<{
    data: T | null
    mutatedData: M | null
  }>
}

export type ReturnCollWatch<T, M> = ReturnColl<T, M> & ReturnWatch
export type ReturnCollGet<T, M> = ReturnColl<T, M> & ReturnGetColl<T, M>
export type ReturnDocWatch<T, M> = ReturnDoc<T, M> & ReturnWatch
export type ReturnDocGet<T, M> = ReturnDoc<T, M> & ReturnGetDoc<T, M>

export type ReturnTypes<T, M> =
  | ReturnCollWatch<T, M>
  | ReturnCollGet<T, M>
  | ReturnDocWatch<T, M>
  | ReturnDocGet<T, M>