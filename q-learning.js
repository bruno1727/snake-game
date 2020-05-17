import * as env from './main.js';

var count = 0;
var done = false

env.create();

var obsSpaceHigh = env.calculateObsSpaceHigh(env.snake, env.food);
var obsSpaceLow = env.calculateObsSpaceLow(env.snake, env.food);
var DISCRETE_SIZE = 20;
var discreteWinsize = (obsSpaceHigh - obsSpaceLow)/DISCRETE_SIZE;
var actionSpace = env.getActionSpace();
var qTable = generateQTable(-2, 0, [DISCRETE_SIZE, actionSpace]);

console.log(obsSpaceHigh); 
console.log(obsSpaceLow);
console.log(discreteWinsize);

requestAnimationFrame(loop);
function loop(){

    const result = env.step('r');
    //console.log("done: " + done +  ", reward: " + result.reward + ", state: " + result.newState)
    env.render();

    if(!done && count <= 1000){
        requestAnimationFrame(loop);
    }
}

function generateQTable(min, max, dimension){

    var arr = [];
    for(var i=0; i < dimension[0]; i++){
        arr[i] = [];
        for(var j=0; j < dimension[1]; j++){

            arr[i][j] = env.random(min, max);
        }
    }

    return arr;
}