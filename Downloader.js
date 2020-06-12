const axios = require('axios');
const fs = require('fs');
let Status = require('./Status.js');
const path = require('path');

const rmdir = require('rimraf').sync;
Status = new Status();
class Downloader {
    mirror;
    gameDir;
    version;
    distrib;
    mustBeDownloaded;
    constructor(gamedir,url,version,distrib) {
        this.gameDir = gamedir;
        this.mirror = url;
        this.distrib = distrib;
        this.version = version;
        this.mustBeDownloaded = [];
    }
    getInstance() {
        return this;
    }

    async downloadLibs() {
        var instance = this;
        return new Promise(async function(resolve,reject) {
            for (var i = 0;i < instance.mustBeDownloaded.length;i++) {         
                
                Status.setStatus('Success')   
                await new Promise(async function(r,rej) {
                    var percent = Math.ceil((i+1)*100/(instance.mustBeDownloaded.length));
                    Status.setPourcent(percent);
                    Status.setStatus('['+percent+'%] Downloading '+path.basename(instance.mustBeDownloaded[i]))
                    var dir = instance.gameDir+"/"+path.dirname(instance.mustBeDownloaded[i]);
                    //Create folder
                    fs.mkdir(dir, { recursive: true }, async function (err) {
                        if (fs.existsSync(instance.gameDir+"/"+instance.mustBeDownloaded[i])) {
                            fs.unlinkSync(instance.gameDir+"/"+instance.mustBeDownloaded[i]);
                        }
                        console.log(instance.mirror+"/"+instance.mustBeDownloaded[i])
                        await  axios({
                            method: 'get',
                            url: instance.mirror+"/"+instance.mustBeDownloaded[i],
                            responseType: 'stream'
                        })
                            .then(function (response) {
                                //uncompress
                                response.data.pipe(fs.createWriteStream(instance.gameDir+"/"+instance.mustBeDownloaded[i]).on('close',function (e) {
                                    
                                }));
                                r();
                            }).catch(function (e) {
                                rej("Error : Failed to connect to the remote server");
                            })
                        })
                })
            }
        resolve();
    })

    }
    async checkFiles() {
        var instance = this;


        return new Promise(async function(resolve,reject) {
            //reset downloads
            instance.mustBeDownloaded = [];
            if (!fs.existsSync(instance.gameDir)) {
                fs.mkdirSync(instance.gameDir);
            }
            var paths = [];
            //get files
            await axios.get(instance.mirror+"/paths.json").then(function (e) {
                paths = e.data;
            })
            for (var i = 0;i < paths.length;i++) {
                var percent = Math.ceil((i+1)*100/(paths.length));
                Status.setPourcent(percent);
                Status.setStatus('['+(i+1)+'/'+paths.length+'] Checking file '+paths[i].file);
                if (fs.existsSync(instance.gameDir + "/"+paths[i].file)) {
                    if (fs.statSync(instance.gameDir + "/" + paths[i].file).size != paths[i].size) {
                        instance.mustBeDownloaded.push(paths[i].file);
                    }
                } else {
                    instance.mustBeDownloaded.push(paths[i].file);
                }
            }
            await instance.downloadLibs().then(function () {
                resolve();
            });
        });
	}
	async removeMods() {
		var instance = this;
		return new Promise(async function(resolve,reject) {
			if (fs.existsSync(instance.gameDir+"/mods")) {
				fs.rmdir(instance.gameDir+"/mods", { recursive: true }, (err) => {
					if (err) {
						reject(err.message);
						throw err;
					}
					resolve();
				});
			}
		});
	}
}
module.exports = Downloader;