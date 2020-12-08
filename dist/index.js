"use strict";
// // register vue composition api as plugin if needed
// import Vue from 'vue'
// import VueCompositionAPI from '@vue/composition-api'
// Vue.use(VueCompositionAPI)
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var firebase_1 = __importDefault(require("firebase"));
var composition_api_1 = require("@vue/composition-api");
var lodash_debounce_1 = __importDefault(require("lodash.debounce"));
// Type gates
var type_gates_1 = require("./types/type-gates");
// The function
// eslint-disable-next-line func-style
function default_1(options) {
    var _this = this;
    // get firebase and make sure it's setup
    if (!firebase_1.default.apps.length) {
        throw new Error('vue-3-firestore Error: No default firebase app found. Please initialize firebase before calling useFirestore');
    }
    var firebase = firebase_1.default.app();
    var data = composition_api_1.ref(undefined);
    var collectionData = composition_api_1.ref([]);
    var mutatedData = composition_api_1.ref(undefined);
    var initialLoading = options.initialLoading === undefined ? true : options.initialLoading;
    var loading = composition_api_1.ref(initialLoading);
    var received = composition_api_1.ref(false);
    // Path replaced computation
    var pathReplaced = composition_api_1.computed(function () {
        var path = options.path, variables = options.variables;
        var stringVars = path.replace(/\s/g, '').match(/\$[^\W]*/g);
        if (!(stringVars === null || stringVars === void 0 ? void 0 : stringVars.length) || !variables)
            return path;
        var newPath = path;
        for (var i = 0; i < stringVars.length; i++) {
            var x = stringVars[i];
            var instanceVal = variables[x.split('$').join('')].value;
            if (!['number', 'string'].includes(typeof instanceVal) || instanceVal === '') {
                newPath = '';
                break;
            }
            else {
                newPath = newPath.replace(x, "" + instanceVal);
            }
        }
        return newPath.startsWith('/')
            ? newPath.endsWith('/')
                ? newPath.substr(1).substr(0, newPath.length - 2)
                : newPath.substr(1)
            : newPath;
    });
    // firestore Ref computation
    var createComputedFirestoreRef = function () {
        if (type_gates_1.optsAreColl(options)) {
            return composition_api_1.computed(function () {
                var path = pathReplaced.value;
                return firebase.firestore().collection(path);
            });
        }
        else {
            return composition_api_1.computed(function () {
                var path = pathReplaced.value;
                return firebase.firestore().doc(path);
            });
        }
    };
    var firestoreRef = createComputedFirestoreRef();
    var firestoreQuery = composition_api_1.computed(function () {
        if (type_gates_1.optsAreColl(options) && !type_gates_1.firestoreRefIsDoc(firestoreRef.value) && options.query !== undefined) {
            return options.query(firestoreRef.value);
        }
        else {
            return null;
        }
    });
    var updateDoc = function (updates) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (type_gates_1.firestoreRefIsDoc(firestoreRef.value)) {
                return [2 /*return*/, firestoreRef.value.set(updates, { merge: true })];
            }
            else {
                return [2 /*return*/, undefined];
            }
            return [2 /*return*/];
        });
    }); };
    var deleteDoc = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (type_gates_1.firestoreRefIsDoc(firestoreRef.value)) {
                return [2 /*return*/, firestoreRef.value.delete()];
            }
            else {
                return [2 /*return*/, undefined];
            }
            return [2 /*return*/];
        });
    }); };
    var receiveCollData = function (receivedData) {
        var opts = options;
        mutatedData.value = opts.mutate ? opts.mutate(receivedData) : undefined;
        if (opts.onReceive)
            opts.onReceive(receivedData, mutatedData.value);
        collectionData.value = receivedData;
        received.value = true;
        loading.value = false;
        return { data: receivedData, mutatedData: mutatedData.value };
    };
    var receiveDocData = function (receivedData) {
        var opts = options;
        mutatedData.value = opts.mutate ? opts.mutate(receivedData) : undefined;
        if (opts.onReceive)
            opts.onReceive(receivedData, mutatedData.value);
        data.value = receivedData;
        received.value = true;
        loading.value = false;
        return { data: receivedData, mutatedData: mutatedData.value };
    };
    var getDocData = function () { return __awaiter(_this, void 0, void 0, function () {
        var firestoreRefVal, doc, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    firestoreRefVal = firestoreRef.value;
                    return [4 /*yield*/, firestoreRefVal.get()];
                case 1:
                    doc = _a.sent();
                    return [2 /*return*/, receiveDocData(doc.exists ? doc.data() : undefined)];
                case 2:
                    e_1 = _a.sent();
                    if (options.onError) {
                        options.onError(e_1);
                    }
                    else {
                        console.error("Failed to getData at path " + pathReplaced.value);
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var getCollData = function () { return __awaiter(_this, void 0, void 0, function () {
        var firestoreRefVal, collection, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    firestoreRefVal = firestoreQuery.value !== null ? firestoreQuery.value : firestoreRef.value;
                    return [4 /*yield*/, firestoreRefVal.get()];
                case 1:
                    collection = _a.sent();
                    return [2 /*return*/, receiveCollData(collection.size ? collection.docs.map(function (x) { return x.data(); }) : [])];
                case 2:
                    e_2 = _a.sent();
                    if (options.onError) {
                        options.onError(e_2);
                    }
                    else {
                        console.error("Failed to getData at path " + pathReplaced.value);
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var watcher = null;
    var watchData = function () {
        try {
            if (type_gates_1.firestoreRefIsDoc(firestoreRef.value)) {
                watcher = firestoreRef.value.onSnapshot(function (doc) {
                    receiveDocData(doc.exists ? doc.data() : undefined);
                });
            }
            else {
                var firestoreRefVal = firestoreQuery.value !== null ? firestoreQuery.value : firestoreRef.value;
                watcher = firestoreRefVal.onSnapshot(function (collection) {
                    receiveCollData(collection.size ? collection.docs.map(function (x) { return x.data(); }) : []);
                });
            }
        }
        catch (e) {
            if (options.onError) {
                options.onError(e);
            }
            else {
                console.error("Failed to watchData at path " + pathReplaced.value);
            }
        }
    };
    var stopWatchingData = function () {
        if (watcher !== null) {
            watcher();
        }
    };
    if (options.type === 'watch') {
        composition_api_1.onUnmounted(function () {
            stopWatchingData();
        });
    }
    var dataGetter = function () {
        composition_api_1.nextTick(function () {
            if (firestoreRef.value) {
                loading.value = true;
                if (type_gates_1.optsAreGet(options)) {
                    if (type_gates_1.optsAreColl(options)) {
                        getCollData();
                    }
                    else {
                        getDocData();
                    }
                }
                else {
                    stopWatchingData();
                    watchData();
                }
            }
        });
    };
    var debounceDataGetter = lodash_debounce_1.default(dataGetter, options.debounce);
    composition_api_1.watch(pathReplaced, function (v) {
        if (options.manual)
            return;
        if (v) {
            debounceDataGetter();
        }
        else {
            stop();
        }
    }, { immediate: true });
    var returnVal = {
        mutatedData: mutatedData,
        loading: loading,
        received: received,
        pathReplaced: pathReplaced,
        firestoreRef: firestoreRef,
        updateDoc: updateDoc,
        deleteDoc: deleteDoc
    };
    if (type_gates_1.optsAreColl(options)) {
        if (type_gates_1.optsAreGet(options)) {
            return __assign(__assign({}, returnVal), { data: collectionData, getData: getCollData, firestoreQuery: firestoreQuery });
        }
        else {
            return __assign(__assign({}, returnVal), { data: collectionData, watchData: watchData,
                stopWatchingData: stopWatchingData,
                firestoreQuery: firestoreQuery });
        }
    }
    else if (type_gates_1.optsAreGet(options)) {
        return __assign(__assign({}, returnVal), { data: data, getData: getDocData });
    }
    else {
        return __assign(__assign({}, returnVal), { data: data,
            watchData: watchData,
            stopWatchingData: stopWatchingData });
    }
}
exports.default = default_1;
