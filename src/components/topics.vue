<template>
  <b-container fluid>
    <b-row>
      <div class="h3">
        <span>Topics</span> <b-badge :variant="activeQueryTopics.length === 0?  'primary':'secondary' " @click="selectTopic('All',$event)">
        All
      </b-badge>
        <b-badge :variant="activeQueryTopics.find(a => a.get('Name')== t.get('Name') )?  'primary':'secondary' "
                 @click="selectTopic(t.get('Name'),$event)" v-for=" t in topics.filter( a => a.get('Group') === undefined ) " v-bind:key="t.get('Name')">{{ t.get('Name') }}
        </b-badge>
      </div>
    </b-row>
    <b-row>
      <div class="h3">
       <span>Date Limit</span> <b-badge :variant="activeDateSelector ==='All' ?  'primary':'secondary' " @click="selectDate('All',$event)">
          All
        </b-badge>
        <b-badge :variant="t.title === activeDateSelector?  'primary':'secondary' "
                 @click="selectDate(t.title,$event)" v-for=" t in dateSelectors" v-bind:key="t.title">{{ t.title }}
        </b-badge>
      </div>
    </b-row>
    <b-row>{{ topicsAsText }} Showing:{{ recordCount }} of {{ queryResultsCount }}</b-row>

    <b-card-group columns>
      <b-card v-for="r in records" v-bind:key="r._id">
        <b-card-header>
          <addToDigest :digests="digests" :outbreakId="r._id"></addToDigest>
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

  </b-container>


</template>

<script>
const axios = require('axios')
var striptags = require('striptags');
const jp = require('jsonpath')
import date from 'date-and-time';

import ds from '../datasources'

import addToDigest from "./addToDigest";


export default {
  name: "topics",
  components: {
    addToDigest
  },
  data() {
    return {
      records: [],
      recordCount: 0,
      queryResultsCount: 0,
      activeQueryTopics: [],
      activeQueryString: "",
      activeDateSelector: "All",
      alwaysUse: '( (COVID || coronavirus || SARS-COV2) AND @type:Publication )',

      dateSelectors: [
      //  {title: 'One day', query: `( date:>${date.format(date.addDays(new Date(), -1), 'YYYY-MM-DD' )})`},
        {title: 'One week', query: `( date:>${date.format(date.addDays(new Date(), -7), 'YYYY-MM-DD' )})`},
        {title: 'Two weeks', query: `( date:>${date.format(date.addDays(new Date(), -14), 'YYYY-MM-DD' )})`},
        {title: 'One month', query: `( date:>${date.format(date.addMonths(new Date(), -1), 'YYYY-MM-DD' )})`},
        {title: 'Three months', query: `( date:>${date.format(date.addMonths(new Date(), -3), 'YYYY-MM-DD' )})`},
        {title: 'Six months', query: `( date:>${date.format(date.addMonths(new Date(), -6), 'YYYY-MM-DD' )})`},

      ],
      topics: [],
      digests: []
    }
  },
 async created() {

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
      if (this.activeQueryTopics.length === 0) {
        return this.topics.map(t => t.get('Name')).join(' OR ')
      } else {
        return this.activeQueryTopics.map(t => t.get('Name')).join(' AND ')
      }
    },
  },
  methods: {
    // selectTopic(item, event) {
    //   console.log(event)
    //   if (item === 'All') {
    //     this.activeQueryTopics = []
    //     this.queryOutbreak(this.createQueryString())
    //   } else {
    //     if (this.activeQueryTopics.find(t => t.title === item)) {
    //       this.activeQueryTopics = this.activeQueryTopics.filter(t => t.title !== item)
    //     } else {
    //       this.activeQueryTopics.push(this.topicList.find(t => t.title === item))
    //     }
    //
    //     this.queryOutbreak(this.createQueryString())
    //   }
    // },
    selectTopic(item, event) {
      console.log(event)
      if (item === 'All') {
        this.activeQueryTopics = []
        this.queryOutbreak(this.createQueryString())
      } else {
        if (this.activeQueryTopics.find(t => t.get('Name') === item)) {
          this.activeQueryTopics = this.activeQueryTopics.filter(t => t.get('Name') !== item)
        } else {
          this.activeQueryTopics.push(this.topics.find(t => t.get('Name') === item))
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
    createQueryString() {
      var qs = ""
      if (this.activeQueryTopics.length === 0) {
        qs = this.topics.map(t => t.get('OutbreakQuery')).join(' OR ') + ' AND ' + this.alwaysUse
      } else {
        qs = this.activeQueryTopics.map(t => t.get('OutbreakQuery')).join(' AND ') + ' AND ' + this.alwaysUse
      }
      if (this.activeDateSelector !=='All' ){
        var dateQuery = this.dateSelectors.find(t => t.title === this.activeDateSelector)
        qs = `${dateQuery.query} AND ( ${qs} )`
      }
      return qs
    },
    queryOutbreak(queryString, size = 200, baseurl = 'https://api.outbreak.info/resources/resource/query') {
      var self = this;

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
            articles.forEach((r) => {
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
              })
            })


          })
    },

  }
}
</script>

<style scoped>

</style>
