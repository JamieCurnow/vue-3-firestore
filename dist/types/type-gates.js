"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optsAreGet = exports.optsAreColl = exports.firestoreRefIsDoc = void 0;
exports.firestoreRefIsDoc = function (firestoreRef) {
    return firestoreRef.path.split('/').length % 2 === 0;
};
exports.optsAreColl = function (o) {
    return o.queryType === 'collection';
};
exports.optsAreGet = function (o) {
    return o.queryType === 'doc' && o.type === 'get';
};
