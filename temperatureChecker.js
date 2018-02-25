request = require('request')
moment = require('moment')
module.exports = function temperatureChecker(){
    let cd = new Date()
    cd.setMinutes(cd.getMinutes() - 20)
    v = moment(cd).format('YYYY-MM-DD[T]HH:mm:ss')
    return new Promise((resolve, reject) => {
        request.get({
            url: "https://api.data.gov.sg/v1/environment/air-temperature",
            header: {'api-key': process.env.DATAGOV_API_KEY},
            qs: {'date_time': v}
        }, (error, response, body) =>{
            if(error){
                reject(error)
            }
            else{
                console.log(body)
                f = JSON.parse(body)
                console.log(f)
                ind = f.items[0].readings.find(el => {
                    return el.station_id == 'S43'
                })
                if (ind){
                    resolve(ind.value)
                }
                else reject( "kim chuan station not found")
            }
        })
    })
}