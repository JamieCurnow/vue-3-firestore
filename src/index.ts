import TypeOfFirebase from 'firebase'
import { Ref, ref, computed, watch, nextTick, onUnmounted } from '@vue/composition-api'
import _debounce from 'lodash.debounce'

// Types
/** Firestore DocumentReference */
type Docref = TypeOfFirebase.firestore.DocumentReference<TypeOfFirebase.firestore.DocumentData>
/** Firestore CollectionReference */
type CollectionRef = TypeOfFirebase.firestore.CollectionReference<TypeOfFirebase.firestore.DocumentData>

import { Options, OptionsCollWatch, OptionsCollGet, OptionsDocGet, OptionsDocWatch } from './types/Options'
import { ReturnCollWatch, ReturnCollGet, ReturnDocWatch, ReturnDocGet } from './types/Return'

// Type gates
import {
  firestoreRefIsDoc,
  optsAreColl,
  optsAreGet
} from './types/type-gates'

// Overload Watch Collection
export default function <T, M = T>(
  options: { queryType: 'collection'; type: 'watch' } & Options<T, M>
): ReturnCollWatch<T, M>

// Overload Get Collection
export default function <T, M = T>(
  options: { queryType: 'collection'; type: 'get' } & Options<T, M>
): ReturnCollGet<T, M>

// Overload Watch Doc
export default function <T, M = T>(
  options: { queryType: 'doc'; type: 'watch' } & Options<T, M>
): ReturnDocWatch<T, M>

// Overload Get Doc
export default function <T, M = T>(
  options: { queryType: 'doc'; type: 'get' } & Options<T, M>
): ReturnDocGet<T, M>

