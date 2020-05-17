import * as env from './main.js';

var count = 0;
var done = false

env.create();

var obsSpaceHigh = env.calculateObsSpaceHigh(env.snake, env.food);
var obsSpaceLow = env.calculateObsSpaceLow(env.snake, env.food);
var DISCRETE_SIZE = 20;
var discreteWindowSize = (obsSpaceHigh - obsSpaceLow)/DISCRETE_SIZE;
var actionSpace = env.getActionSpace();
var qTable = generateQTable(-2, 0, [DISCRETE_SIZE, actionSpace]);
var done = 0;

const LEARNING_RATE = 0.1;
const DISCOUNT = 0.95;
const EPISODES = 25000;

var epsilon = 1;
const START_EPSILON_DECAYING = 1;
const END_EPSILON_DECAYING = EPISODES//2;
const epsilonDecayValue = epsilon/(END_EPSILON_DECAYING - START_EPSILON_DECAYING);

//console.log(obsSpaceHigh); 
//console.log(obsSpaceLow);
//console.log(discreteWindowSize);

var discreteState = getDiscreteState(env.reset().newState);
//console.log(discreteState);

var count = 1;


console.log('episode '  + count);
console.log('epsilon '  + epsilon);
console.log(qTable);
requestAnimationFrame(loop);
var then = 0;
function loop(now){
    

    if(now - then > 250){
        then = now;
        const action = Math.random() > epsilon ? findIndexWithMaxQValue(qTable[discreteState]) : parseInt(env.random(0, env.getActionSpace()));
        const result = env.step(action);
        done = result.done;
        const scored = result.scored;
        const reward = result.reward;
        var newDiscrateState = getDiscreteState(result.newState);
        //console.log("done: " + done +  ", reward: " + result.reward + ", state: " + result.newState)
        env.render();
        
        if(!done){
            
            const maxFutureQ = findMaxQValue(qTable[newDiscrateState]);
            const currentQ = qTable[discreteState][action];
            
            var newQ = (1 - LEARNING_RATE) * currentQ + LEARNING_RATE * (reward + DISCOUNT * maxFutureQ);
            
            qTable[discreteState][action] = newQ;
            requestAnimationFrame(loop);
        } else if(scored){
            console.log('score!')
            qTable[discreteState][action] = env.SCORE_REWARD;
        }
        
        discreteState = newDiscrateState;
        
        if(done){
            if(count <= EPISODES){
                if (END_EPSILON_DECAYING >= count >= START_EPSILON_DECAYING) epsilon -= epsilonDecayValue;
                count++;
                env.reset();
                console.log('episode '  + count);
                console.log('epsilon '  + epsilon);
                console.log(qTable);
                requestAnimationFrame(loop);
            }
        }
    } else{
        requestAnimationFrame(loop);
    }
    
}

function findIndexWithMaxQValue(qTableRow){
    var max = qTableRow[0];
    qTableRow.forEach(q => {
        max = q > max ? max : q;
    })
    return qTableRow.findIndex(q => q == max);

}

function findMaxQValue(qTableRow){
    var max = qTableRow[0];
    qTableRow.forEach(q => {
        max = q > max ? max : q;
    })
    return max;

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

function getDiscreteState(state){
    return parseInt( (state - obsSpaceLow)/discreteWindowSize);
}