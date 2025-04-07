function uncolorVertex(vertex) {
    document.getElementById(vertex).classList = 'vertex'
}

function uncolorEdge(start, end) {
    (document.getElementById(start + '-' + end) ||
    document.getElementById(end + '-' + start)).classList = 'edge fixed'
}

function colorVertex(vertex, color) {
    uncolorVertex(vertex)
    document.getElementById(vertex).classList.add(color)
}

function colorEdge(start, end, color) {
    uncolorEdge(start, end)
    let e = document.getElementById(start + '-' + end) ||
        document.getElementById(end + '-' + start)
    e.classList.add(color)
}

function removeVertexGroup(color) {
    for (let i of document.getElementsByClassName('vertex'))
        if (i.classList.contains(color))
            i.classList.remove(color)
}

function removeEdgeGroup(color) {
    for (let i of document.getElementsByClassName('edge'))
        if (i.classList.contains(color))
            i.classList.remove(color)
}

function clearAll(){
    for (let i of document.getElementsByClassName('vertex'))
        i.classList = 'vertex'
    for (let i of document.getElementsByClassName('edge'))
        i.classList = 'edge fixed'
    clearMessages()
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let finish = false, deadlock = false

let visited = Array.from({length: v}, e => false)

function finishAlgo(){
    if(!finish) {
        finish = true
        if(deadlock) window.alert("deadlock detected")
        else window.alert("No deadlock detected")
    }
}

async function startMessage(init, start){
    if(!start){
        visited.fill(false)
        start = init
        finish = false
        deadlock = false
    }
    if(visited[start])  return
    else visited[start] = true
    await delay(500)
    colorVertex(start, "green")
    await delay(500)
    let p = adjacency[start].map(element => {
        console.log(start, element)
        return sendMessage(init, start, element.v)
    });
    console.log(p)
    await Promise.all(p).then(async data => {
        console.log(data)
        if(data.includes(-1)) 
            deadlock = true
        else {
            await delay(1000)
            Promise.all(data.map(pid => {
                return startMessage(init, pid)
            })).then(data => {
                console.log(2, data, init, start, visited)
                if(!visited.includes(false))
                    finishAlgo()
            })
        }
    })
    return 0
}

async function sendMessage(init, sender, receiver){
    colorEdge(sender, receiver, "purple")
    const msg = document.createElement("span")
    msg.innerText = `(${init}, ${sender}, ${receiver})`
    msg.classList.add('message')
    msg.style.left = 0
    
    const e = document.getElementById(`${sender}-${receiver}`)
    const f = e.style.transform.match('rotate\\(\(-?\)\([-0-9.]*deg\)\\)')
    msg.style.transform = `rotate(${f[1] ? '' : '-'}${f[2]})`
    e.appendChild(msg)
    
    await delay(100)
    msg.style.left = '100%'
    await delay(4000)
    setTimeout(() => clearMessages(), 2000)
    setTimeout(() => colorEdge(sender, receiver, "brown"), 1000)
    if(init == receiver)    return -1
    return receiver

}

function clearMessages() {
    Array.from(document.getElementsByClassName('message')).forEach(e => e.remove())
}