function extract(){
    const C = document.getElementById("C"),
        space = document.getElementById("space")
    space.innerHTML = ""
    C.innerHTML = "{<br>"

    mat.forEach((row) => {
        C.innerHTML += ' {'
        row.forEach((value, index) => {
            space.innerHTML += value
            space.innerHTML += " "
            
            C.innerHTML += value
            if(index != v - 1)
                C.innerHTML += ", "
        })
        space.innerHTML += '<br>'

        C.innerHTML += '},<br>'
    })
    C.innerHTML += '}'

}

function load(){
    let option = document.inputForm.inputStyle.value
    let input = document.getElementById('matrix').innerHTML
        .split(/(,|{|}|\s|<br>|<div>|<\/div>)/)
        .filter(x => !isNaN(parseInt(x)))
    console.log(input)
    for(let i = 0; i < v; i++)
        for(let j = 0; j < v; j++){
            mat[i][j] = parseInt(input[i*v + j])
            console.log(i, j, mat[i][j])
            if(mat[i][j]){
                startingVertex = i
                createWaitingEdge()
                finishEdge(document.getElementById(j))
                endChanges(0, 0)
            }
            else{
                activeEdge = document.getElementById(i+'-'+j)
                if(activeEdge)  deleteEdge()
            }
        }
}

function hide(div){
    document.getElementById(div).style.visibility = "hidden"
    container.style.visibility = "visible"
    if(div == 'input')
        load()
}

function show(div){
    extract()
    document.getElementById('matrix').innerHTML = document.getElementById("space").innerHTML
    document.getElementById(div).style.visibility = "visible"
    container.style.visibility = "hidden"
}

function clear() {
    mat = Array(v).fill().map(() => Array(v).fill(0))
    adjacency = []
    edges.innerHTML = ""
}

document.addEventListener('visibilitychange', function() {
      if (document.visibilityState == 'hidden') { 
        extract()
        sessionStorage.setItem('matrix', document.getElementById('space').innerHTML)
        sessionStorage.setItem('v', v)
      }
  });

