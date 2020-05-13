import * as THREE from './three.module.js';

main();

var currDirection = '';
const VELOCITY = 0.05;
var snake;


function main() {

    const canvas = document.querySelector('#c');

    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight, false);
    
    const camera = createCamera(renderer);

    const scene = new THREE.Scene();
    scene.add(createLight());
    snake = createSnake();
    scene.add(snake);


    const visibleHeightAtZDepth = ( depth, camera ) => {
        // compensate for cameras not positioned at z=0
        const cameraOffset = camera.position.z;
        if ( depth < cameraOffset ) depth -= cameraOffset;
        else depth += cameraOffset;
      
        // vertical fov in radians
        const vFOV = camera.fov * Math.PI / 180; 
      
        // Math.abs to ensure the result is always positive
        return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
      };
      
      const visibleWidthAtZDepth = ( depth, camera ) => {
        const height = visibleHeightAtZDepth( depth, camera );
        return height * camera.aspect;
      };
    

    
    function render(now) {
        
        if(snake.position.x > ((visibleWidthAtZDepth(0, camera)/2)  - snake.scale.x/2) )
            reset();

        if(snake.position.y > ((visibleHeightAtZDepth(0, camera)/2)  - snake.scale.y/2) )
            reset();

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

function reset(){
    snake.position.x = 0;
    snake.position.y = 0;
    currDirection = '';
}

function createCamera(renderer){

    const fov = 75;
    const aspect = renderer.domElement.clientWidth / renderer.domElement.clientHeight;
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 1;

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