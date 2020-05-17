import * as THREE from './three.module.js';

var currDirection = -1;
var prevDirection = currDirection;
var points = 0;
export var food;
const VELOCITY = 2.5;
var camera;
var scene;
export var snake;
var renderer;
const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
var pointsTemp = points;
const DEFAULT_SIZE = 4;
var stepCount = 0;
export const SCORE_REWARD = 25;
const MOVE_REWARD = -1;

export function getActionSpace(){
    return 4;
}

export function step(direction){
    stepCount++;
    setDirection(direction);
    const scored = points > pointsTemp;
    if(scored) pointsTemp = points;

    var reward;
    if(points > pointsTemp){
        reward = SCORE_REWARD;
    } else{
        reward = MOVE_REWARD;
    }

    return {
        done: stepCount % 200 == 0 || scored,
        newState: calculateEuclideanDistance(snake, food),
        reward: reward,
        scored: scored
    };
}

function setDirection(direction){

    prevDirection = currDirection;
    currDirection = direction;

    if( (prevDirection == RIGHT && currDirection == LEFT) 
    || (prevDirection == LEFT && currDirection == RIGHT)
    || (prevDirection == DOWN && currDirection == UP)
    || (prevDirection == UP && currDirection == DOWN))
        currDirection = prevDirection;
    
}

export function reset(object){

    object = object || snake;
    object.position.x = 0;
    object.position.y = 0;
    setDirection(-1);

    return {
        newState: calculateEuclideanDistance(snake, food)
    }
}

function calculateEuclideanDistance(object1, object2){
    return Math.sqrt( 
        Math.pow(object1.position.x - object2.position.x, 2)
        + Math.pow(object1.position.y - object2.position.y, 2)
        )
}

export function calculateObsSpaceHigh(object1, object2){

    const object1Temp = createSnake();
    object1Temp.geometry.parameters.width = object1.geometry.parameters.width;
    object1Temp.geometry.parameters.height = object1.geometry.parameters.height;
    object1Temp.position.x = getMinX(camera) + object1Temp.geometry.parameters.width/2;
    object1Temp.position.y = getMaxY(camera) - object1Temp.geometry.parameters.height/2;
    
    const object2Temp = createSnake();
    object2Temp.geometry.parameters.width = object2.geometry.parameters.width;
    object2Temp.geometry.parameters.height = object2.geometry.parameters.height;
    object2Temp.position.x = getMaxX(camera) - object2Temp.geometry.parameters.width/2;
    object2Temp.position.y = getMinY(camera) + object2Temp.geometry.parameters.height/2;

    return calculateEuclideanDistance(object1Temp, object2Temp);
}

export function calculateObsSpaceLow(object1, object2){
    
    const object1Temp = createSnake();
    object1Temp.geometry.parameters.width = object1.geometry.parameters.width;
    object1Temp.geometry.parameters.height = object1.geometry.parameters.height;
    object1Temp.position.x = 0;
    object1Temp.position.y = 0;
    
    const object2Temp = createSnake();
    object2Temp.geometry.parameters.width = object2.geometry.parameters.width;
    object2Temp.geometry.parameters.height = object2.geometry.parameters.height;
    object2Temp.position.x = object1Temp.position.x + object1Temp.geometry.parameters.width/2 + object2Temp.geometry.parameters.width/2;
    object2Temp.position.y = object1Temp.position.y;

    return calculateEuclideanDistance(object1Temp, object2Temp);
}

export function create() {

    const canvas = document.querySelector('#c');

    renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight, false);
    
    camera = createCamera(renderer);

    scene = new THREE.Scene();
    scene.add(createLight());
    snake = createSnake();
    scene.add(snake);
    
    food = refreshFood(camera, scene);
}

