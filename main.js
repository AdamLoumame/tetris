let tileSize = 24
let columns = 10
let rows = 18

let canvas = document.querySelector(".canvas")
let context = canvas.getContext("2d")

canvas.height = tileSize * rows
canvas.width = tileSize * columns

class Cube{
    constructor(x,y,color){
        this.x = x 
        this.y = y
        this.color = color

        this.height = tileSize
        this.width = tileSize

        this.Of
    }
    place(){
        context.fillStyle = this.color
        context.fillRect(this.x,this.y,tileSize,tileSize)

        context.strokeStyle = "white"
        context.strokeRect(this.x,this.y,tileSize,tileSize)

    } 
}

let placedBlocks = []

class Builder{
    constructor(shape,color,y=0,rotatable=true){
        this.shape = JSON.parse(JSON.stringify(shape))
        this.x = 3 * tileSize     // the start point of x cords 
        this.y = y * tileSize     // the start point of y cords
        this.color = color
        this.rotatable = rotatable

        this.palced = false 
        this.compontents = []

        this.width = this.shape[0].length * tileSize
        this.height = this.shape.length * tileSize
        
        this.canMoveR = true
        this.canMoveL = true
    }
    create(){
        ShapeBox.push(this)
    }
    draw(){
        this.compontents = []
        let row = 0
        for (let saf of this.shape){
            let index = 0
            for (let bloc of saf){
                if (bloc === 1){
                    let part = new Cube(this.x+(index*tileSize),this.y+(row*tileSize),this.color)
                    part.of = this
                    part.place()
                    this.compontents.push(part)
                }
                index++
            }
            row++
        }
    }
    rotation(){
        if (this.rotatable){
            let rotatedShape = this.shape[0].map((_,index)=>this.shape.map(row=>row[index]).reverse())
            let canRotate = true

            // detect if the new shape will collision of any one of the placed blocks if so canRotate to false
            for (let row of rotatedShape){
                for (let block of row){
                    let newbX = this.x + row.indexOf(block)*tileSize
                    let newbY = this.y + rotatedShape.indexOf(row)*tileSize
                    placedBlocks.forEach(pb=> {
                        if (newbX < pb.x + pb.width && newbX + tileSize > pb.x && newbY < pb.y + pb.height && newbY + tileSize > pb.y){
                            canRotate = false
                        }
                    })
                }
            }
            if (rotatedShape.length*tileSize+this.y>canvas.height || this.x+rotatedShape[0].length * tileSize>canvas.width){
                canRotate=false
            }

            // Only rotate if will be collisions
            if (canRotate) {
                this.shape = rotatedShape
                context.clearRect(0, 0, canvas.width, canvas.height)
                this.draw()

                // Update the height and the width after rotation
                this.width = this.shape[0].length * tileSize
                this.height = this.shape.length * tileSize
            }
        }
    }
    goRight(){
        if (this.canMoveR){
            this.x += tileSize
        }
    }
    goLeft(){
        if (this.canMoveL){
            this.x -= tileSize
        }
    }
}



let ShapeBox = []
let tetrisShapes = {
    I: {
        shape: [
            [1, 1, 1, 1] // Horizontal
        ],
        color: "cyan" // Cyan
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1] // J-shaped
        ],
        color: "blue" // Blue
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1] // L-shaped
        ],
        color: "orange" // Orange
    },
    O: {
        shape: [
            [1, 1],
            [1, 1] // Square
        ],
        color: "yellow" // Yellow
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0] // S-shaped
        ],
        color: "lime" // Green
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1] // T-shaped
        ],
        color: "purple" // Purple
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1] // Z-shaped
        ],
        color: "red" // Red
    }
}

let randomShapeObj = Object.values(tetrisShapes)[Math.floor(Math.random()*Object.values(tetrisShapes).length)]
let shape1 = new Builder(randomShapeObj.shape,randomShapeObj.color)
shape1.create()

        // Low fps game settings 
function Update(){
    context.clearRect(0,0,canvas.width,canvas.height)

    let current = ShapeBox[ShapeBox.length-1]
    // spot the curr on mvt shape and check if it can move if not it wont be rotatable and creat new shape
    if (current.y+(tileSize*current.shape.length) < canvas.height && !current.placed){
        current.y += tileSize
    }else{
        current.rotatable = false
        current.placed = true
        // add the blocks of the current as placed
        current.compontents.forEach(b => placedBlocks.push(b))
        // score
        let score = Number(document.querySelector(`.${current.color} .score`).innerHTML) + 1
        document.querySelector(`.${current.color} .score`).innerHTML = score.toString().padStart(3,"0")

        document.querySelector(".score p").innerHTML = (Number(document.querySelector(".score p").innerHTML) + (current.compontents.length * 4)).toString().padStart(5,"0") 
        // create a new main (current) shape 
        let randomShapeObj = Object.values(tetrisShapes)[Math.floor(Math.random()*Object.values(tetrisShapes).length)]
        let shape = new Builder(randomShapeObj.shape,randomShapeObj.color)
        shape.create()
    }    
}
// speed changes (dy)
let speed = 500
let mainloop
let notLose = true
function gameloop(){
    mainloop = setInterval(_=>{
        if (notLose){
            Update()
        }
    },speed) // main loop
}
document.addEventListener("keydown",e=>{
    if (e.code === "ArrowDown"){
        clearInterval(mainloop)
        speed = 40
        gameloop()
    }
})
document.addEventListener("keyup",e=>{
    if (e.code === "ArrowDown"){
        clearInterval(mainloop)
        speed = 500
        gameloop()
    }
})
gameloop()
        // Smooth changes
