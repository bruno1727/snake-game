import * as THREE from './three.module.js';

main();

var currDirection = '';
var points = 0;
var food;
const VELOCITY = 0.08;
var camera;
var scene;


function main() {

    const canvas = document.querySelector('#c');

    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight, false);
    
    camera = createCamera(renderer);

    scene = new THREE.Scene();
    scene.add(createLight());
    const snake = createSnake();
    scene.add(snake);
    
    food = refreshFood(camera, scene);
    
    function render(now) {

        if(collided(snake, food)){
            score();
            food = refreshFood(camera, scene);
        }
        
        if(collidedWithWall(snake, camera))
            reset(snake);

        if(currDirection == 'l')
            snake.position.x += -VELOCITY;

        else if(currDirection == 'u')
            snake.position.y += VELOCITY;

        else if(currDirection == 'r')
            snake.position.x += VELOCITY;

        else if(currDirection == 'd')
            snake.position.y += -VELOCITY;

        renderer.render(scene, camera);
        
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

window.onkeyup = function(event){
    console.log(event.keyCode);

    if(event.keyCode == 37 || event.keyCode == 65){ //left
        console.log('left!');
        currDirection = 'l';
    } else if(event.keyCode == 38 || event.keyCode == 87){ //up
        console.log('up!');
        currDirection = 'u';
        
    } else if(event.keyCode == 39 || event.keyCode == 68){ //right
        console.log('right!');
        currDirection = 'r';
        
    } else if(event.keyCode == 40 || event.keyCode == 83){ //down
        console.log('down!');
        currDirection = 'd';
    } else if(event.keyCode == 27 || event.keyCode == 13 || event.keyCode == 32){ //esc/space/enter
        console.log('reset!');
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

    food.position.x = Math.random() * ( (getMaxX(camera) - food.scale.x) - getMinX(camera)) + getMinX(camera);
    food.position.y = Math.random() * ( (getMaxY(camera) - food.scale.y) - getMinY(camera)) + getMinY(camera);

    console.log("food: (" + food.position.x + ", " + food.position.y + ")");

    scene.add(food);

    return food;
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