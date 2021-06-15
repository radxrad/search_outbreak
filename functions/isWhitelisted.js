require('dotenv').config()

exports.handler = async function(event, context) {

    const Airtable = require('airtable')
    const base = new Airtable({apiKey: process.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE)
    const { email } = JSON.parse(event.body)
    const isWhitelisted = await base('People').select({view: 'People with private access', filterByFormula: `{Google email} = '${email}'`}).all()

    return {
        statusCode: 200,
        body: JSON.stringify({
            result: isWhitelisted.length > 0
        })
    }
}
