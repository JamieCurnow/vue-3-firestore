# firestore-vue-3
An easy way to interactive with Firestore using vue 3 and the composition-api

## Get started:
`yarn add firestore-vue-3`

### in your .vue file:

```ts
<template lang="html">
  <p>{{ data }}</p>
</template>

<script lang="ts">
import * as firebase from 'firebase'
import { defineComponent, ref } from '@vue/composition-api'
import { FirestoreBind } from '../../firestore-vue-3'
export default defineComponent({
  setup() {
    const uid = ref('1')

    const { data } = FirestoreBind(firebase, {
      queryType: 'doc',
      type: 'watch',
      path: 'some/collection/$uid',
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

# Options:
| param          | type     | required? | default       | description                                                                                                                                                                                                                                       |
|----------------|----------|-----------|---------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| queryType      | string   | true      |               | The type of this query - 'collection' or 'doc'                                                                                                                                                                                                    |
| type           | string   | true      |               | The type of the get function - 'watch' or 'get'. 'get' does a single get() from firestore \| 'watch' watches for document or collection changes and updates the data recieved                                                                     |
| path           | string   | true      |               | Path to the document or collection in firestore. Use $variableName to insert reactive variable data into the path. If the path includes variables, the options object must include a 'variables' key                                              |
| variables      | Object   | false     |               | Variables that should be used to construct the path to the document or collection in firestore. If a variable changes the path, data will be re-fetched. Variable values should be a vue ref. Variable keys should match those in the path string |
| debounce       | number   | false     | 200           | The debounce amount in milliseconds that should be waited between a path change and getting the data from firestore. Useful to change if a variable is bound to a text input. Defaults to 200                                                     |
| initialLoading | boolean  | false     | true          | The initial state of the loading return value. Defaults to true. Setting to false could be helpful in manual mode                                                                                                                                 |
| manual         | boolean  | false     | false         | When in manual mode, data will not automatically be fetched or watched initially or on path change. It will be up to you to call the getData or watchData function.                                                                               |
| onError        | function | false     | console.error | Exposes a function to customise error handling. Defaults to console.error(e)                                                                                                                                                                      |
|                |          |           |               |                                                                                                                                                                                                                                                   |
| query          | function | false     |               | Exposes a function to extend the firestore query for the collection eg: add a '.where()' function or '.limit()'. The returned Query object will be used to get or watch data                                                                      |
| mutate         | function | false     |               | Exposes a function to mutate the data that is fetched from firestore. The mutated data will be returned as 'mutatedData'                                                                                                                          |
| onRecieve      | function | false     |               | Exposes a hook for when a collection is recieved. Provides access to the recieved data and mutated data                                                                                                                                           |

# Examples:
// TODO
