const fs = require('fs');
const Events = require('events')
const axios = require('axios')
const Launcher = require('./Launcher.js');
let Downloader = require('./Downloader.js');
const path = require('path');
let Status = require('./Status');
Status = new Status();
const {dialog, app, BrowserWindow } = require('electron')
if (!fs.existsSync(path.resolve(process.platform === "win32" ? process.env.APPDATA : process.env.HOME)+"/.ggo")) {
    fs.mkdirSync(path.resolve(process.platform === "win32" ? process.env.APPDATA : process.env.HOME)+"/.ggo");
}
global.config = {
    "java_path":"java",
    "username":"",
    "mirror":"",
    "accessToken":"",
    "uuid":"",
    "userType":"mojang",
    "versionType":"Forge",
    "distrib": ""
,    "baseDir":path.resolve(process.platform === "win32" ? process.env.APPDATA : process.env.HOME)+"/.ggo",
    "window": {
        "width": '900',
        "height": '500'
    },
    "ram":{
        "min":"500",
        "max":"2500"
    }
};

function isConnected() {
    if (!fs.existsSync('accounts.json')) {
        fs.writeFileSync('accounts.json',`{
            "accessToken":""
        }`)
    }
    var json = JSON.parse(fs.readFileSync('accounts.json'));
    if (json.accessToken != "") {
        global.config.accessToken = json.accessToken;
    }
    return json.accessToken != "" ? true : false;
}
class Emitter extends Events {};
let events = new Emitter();
global.events = events;
global.shared = {

    connection : async function(username) {
        if (username!= "") {
            global.config.accessToken = "0";
            global.config.uuid = "0";
            global.config.username = username;
            fs.writeFileSync('accounts.json',`{
                "accessToken":"0",
                "username":"${global.config.username}",
                "uuid":"0"
            }`)
            return {
                status:username
            }
        }

            
        
        return  {
            status:"500"
        };
    },
    isConnected() {
        if (!fs.existsSync('accounts.json')) {
            fs.writeFileSync('accounts.json',`{
                "accessToken":"",
                "username":"",
                "uuid":""
            }`)
        }
        try {

            var json = JSON.parse(fs.readFileSync('accounts.json'));
            if (json.accessToken != "") {
                global.config.accessToken = json.accessToken;
                global.config.username = json.username;
                global.config.uuid = json.uuid
            }
            return json.username != "" ? true : false;
        } catch(e) {
            return false;
        }
       
    },
    disconnect() {
        fs.unlinkSync('accounts.json')
    },
    runClient() {
        console.log("Launching...");
        var dl = new Downloader(global.config.baseDir,global.config.mirror,global.config.distrib.gameVersion,global.config.distrib);
        dl.checkFiles().then(function (e) {
            var launcher = new Launcher(global.config);
            global.win.show();
           // global.win.minimize();
            launcher.runClient();
        });
        
    },
    removeMods() {
        var dl = new Downloader(global.config.baseDir,global.config.mirror,global.config.distrib.gameVersion,global.config.distrib);
        dl.removeMods().then(function () {
            Status.setStatus("Le répertoire mods a bien été supprimé");
        }).catch(function (e) {
            Status.setStatus("Erreur : "+e);
        })
    },
    installLibraries() {

        var dl = new Downloader(global.config.baseDir,global.config.mirror,global.config.distrib.gameVersion,global.config.distrib);
        dl.downloadPack().then(function (e) {
            Status.setStatus(e)
        }).catch(function(e) {
            Status.setStatus(e);
        })
    },
    downloadModpack() {
        var dl = new Downloader(global.config.baseDir,global.config.mirror,global.config.distrib.gameVersion,global.config.distrib);
        dl.downloadModpack().then(function (e) {
            Status.setStatus(e)
        }).catch(function(e) {
            Status.setStatus(e);
        })
    }
};
/*connection().then(function (msg) {
    if (msg.accessToken == "500") {
        console.log('Username or password incorrect')
    } else {

        global.config.accessToken = msg.accessToken;
        global.config.uuid = msg.selectedProfile.id;
        global.config.username = msg.selectedProfile.name;
        //
    }

});

Downloader.downloadPack().then(function (e) {
    Status.setStatus(e)
    //launcher.runClient();
}).catch(function(e) {
    Status.setStatus(e);
})
*/

async function initWindow() {
    axios.get('https://github.com/hytykateur/cyteriarepo/raw/master/distrib.json').then(function (e) {
        global.config.distrib = e.data;
        global.config.mirror = e.data.mirror;
            const win = new BrowserWindow({
                width: 800,
                height: 600,
                webPreferences: {
                  nodeIntegration: true
                }
              })
          win.loadFile('assets/html/app.html');
          global.win = win;
       
      }).catch(function (e) {
        console.log("Le launcher est désactivé car les serveurs sont éteints")
        console.log(e)
        process.kill(process.pid)
      })
}
app.whenReady().then(initWindow)
