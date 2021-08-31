/* eslint-disable no-unused-vars */
require('dotenv').config()
var _ = require('lodash')
var dateformat = require('dateformat')
const Airtable = require("airtable");
var {URL} = process.env
// eslint-disable-next-line no-unused-vars
exports.handler = async function (event, context) {
    const associatedNewsField = 'Publications'
    const Airtable = require('airtable')
    const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
    const {digestId, newsItem} = JSON.parse(event.body)
    // functions for serverless functions
    const listResearchers = async function () {

        console.log("Researcher:" )
        let table = base("Network")
        //console.log( await table.select().all())
        console.log("Researcher:" )
        return table.find("", function (err, associated) {

                if (err) {
                    console.error(err);
                    Promise.reject(err);
                }
                console.log("associated from find: " + associated)
                if (associated) {
                    // console.log("associated news recs:" + associated.get('News').join(','))
                   Promise.resolve(associated)
                }
            }
        )

    }


    // const existingNewsItem = await base('News').select({filterByFormula: `{slug} = '${newsItem.fields.slug}'`}).all()
    // console.log("isExisting:", existingNewsItem)
    // if (existingNewsItem.length > 0){
    //     addNewsToDigest
    // }
    //await updateOrInsert(newsItem).then(
    return listResearchers().then(
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


