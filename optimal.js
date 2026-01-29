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
const clients = new Set()
wss.on("connection", (socket) => {
    clients.add(socket);
    socket.on("close", () => clients.delete(socket));
    console.log("Client connected");
});

// For every client connection and detecting file changes
fs.watch("./", (eventType, filename) => {
    if (!filename || eventType !== "change") return;
    else if (![".html", ".css"].includes(path.extname(filename))) return;
    for (const socket of clients) {
        socket.send(JSON.stringify({
            type: path.extname(filename) === ".css" ? "css" : "html",
            message: "reload",
            fileName: filename
        }));
    }
});

// Creating html/css collection on server
let fileCollection = []
fs.readdirSync(dirPath).forEach(file => {
    if (path.extname(file) === ".html" || path.extname(file) === ".css") {
        fileCollection.push(file)
    }

})
// Server Created
let handled = false
const server = http.createServer((req, res) => {
    if (req.url === "/" && req.method === "GET") {
        res.end(injection("home.html"))
    }

    else if (req.method == "GET") {
        const urlObj = new URL(req.url, `http://${req.headers.host}`)
        // converting path name to file and storing in urlobj.filename like /style.css to style.css
        urlObj.fileName = (urlObj.pathname).replace("/", "")
        console.log(urlObj.fileName);
        if (fileCollection.includes(urlObj.fileName)) {
            if (path.extname(urlObj.fileName) === ".html") {
                res.end(injection(urlObj.fileName))
            }
            else if (path.extname(urlObj.fileName) === ".css") {
                res.end(fs.readFileSync(urlObj.fileName, 'utf-8'))
            }
        }
    }


})
server.listen(3000)

