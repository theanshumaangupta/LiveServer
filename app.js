
let b = document.createElement('h4')
b.innerText = "Counter is intentionally added to demonstrate Css hot  reload. when CSS files change, the page does not fully reload and the Counter keeps running."
document.body.appendChild(b)

let c = 0
setInterval(() => {
    let a = (document.createElement("h1"))
    a.innerText = c
    c++
    document.body.appendChild(a)
}, 2000);