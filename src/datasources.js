var datasource = module.exports = function () {}
var Airtable = require('airtable');
//const {create} = require("lodash");
require('dotenv').config()

// readonly user https://support.airtable.com/hc/en-us/articles/360056249614-Creating-a-read-only-API-key
var base = new Airtable({apiKey: 'keysRYrgqnt3ZdHJP'}).base('appPINbN9J3uvK315');
//var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);
//{apiKey: process.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)

datasource.getTopics =   function(tableName= 'Topics'){
    return new Promise((resolve, reject) => {
        let table = base(tableName);

        let topics = []
        table.select().eachPage(function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.

            records.forEach(function (record) {
                console.log('Retrieved', record.get('Name'));
                topics.push(record)
            });

            // To fetch the next page of records, call `fetchNextPage`.
            // If there are more records, `page` will get called again.
            // If there are no more records, `done` will get called.
            fetchNextPage();

        }, function done(err) {
            if (err) {
                console.error(err);
                reject (err);
            }
            resolve (topics);
        });


    })

}
datasource.getDigests =  function(tableName= 'Digests'){
    return new Promise((resolve, reject) => {
        let table = base(tableName);

    let topics = []
      table.select().eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

        records.forEach(function(record) {
            console.log('Retrieved', record.get('Name'));
            topics.push(record)
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

    }, function done(err) {
        if (err) { console.error(err); reject (err); }
          resolve (topics);
    });

})

}
