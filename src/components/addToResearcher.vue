<template>
  <b-container fluid>
    <b-button v-on:click="onSubmit">Add Latest to Researchers</b-button>
  </b-container>
</template>

<script>
import axios from "axios";

export default {
  name: "addToResearcher",
  data(){
    return {
      researchers: [],
      selected:""
     }
  },
  methods:{
    onSubmit(event) {
      event.preventDefault()
      //alert(JSON.stringify(this.form))
      console.log(JSON.stringify(this.form))
      const options = {
        method: 'POST',
        url: '/.netlify/functions/createDigest',
        data: JSON.stringify({form: this.form}),
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      };
      axios.request(options).then(() => true).catch((err) => console.log(err))
    },
  }
}
</script>

<style scoped>

</style>
