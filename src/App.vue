<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/radx-labcore.svg">
    <div>Prototyping</div>
    <b-tabs content-class="mt-3">
      <b-tab title="Create Digests" active><create-digests></create-digests></b-tab>
      <b-tab title="News Selection"><topics /></b-tab>
      <b-tab title="Add to Curated"><add-by-doi /></b-tab>
      <b-tab title="Disabled" disabled><p>I'm a disabled tab!</p></b-tab>
    </b-tabs>

  </div>
</template>

<script>

import topics from './components/topics.vue'
import CreateDigests from "./components/CreateDigests";
import addByDoi from "./components/addByDoi";

export default {
  name: 'App',
  components: {
    topics,
    CreateDigests,
    addByDoi
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
