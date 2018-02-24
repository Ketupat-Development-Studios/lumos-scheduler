let request = require('request')
module.exports.triggerSpell = function(spellId){
    console.log(`triggered spell ${spellId}!!`)
    request.post({
        url: `http://0.0.0.0:5000/spells/${spellId}/pullTrigger`,
        headers: {'content-type': 'application/json'}
    }, (error, response, body) => {
        console.log(error, response, body)
    })
}