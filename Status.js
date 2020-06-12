
class Status {
    constructor() {

    }
    setStatus(text) {
        global.events.emit('status',text)
    }
    setPourcent(pourcent) {
        global.events.emit('progressEvent',pourcent)
    }
    log(text) {
        global.events.emit('log',text)
    }
}
module.exports = Status;