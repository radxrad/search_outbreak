require('dotenv').config()

var CrossRef = require('crossref')
var doiRegex = require('doi-regex')
var _ = require('lodash')
var SummaryTool = require('node-summary');
var axios = require('axios')
var cors = require('cors')
var util = require('util');

var works = util.promisify(CrossRef.work)
exports.handler = async function (event, context) {

}




doiinfo.getCrossrefMetadata =  async function (doi){

    var itemUrl = `https://doi.org/${doi}`
    var res =  await axios.get(itemUrl,  {headers: {'Accept': 'application/vnd.citationstyles.csl+json'}})
    //     let crResult =    function (err, response) {
    //         // console.log(response)
    //
    //          item = _.pick(response, cors(), ['title', 'abstract', 'type',
    //             'subtype', 'DOI', 'URL', 'created'])
    //         //item.citation = citation;
    //         if (Array.isArray(item.title)) item.title = item.title[0];
    //
    //         let aDate = item.created["date-parts"][0]
    //         item.date = `${aDate[0]}-${aDate[1]}-${aDate[2]}`
    //         SummaryTool.summarize(item.title, item.abstract, function (s_error, summary) {
    //             console.log(summary)
    //             item.summary = summary;
    //
    //         });
    //
    //         console.log(item);
    //
    //         //res.end(JSON.stringify(item));
    //         returnItem =  item;
    //     }
    //
    // // CrossRef.work(doi, crResult);
    // var z = await work(doi)
    let item = await _.pick( res, cors(), ['title', 'abstract', 'type',
        'subtype', 'DOI', 'URL', 'created'])
    return item

}
doiinfo.getDoiCitation =  async function (doi) {
    var citUrl = `http://dx.doi.org/${doi}`
    return axios.get(citUrl,  {headers: {'Accept': 'text/x-bibliography'}}).then(function(response){
        return response.data
    }).catch(
        err=>{console.log(err)}
    )


}
doiinfo.getDoiMetadata = async function (doi){
    var citUrl = `https://data.crosscite.org/${doi}`
    return  axios.get(citUrl,  {headers: {'Accept': 'text/x-bibliography'}})

}

