/* eslint-disable no-unused-vars */
//import addToDigest from "../src/components/addToDigest";

require('dotenv').config()
var _ = require('lodash')
var dateformat = require('dateformat')
var axios = require('axios')
const jp = require('jsonpath')
var striptags = require('striptags');
const { URL } = process.env

// eslint-disable-next-line no-unused-vars
exports.handler = async function (event, context) {

    const Airtable = require('airtable')
    const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
    const {form} = JSON.parse(event.body)
    // functions for serverless functions
    const createDigestRecord =  function (form) {

        console.log("Form:" + form.toString())
        let table = base("Digests")
        //console.log( await table.select().all())
        let creator = form.digestCreator
        let digestTitle = form.digestTitle
        let topics = form.digestQueryTopics
        let digestDateSelector = form.digestDateSelector
        let digestQuery = form.digestQueryString
        let dateCreated = new Date('05 October 2011 14:48 UTC').toISOString().substring(0, 10)
        let query = form.query;

        let record =
            {
                fields: {

                    Title: digestTitle,
                    Published: true,
                    'Date updated': dateCreated,
                    Creator: creator,
                    AdditionalQuery: digestQuery,
                    Query:query,
                    DigestType: 'UserSpecified'


                }
            }

        return record

    }
    const updateOrInsertDigest = function (form) {
        return new Promise((resolve, reject) => {
            let record =  createDigestRecord(form)
            const primaryField = record.fields.Title;
            let table = base("Digests")
            table
                .select({
                    maxRecords: 1,
                    view: "Grid view",
                    filterByFormula: `{Title} = "${primaryField}"`,
                })
                .firstPage(function (err, records) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    records.forEach(function (r) {
                        console.log("Retrieved", r.get("name"));

                        table.replace(r.id, record.fields,
                            function (err, arecord) {
                                if (err) {
                                    console.error(err);
                                    reject(err);
                                }
                                // arecord.forEach(function (record) {
                                //     console.log(record.getId());
                                // });
                                resolve(arecord)
                            }
                        );
                    });

                    if (!records.length) {
                        console.log("empty");
                        table.create(record.fields,
                            function (err, arecord) {
                                if (err) {
                                    console.error(err);
                                    reject(err);
                                }
                                // arecord.forEach(function (record) {
                                //     console.log(record.getId());
                                // });
                                resolve(arecord)
                            }
                        );
                    }
                });
        })
    }
    const updateOrInsertNews = function (record) {
        return new Promise((resolve, reject) => {

            const primaryField = record.fields.slug;
            let table = base("News")
            table
                .select({
                    maxRecords: 1,
                    view: "Grid view",
                    filterByFormula: `{slug} = "${primaryField}"`,
                })
                .firstPage(function (err, records) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    }
                    records.forEach(function (r) {
                        console.log("Retrieved", r.get("name"));

                        table.replace(r.id, record.fields,
                            function (err, arecord) {
                                if (err) {
                                    console.error(err);
                                    reject(err);
                                }
                                // arecord.forEach(function (record) {
                                //     console.log(record.getId());
                                // });
                                resolve(arecord)
                            }
                        );
                    });

                    if (!records.length) {
                        console.log("empty");
                        table.create(record.fields,
                            function (err, arecord) {
                                if (err) {
                                    console.error(err);
                                    reject(err);
                                }
                                // arecord.forEach(function (record) {
                                //     console.log(record.getId());
                                // });
                                resolve(arecord)
                            }
                        );
                    }
                });
        })
    }
    console.log("Create Digest: " )
    updateOrInsertDigest(form).then( (digestRecord)=>{
        let hostUrl = URL;
       let size = 200
           let baseurl = 'https://api.outbreak.info/resources/resource/query'
            var self = this;
            self.searchIsActive = true;
            self.records = []
            const options = {
                method: 'GET',
                url: baseurl,
                params: {q: form.query, size: size, sort_by: 'relevancy'},

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
                        let id = jp.value(r, '$._id')
                        let title = jp.value(r, '$.name')
                        // if (title.length === 1) {
                        //     title = striptags(title[0])
                        // }
                        let description = jp.value(r, '$.abstract')
                        // if (description.length === 1) {
                        //     description = striptags(description[0])
                        // }
                        let authors = jp.query(r, '$.author[*].name', 3)
                        let journal = jp.value(r, '$.journalAbbreviation')
                        let pubtype = jp.value(r, '$.publicationType[*]')
                        let pubDate = jp.value(r, '$.datePublished')
                        let created = jp.value(r, '$.dateCreated')
                        let curationDate = jp.value(r, '$.curatedBy.curationDate')
                        let url = jp.value(r, '$.url')
                        self.records.push({
                            fields: {
                                Title: title,
                                Abstract: description,
                                Source: url,
                                Author: authors.join(', '),
                                Journal: journal,
                                "Source type": pubtype,
                                Date: pubDate,

                                slug: "outbreak-" + id,
                            }
                        }
                        )

                    })
                    self.records.forEach((rec) =>
                    {
                        const options = {
                            method: 'POST',
                            url: `${hostUrl}/.netlify/functions/addToDigest`,
                            data: JSON.stringify({digestId: digestRecord.id, newsItem: rec}),
                            headers: {
                                'Content-type': 'application/json; charset=UTF-8'
                            }
                        };
                        axios.request(options).then(() => true).catch((err) => console.log(err))
                    }

                    )


                }).catch( err =>{
                console.log('search error: ' + err)
                self.records = [] // bad
                this.searchError = 'Error happened: ' + err;
                this.showError = true;
            })

    })


    return {
        statusCode: 200,
        body: JSON.stringify({
            result: true
        })
    }
}


