var json = [];
const path = require('path');
const fs = require('fs');
require('walk').walk('../cyteriarepo')
 
.on('file', function (root, fileStats, next) {
    if (root.search(/(repo\/\.git)/g) == -1) {
        root_w = root.replace('repo/','');
        if (root_w != "repo") {
            json.push({file: path.join(root_w,fileStats.name).replace(/\\/g,'/'),size: fs.statSync(path.join(root,fileStats.name)).size,state: root_w.split('/')[0]});
        }
    } 
    next();
    
})
.on('end',function (e) {

        fs.writeFileSync('../cyteriarepo/paths.json',JSON.stringify(json).replace(/(\},)/g,'},\n'));
    })
