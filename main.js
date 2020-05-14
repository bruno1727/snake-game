import * as THREE from './three.module.js';

main();

var currDirection = '';
const VELOCITY = 0.08;


function main() {

    const canvas = document.querySelector('#c');

    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight, false);
    
    const camera = createCamera(renderer);

    const scene = new THREE.Scene();
    scene.add(createLight());
    snake = createSnake();
    scene.add(snake);
    

    
    function render(now) {
        
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

function collidedWithWall(object, camera){

    return object.position.x > ((visibleWidth(camera)/2)  - object.scale.x/2) 
        || object.position.y > ((visibleHeight(camera)/2)  - object.scale.y/2);
}

function visibleHeight(camera){
    return 2 * Math.tan( toRadians(camera.fov) / 2 ) * camera.position.z;;
} 
    

function visibleWidth(camera){
    return 2 * Math.tan( toRadians(camera.fov) / 2 ) * camera.position.z * camera.aspect;
}

const toRadians = (degrees) => degrees * Math.PI / 180;

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