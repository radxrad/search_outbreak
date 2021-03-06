/* eslint-disable no-unused-vars */
require('dotenv').config()
var _ = require('lodash')
var dateformat = require('dateformat')
// eslint-disable-next-line no-unused-vars
exports.handler = async function (event, context) {

    const Airtable = require('airtable')
    const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
    const {digestId, newsItem} = JSON.parse(event.body)
    // functions for serverless functions
    const updateCount = async function (NewsRecord) {

        console.log("NewsRecord:" + NewsRecord.toString())
        let table = base("Digests")
        //console.log( await table.select().all())
        console.log("digestid:" + digestId)
        return table.find(`${digestId}`, function (err, digest) {

                if (err){
                    console.error(err);
                    Promise.reject(err);
                }
                console.log("digest from find: " + digest)
                if (digest) {
                    // console.log("digest news recs:" + digest.get('News').join(','))
                    let news = []
                    try {
                        news = digest.get('News')
                    } catch (ex) {
                        news = []
                    }
                    if (news === undefined) { news = []}
                    news.push(NewsRecord.getId())
                    console.log('news all ' + news.join(','))
                    news = _.uniq(news)
                    console.log('news unique ' + news.join(','))
                    var now = new Date();
                    let dateUpdated = dateformat(now, "isoDate")
                    table.update(
                        [{
                            "id": digest.getId(),
                            "fields": {
                                "News": news,
                                "Date updated": dateUpdated
                            }
                        }],
                        function (err, arecord) {
                            if (err) {
                                console.error(err)
                            }
                            console.info('digest record ' + arecord[0].toString())
                            Promise.resolve(true)
                        }
                    );
                }
            }
        )

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
    const existingNewsItem = await base('News').select({filterByFormula: `{slug} = '${newsItem.fields.slug}'`}).all()
    console.log("isExisting:", existingNewsItem)
    var recWithId = await updateOrInsert(newsItem)
    //console.log(await recWithId)
    let success = false
    // if (existingNewsItem.length > 0) {
    //     success = await this.addNewsToDigest(digestId, existingNewsItem[0])
    // } else {
    //     success = await this.addNewsToDigest(digestId, recWithId)
    // }
    success = await addNewsToDigest(digestId, await recWithId)

    return {
        statusCode: 200,
        body: JSON.stringify({
            result: success
        })
    }
}


