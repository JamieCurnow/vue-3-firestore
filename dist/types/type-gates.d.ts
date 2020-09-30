import { Docref, CollectionRef } from './firestoreTypes';
import { Options, OptionsCollWatch, OptionsCollGet, OptionsDocGet } from './Options';
export declare const firestoreRefIsDoc: (firestoreRef: CollectionRef | Docref) => firestoreRef is Docref;
export declare const optsAreColl: <T, M>(o: Options<T, M>) => o is OptionsCollWatch<T, M> | OptionsCollGet<T, M>;
export declare const optsAreGet: <T, M>(o: Options<T, M>) => o is OptionsCollGet<T, M> | OptionsDocGet<T, M>;