function SmoothUps(){
    let SmoothLoop = requestAnimationFrame(SmoothUps)

    context.clearRect(0,0,canvas.width,canvas.height)
    for (let shape of ShapeBox){
        shape.draw()
    }

    // detect collision to stop the mvt
    let current = ShapeBox[ShapeBox.length-1]
    current.canMoveR = true
    current.canMoveL = true
    placedBlocks.forEach(placedB => {
        for (let block of current.compontents){
            if (detectCollisionSupperposed(block,placedB) && block.x===placedB.x && block.y+block.height===placedB.y){
                current.placed = true
                current.rotatable = false
                current.canMoveR = false
                current.canMoveL = false
            }
        }
    }) 
    // check if it can move in x axes
    for (let block of current.compontents){
        let nextXR = block.x+tileSize
        let nextXY = block.x-tileSize
        placedBlocks.forEach(pb=>{
            if(nextXR===pb.x && block.y===pb.y){
                current.canMoveR = false
            }
            if(nextXY===pb.x && block.y===pb.y){
                current.canMoveL = false
            }
        })
    }
    if (current.y+(tileSize*current.shape.length) >= canvas.height){
        current.rotatable = false
    }

    // lines logic
    let lineY
    placedBlocks.forEach(pb1=>{
        if (placedBlocks.filter(pb2=>pb1.y===pb2.y).length===columns){
            for (let block of placedBlocks.filter(pb2=>pb1.y===pb2.y)){
                placedBlocks.splice(placedBlocks.indexOf(block),1)

                let row = ((block.y-block.of.y)/tileSize)+1
                let X = ((block.x-block.of.x)/tileSize)+1
                block.of.shape[row-1][X-1] = 0
                block.of.compontents.splice(block.of.compontents.indexOf(block),1)

                lineY = block.y
            }
            placedBlocks = []
            for (let shape of ShapeBox){
                if (shape !== ShapeBox[ShapeBox.length-1] && lineY>shape.y){
                    shape.y+=tileSize
                    shape.draw()
                    shape.compontents.forEach(b => placedBlocks.push(b))
                }else if (shape !== ShapeBox[ShapeBox.length-1]){
                    shape.draw()
                    shape.compontents.forEach(b => placedBlocks.push(b))
                }
            }
            document.querySelector(".line .sc").innerHTML = Number(document.querySelector(".line .sc").innerHTML) + 1 
        }
    })
    
    // game over
    placedBlocks.forEach(block=>{
        if (block.y===0){
            cancelAnimationFrame(SmoothLoop)
            notLose = false
            document.querySelector('.lose').style.opacity = 1
        }
    })
}
SmoothUps()

// x mouvement
document.addEventListener("keydown",e=>{
    let current = ShapeBox[ShapeBox.length-1]
    if (e.code === "ArrowRight" && current.x+current.width<canvas.width){
        current.goRight()
    }
    if (e.code === "ArrowLeft" && current.x>0){
        current.goLeft()
    }
})
document.addEventListener("keydown",e=>{
    if (e.code === "Space"){
        ShapeBox[ShapeBox.length-1].rotation()
    }
})
// detect collision function 
let detectCollisionSupperposed = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y + a.height >= b.y

document.querySelector(".lose span").addEventListener("click",_=>location.reload()) 

document.addEventListener("keydown",e=>{
    if (e.code === "ArrowRight"){
        document.querySelector(".arrows span:nth-of-type(4)").style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)"
        document.querySelector(".arrows span:nth-of-type(4)").style.backgroundColor  = "white"
    }
    if (e.code === "ArrowLeft"){
        document.querySelector(".arrows span:nth-of-type(3)").style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)"
        document.querySelector(".arrows span:nth-of-type(3)").style.backgroundColor  = "white"
    }
    if (e.code === "ArrowUp"){
        document.querySelector(".arrows span:nth-of-type(2)").style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)"
        document.querySelector(".arrows span:nth-of-type(2)").style.backgroundColor  = "white"
    }
    if (e.code === "ArrowDown"){
        document.querySelector(".arrows span:nth-of-type(5)").style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)"
        document.querySelector(".arrows span:nth-of-type(5)").style.backgroundColor  = "white"
    }
    if (e.code === "ArrowRight"){
        document.querySelector(".arrows span:nth-of-type(4)").style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)"
        document.querySelector(".arrows span:nth-of-type(4)").style.backgroundColor  = "white"
    }
    if (e.code === "Space"){
        document.querySelector(".b2").style.backgroundColor  = "white"
    }
    setTimeout(() => {
        document.querySelectorAll(".arrows span").forEach(e => {
            e.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)"
            e.style.backgroundColor  = "#2c2d2f"
            document.querySelector(".b2").style.backgroundColor  = "#9b1f57"
        })  
    },100);
}) 