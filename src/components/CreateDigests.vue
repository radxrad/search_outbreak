<template>
  <b-container >
    <b-row><h2>Create a Digest</h2></b-row>
    <b-form>
      <b-form-group label="Title" label-for="digestTitle" label-align="left">
        <b-form-input id="digestTitle" v-model="form.digestTitle" placeholder="Title"></b-form-input>
      </b-form-group>
      <b-form-group label="Digest Creator" label-for="digestCreator"  label-align="left">
        <b-form-input id="digestCreator" v-model="form.digestCreator" placeholder="Your email address"></b-form-input>
      </b-form-group>
      <b-row>

          <span class="mx-2">Select Topics:</span> <span>  These topics are expanded to multiple keywords</span>
          <div class="h3">  <b-badge :variant="form.digestQueryTopics.length === 0?  'primary':'secondary' " @click="selectTopic('All',$event)">
          None
        </b-badge>
          <b-badge class="m-1" :variant="form.digestQueryTopics.find(a => a.get('Title')== t.get('Title') )?  'primary':'secondary' "
                   @click="selectTopic(t.get('Title'),$event)" v-for=" t in topics.filter( a => a.get('Group') === undefined ) " v-bind:key="t.get('Name')">{{ t.get('Name') }}
          </b-badge>
        </div>
      </b-row>


      <b-form-input v-model="form.digestQueryTopics" hidden></b-form-input>
      <b-form-input v-model="form.digestDateSelector" hidden></b-form-input>

      <b-form-group label="Additional Terms" label-for="digestQuery"  label-align="left">
        <b-form-input id="digestQuery" v-model="form.digestQueryString" placeholder="Additional Terms"
        v-on:change="updateUserQuery"></b-form-input>
      </b-form-group>
<b-form-group>
  <b-form-input v-model="form.query" hidden></b-form-input>
  <b-button type="submit" variant="primary" v-on:click="onSubmit">Create New Digest</b-button>
  <b-button type="reset" variant="danger" v-on:click="onReset">Reset</b-button>
</b-form-group>

    </b-form>
    <b-row>
      <div class="h2">Example Results</div>
    </b-row>
    <b-container fluid>
      <b-overlay :show="searchIsActive" rounded="sm">
        <b-row><span class="mx-2 font-weight-bold">Topics</span> {{ topicsAsText }} </b-row>

        <b-row><span class="mx-2 font-weight-bold">Showing:</span>{{ recordCount }} of {{ queryResultsCount }}</b-row>
        <b-card-group columns>
          <b-card v-for="r in records" v-bind:key="r._id">
            <b-card-header>
              <b-button>+1</b-button>
              <b-card-title>{{ r.title }}</b-card-title>
              <b-card-sub-title>{{ r.author }}</b-card-sub-title>
              <b-card-sub-title>{{ r.journal }}</b-card-sub-title>

            </b-card-header>


            <b-card-body>
              <b-card-text>{{ r.description }}</b-card-text>


            </b-card-body>
            <b-card-footer>
              <b-badge class="m-1" v-for="p in r.pubtype" v-bind:key="p">{{ p }}</b-badge>
              <b-card-sub-title>{{ r.datePublished }}</b-card-sub-title>
              <b-link :href="r.url">{{ r.url }}</b-link>
            </b-card-footer>
          </b-card>
        </b-card-group>
      </b-overlay>
      <b-alert
          v-model="showError"
          class="position-fixed fixed-bottom m-0 rounded-0"
          style="z-index: 2000;"
          variant="warning"
          dismissible
      >{{searchError}}</b-alert>
    </b-container>
  </b-container>
</template>

<script>
import date from "date-and-time";
import ds from "../datasources";
const axios = require('axios')
var striptags = require('striptags');
const jp = require('jsonpath')

