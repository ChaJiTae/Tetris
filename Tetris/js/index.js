//blocks.js를 import 시킴
import BLOCKS from "./blocks.js";

// DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
//Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

//variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;

let movingItem = {
    type: "",
    direction: 0,
    top: 0,
    left: 3,
}

init();

//functions
function init(){
    tempMovingItem = {...movingItem};
    for(let i=0; i<20; i++){
        prependNewLine();
    }
    generateNewBlock()
}

// li와 ul 태그 그리는 함수
function prependNewLine(){
        const li = document.createElement("li");
        const ul = document.createElement("ul");
        for(let j=0; j<10; j++){
            const matrix = document.createElement("li");
            ul.prepend(matrix);
        }
        li.prepend(ul)
        playground.prepend(li);
}

//블록 렌더링 하는 함수
function renderBlocks(moveType=""){
    const {type,direction,top,left} = tempMovingItem;
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving=>{
        moving.classList.remove(type,"moving")
    })
    BLOCKS[type][direction].some(block=>{
        const x = block[0]+left;
        const y = block[1] + top;
        const target= playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);
        if(isAvailable){
            target.classList.add(type,"moving");
        }else{
            tempMovingItem = {...movingItem}
            if(moveType==='retry'){
                clearInterval(downInterval);
                showGameoverText();
            }
            setTimeout(()=>{
                renderBlocks('retry')
                if(moveType==="top"){
                    seizeBlock();
                }
            },0)
            return true;
        }
    })
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;
}
function seizeBlock(){
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving=>{
        moving.classList.remove("moving")
        moving.classList.add("seized");
    })
    checkMatch();
}

function checkMatch(){

    const childNodes = playground.childNodes;
    childNodes.forEach(child=>{
        let matched = true;
        child.children[0].childNodes.forEach(li=>{
            if(!li.classList.contains("sized")){
                matched=false;
            }
        })
        if(matched){
            child.remove();
            prependNewLine();
            score++;
            scoreDisplay.innerText = score;
        }
    })

    generateNewBlock();
}

function generateNewBlock(){

    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock('top',1)
    },duration)

    //blocks는 오브젝트이기에 반복문을 돌리기 위해 Object.entries를 이용함
    const blockArray = Object.entries(BLOCKS);
    //곱한 값만큼 random값 형성
    //floor는 소수점을 없애는 함수임
    const randomIndex = Math.floor(Math.random()*blockArray.length);
    movingItem.type=blockArray[randomIndex][0];
    movingItem.top=0;
    movingItem.left=3;
    movingItem.direction=0;
    tempMovingItem ={...movingItem};
    renderBlocks()
}

function checkEmpty(target){
    if(!target || target.classList.contains("seized")){
        return false;
    }
    return true;
}

function moveBlock(moveType,amount){
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}

function changeDirection(){
    const direction = tempMovingItem.direction;
    direction === 3 ? tempMovingItem.direction = 0 : tempMovingItem.direction += 1;
    renderBlocks()
}

function dropBlock(){
    clearInterval(downInterval);
    downInterval = setInterval(()=>{
        moveBlock("top",1)
    },10)
}

function showGameoverText(){
    gameText.style.display="flex";
}

//event handling
document.addEventListener("keydown",e=>{
    switch(e.keyCode){
        case 39:
            moveBlock("left",1);
            break;
        case 37:
            moveBlock("left",-1);
            break;
        case 40:
            moveBlock("top",1);
            break;
        case 38:
            changeDirection();
            break;
        case 32:
            dropBlock();
            break;
        default:
            break;
    }
})

restartButton.addEventListener("click",()=>{
    playground.innerHTML="";
    gameText.style.display="none";
    init()
})