// The function
// eslint-disable-next-line func-style
export default function <T, M = T>(options: Options<T, M>): any {
  // get firebase and make sure it's setup
  if (!TypeOfFirebase.apps.length) {
    throw new Error('vue-3-firestore Error: No default firebase app found. Please initialize firebase before calling useFirestore')
  }
  const firebase = TypeOfFirebase.app()
  const data: Ref<T | undefined> = ref(undefined)
  const collectionData: Ref<T[]> = ref([])
  const mutatedData: Ref<undefined | M> = ref(undefined)
  const initialLoading = options.initialLoading === undefined ? true : options.initialLoading
  const loading = ref(initialLoading)
  const received = ref(false)

  // Path replaced computation
  const pathReplaced = computed(() => {
    const { path, variables } = options
    const stringVars = path.replace(/\s/g, '').match(/\$[^\W]*/g)
    if (!stringVars?.length || !variables) return path
    let newPath = path
    for (let i = 0; i < stringVars.length; i++) {
      const x = stringVars[i]
      const instanceVal = variables[x.split('$').join('')].value
      if (!['number', 'string'].includes(typeof instanceVal) || instanceVal === '') {
        newPath = ''
        break
      } else {
        newPath = newPath.replace(x, `${instanceVal}`)
      }
    }
    return newPath.startsWith('/')
      ? newPath.endsWith('/')
        ? newPath.substr(1).substr(0, newPath.length - 2)
        : newPath.substr(1)
      : newPath
  })

  // firestore Ref computation
  const createComputedFirestoreRef = () => {
    if (optsAreColl(options)) {
      return computed(() => {
        const path = pathReplaced.value
        return firebase.firestore().collection(path)
      })
    } else {
      return computed(() => {
        const path = pathReplaced.value
        return firebase.firestore().doc(path)
      })
    }
  }

  const firestoreRef = createComputedFirestoreRef()

  const firestoreQuery = computed(() => {
    if (optsAreColl(options) && !firestoreRefIsDoc(firestoreRef.value) && options.query !== undefined) {
      return options.query(firestoreRef.value)
    } else {
      return null
    }
  })

  const updateDoc = async (updates: Partial<T>) => {
    if (firestoreRefIsDoc(firestoreRef.value)) {
      return firestoreRef.value.set(updates, { merge: true })
    } else {
      return undefined
    }
  }

  const deleteDoc = async () => {
    if (firestoreRefIsDoc(firestoreRef.value)) {
      return firestoreRef.value.delete()
    } else {
      return undefined
    }
  }

  const receiveCollData = (receivedData: T[]) => {
    const opts = options as OptionsCollWatch<T, M> | OptionsCollGet<T, M>
    mutatedData.value = opts.mutate ? opts.mutate(receivedData) : undefined
    if (opts.onReceive) opts.onReceive(receivedData, mutatedData.value)
    collectionData.value = receivedData
    received.value = true
    loading.value = false
    return { data: receivedData, mutatedData: mutatedData.value }
  }

  const receiveDocData = (receivedData: T | undefined) => {
    const opts = options as OptionsDocGet<T, M> | OptionsDocWatch<T, M>
    mutatedData.value = opts.mutate ? opts.mutate(receivedData) : undefined
    if (opts.onReceive) opts.onReceive(receivedData, mutatedData.value)
    data.value = receivedData
    received.value = true
    loading.value = false
    return { data: receivedData, mutatedData: mutatedData.value }
  }

  const getDocData = async () => {
    try {
      const firestoreRefVal = firestoreRef.value as Docref
      const doc = await firestoreRefVal.get()
      return receiveDocData(doc.exists ? <T>doc.data() : undefined)
    } catch (e) {
      if (options.onError) {
        options.onError(e)
      } else {
        console.error(`Failed to getData at path ${pathReplaced.value}`)
      }
    }
  }

  const getCollData = async () => {
    try {
      const firestoreRefVal =
        firestoreQuery.value !== null ? firestoreQuery.value : (firestoreRef.value as CollectionRef)
      const collection = await firestoreRefVal.get()
      return receiveCollData(collection.size ? collection.docs.map((x) => <T>x.data()) : [])
    } catch (e) {
      if (options.onError) {
        options.onError(e)
      } else {
        console.error(`Failed to getData at path ${pathReplaced.value}`)
      }
    }
  }

  let watcher: null | (() => void) = null
  const watchData = () => {
    try {
      if (firestoreRefIsDoc(firestoreRef.value)) {
        watcher = firestoreRef.value.onSnapshot((doc) => {
          receiveDocData(doc.exists ? <T>doc.data() : undefined)
        })
      } else {
        const firestoreRefVal =
          firestoreQuery.value !== null ? firestoreQuery.value : (firestoreRef.value as CollectionRef)
        watcher = firestoreRefVal.onSnapshot((collection) => {
          receiveCollData(collection.size ? collection.docs.map((x) => <T>x.data()) : [])
        })
      }
    } catch (e) {
      if (options.onError) {
        options.onError(e)
      } else {
        console.error(`Failed to watchData at path ${pathReplaced.value}`)
      }
    }
  }

  const stopWatchingData = () => {
    if (watcher !== null) {
      watcher()
    }
  }

  if (options.type === 'watch') {
    onUnmounted(() => {
      stopWatchingData()
    })
  }

  const dataGetter = () => {
    nextTick(() => {
      if (firestoreRef.value) {
        loading.value = true
        if (optsAreGet(options)) {
          if (optsAreColl(options)) {
            getCollData()
          } else {
            getDocData()
          }
        } else {
          stopWatchingData()
          watchData()
        }
      }
    })
  }

  const debounceDataGetter = _debounce(dataGetter, options.debounce)

  watch(
    pathReplaced,
    (v) => {
      if (options.manual) return
      if (v) {
        debounceDataGetter()
      } else {
        stop()
      }
    },
    { immediate: true }
  )

  const returnVal = {
    mutatedData,
    loading,
    received,
    pathReplaced,
    firestoreRef,
    updateDoc,
    deleteDoc
  }

  if (optsAreColl(options)) {
    if (optsAreGet(options)) {
      return {
        ...returnVal,
        data: collectionData,
        getData: getCollData,
        firestoreQuery
      }
    } else {
      return {
        ...returnVal,
        data: collectionData,
        watchData,
        stopWatchingData,
        firestoreQuery
      }
    }
  } else if (optsAreGet(options)) {
    return {
      ...returnVal,
      data,
      getData: getDocData
    }
  } else {
    return {
      ...returnVal,
      data,
      watchData,
      stopWatchingData
    }
  }
}
