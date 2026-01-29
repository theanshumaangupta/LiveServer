import http from "http";
import fs from "fs";
import { WebSocketServer } from 'ws';
import path from "path";

const dirPath = "./";
const wss = new WebSocketServer({ port: 8080 });


// Function for Adding script before </body> tag
function injection(fileName) {
    let data = fs.readFileSync(fileName, 'utf-8')
    data = data.replace('</body>',
        `
    <script >
            // Code is injected for Live Reloading
            const ws = new WebSocket("ws://localhost:8080");

            ws.onopen = () => {
                ws.send("Hello server");
            };
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)
                if (data.message === "reload") {
                    if(data.type == "html"){
                        window.location.reload();
                    }
                    else if (data.type == "css") {
                        console.log(data.fileName)
                        let links = document.querySelectorAll('link[rel="stylesheet"]')
                        Array.from(links).forEach((link) => {
                            if (link.href.includes(data.fileName)){
                                const url = new URL(link.href)
                                url.searchParams.set("v", Date.now())
                                link.href = url.toString()
                            }
                        });
                    }
                }
        };
    </script>
</body> `
    )
    return data;
}
// Websocket Server Created
wss.on("connection", (socket) => {
    console.log("Client connected");
    // For every client connection and detecting file changes
    fs.watch("./", (eventType, filename) => {
        if (eventType == "change") {
            if(path.extname(filename) == ".css"){
                socket.send(JSON.stringify({
                    type: "css",
                    message: "reload",
                    fileName: filename
                }))
            }
            else{
                socket.send(JSON.stringify({
                    type: "html",
                    message: "reload"
                }))
            }
        }
    });
});
// Server Created
const server = http.createServer((req, res) => {
    fs.readdirSync(dirPath).forEach(file => {
        const urlObj = new URL(req.url, `http://${req.headers.host}`)
        
        if (urlObj.pathname == `/${file}` && req.method == "GET") {
            if (path.extname(file) === ".html") {
                res.end(injection(file))
                res.destroy()
            }
            else if (path.extname(file) === ".css") {
                res.end(fs.readFileSync(file, 'utf-8'))
                res.destroy()
            }
        }
    })
    if (req.url === "/" && req.method === "GET") {
        console.log("dsfasdf")
        res.end(injection("home.html"))
    }
    else {
        return res.end("<html><h1>Not a registered hello path for a Request</h1></html>")
    };
})
server.listen(3000)

