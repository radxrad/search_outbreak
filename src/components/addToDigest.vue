<template>
<div>
  <b-dropdown split
              split-variant="outline-primary"
              variant="primary"
              text="Add to Digest"
              class="m-2" >
      <b-dropdown-item href="#" v-for="d in digests" v-bind:key="d.get('_id')" >{{d.get('Name')}}</b-dropdown-item>
  </b-dropdown>
</div>
</template>

<script>

export default {
  name: "addToDigest",
  props: {
    outbreakId:String,
    digests:Array
  },

  created(){

  }
}
</script>

<style scoped>

</style>