export function render(now) {

    if(collided(snake, food)){
        score();
        food = refreshFood(camera, scene);
    }
    
    if(collidedWithWall(snake, camera))
        reset(snake);

    if(currDirection == LEFT)
        snake.position.x += -VELOCITY;

    else if(currDirection == UP)
        snake.position.y += VELOCITY;

    else if(currDirection == RIGHT)
        snake.position.x += VELOCITY;

    else if(currDirection == DOWN)
        snake.position.y += -VELOCITY;

    renderer.render(scene, camera);
}

window.onkeyup = function(event){

    if(event.keyCode == 37 || event.keyCode == 65){ //left
        setDirection(LEFT);
        
    } else if(event.keyCode == 38 || event.keyCode == 87){ //up
        setDirection(UP);
        
    } else if(event.keyCode == 39 || event.keyCode == 68){ //righ
        setDirection(RIGHT);
        
    } else if(event.keyCode == 40 || event.keyCode == 83){ //down
        setDirection(DOWN);

    } else if(event.keyCode == 27 || event.keyCode == 13 || event.keyCode == 32){ //esc/space/enter
        reset();
    }
}

function score(){
    points++;
    console.log("score: " + points);
    reset();
}

function refreshFood(camera, scene){

    if(food){
        //scene.remove(food);
        return food;
    }

    const width = DEFAULT_SIZE;
    const height = 32;
    const geometry = new THREE.PlaneBufferGeometry(width, height);

    const material = new THREE.MeshPhongMaterial();
    food = new THREE.Mesh(geometry, material);

    food.position.x = random( (getMaxX(camera) - food.geometry.parameters.width), getMinX(camera) );
    food.position.y = random( (getMaxY(camera) - food.geometry.parameters.height), getMinY(camera) );

    scene.add(food);

    return food;
}

export function random(min, max){
    return Math.random() * (max - min) + min;
}

function collided(object1, object2){

    const object1FirstX = object1.position.x  - object1.geometry.parameters.width/2;
    const object1LastX = object1.position.x + object1.geometry.parameters.width/2;
    const object1FirstY = object1.position.y - object1.geometry.parameters.height/2;
    const object1LastY = object1.position.y + object1.geometry.parameters.height/2;
    
    const object2FirstX = object2.position.x - object2.geometry.parameters.width/2;
    const object2LastX = object2.position.x + object2.geometry.parameters.width/2;
    const object2FirstY = object2.position.y - object2.geometry.parameters.height/2;
    const object2LastY = object2.position.y + object2.geometry.parameters.height/2;

    return (object1LastX >= object2FirstX  && object1FirstX <= object2LastX)
     && (object1LastY >= object2FirstY  && object1FirstY <= object2LastY);
}

function collidedWithWall(object, camera){

    const xLimit = ((visibleWidth(camera)/2)  - object.geometry.parameters.width/2);
    const yLimit = ((visibleHeight(camera)/2)  - object.geometry.parameters.height/2);

    return Math.abs(object.position.x) > xLimit
        || Math.abs(object.position.y) > yLimit;
}

function getMaxX(camera){
    return visibleWidth(camera)/2;
}

function getMinX(camera){
    return -visibleWidth(camera)/2;
}

function getMaxY(camera){
    return visibleHeight(camera)/2;
}

function getMinY(camera){
    return -visibleHeight(camera)/2;
}

function visibleHeight(camera){
    return 2 * Math.tan( toRadians(camera.fov) / 2 ) * camera.position.z;
} 
    

function visibleWidth(camera){
    return 2 * Math.tan( toRadians(camera.fov) / 2 ) * camera.position.z * camera.aspect;
}

function toRadians(degrees){
    return degrees * Math.PI / 180;
}

function createCamera(renderer){

    const fov = 75;
    const aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 10;

    return camera;
}

function createLight(){

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);

    return light;
}

function createSnake(){
    
    const width = DEFAULT_SIZE;
    const height = DEFAULT_SIZE;
    const geometry = new THREE.PlaneBufferGeometry(width, height);

    const material = new THREE.MeshPhongMaterial();
    const cube = new THREE.Mesh(geometry, material);

    return cube;
}