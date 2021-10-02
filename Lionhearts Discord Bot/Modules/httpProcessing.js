const verificationTokens = require("./verificationTokens");

module.exports = {
    runServer(client){
        const http = require("http");
        let verificationModule = require('./verificationTokens.js');

        const server = http.createServer((req, res) => {
            function endSuccessfully(message){
                res.writeHead(200, {
                    'Content-Length' : Buffer.byteLength(message),
                    'Content-Type' : 'text/plain'
                });
                res.end(message);
            }

            const { headers, method, url } = req;
            let body = '';
            req.on('error', (err) => {
                console.warn(err);
            }).on('data', (chunk) => {
                body += chunk;
            }).on('end', () => {
                if (req.method == 'POST' || req.method == 'PUT'){
                    let processedBody;
                    try{ //ensure that we get proper json
                        processedBody = JSON.parse(body);
                    }catch{
                        console.warn("Invalid JSON Recieved!");
                        res.writeHead(400);
                        res.end();
                    }finally{
                        if (processedBody && processedBody.Process == 'token-validation'){
                            let succ = verificationModule.tokenEvent(processedBody.UserId, processedBody.Token, client);
                            if (succ){
                                endSuccessfully("Found token! Please run a command to confirm verification.");
                            }else{
                                endSuccessfully("Did not find token. Please run the verification command again!");
                            }
                        }else {
                            res.writeHead(404);
                            res.end();
                        }//leave room for other operations
                    }
                } else {
                    res.writeHead(404);
                    res.end();
                }//leave room for other operations
            });
        });

        server.listen(process.env.HTTP_PORT, `${process.env.HTTP_HOST}`, () =>{
            console.log("HTTP Server is running!");
        });
    }
}