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

async function chandyMisraHaas(start) {
    if(!start) retuurn
    clearAll()
    colorVertex(start, "blue")
    let visited = Array.from({length: v}, e => false)
    let init = start
    let p = await broadcastMessage(init, start, visited)
    if(!p) {
        colorVertex(init, "red")
        await delay(250)
        window.alert("Deadlock detected")
    }
    else window.alert("No deadlock detected")
}


async function broadcastMessage(init, start, visited){
    if(visited[start])  return true
    else visited[start] = true
    await delay(500)
    if(init != start) colorVertex(start, "green")
    await delay(500)
    let p = adjacency[start].map(element => {
        console.log(start, element)
        return sendMessage(init, start, element.v)
    });
    console.log(p)
    let receivers = await Promise.all(p)
    console.log(receivers)
    if(receivers.includes(init)) {
        return false
    }
    await delay(750)
    let p2 = receivers.map(pid => {
        return broadcastMessage(init, pid, visited)
    })

    console.log(p2)
    let result = await Promise.all(p2)
    console.log(result)
    return !result.includes(false)

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
    await delay(3500)
    setTimeout(() => colorEdge(sender, receiver, "brown"), 100)
    setTimeout(() => clearMessages(), 1760)
    return receiver

}

function clearMessages() {
    Array.from(document.getElementsByClassName('message')).forEach(e => e.remove())
}