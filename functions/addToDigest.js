/* eslint-disable no-unused-vars */
require('dotenv').config()
var _ =require('lodash')
// eslint-disable-next-line no-unused-vars
exports.handler = async function (event, context) {

    const Airtable = require('airtable')
    const base = new Airtable({apiKey: process.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
    const {digestId, newsItem} = JSON.parse(event.body)

    console.log(newsItem)
    console.log("slug: " + newsItem.fields.slug)
    const existingNewsItem = await base('News').select({filterByFormula: `{slug} = '${newsItem.fields.slug}'`}).all()
    console.log("isExisting:", existingNewsItem)
    var recWithId= await this.updateOrInsert(newsItem)
    console.log(await recWithId)
    let success = false
    // if (existingNewsItem.length > 0) {
    //     success = await this.addNewsToDigest(digestId, existingNewsItem[0])
    // } else {
    //     success = await this.addNewsToDigest(digestId, recWithId)
    // }
    success = await this.addNewsToDigest(digestId, await recWithId)

    return {
        statusCode: 200,
        body: JSON.stringify({
            result: success
        })
    }
}

exports.addNewsToDigest = async function (digestId, NewsRecord) {

    const Airtable = require('airtable')

    const base = new Airtable({apiKey: process.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
    //let newsrecord = this.updateOrInsert(record)
    console.log("NewsRecord:"+NewsRecord )
    let table = base("Digests")
    //console.log( await table.select().all())
    console.log("digestid:" + digestId)
    return table.find(`${digestId}`, function(err, digest) {


            console.log("digest " + digest)
            if (digest) {
                console.log("digest news recs:" + digest.get('News').join(','))
                let news = digest.get('News')


                news.push(NewsRecord.getId())
                console.log('news all ' + news.join(','))
                news = _.uniq(news)
                console.log('news unique ' + news.join(','))
                table.update(
                    [{
                    "id":digest.getId(),
                    "fields": {
                        "News": news
                         }
                    }],
                    function (err, arecord) {
                        if (err) {
                            console.error(err);
                            Promise.reject(err);
                        }

                        Promise.resolve(true)
                    }
                );
            }
        }
    )

}
exports.updateOrInsert =  function (record) {
    return new Promise((resolve, reject) => {
        const Airtable = require('airtable')

        const base = new Airtable({apiKey: process.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)

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
