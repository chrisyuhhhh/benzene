/*
  '||                                                        
   || ...    ....  .. ...   ......    ....  .. ...     ....  
   ||'  || .|...||  ||  ||  '  .|'  .|...||  ||  ||  .|...|| 
   ||    | ||       ||  ||   .|'    ||       ||  ||  ||      
   '|...'   '|...' .||. ||. ||....|  '|...' .||. ||.  '|...' 
*/
// kibiri.net :)

const http = require("http")
const path = require("path");
const url = require("url");
const fs = require("fs")
const mime = require('mime-types')
const config = {}
config.sites = require("./config/sites.json")
config.general = require("./config/general.json")

function getCurrentTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function log(text,type="INFO") {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;

    fs.appendFileSync(path.join(__dirname,`${config.general.logs}/${formatted}.log`),`[${getCurrentTimestamp()}] [${type}] ${text}\r\n`)
}

function sendResponse(filePath, res) {
    let fileData = fs.readFileSync(filePath);
    let contentType = mime.lookup(filePath);
    res.setHeader('Content-Type', contentType);
    res.write(fileData);
    res.statusCode = 200;
    res.end();
}

http.createServer(function (req, res) {
    var url_parts = url.parse(req.url);
    let site = config.sites["default"]
    const filePath = path.join(__dirname,site.htdocs,url_parts.pathname)
    let extension = path.extname(filePath) // TODO: implement configurable sites with restrictable file extensions
    let found = false; // clean this please!!!!
                       // to whomever may be reading this: i wrote this code at 2am please dont judge
    if (!found && fs.existsSync(filePath)) {
        let stat = fs.statSync(filePath);
        if (stat.isFile()) {
            sendResponse(filePath, res);
            found = true;
            return;
        }
    }
    if (!found && fs.existsSync(filePath + ".html")) {
        let stat = fs.statSync(filePath + ".html");
        if (stat.isFile()) {
            sendResponse(filePath + ".html", res);
            found = true;
            return;
        }
    }
    if(!found) {
        let indexPath = path.join(filePath, "index.html");
        if (fs.existsSync(indexPath)) {
            sendResponse(indexPath, res);
        } else {
            // File not found
            res.statusCode = 404;
            res.write('File not found');
        }
    }
    res.end();
}).listen(80,() => {
    log(`listening on port 80`); // TODO: configurable ports
});