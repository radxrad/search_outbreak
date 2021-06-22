<template>
  <div>
    <b-dropdown split
                split-variant="outline-primary"
                variant="primary"
                text="Add All Records to a Digest"
                class="m-2">
      <b-dropdown-item href="#" v-for="d in digests" v-bind:key="d.getId()"
                       @click="addRecordsToDigest(d.getId(),records )">{{ d.get('Name') }}
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import axios from "axios";
import jp from "jsonpath";

export default {
  name: "addToDigest",
  props: {
    records: Array,
    digests: Array
  },

  created() {

  },
  methods: {

    addRecordsToDigest(digestId, records) {
      let limitedrecords =records.slice(0,20)

      limitedrecords.forEach( r => {
        const newsRecord = this.articlesToRecords([r.originalJson])
        const options = {
          method: 'POST',
          url: '/.netlify/functions/addToDigest',
          data: JSON.stringify({digestId: digestId, newsItem: newsRecord[0]}),
          headers: {
            'Content-type': 'application/json; charset=UTF-8'
          }
        };
        axios.request(options).then(() => true).catch((err) => console.log(err))
      })

    },
    articlesToRecords(articles) {
      let records = [];
      var i;
      for (i = 0; i < articles.length; i++) {
        var item = articles[i];
        // let slug = item.name.toLocaleLowerCase('en-US').replaceAll(" ", "-")
        //     .replaceAll("'", "").replaceAll(",", "")
        //     .replaceAll('.', '_').replaceAll(':', "__");
        var keywords = item.keywords ? item.keywords.join(' | ') : ""
        var author = 'Outbreak'
        var authors = jp.query(item, '$..author[*].name');
        if (authors && authors.length < 4) {
          author = authors.join(', ')
        } else {
          author = authors[0] + ', et al.'
        }
        let fields = {
          fields: {
            //name: "outbreak-"+item._id,
            Abstract: item.abstract,
            Title: item.name,
            //status: "Published",
            Date: item.datePublished,
            slug: "outbreak-" + item._id,
            Author: author,
            Journal: item.journalAbbreviation,
            Source: item.url,

            'Source type': item.publicationType ? this.publicationTypeToSourceType(item.publicationType[0]) : "Other",
            keywords: keywords


          }
        }
        records.push(fields);
      }
      return records
    },
    publicationTypeToSourceType(pubtype) {
      if (pubtype === 'Preprint') return 'Preprints'
      if (pubtype === 'Journal Article') return 'Peer reviewed pubs'
      return 'Other'
    }

  }


}
</script>

<style scoped>

</style>
