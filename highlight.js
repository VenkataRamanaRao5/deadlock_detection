function colorVertex(vertex, color) {
    document.getElementById(vertex).style.backgroundColor = color
}

function colorEdge(start, end, color) {
    (document.getElementById(start + '-' + end) ||
        document.getElementById(end + '-' + start)).style.backgroundColor = color
}

function uncolorVertex(vertex) {
    document.getElementById(vertex).style.backgroundColor = 'rgb(186, 189, 85)'
}

function uncolorEdge(start, end) {
    (document.getElementById(start + '-' + end) ||
        document.getElementById(end + '-' + start)).style.backgroundColor = 'orange'
}

function removeVertexGroup(color) {
    for (let i of document.getElementsByClassName('vertex'))
        if (i.style.backgroundColor == color)
            i.style.backgroundColor = 'rgb(186, 189, 85)'
}

function removeEdgeGroup(color) {
    for (let i of document.getElementsByClassName('edge'))
        if (i.style.backgroundColor == color)
            i.style.backgroundColor = 'orange'
}

async function prim(root) {
    removeEdgeGroup('brown')
    removeEdgeGroup('blue')
    removeEdgeGroup('purple')
    removeVertexGroup('brown')
    removeVertexGroup('green')
    removeVertexGroup('blue')
    let mst = Array(v).fill().map(() => ({ distance: 0, vertex: -1 })),
        nearness = Array(v).fill().map(() => ({ distance: Infinity, vertex: -1 }))
    while (true) {
        nearness[root] = { distance: 0, vertex: root }
        colorVertex(root, 'green')
        for (let i = 0; i < v; i++) {
            if (nearness[i].vertex == i) continue
            if (mat[root][i]) {
                await new Promise(r => setTimeout(r, 1000))
                colorVertex(i, 'blue')
                colorEdge(root, i, 'blue')
                try {
                    colorEdge(nearness[i].vertex, i, 'blue')
                } catch (error) {
                }
                await new Promise(r => setTimeout(r, 750))
                if (mat[root][i] < nearness[i].distance) {
                    nearness[i] = { distance: mat[root][i], vertex: root }
                    colorEdge(root, i, 'brown')
                }
                else
                    try {
                        colorEdge(nearness[i].vertex, i, 'brown')
                    } catch (error) {
                    }
                await new Promise(r => setTimeout(r, 750))
                removeEdgeGroup('blue')
                removeEdgeGroup('brown')
                if (nearness[i].vertex != i)
                    uncolorVertex(i)
                else
                    colorVertex(i, 'brown')
            }
        }
        colorVertex(root, 'green')
        let nearestDistance = Infinity, nearestVertex = -1, nearestParent = -1;
        await new Promise(r => setTimeout(r, 1000))
        for (let i = 0; i < v; i++)
            if (nearness[i].distance) {
                await new Promise(r => setTimeout(r, 750))
                colorVertex(i, 'blue')
                try {
                    colorEdge(i, nearness[i].vertex, 'blue')
                } catch (error) {
                }
                if (nearness[i].distance < nearestDistance) {
                    nearestDistance = nearness[i].distance;
                    nearestVertex = i;
                    nearestParent = nearness[i].vertex;
                }
            }
        if (nearestDistance == Infinity) {
            removeEdgeGroup('blue')
            removeVertexGroup('blue')
            break;
        }
        await new Promise(r => setTimeout(r, 1000))
        colorVertex(nearestVertex, 'brown')
        colorEdge(nearestVertex, nearestParent, 'purple')
        await new Promise(r => setTimeout(r, 1250))
        removeEdgeGroup('blue')
        removeVertexGroup('blue')
        colorVertex(root, 'brown')
        mst[nearestVertex].distance = nearestDistance;
        mst[nearestVertex].vertex = nearestParent;
        root = nearestVertex;
    }
    colorVertex(root, 'brown')
    return mst;

}

/*
0 5 7 4 5 
5 0 7 4 8 
7 7 0 4 5 
4 4 4 0 5 
5 8 5 5 0
*/