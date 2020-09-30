# vue-3-firestore

An easy way to interact with Firestore using vue 3 and the composition-api.

- [Get started](#get-started)
- [Usage](#usage)
- [Options](#options)
- [Return values](#return-values)
- [Examples](#examples)

Examples:

- [Get Doc (without variables)](#get-doc-without-variables)
- [Get Doc](#get-doc)
- [Get Collection (without variables)](#get-collection-without-variables)
- [Get Collection](#get-collection)
- [Watch Doc](#watch-doc)
- [Watch Collection](#watch-collection)
- [With Typesctipt](#with-typesctipt)
- [With Typesctipt and Mutation of incoming data](#with-typesctipt-and-mutation-of-incoming-data)
- [Manual mode get](#manual-mode-get)
- [Manual mode watch](#manual-mode-watch)
- [Update and Delete helpers](#update-and-delete-helpers)
- [Extending a query (order, where, limit)](#extending-a-query-order-where-limit)

## Get started

`yarn add vue-3-firestore`

### in your .vue file

```html
<template lang="html">
  <p>{{ data }}</p>
</template>

<script lang="ts">
import * as firebase from 'firebase'
import { defineComponent, ref } from '@vue/composition-api'
import { FirestoreBind } from '../../vue-3-firestore'
export default defineComponent({
  setup() {
    const uid = ref('1')

    const { data, loading } = FirestoreBind(firebase, {
      queryType: 'doc',
      type: 'watch',
      path: 'collection/$uid',
      variables: {
        uid
      }
    })

    return {
      data
    }
  }
})
</script>

<style lang="scss" scoped></style>
```

## Usage

```ts
import * as firebase from 'firebase'
const results = FirestoreBind<ReturnDataType>(firebase, options)
```

## Options

|param|type|required?|default|description|
|-----|----|---------|-------|-----------|
|queryType|string|true||The type of this query - 'collection' or 'doc'|
|type|string|true||The type of the get function - 'watch' or 'get'. 'get' does a single get() from firestore. 'watch' watches for document or collection changes and updates the data recieved|
|path|string|true||Path to the document or collection in firestore. Use $variableName to insert reactive variable data into the path. If the path includes variables, the options object must include a 'variables' key|
|variables|Object|false||Variables that should be used to construct the path to the document or collection in firestore. If a variable changes the path, data will be re-fetched. Variable values should be a vue ref. Variable keys should match those in the path string|
|debounce|number|false|200|The debounce amount in milliseconds that should be waited between a path change and getting the data from firestore. Useful to change if a variable is bound to a text input. Defaults to 200|
|initialLoading|boolean|false|true|The initial state of the loading return value. Defaults to true. Setting to false could be helpful in manual mode|
|manual|boolean|false|false|When in manual mode, data will not automatically be fetched or watched initially or on path change. It will be up to you to call the getData or watchData function.|
|onError|function|false|console.error|Exposes a function to customise error handling. Defaults to console.error(e)|
||||||
|query|function|false||Exposes a function to extend the firestore query for the collection eg: add a '.where()' function or '.limit()'. The returned Query object will be used to get or watch data|
|mutate|function|false||Exposes a function to mutate the data that is fetched from firestore. The mutated data will be returned as 'mutatedData'|
|onRecieve|function|false||Exposes a hook for when a collection is recieved. Provides access to the recieved data and mutated data|

## Return values

|param|type|description|
|-|-|-|
|data|Ref\<T \| T[] \| null>|The data returned from the collection as a reactive array or an ampty array if no data has been fetched yet
|loading|Ref\<boolean>|The loading state of the data fetch. Will be true when an async data fetch operation is happening. Works reactively as expected.
|recieved|Ref\<boolean>|A reactive boolean value to indicate if data has been recieved yet. Will be false as soon as data has been recieved and will stay false thereafter.
|pathReplaced|ComputedRef\<string>|A reactive string of the path with $variables replaced with the true variable value from the 'variables' input object
|mutatedData|Ref\<M \| null>| Reactive mutated data returned from the mutate() function. If no mutate function is passed, will be equal to 'data'. Will be null until initialised and 'recieved' === true
|firestoreRef|ComputedRef\<CollectionRef \| Docref>|A reactive computed prop that returns the firestore collection reference query
|firestoreQuery|ComputedRef\<Query>|A reactive computed prop that returns the firestore Query if the 'query' input function is used, else it will be null
|updateDoc|(updates: Partial\<T>) => Promise\<void>|Exposes a method for updating the doc via the current firestore DocumentReference. Uses the firestore().doc(pathReplaced).set() function with the { merge: true } options. This way, it can be used to set a new doc as well as update an existing
|deleteDoc|() => Promise\<void>|Exposes a method for deleting the doc via the current firestore DocumentReference - firestore().doc(pathReplaced).delete()
|watchData|() => void|Exposes a function to initiate a firestore document/collection listener via the onSnapshot method.
|stopWatchData|() => void|Exposes a function for tearing down a firestore onSnapshot listener. Will be called on the onUnmounted hook of this component regardless of the manual mode setting.
|getData|() => Promise\<{ data: T; mutatedData: M \| null }>|getData provides a function for getting data from firestore. firestore().doc(${path}).get

## Examples

All of the examples below are within the context of the Vue composition api `setup()` function. eg:

```ts
import * as firebase from 'firebase'
import { defineComponent, ref } from '@vue/composition-api'
import { FirestoreBind } from 'vue-3-firestore'
export default defineComponent({
  setup() {
    // code examples
  }
})
```

This will save these docs from having a load of boiler 😅

### Get Doc (without variables)

```ts
const { data, loading } = FirestoreBind(firebase, {
  type: 'get',
  queryType: 'doc',
  path: 'collection/doc'
})
return { data, loading  }
```

### Get Doc

```ts
const uid = ref('1')
const { data, loading  } = FirestoreBind(firebase, {
  type: 'get',
  queryType: 'doc',
  path: 'collection/$id',
  variables: {
    id: uid
  }
})

return { data, loading  }
```

### Get Collection (without variables)

```ts
const { data, loading  } = FirestoreBind(firebase, {
  type: 'get',
  queryType: 'collection',
  path: 'collection/doc/subCollection'
})

return { data, loading  }
```

### Get Collection

```ts
const uid = ref('1')
const { data, loading  } = FirestoreBind(firebase, {
  type: 'get',
  queryType: 'collection',
  path: 'collection/$id/subCollection',
  variables: {
    id: uid
  }
})

return { data, loading  }
```

### Watch Doc

```ts
const uid = ref('1')
const { data, loading  } = FirestoreBind(firebase, {
  type: 'watch',
  queryType: 'doc',
  path: 'collection/$id',
  variables: {
    id: uid
  }
})

return { data, loading  }
```

### Watch Collection

```ts
const uid = ref('1')
const { data, loading  } = FirestoreBind(firebase, {
  type: 'watch',
  queryType: 'collection',
  path: 'collection/$id/subCollection',
  variables: {
    id: uid
  }
})

return { data, loading  }
```

### With Typesctipt

```ts
interface UserType {
  firstName: string
  lastName: string
}

const uid = ref('1')
const { data: user, loading } = FirestoreBind<UserType>(firebase, {
  queryType: 'doc',
  type: 'watch',
  path: 'users/$uid',
  variables: {
    uid
  }
})

const fullName = computed(() => {
  return `${user.value?.firstName} ${user.value?.lastName}`
})

return { user, loading }
```

### With Typesctipt and Mutation of incoming data

```ts
interface UserType {
  firstName: string
  lastName: string
}
type fullName = string

const uid = ref('1')
const { mutatedData, loading } = FirestoreBind<UserType, fullName>(firebase, {
  queryType: 'doc',
  type: 'watch',
  path: 'users/$uid',
  variables: {
    uid
  },
  mutate(data) {
    const { firstName, lastName } = data
    return `${firstName} ${lastName}`
  }
})

return { fullName: mutatedData, loading }
```

### Manual mode get

```ts
interface UserType {
  firstName: string
  lastName: string
}

const uid = ref('1')
const { data: user, loading, getData } = FirestoreBind<UserType>(firebase, {
  queryType: 'doc',
  type: 'get',
  path: 'users/$uid',
  variables: {
    uid
  },
  manual: true
})

const changeUserAndGetData = async(userId: string) => {
  uid.value = userId
  const newData = await getData()
  console.log(newData) // same as user.value
}

onMounted(() => {
  getData()
})

return { user, loading, changeUserAndGetData }
```

### Manual mode watch

```ts
interface UserType {
  firstName: string
  lastName: string
}

const uid = ref('1')
const { data: user, loading, watchData, stopWatchData } = FirestoreBind<UserType>(firebase, {
  queryType: 'doc',
  type: 'watch',
  path: 'users/$uid',
  variables: {
    uid
  },
  manual: true
})

const changeUserAndWatchData = async(userId: string) => {
  stopWatchData()
  uid.value = userId
  watchData()
}

return { user, loading, changeUserAndWatchData }
```

### Update and Delete helpers

```ts
interface UserType {
  firstName: string
  lastName: string
}

const uid = ref('1')
const { data: user, loading, updateDoc, deleteDoc } = FirestoreBind<UserType>(firebase, {
  queryType: 'doc',
  type: 'watch',
  path: 'users/$uid',
  variables: {
    uid
  }
})

const updatingUser = ref(false)
const updateUser = async (updates: Partial<UserType>) => {
  try {
    updatingUser.value = true
    await updateDoc(updates)
    updatingUser.value = false
  } catch (e) {
    updatingUser.value = false
    console.error(e)
  }
}

const deletingUser = ref(false)
const deleteUser = async (updates: Partial<UserType>) => {
  try {
    deletingUser.value = true
    await deleteDoc()
    deletingUser.value = false
  } catch (e) {
    deletingUser.value = false
    console.error(e)
  }
}

return { user, loading, updateUser, deleteUser }
```

### Extending a query (order, where, limit)
```ts
interface UserType {
  firstName: string
  lastName: string
}

const { data: activeUsers, loading } = FirestoreBind<UserType>(firebase, {
  queryType: 'collection',
  type: 'watch',
  path: 'users',
  query(collectionRef) {
    return collectionRef.where('status', '==', 'active').orderBy('lastName').limit(1)
  }
})

return { activeUsers, loading }
```

## Roadmap

- Make into vue plugin and inject into `SetupContext`