export default {
  name: "CreateDigests",

data() {
  return {
    form: {
      digestTitle: "",
      digestCreator: "",
      digestQueryTopics: [],
      digestDateSelector:"One week",
      digestQueryString:"",
      query: "",
      digestArticles: []
    },
    records: [],
    recordCount: 0,
    queryResultsCount: 0,
    searchIsActive: false,
    searchError: undefined,
    showError: false,
    activeQueryTopics: [],
    activeQueryString: "",

    activeDateSelector: "One week",
    ActivePublicationType: "Journal Article",
    alwaysUse: '( (COVID || coronavirus || SARS-COV2) AND @type:Publication )',

    dateSelectors: [
      //  {title: 'One day', query: `( date:>${date.format(date.addDays(new Date(), -1), 'YYYY-MM-DD' )})`},
      {title: 'One week', query: `( date:>${date.format(date.addDays(new Date(), -7), 'YYYY-MM-DD' )})`},
      {title: 'Two weeks', query: `( date:>${date.format(date.addDays(new Date(), -14), 'YYYY-MM-DD' )})`},
      {title: 'One month', query: `( date:>${date.format(date.addMonths(new Date(), -1), 'YYYY-MM-DD' )})`},
      {title: 'Three months', query: `( date:>${date.format(date.addMonths(new Date(), -3), 'YYYY-MM-DD' )})`},
      {title: 'Six months', query: `( date:>${date.format(date.addMonths(new Date(), -6), 'YYYY-MM-DD' )})`},

    ],
    //publicationType
    publicationSelectors: [
      //  {title: 'One day', query: `( date:>${date.format(date.addDays(new Date(), -1), 'YYYY-MM-DD' )})`},
      {title: 'Journal Article', query: `( publicationType:"Journal Article")`},
      {title: 'PrePrint', query:  `( publicationType:"Journal Article")`},
      {title: 'Review', query:  `( publicationType:"Review")`},
      {title: 'Clinical Study', query:  `( publicationType:"Clinical Study")`},
      {title: 'All', query:  `( publicationType:*)`},

    ],
    PreferedPublicationSelectors: [
      //  {title: 'One day', query: `( date:>${date.format(date.addDays(new Date(), -1), 'YYYY-MM-DD' )})`},
      {title: 'Clin Infect Dis', query: `( "journalAbbreviation":"Clin Infect Dis")`},
      {title: 'Infect Dis Now', query:  `( "journalAbbreviation":"Infect Dis Now")`},
      {title: 'Any', query:  `( "journalAbbreviation":*)`},

    ],
    topics: [],
    digests: [],

  }
},
  mounted() {
    ds.getTopics().then( (t) =>
    {
      this.topics = t
      this.activeQueryTopics = []
      let q = this.createQueryString()
      console.log(q)
      this.queryOutbreak(q)
    })
    ds.getDigests().then(
        d => {
          this.digests = d
        }
    )

  },
  computed: {
    topicsAsText() {
      let topicString = ''
      if (this.form.digestQueryString) {
        topicString = ` UserQuery: ${this.form.digestQueryString}`
      }
      if (this.form.digestQueryTopics.length === 0) {
        //return this.topics.map(t => t.get('Name')).join(' OR ')

        return topicString
      } else {
        topicString = this.form.digestQueryTopics.map(t => t.get('Name')).join(' AND ') + topicString
        return topicString
      }
    },

  },
  methods: {
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
    onReset(event) {
      console.log(event)
     // event.preventDefault()
      // Reset our form values
      this.form.digestTitle = ''
      this.form.digestCreator = ''
      this.form.digestQueryTopics = ''
      this.form.digestQueryTopics = []
      this.form.digestQueryString =''
      // Trick to reset/clear native browser form validation state
      this.show = false
      this.queryOutbreak(this.createQueryString)
      this.$nextTick(() => {

        this.show = true
      })
    },
    updateUserQuery(event){
      console.log(event)
      this.queryOutbreak(this.createQueryString())
    },
    selectTopic(item, event) {
      console.log(event)
      if (item === 'None') {
        this.form.digestQueryTopics = []
        this.queryOutbreak(this.createQueryString())
      } else {
        if (this.form.digestQueryTopics.find(t => t.get('Name') === item)) {
          this.form.digestQueryTopics = this.form.digestQueryTopics.filter(t => t.get('Name') !== item)
        } else {
          this.form.digestQueryTopics.push(this.topics.find(t => t.get('Name') === item))
        }

        this.queryOutbreak(this.createQueryString())
      }
    },
    selectDate(item, event) {
      console.log(event)
      this.activeDateSelector = item
      this.queryOutbreak(this.createQueryString())
    }
    ,
    selectPublicationb(item, event) {
      console.log(event)
      if (item === 'None') {
        this.form.PreferedPublicationSelectors = []
        this.queryOutbreak(this.createQueryString())
      } else {
        if (this.form.PreferedPublicationSelectors.find(t => t.get('Title') === item)) {
          this.form.PreferedPublicationSelectors = this.form.v.filter(t => t.get('Title') !== item)
        } else {
          this.form.PreferedPublicationSelectors.push(this.topics.find(t => t.get('Title') === item))
        }

        this.queryOutbreak(this.createQueryString())
      }
    },
    // createQueryString() {
    //   var qs = ""
    //   if (this.activeQueryTopics.length === 0) {
    //     qs = this.topicList.map(t => t.query).join(' OR ') + ' AND ' + this.alwaysUse
    //   } else {
    //     qs = this.activeQueryTopics.map(t => t.query).join(' AND ') + ' AND ' + this.alwaysUse
    //   }
    //   if (this.activeDateSelector !=='All' ){
    //     var dateQuery = this.dateSelectors.find(t => t.title === this.activeDateSelector)
    //     qs = `${dateQuery.query} AND ( ${qs} )`
    //   }
    //   return qs
    // },
    createBaseQueryString() {
      var qs = ""
      var digestQuery = this.form.digestQueryString == "" ? '' :` AND ( ${this.form.digestQueryString} )`

      if (this.form.digestQueryTopics.length === 0) {
        qs =  this.alwaysUse +  digestQuery
        // qs = this.topics.map(t => t.get('OutbreakQuery')).join(' OR ') + ' AND ' + this.alwaysUse
      } else {
        qs = this.form.digestQueryTopics.map(t => t.get('OutbreakQuery')).join(' AND ') + ' AND ' + this.alwaysUse+ digestQuery
      }
      this.form.query= qs // we want to store sans data
      return qs
    },
    createQueryString() {
      var qs = ""
      // var digestQuery = this.form.digestQueryString == "" ? '' :` AND ( ${this.form.digestQueryString} )`
      //
      // if (this.form.digestQueryTopics.length === 0) {
      //   qs =  this.alwaysUse +  digestQuery
      //   // qs = this.topics.map(t => t.get('OutbreakQuery')).join(' OR ') + ' AND ' + this.alwaysUse
      // } else {
      //   qs = this.form.digestQueryTopics.map(t => t.get('OutbreakQuery')).join(' AND ') + ' AND ' + this.alwaysUse+ digestQuery
      // }
      qs = this.createBaseQueryString()
      if (this.activeDateSelector !=='All' ){
        var dateQuery = this.dateSelectors.find(t => t.title === this.activeDateSelector)
        qs = `${dateQuery.query} AND ( ${qs} )`
      }
      //this.form.query= qs // we want to store sans data
      return qs
    },
    queryOutbreak(queryString, size = 200, baseurl = 'https://api.outbreak.info/resources/Publications/query') {
      var self = this;
      self.searchIsActive = true;
      self.records = []
      const options = {
        method: 'GET',
        url: baseurl,
        params: {q: queryString, size: size, sort_by: 'relevancy'},

      };


      return axios.request(options).then(
          // response => (console.log(response))
          async function (response) {
            let articles = response.data.hits;
            self.records = []
            self.recordCount = response.data.hits.length;
            self.queryResultsCount = response.data.total;
            self.searchIsActive = false;
            articles.forEach((r) => {
              let originalJson = r
              let id = jp.query(r, '$._id', 1)
              let title = jp.query(r, '$.name', 1)
              if (title.length === 1) {
                title = striptags(title[0])
              }
              let description = jp.query(r, '$.abstract', 1)
              if (description.length === 1) {
                description = striptags(description[0])
              }
              let authors = jp.query(r, '$.author[*].name', 3)
              let journal = jp.query(r, '$.journalName', 1)
              let pubtype = jp.query(r, '$.publicationType[*]',)
              let pubDate = jp.query(r, '$.datePublished',)
              let created = jp.query(r, '$.dateCreated',)
              let curationDate = jp.query(r, '$.curatedBy.curationDate',)
              let url = jp.query(r, '$.url')
              self.records.push({
                title: title,
                id: id[0],
                description: description,
                url: url[0],
                author: authors.join(', '),
                journal: journal[0],
                pubtype: pubtype,
                datePublished: pubDate,
                dateCreated: created,
                curationDate: curationDate,
                originalJson:originalJson,
              })
            })


          }).catch( err =>{
        self.searchIsActive = false;
        console.log('search error: ' + err)
        self.records = [] // bad
        this.searchError = 'Error happened: ' + err;
        this.showError = true;
      })
    },

  }
}
</script>

<style scoped>

</style>
