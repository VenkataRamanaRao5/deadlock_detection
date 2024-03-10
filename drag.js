const container = document.getElementById("container")
const edges = document.getElementById("edges")
const weightBox = document.getElementsByClassName("weight")[0]

let v = parseInt(window.prompt("No. of vertices")),
    isWeighted = window.confirm("Is the graph weighted"),
    isDirected = false

const w = container.clientWidth, h = container.clientHeight
const r = (Math.min(w, h) > 510) ? 250 : Math.min(h, w)*0.45
const vWidth = 30, vHeight = 30
const longPress = 300

let movingVertex = null, startingVertex = null,
    activeEdge = null, activeVertex = null, timer = null
    
let isWeightBoxVisibile = false, isEdgeInfoBoxVisible = false

let adjacency = [],
    mat = Array(v).fill().map(
    () => Array(v).fill(0)
)

weightBox.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopImmediatePropagation()
})

for (let j = 0; j < v; j++) {
    // creating v vertices as a regular polygon
    // me sad, native js does not support complex numbers
    // i couldn't use the polar form :(

    // x coord of jth vertex
    let x = r * Math.cos(2 * Math.PI * j / v) + w / 2

    // y coord of jth vertex
    let y = r * Math.sin(2 * Math.PI * j / v) + h / 2

    // creating vertex div, adding class, id and coords
    let vertex = document.createElement("div")
    vertex.classList.add("vertex")
    vertex.id = `${j}`
    vertex.style.left = `${x}px`
    vertex.style.top = `${y}px`

    vertex.addEventListener('mousedown', (e) => {
        e.preventDefault()
        e.stopImmediatePropagation()

        if(isWeightBoxVisibile)
            container.click()

        //console.log(e)

        // no shift key => move around
        if (e.buttons == 1 && !e.shiftKey) {
            console.log("left")
            e.target.style.cursor = 'grabbing'
            movingVertex = e.target.id
        }

        // shift key => edge
        else {
            console.log("right")
            container.style.cursor = 'crosshair'
            startingVertex = e.target.id
        }
    })

    vertex.addEventListener('mouseup', (e) => finishEdge(e.target))

    vertex.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        return false
    })

    vertex.addEventListener('touchstart', (e) => {
        e.preventDefault()

        if(isWeightBoxVisibile)
            container.click()

        if (!e.target.classList.contains("vertex")) return
        e.target.classList.add("active")
        if (startingVertex != e.target.id) {
            startingVertex = null
        }
        console.log("TImer")
        timer = setTimeout(function () {
            movingVertex = e.target.id
            startingVertex = null
            e.target.classList.remove('active')
        }, longPress)
    })

    vertex.addEventListener('touchend', (e) => {
        e.preventDefault()
        if (timer) {
            clearTimeout(timer)
            timer = null
            console.log("Heer")
            startingVertex = e.target.id
            e.target.classList.remove("active")
        }
        else {
            let el = document.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY)
            //console.log(el)
            if (el.classList.contains("vertex"))
                finishEdge(el)
            endChanges(e.changedTouches[0].pageX, e.changedTouches[0].pageY)
        }
    })

    vertex.addEventListener('touchmove', (e) => {
        e.preventDefault()
        if (e.target.id == movingVertex) {
            move(e.touches[0].clientX, e.touches[0].clientY)
            clearTimeout(timer)
            timer = null
            e.target.classList.remove("active")
        }
        else if (e.target.id == startingVertex) {
            draw(e.touches[0].clientX, e.touches[0].clientY)
            clearTimeout(timer)
            timer = null
            e.target.classList.remove("active")
        }
    })

    // creating span for the vertex label
    let label = document.createElement("span")
    label.classList.add("label")
    label.innerHTML = `${j}`
    vertex.appendChild(label)

    container.appendChild(vertex)

    adjacency.push([])
}

// mouse can move anywhere in the window
window.addEventListener('mousemove', (e) => {
    if (movingVertex == null) {
        if (startingVertex == null) return
        else draw(e.x, e.y)
    }
    else {
        move(e.x, e.y)
    }
})

// mouse up can be triggered anywhere in the window
window.addEventListener('mouseup', (e) => endChanges(e.x, e.y))

// delete selected edge
window.addEventListener('keydown', ({ key }) => {
    if (key == "Delete")
        deleteEdge()
    else if(key == "Enter")
        container.click()
})

window.addEventListener('click', (e) => {
    if(isWeightBoxVisibile){
        weightBox.style.visibility = "hidden"
        isWeightBoxVisibile = false
        let endpoints = weightBox.id.split('~')
        let wt = weightBox.value
        updateAdjacency(endpoints[0], endpoints[1], wt)
    }

    if(activeEdge){
        activeEdge.classList.remove("active")
        activeEdge = null
    }
})

function deleteEdge() {
    let endPts = activeEdge.id.split('-')
    adjacency[endPts[0]].forEach((v, i) => {
        if (v.v == endPts[1])
            adjacency[endPts[0]].splice(i, 1)
    })
    mat[endPts[0]][endPts[1]] = 0

    adjacency[endPts[1]].forEach((v, i) => {
        if (v.v == endPts[0])
            adjacency[endPts[1]].splice(i, 1)
    })
    mat[endPts[1]][endPts[0]] = 0

    edges.removeChild(activeEdge)
    activeEdge = null
}

