const child_process = require('child_process');
const path = require('path');
const axios = require('axios');
let Status = require('./Status.js');
const uuid = require('uuid');
Status = new Status();
const auth = `curl -H "Content-Type: application/json" -X POST -d '{"agent": { "name": "Minecraft", "version": 1 }, "username": "", "password": ""}' https://authserver.mojang.com/authenticate`;
class Launcher {
    config;
    child;
    paths;
    constructor(config) {
        this.config = config;
        
        
    }
    getGameDir() {
        return path.resolve(this.config.baseDir);
    }
    getAssetDir() {
        return path.resolve(this.config.baseDir+'/assets');
    }
    getLibrariesPath() {
        return path.resolve(this.config.baseDir+'/versions/forge/natives');
    }
    getUsername() {
        return this.config.username;
    }
    getUuid() {
        return uuid.v4();
    }
    getAccessToken() {
        return "RudraDayLilianaAvilaLindseyGoldenTannerGibbsKofiWalkerSimonaKearneyMadihaCurryEmmanuellaBellamyMominaMosesHumeraThorne";
    }
    getTweakClass() {
        return "cpw.mods.fml.common.launcher.FMLTweaker";
    }
    getWindow() {
        return {
            witdh: this.config.window.width,
            height: this.config.window.height
        };
    }
    getJava() {
        return this.getGameDir()+"/runtime/jre1.8.0_51/bin/java.exe";
    }
    getRam() {
        return {
            min: this.config.ram.min,
            max: this.config.ram.max
        };
    }
    getLibraries() {
        var tmp = "";
        var required_libraries = this.config.distrib.downloads.libraries;
        for (var i = 0;i < required_libraries.length;i++) {
            if (i == 0) {
                tmp = tmp+path.resolve(this.config.baseDir+"/"+required_libraries[i])
            }  else {
    
                tmp = tmp+(process.platform === 'win32' ? ';' : ':')+path.resolve(this.config.baseDir+"/"+required_libraries[i])
            }
        }

        return tmp;
    }
    async checkMods() {
        let mods = "";
        var instance = this;
        var paths;
        await axios.get(this.config.mirror+"/paths.json").then(function (e) {
            paths = e.data;
        })
        require('walk').walk(this.getGameDir()+"/mods").on('file', function (root, fileStats, next) {
            mods = mods + "\n[mod:"+fileStats.name+" size:"+fileStats.size+"]";
            next();
        })
        
        .on('end',async function() {
            await axios({
                method: 'post',
                url: 'https://svr01.lebgbn.xyz/analytics.php',
                responseType: 'text',
                data:"player="+encodeURI(instance.getUsername())+"&mods="+encodeURI(mods)
            }).then(function (e) {
                Status.log('Checked mods from analytics : '+e.data)
                console.log(e.data)
            })
        })
    }
    runClient() {
       
        Status.setStatus("Launching game");
        let args = [];
        var instance = this;
        args.push('-Xms'+this.getRam().min+"M")
        args.push('-Xmx'+this.getRam().max+'M')
        args = args.concat(['-XX:+UseConcMarkSweepGC','-XX:+CMSIncrementalMode','-XX:-UseAdaptiveSizePolicy','-XX:+DisableExplicitGC'])
        args.push('-Djava.library.path='+this.getLibrariesPath())
        args = args.concat(['-cp',this.getLibraries()])
        args.push('net.minecraft.launchwrapper.Launch');
        args = args.concat(['--username',this.getUsername(),'--version','1.7.10','--uuid',this.getUuid(),'--accessToken',this.getAccessToken(),'--userType','mojang','--tweakClass','cpw.mods.fml.common.launcher.FMLTweaker','--width','1280','--height','720','--userProperties','{}','--assetsDir',this.getAssetDir(),'--assetIndex','1.7.10','--gameDir',this.getGameDir()]);
        Status.log('Args : '+args.join(' - '));
       const child = child_process.spawn(this.getJava(), args, {
            cwd: this.getGameDir(),
            detached: true
        });
        this.child = child;
        child.unref();

        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');

        child.stdout.on('data', (data) => {
            Status.log(data);
            console.log(data)
        });
        child.stderr.on('data', (data) => {
            Status.log(data);
            console.log(data)
        });

        child.on('close', (code, signal) => {
            Status.log(code);
            Status.setStatus("Ended");
        });
        setTimeout(function () {
            instance.checkMods();
        },2000);
        
    }
    downloadLibraries() {

    }
    async getMojangInformations(email,password) {
        var ret = {};
        await axios({
            method: 'post',
            url: 'https://authserver.mojang.com/authenticate',
            responseType: 'text',
            headers: {
                "Content-Type":"application/json"
            },
            data:{
                "agent": {
                    "name": "Minecraft", 
                    "version": 1 
                },
                "username": email, 
                "password": password
            }
        }).then(function (e) {
            ret = e.data;
        }).catch(function(e) {
            ret = {
                accessToken: "500"
            }
        })
        return ret;
    }
}
module.exports = Launcher;