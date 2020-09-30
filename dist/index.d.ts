import * as TypeOfFirebase from 'firebase';
import { Options } from './types/Options';
import { ReturnCollWatch, ReturnCollGet, ReturnDocWatch, ReturnDocGet } from './types/Return';
export declare function FirestoreBind<T, M = T>(firebase: typeof TypeOfFirebase, options: {
    queryType: 'collection';
    type: 'watch';
} & Options<T, M>): ReturnCollWatch<T, M>;
export declare function FirestoreBind<T, M = T>(firebase: typeof TypeOfFirebase, options: {
    queryType: 'collection';
    type: 'get';
} & Options<T, M>): ReturnCollGet<T, M>;
export declare function FirestoreBind<T, M = T>(firebase: typeof TypeOfFirebase, options: {
    queryType: 'doc';
    type: 'watch';
} & Options<T, M>): ReturnDocWatch<T, M>;
export declare function FirestoreBind<T, M = T>(firebase: typeof TypeOfFirebase, options: {
    queryType: 'doc';
    type: 'get';
} & Options<T, M>): ReturnDocGet<T, M>;
