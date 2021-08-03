/* eslint-disable no-unused-vars */
require('dotenv').config()
var _ = require('lodash')
var dateformat = require('dateformat')
const Airtable = require("airtable");
var {URL} = process.env
// eslint-disable-next-line no-unused-vars
exports.handler = async function (event, context) {
    const associatedNewsField = 'Network'
    const Airtable = require('airtable')
    const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
    const {digestId, newsItem} = JSON.parse(event.body)
    // functions for serverless functions
    const addNewsToNetworkResearcher = async function (associatedId, NewsRecord) {

        console.log("Researcher:" + NewsRecord.toString())
        let table = base("Digests")
        //console.log( await table.select().all())
        console.log("Researcher:" + associatedId)
        return table.find(`${associatedId}`, function (err, associated) {

                if (err) {
                    console.error(err);
                    Promise.reject(err);
                }
                console.log("associated from find: " + associated)
                if (associated) {
                    // console.log("associated news recs:" + associated.get('News').join(','))
                    let news = []
                    try {
                        news = associated.get('News')
                    } catch (ex) {
                        news = []
                    }
                    if (news === undefined) {
                        news = []
                    }
                    news.push(NewsRecord.getId())
                    console.log('news all ' + news.join(','))
                    news = _.uniq(news)
                    console.log('news unique ' + news.join(','))
                    var now = new Date();
                    let dateUpdated = dateformat(now, "isoDate")
                    table.update(associated.getId(),
                        {
                            "News": news,
                            "Date updated": dateUpdated

                        },
                        function (err, arecord) {
                            if (err) {
                                console.error(err)
                                Promise.reject(err);
                            }
                            // console.log('associated record ' + arecord.toString())
                            Promise.resolve(true)
                        }
                    );
                }
            }
        )

    }
    const updateOrInsert = function (record, digestId) {
        return new Promise((resolve, reject) => {
            let theRecord = record
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
                        if (r.fields[associatedNewsField] !== undefined && Array.isArray(r.fields[associatedNewsField])){
                            r.fields[associatedNewsField].push( digestId)
                        } else {
                            r.fields[associatedNewsField] = [ digestId]
                        }
                        console.log("Retrieved", r.get("name"));
                        Object.assign(r.fields, theRecord.fields)
                        theRecord.fields = _.omit(r.fields, ["Name"])
                        table.update(r.id, theRecord.fields,{typecast: true},
                            //table.replace(r.id, record.fields, {typecast: true},
                            // table.replace(r.id, r.fields,{typecast: true},
                            function (err, arecord) {
                                if (err) {
                                    console.error(err);
                                    reject(err);

                                }
                                // arecord.forEach(function (record) {
                                //     console.log(record.getId());
                                // });
                                console.log(arecord.getId());
                                resolve(arecord)
                            }
                        );
                    });

                    if (!records.length) {
                        console.log("empty");
                        record.fields[associatedNewsField] = [ digestId]
                        table.create(record.fields, {typecast: true},
                            function (err, arecord) {
                                if (err) {
                                    console.error(err);
                                    reject(err);

                                }
                                // arecord.forEach(function (record) {
                                //     console.log(record.getId());
                                // });
                                console.log(arecord.getId());
                                resolve(arecord)
                            }
                        );
                    }
                });
        })
    }
    console.log("NewsItem: " + newsItem)
    if (Array.isArray(newsItem)) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                result: false,
                error: "should be a single item"
            })
        }
    }
    console.log("slug: " + newsItem.fields.slug)
    // const existingNewsItem = await base('News').select({filterByFormula: `{slug} = '${newsItem.fields.slug}'`}).all()
    // console.log("isExisting:", existingNewsItem)
    // if (existingNewsItem.length > 0){
    //     addNewsToDigest
    // }
    //await updateOrInsert(newsItem).then(
    return updateOrInsert(newsItem, digestId).then(
        recWithId => { console.log( recWithId)

            return {
                statusCode: 200,
                body: JSON.stringify({
                    result: true
                })
            }
        }
        // (recWithId => {
        //     //console.log(await recWithId)
        //     let success = false
        //     // if (existingNewsItem.length > 0) {
        //     //     success = await this.addNewsToDigest(digestId, existingNewsItem[0])
        //     // } else {
        //     //     success = await this.addNewsToDigest(digestId, recWithId)
        //     // }
        //     return addNewsToDigest(digestId, recWithId).then(e => {
        //         return {
        //             statusCode: 200,
        //             body: JSON.stringify({
        //                 result: true
        //             })
        //         }
        //     }).catch(e => {
        //         return {
        //             statusCode: 500,
        //             body: JSON.stringify({
        //                 result: false
        //             })
        //         }
        //     })
        // })
    ).catch((err) => {
        console.error(err)
        return {
            statusCode: 500,
            body: JSON.stringify({
                result: false
            })
        }
    })


}


