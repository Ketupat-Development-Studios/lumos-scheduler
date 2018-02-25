require('dotenv').config()
database = require('./database.js')
triggerSpell = require('./triggerSpell').triggerSpell
temperatureChecker = require('./temperatureChecker')
schedules = {} //maps spellsid to cleartimeout

function removeTrigger(spellId){
    clearTimeout(schedules[spellId])
}

function updateOrAddTrigger(spellId, trigger){
    if (schedules.hasOwnProperty(spellId)){
        removeTrigger(spellId)
    }
    if(trigger.type == "clock"){
        weekly = {
            'every_monday': 1,
            'every_tuesday': 2,
            'every_wednesday': 3,
            'every_thursday': 4,
            'every_friday': 5,
            'every_saturday': 6,
            'every_sunday': 0
        }
        if(trigger.schedule == "everyday"){
            let nearestDayTime = function(){
                let start = new Date()
                let end =  new Date()
                let targetHour = trigger.time.slice(0, 2), targetMinute = trigger.time.slice(2, 4)
                end.setHours(targetHour)
                end.setMinutes(targetMinute)
                end.setSeconds(0)
                if (end <= start){
                    end.setDate(end.getDate() + 1)
                }
                return end - start
            }
            console.log(`nearest time is ${nearestDayTime()}`)
            schedules[spellId] = setTimeout(
                function action(){
                    triggerSpell(spellId)
                    let nxt = nearestDayTime()
                    console.log(`next time is ${nxt} ms away!`)
                    schedules[spellId] = setTimeout(action, nxt)
                }, nearestDayTime()
            )
        }
        else if(trigger.schedule == 'once'){
            let nearestOnceTime = function(){
                let start = new Date()
                let end =  new Date(trigger.timestamp)
                return end - start
            }
            schedules[spellId] = setTimeout(
                function action(){
                    triggerSpell(spellId)
                }, nearestOnceTime()
            )
        }
        else if(trigger.schedule == 'every_hour'){
            let nearestHourlyTime = function(){
                let start = new Date()
                let end = new Date()
                end.setMinutes(trigger.minute)
                end.setSeconds(0)
                if (end <= start){
                    end.setHours(end.getHours() + 1)
                }
                return end - start
            }
            schedules[spellId] = setTimeout(
                function action(){
                    triggerSpell(spellId)
                    let nxt = nearestHourlyTime()
                    console.log(`next time is ${nxt} ms away!`)
                    schedules[spellId] = setTimeout(action, nxt)
                }, nearestHourlyTime()
            )
        }
        else if(weekly.hasOwnProperty(trigger.schedule)){
            let nearestWeeklyTime = function(){
                let start = new Date()
                let end = new Date()
                let targetHour = trigger.time.slice(0, 2), targetMinute = trigger.time.slice(2, 4)
                end.setHours(targetHour)
                end.setMinutes(targetMinute)
                end.setSeconds(0)
                end.setDate(end.getDate() + (weekly[trigger.schedule] - end.getDay() + 7)%7)
                if(end <= start){
                    end.setDate(end.getDate()+ 7)
                }
                return end - start
            };
            console.log(`init week to ${nearestWeeklyTime()}`)
            schedules[spellId] = setTimeout(
                function action(){
                    triggerSpell(spellId)
                    let nxt = nearestWeeklyTime()
                    console.log(`next week is ${nxt} away`)
                    schedules[spellId] = setTimeout(action, nxt)
                }, nearestWeeklyTime()
            )
        }
    }
    else if(trigger.type == 'temperature'){
        let timeoutInterval = 15*60*1000
        console.log(`nearest time is ${nearestDayTime()}`)
        schedules[spellId] = setTimeout(
            function action(){
                temperatureChecker().then(temp => {
                    if(trigger.direction == 'less than'){
                        if(temp < trigger.temperature){
                            triggerSpell(spellId)
                        }
                    }
                    else if(trigger.direction == 'greater than'){
                        if(temp > trigger.temperature){
                            triggerSpell(spellId)
                        }
                    }
                })
                schedules[spellId] = setTimeout(action, timeoutInterval)
            }, timeoutInterval
        )
    }
}

database.ref('spells').on('child_added', function(spell){
    console.log('added')
    console.log(spell.val())
    updateOrAddTrigger(spell.key, spell.val().trigger)
    console.log('current schedule ', Object.keys(schedules))
})

database.ref('spells').on('child_changed', function(spell){
    console.log('changed')
    console.log(spell.val())
    updateOrAddTrigger(spell.key, spell.val().trigger)
    console.log('current schedule ', Object.keys(schedules))
})
database.ref('spells').on('child_removed', function(spell){
    console.log('deleted')
    console.log(spell.val())
    removeTrigger(spell.key)
    console.log('current schedule ', Object.keys(schedules))
})
