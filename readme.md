# Simple Live Server

Minimal Node.js live reload server for `.html` and `.css` files using HTTP + WebSocket.

---

## Features

- Serves HTML , CSS and JS
- Live reload on file change 
- HTML → reload 
- CSS → hot reload (reflect changes only and dont reload page)
- WebSocket based
- Auto script injection

---

## Setup

```bash
npm install
node server.js
open the port (default 3000)

---
By default, the server opens home.html.
When you edit any HTML file or  JS, the changes automatically appear in the browser.
When you edit CSS files, the styles update instantly without reloading the whole page.


