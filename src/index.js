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
const url  = require("url");
const fs   = require("fs")
const mime = require('mime-types')

function sendResponse(filePath, res) {
    let stat = fs.statSync(filePath)
    let fileData = fs.readFileSync(filePath);
    let contentType = mime.lookup(filePath);
    res.setHeader('Content-Type', contentType);
    res.write(fileData);
    res.statusCode = 200;
    res.end();
}

http.createServer(function (req, res) {
    var url_parts = url.parse(req.url);
    const filePath = path.join(__dirname,"serve",url_parts.pathname)
    let extension = path.extname(filePath) // TODO: implement configurable sites with restrictable file extensions
    const contentType = mime.lookup(extension) || 'application/octet-stream';
    console.log(`hello world from ${filePath} (${extension})`)
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
        console.log(`trying ${indexPath}`)
        if (fs.existsSync(indexPath)) {
            sendResponse(indexPath, res);
        } else {
            // File not found
            res.statusCode = 404;
            res.write('File not found');
        }
    }
    res.end();
}).listen(80);