// move the vertex
function move(x, y) {
    const vertex = document.getElementById(movingVertex)
    adjacency[movingVertex].forEach((neighbour) => {
        drawDiv(document.getElementById(neighbour.edge), x, y, neighbour.x, neighbour.y)
    })
    vertex.style.left = `${x - vWidth / 2}px`
    vertex.style.top = `${y - vHeight / 2}px`
}

// draw line from point1 to point2
function drawDiv(div, x1, y1, x2, y2) {
    let dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
        angle = Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI,
        midx = (x1 + x2) / 2,
        midy = (y1 + y2) / 2
    div.style.left = `${midx - dist / 2 + 4}px`
    div.style.width = `${dist}px`
    div.style.top = `${midy}px`
    div.style.height = `8px`
    div.style.transform = `rotate(${angle}deg)`
}

// draw the edge
function draw(x2, y2) {
    const vertex = document.getElementById(startingVertex)
    let x1 = parseFloat(vertex.style.left) + vWidth / 2,
        y1 = parseFloat(vertex.style.top) + vHeight / 2

    let edge = document.getElementById("waitingEdge")
    if (edge == null)
        edge = createWaitingEdge()
    drawDiv(edge, x1, y1, x2, y2)
}

function createWaitingEdge() {
    let edge = document.createElement("div")
    edge.classList.add('edge')
    edge.id = "waitingEdge"

    let wtBox = document.createElement("span")
    wtBox.classList.add('wt')
    wtBox.addEventListener('click', (e) => {
        container.click()
        e.preventDefault()
        e.stopImmediatePropagation()

        let se = wtBox.parentElement.id.split('-')
        console.log(se)
        se[0] = document.getElementById(se[0])
        se[1] = document.getElementById(se[1])
        askWeight({x: parseFloat(se[0].style.left), y: parseFloat(se[0].style.top), id: se[0].id},
            {x: parseFloat(se[1].style.left), y: parseFloat(se[1].style.top), id: se[1].id})
    })
    edge.appendChild(wtBox)

    edge.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopImmediatePropagation()

        if (edge.classList.contains("active")) {
            edge.classList.remove("active")
            deleteEdge()
            activeEdge = null
        }
        else {
            if (activeEdge)
                activeEdge.classList.remove("active")
            activeEdge = edge
            edge.classList.add("active")
        }
    })

    edges.appendChild(edge)
    return edge
}

// finishing and saving the edge when mouse goes up on a vertex
function finishEdge(el) {
    if (startingVertex == null) return
    const vertex = document.getElementById(startingVertex)
    let x1 = parseFloat(vertex.style.left) + vWidth / 2,
        y1 = parseFloat(vertex.style.top) + vHeight / 2
    let x2 = parseFloat(el.style.left) + vWidth / 2,
        y2 = parseFloat(el.style.top) + vHeight / 2
    let edge = document.getElementById("waitingEdge")
    let name1 = `${startingVertex}-${el.id}`,
        name2 = `${el.id}-${startingVertex}`
    if (document.getElementById(name1))
        edges.removeChild(edge)
    else if(!isDirected && document.getElementById(name2))
        edges.removeChild(edge)
    else if(name1 == name2)
        edge.removeChild(edge)
        //console.log("boo", name1, name2)
    else {
        edge.id = name1
        edge.classList.add("fixed")
        drawDiv(edge, x1, y1, x2, y2)

        if(isWeighted)
            askWeight({x: x1, y: y1, id: startingVertex}, {x: x2, y: y2, id: el.id})
        else
            updateAdjacency(startingVertex, el.id, 1)

        adjacency[startingVertex].push({
            v: el.id,
            edge: name1,
            x: x2,
            y: y2,
        })

        if(!isDirected){
            adjacency[el.id].push({
                v: startingVertex,
                edge: name1,
                x: x1,
                y: y1,
            })
        }

        //console.log("foo", el)
    }
    console.log("righting")
}

function updateAdjacency(start, end, wt){
    
    let f = document.getElementById(start+'-'+end)
    if(f)   f.firstElementChild.innerHTML = wt

    mat[start][end] = wt

    if(!isDirected){
        mat[end][start] = wt
    }
}

function askWeight(start, end){
    console.log(start, end)

    weightBox.style.left = `${(start.x + end.x) / 2}px` 
    weightBox.style.top = `${(start.y + end.y) / 2}px`
    weightBox.id = `${start.id}~${end.id}`
    weightBox.style.visibility = "visible"
    isWeightBoxVisibile = true
}

// ending all changes when mouse goes up
function endChanges(x, y) {
    if (movingVertex == null && startingVertex == null)
        return
    if (movingVertex) {
        adjacency.forEach((value, index) => {
            value.forEach((v2, i2) => {
                if (v2.v == movingVertex) {
                    adjacency[index][i2].x = x
                    adjacency[index][i2].y = y
                }
            })
        })
        document.getElementById(movingVertex).style.cursor = 'grab'
    }
    if (startingVertex)
        if (document.getElementById("waitingEdge"))
            edges.removeChild(document.getElementById("waitingEdge"))
    container.style.cursor = 'default'
    movingVertex = null
    startingVertex = null
    console.log("lefting")
}