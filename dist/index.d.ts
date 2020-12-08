import { Options } from './types/Options';
import { ReturnCollWatch, ReturnCollGet, ReturnDocWatch, ReturnDocGet } from './types/Return';
export default function <T, M = T>(options: {
    queryType: 'collection';
    type: 'watch';
} & Options<T, M>): ReturnCollWatch<T, M>;
export default function <T, M = T>(options: {
    queryType: 'collection';
    type: 'get';
} & Options<T, M>): ReturnCollGet<T, M>;
export default function <T, M = T>(options: {
    queryType: 'doc';
    type: 'watch';
} & Options<T, M>): ReturnDocWatch<T, M>;
export default function <T, M = T>(options: {
    queryType: 'doc';
    type: 'get';
} & Options<T, M>): ReturnDocGet<T, M>;
