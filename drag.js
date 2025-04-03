const container = document.getElementById("container")
const edges = document.getElementById("edges")

let v = parseInt(window.prompt("No. of vertices")),
    isDirected = true

const w = container.clientWidth, h = container.clientHeight
const r = (Math.min(w, h) > 510) ? 250 : Math.min(h, w)*0.40
const vWidth = 35, vHeight = 35
container.style.setProperty('--vertex-size', `${vWidth}px`)
container.style.setProperty('--font-size', `24px`)

const longPress = 300
const arrowWidth = 20

let movingVertex = null, startingVertex = null,
    activeEdge = null, activeVertex = null, timer = null

let adjacency = [],
    mat = Array(v).fill().map(
    () => Array(v).fill(0)
)

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

        //console.log(e)

        // no shift key and left click => move around
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
    label.innerHTML = `P${j}`
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
        drawDiv(document.getElementById(neighbour.edge), x, y, neighbour.otherX, neighbour.otherY)
    })
    adjacency.forEach((value, index) => {
        value.forEach((v2, i2) => {
            if (v2.v == movingVertex) {
                drawDiv(document.getElementById(v2.edge), v2.thisX, v2.thisY, x, y)
            }
        })
    })
    vertex.style.left = `${x - vWidth / 2}px`
    vertex.style.top = `${y - vHeight / 2}px`
}

// draw line from point1 to point2
function drawDiv(div, x1, y1, x2, y2) {
    let dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
        angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI,
        midx = (x1 + x2) / 2,
        midy = (y1 + y2) / 2
    div.style.left = `${midx - dist / 2 + 4}px`
    div.style.width = `${dist}px`
    div.style.top = `${midy}px`
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

    let leftArrow = document.createElement("div")
    leftArrow.classList.add('arrow')
    leftArrow.classList.add('edge')
    leftArrow.classList.add('left')
    edge.appendChild(leftArrow)

    let rightArrow = document.createElement("div")
    rightArrow.classList.add('arrow')
    rightArrow.classList.add('edge')
    rightArrow.classList.add('right')
    edge.appendChild(rightArrow)

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

        updateAdjacency(startingVertex, el.id, 1)

        adjacency[startingVertex].push({
            v: el.id,
            edge: name1,
            thisX: x1,
            thisY: y1,
            otherX: x2,
            otherY: y2,
        })

        if(!isDirected){
            adjacency[el.id].push({
                v: startingVertex,
                edge: name1,
                thisX: x2,
                thisY: y2,
                otherX: x1,
                otherY: y1,
            })
        }

        //console.log("foo", el)
    }
    console.log("righting")
}

function updateAdjacency(start, end, wt){

    mat[start][end] = wt

    if(!isDirected){
        mat[end][start] = wt
    }
}

// ending all changes when mouse goes up
function endChanges(x, y) {
    if (movingVertex == null && startingVertex == null)
        return
    if (movingVertex) {
        adjacency[movingVertex].forEach((neighbour) => {
            neighbour.thisX = x
            neighbour.thisY = y
        })
        adjacency.forEach((value, index) => {
            value.forEach((v2, i2) => {
                if (v2.v == movingVertex) {
                    adjacency[index][i2].otherX = x
                    adjacency[index][i2].otherY = y
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