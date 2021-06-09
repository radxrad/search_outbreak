<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/radx-labcore.svg">
    <topics />
  </div>
</template>

<script>

import topics from './components/topics.vue'

export default {
  name: 'App',
  components: {
    topics
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
