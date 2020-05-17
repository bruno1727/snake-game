import * as THREE from './three.module.js';

var currDirection = '';
var points = 0;
export var food;
const VELOCITY = 0.08;
var camera;
var scene;
export var snake;
var renderer;
const LEFT = 'l';
const UP = 'u';
const RIGHT = 'r';
const DOWN = 'd';

export function getActionSpace(){
    return 4;
}

export function step(direction){
    const pointsTemp = points;
    currDirection = direction;

    return {
        done: points > pointsTemp,
        newState: calculateEuclideanDistance(snake, food),
        reward: points > pointsTemp ? 0 : -1
    };
}

function calculateEuclideanDistance(object1, object2){
    return Math.sqrt( 
        Math.pow(object1.position.x - object2.position.x, 2)
        + Math.pow(object1.position.y - object2.position.y, 2)
        )
}

export function calculateObsSpaceHigh(object1, object2){

    const object1Temp = createSnake();
    object1Temp.scale.x = object1.scale.x;
    object1Temp.scale.y = object1.scale.y;
    object1Temp.position.x = getMinX(camera) + object1Temp.scale.x/2;
    object1Temp.position.y = getMaxY(camera) - object1Temp.scale.y/2;
    
    const object2Temp = createSnake();
    object2Temp.scale.x = object2.scale.x;
    object2Temp.scale.y = object2.scale.y;
    object2Temp.position.x = getMaxX(camera) - object2Temp.scale.x/2;
    object2Temp.position.y = getMinY(camera) + object2Temp.scale.y/2;

    return calculateEuclideanDistance(object1Temp, object2Temp);
}

export function calculateObsSpaceLow(object1, object2){
    
    const object1Temp = createSnake();
    object1Temp.scale.x = object1.scale.x;
    object1Temp.scale.y = object1.scale.y;
    object1Temp.position.x = 0;
    object1Temp.position.y = 0;
    
    const object2Temp = createSnake();
    object2Temp.scale.x = object2.scale.x;
    object2Temp.scale.y = object2.scale.y;
    object2Temp.position.x = object1Temp.position.x + object1Temp.scale.x/2 + object2Temp.scale.x/2;
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
    console.log('begin');

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
        currDirection = LEFT;
        
    } else if(event.keyCode == 38 || event.keyCode == 87){ //up
        currDirection = UP;
        
    } else if(event.keyCode == 39 || event.keyCode == 68){ //righ
        currDirection = RIGHT;
        
    } else if(event.keyCode == 40 || event.keyCode == 83){ //down
        currDirection = DOWN;

    } else if(event.keyCode == 27 || event.keyCode == 13 || event.keyCode == 32){ //esc/space/enter
        reset();
    }
}

function score(){
    points++;
    console.log("score: " + points);
}

function refreshFood(camera, scene){

    if(food)
        scene.remove(food);

    const width = 1;
    const height = 1;
    const geometry = new THREE.PlaneBufferGeometry(width, height);

    const material = new THREE.MeshPhongMaterial();
    food = new THREE.Mesh(geometry, material);

    food.position.x = random( (getMaxX(camera) - food.scale.x), getMinX(camera) );
    food.position.y = random( (getMaxY(camera) - food.scale.y), getMinY(camera) );

    scene.add(food);

    return food;
}

export function random(min, max){
    return Math.random() * (max - min) + min;
}

function collided(object1, object2){

    const object1FirstX = object1.position.x  - object1.scale.x/2;
    const object1LastX = object1.position.x + object1.scale.x/2;
    const object1FirstY = object1.position.y - object1.scale.y/2;
    const object1LastY = object1.position.y + object1.scale.y/2;
    
    const object2FirstX = object2.position.x - object2.scale.x/2;
    const object2LastX = object2.position.x + object2.scale.x/2;
    const object2FirstY = object2.position.y - object2.scale.y/2;
    const object2LastY = object2.position.y + object2.scale.y/2;

    return (object1LastX >= object2FirstX  && object1FirstX <= object2LastX)
     && (object1LastY >= object2FirstY  && object1FirstY <= object2LastY);
}

function collidedWithWall(object, camera){

    const xLimit = ((visibleWidth(camera)/2)  - object.scale.x/2);
    const yLimit = ((visibleHeight(camera)/2)  - object.scale.y/2);

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

function reset(object){
    object.position.x = 0;
    object.position.y = 0;
    currDirection = '';
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
    
    const width = 1;
    const height = 1;
    const geometry = new THREE.PlaneBufferGeometry(width, height);

    const material = new THREE.MeshPhongMaterial();
    const cube = new THREE.Mesh(geometry, material);

    return cube;
}