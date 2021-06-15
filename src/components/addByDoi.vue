<template>
  <div>
    <img src="images/logo.svg">
    <b-alert variant="success" dismissible
             :show=" dismissCountDown"
             @dismissed="dismissCountDown=0"
             @dismiss-count-down="countDownChanged"
    > DOI Added

    </b-alert>
    <b-form id="doiform" @submit.prevent="onSubmit" @reset="onReset" v-if="show">
      <b-form-group
          id="input-group-1"
          label="DOI:"
          label-for="input-1"
          description="DOI, https://doi.org/... "
      >
        <b-form-input
            id="input-1"
            v-model="form.doi"
            type="url"
            placeholder="enter DOI"
            required
        ></b-form-input>
      </b-form-group>
      <b-form-group id="input-group-4" v-slot="{ ariaDescribedby }">
        <b-form-checkbox-group
            id="checkbox-group-1"
            v-model="form.tags"
            :options="options"
            :aria-describedby="ariaDescribedby"
            name="flavour-1"
        ></b-form-checkbox-group>
      </b-form-group>
      <b-form-group label="Tagged input using select" label-for="tags-component-select">
        <!-- Prop `add-on-change` is needed to enable adding tags vie the `change` event -->
        <b-form-tags
            id="tags-component-select"
            v-model="form.tags"
            size="lg"
            class="mb-2"
            add-on-change
            no-outer-focus
        >
          <template v-slot="{ tags, inputAttrs, inputHandlers, disabled, removeTag }">
            <ul v-if="tags.length > 0" class="list-inline d-inline-block mb-2">
              <li v-for="tag in tags" :key="tag" class="list-inline-item">
                <b-form-tag
                    @remove="removeTag(tag)"
                    :title="tag"
                    :disabled="disabled"
                    variant="info"
                >{{ tag }}</b-form-tag>
              </li>
            </ul>
            <b-form-select
                v-bind="inputAttrs"
                v-on="inputHandlers"
                :disabled="disabled || availableOptions.length === 0"
                :options="availableOptions"
            >
              <template #first>
                <!-- This is required to prevent bugs with Safari -->
                <option disabled value="">Choose a tag...</option>
              </template>
            </b-form-select>
          </template>
        </b-form-tags>
      </b-form-group>
      <b-button v-if="!showMetadata" type="submit" variant="primary" id="btn-addNewsItem">Submit</b-button>
      <b-button v-if="!showMetadata" type="reset" variant="danger">Reset</b-button>
      <div v-if="showMetadata">
        <b-form-input readonly id="date" v-model="form.citation" placeholder="Citation from DOI.org"></b-form-input>
        <b-form-input readonly id="date" v-model="form.date" placeholder="Date"></b-form-input>

        <b-form-input readonly id="title" v-model="form.title" placeholder="Title from metadata"></b-form-input>

        <b-form-textarea
            id="summary"
            v-model="form.summary"
            placeholder="No abstract or failed summarization..."
            rows="3"
            max-rows="6"
        ></b-form-textarea>
        <b-button variant="success" @click="onAddDoi">Submit Information</b-button>
        <b-button variant="danger" @click="onReset">Reset</b-button>
      </div>
    </b-form>


  </div>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'

export default {
  name: "addDoi",
  data() {
    return {
      form: {
        doi: '',
        title: '',
        content:'',
        source:'',
        slug:'',
        date:'',
        tags:[],
        citation:''
      },
      options: [
        { text: 'RadX', value: 'RadX' },
        { text: 'General', value: 'General' },
        { text: 'Data', value: 'Data' },
        { text: 'Diagnostic', value: 'Diagnostic' }
      ],
      // tags: [
      //   'RadX' ,'General' ,'Data' , 'Diagnostic'
      // ],
      show: true,
      showMetadata: false,
      dismissSecs: 10,
      dismissCountDown: 0,
    }
  },computed: {
    availableOptions() {
      return this.options.filter(opt => this.form.tags.indexOf(opt) === -1)
    }
  },
  methods: {

    countDownChanged(dismissCountDown) {
      this.dismissCountDown = dismissCountDown
    },
    showAlert() {
      this.dismissCountDown = this.dismissSecs
    },
    onSubmit: function () {
      //let f = document.getElementById('doiform')
      //var bodyFormData = new FormData(f);
      console.log('onsubmit')
      let getBiblo = `http://localhost:3000/getDoiCitation`
      let addurl = `http://localhost:3000/getDoiMetadata`
      axios.post(getBiblo, this.form).then((res) => {
        console.log('doi citation returned')
        if (!_.isEmpty(res.data)) {

          this.form.citation = res.data

          this.showMetadata = true;
        }
      }).catch(function (error) {
        console.log(error)
      })

      axios.post(addurl, this.form).then((res) => {
        console.log('doi form returned')
        if (! _.isEmpty(res.data )) {
          if (Array.isArray(res.data.title)) {
            this.form.title = res.data.title[0]
          } else {
            this.form.title = res.data.title
          }
          this.form.summary = res.data.summary
          this.form.date = res.data.date;
          this.showMetadata = true;
        }
      }).catch(function (error) {
        console.log(error)
      })

    },

    onReset(event) {
      event.preventDefault()
      // Reset our form values

      this.form.title = ''
      this.form.content = ''
      this.form.source = ''
      this.form.slug = ''
      this.form.date = ''
      this.form.tags=[],
          this.form.citation = ''
      // Trick to reset/clear native browser form validation state
      this.showMetadata = false
      this.$nextTick(() => {
        this.show = true
      })
    }
    ,
    onAddDoi: function () {
      //let f = document.getElementById('doiform')
      //var bodyFormData = new FormData(f);
      console.log('addDoi')
      let addurl = `http://localhost:3000/addNewsItem`
      axios.post(addurl, this.form).then((res) => {
        console.log('addedMetadata returned' + res)
        this.showAlert();

      }).catch(function (error) {
        console.log(error)
      })

    },

  }
}
</script>

<style scoped>

</style>
