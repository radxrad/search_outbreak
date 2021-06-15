require('dotenv').config()

// eslint-disable-next-line no-unused-vars
exports.handler = async function(event, context) {

    const Airtable = require('airtable')
    const base = new Airtable({apiKey: process.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
    const { digestId,  newsItem } = JSON.parse(event.body)

    const existingNewsItem = await base('News').select({filterByFormula: `{slug} = '${newsItem.id}'`}).all()
    let success = false
    if (existingNewsItem.length > 0) {
         success = await addNewsToDigest(digestId,newsItem)
    } else {
         success = await addNewsToDigest(digestId,newsItem)
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            result: success
        })
    }
}

async function  addNewsToDigest(digestId, record){
    const Airtable = require('airtable')
    const base = new Airtable({apiKey: process.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
    let newsrecord = updateOrInsert (record)
    let table = base("Digest")
    const digest = table.select({filterByFormula: `{id} = '${digestId}'`}).all()
    if (digest.length > 0 ) {
        table.replace(digest[0].id, newsrecord.fields,
        function(err, arecord) {
            if (err) {
                console.error(err);
                return null;
            }
            arecord.forEach(function (record) {
                console.log(record.getId());
            });
            return arecord
        }
    );
    }

}
async function  updateOrInsert (record)  {
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
        .firstPage(function(err, records) {
            if (err) {
                console.error(err);
                return;
            }
            records.forEach(function(r) {
                console.log("Retrieved", r.get("name"));

                table.replace(r.id, record.fields,
                    function(err, arecord) {
                        if (err) {
                            console.error(err);
                            return null;
                        }
                        arecord.forEach(function (record) {
                            console.log(record.getId());
                        });
                        return arecord
                    }
                );
            });

            if (!records.length) {
                console.log("empty");
                table.create(record.fields,
                    function(err, arecord) {
                        if (err) {
                            console.error(err);
                            return null;
                        }
                        arecord.forEach(function (record) {
                            console.log(record.getId());
                        });
                        return arecord
                    }
                );
            }
        });
}
