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
}