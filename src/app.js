import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import Stats from 'three/examples/jsm/libs/stats.module';
//import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

let container, stats, group;
let camera, scene, controls, raycaster, pointer, renderer;

let INTERSECTED;
var intersects;

var stepX = 0;
var stepY = 0;
var stepZ = 0;

var targetX = 0;
var targetY = 0;
var targetZ = 0;

var camX = 0;
var camY = 0;
var camZ = 0;

var valueX = 0;
var valueY = 0;
var valueZ = 0;

let enableSelection = false;
let cameraMove = false;
let cameraStop = false;

var fbxobject;
var oldMat;
var planePlan;

init();
animate();

function init() {

    container = document.createElement( 'div' );
	document.body.appendChild( container );

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    //Camera
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.up.set( 0, 0, 1 );
    camera.position.set( 100, -100, 100 );
    //camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
    

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xd4d4d4 );


    // OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents( window );
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.enableZoom = true;
    controls.target.set( 0, 0, 30 );
    controls.update();


    // SpotLight
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(200, -400, 300);
    scene.add(spotLight);

    stats = new Stats();
    container.appendChild( stats.dom );
    

    //FBXLoader
    const loaderFBX = new FBXLoader();
    loaderFBX.load( 'EINSTEIN_Main_Building_FBX.fbx', function ( fbxobject ) {
        fbxobject.traverse( function ( child ) {
            if ( child.isMesh ) {
                //oldMat = child.material;
                child.material = new THREE.MeshLambertMaterial( {  
                color: 0x515151,
                //color: oldMat.color,
                transparent: false,
                opacity: 1 
                } );
            }
        } );
        fbxobject.rotation.x = 1.57;
        fbxobject.position.set( 0, 0, 0 );
        fbxobject.visible = true;
        scene.add( fbxobject );
        //console.log("fbxobject", fbxobject.position);
    });


    // Plane
    const loader = new THREE.TextureLoader();
    loader.load("plan_es.jpg", texture => {
        planePlan = new THREE.Mesh(
            new THREE.PlaneGeometry( 0.7, 0.7 ),
            new THREE.MeshLambertMaterial({map: texture, transparent: true, opacity: 0})
        );
        
        planePlan.rotation.z = 1.57;
        planePlan.visible = false;
        scene.add( planePlan );
    });
    

    // Listeners
    document.addEventListener( 'mousemove', onPointerMove );
    window.addEventListener( 'resize', onWindowResize );
    window.addEventListener('click', onClick );

}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}


function onPointerMove( event ) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}


function onClick( event ) {
    event.preventDefault();
    console.log("Metod onClick!");

    if ( enableSelection === true ) {
        stepX = ( camX - targetX ) / 1000;
        stepY = ( camY - targetY ) / 1000;
        stepZ = ( camZ - targetZ ) / 1000;
        //console.log("STEP", stepX, stepY, stepZ);
        
        cameraMove = true;
        //console.log(cameraMove);
        INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
    }    
}


function render() {

    if( cameraMove === false && cameraStop === false ) {

        // find intersections

        raycaster.setFromCamera( pointer, camera );

        intersects = raycaster.intersectObjects( scene.children );

        if ( intersects.length > 0 ) {

            enableSelection = true;

            if ( INTERSECTED != intersects[ 0 ].object ) {

                if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

                INTERSECTED = intersects[ 0 ].object;
                INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();

                if( cameraMove === false ) {
                    INTERSECTED.material.emissive.setHex( 0xff0000 ); 
                }
                if( cameraMove === true ) {
                    INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
                }
                
                //console.log(INTERSECTED);
                //console.log(intersects[ 0 ].distance);
                //console.log(intersects[ 0 ].object.name);
                //console.log(intersects[ 0 ].point);

                camX = camera.position.x;
                camY = camera.position.y;
                camZ = camera.position.z;
                //console.log("CAM", camX, camY, camZ);

                targetX = intersects[ 0 ].point.x;
                targetY = intersects[ 0 ].point.y;
                targetZ = intersects[ 0 ].point.z;
                console.log("OBJ", targetX, targetY, targetZ);

                targetX = intersects[ 0 ].point.x - 5.35;
                targetY = intersects[ 0 ].point.y + 5.15;
                targetZ = intersects[ 0 ].point.z + 5;
                //console.log("OBJ - + +  4.7", targetX, targetY, targetZ);

                //console.log( "DIST", camX - targetX, camY - targetY, camZ - targetZ );

                valueX = camX - stepX;
                valueY = camY - stepY;
                valueZ = camZ - stepZ;

                //console.log( "VALUE", valueX, valueY, valueZ );
            }

        } else {

            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = null;
            enableSelection = false;

        }
    }

    if( cameraMove === true && cameraStop === false ) {

        // Rotation
        if( camera.position.x - targetX < 15 ) {
            let stepRotation = 1.57 / 1000;
            camera.rotation.x -= stepRotation * 4.8;
            camera.rotation.y -= stepRotation * 3.4;
            camera.rotation.z += stepRotation * 5.73;
        }


        // Speed
        if( camera.position.x - targetX < -25 || camera.position.x - targetX > 25 ) {
            camera.position.x -= stepX * 2.84;
            camera.position.y -= stepY * 2.84;
            camera.position.z -= stepZ * 2.84;
        } else if( camera.position.x - targetX < -24 || camera.position.x - targetX > 24 ) {
            camera.position.x -= stepX * 2.74;
            camera.position.y -= stepY * 2.74;
            camera.position.z -= stepZ * 2.74;
        } else if( camera.position.x - targetX < -23 || camera.position.x - targetX > 23 ) {
            camera.position.x -= stepX * 2.72;
            camera.position.y -= stepY * 2.72;
            camera.position.z -= stepZ * 2.72;
        } else if( camera.position.x - targetX < -22 || camera.position.x - targetX > 22 ) {
            camera.position.x -= stepX * 2.65;
            camera.position.y -= stepY * 2.65;
            camera.position.z -= stepZ * 2.65;
        } else if( camera.position.x - targetX < -21 || camera.position.x - targetX > 21 ) {
            camera.position.x -= stepX * 2.58;
            camera.position.y -= stepY * 2.58;
            camera.position.z -= stepZ * 2.58;
        } else if( camera.position.x - targetX < -20 || camera.position.x - targetX > 20 ) {
            camera.position.x -= stepX * 2.5;
            camera.position.y -= stepY * 2.5;
            camera.position.z -= stepZ * 2.5;
        } else if( camera.position.x - targetX < -19 || camera.position.x - targetX > 19 ) {
            camera.position.x -= stepX * 2.4;
            camera.position.y -= stepY * 2.4;
            camera.position.z -= stepZ * 2.4;
        } else if( camera.position.x - targetX < -18 || camera.position.x - targetX > 18 ) {
            camera.position.x -= stepX * 2.31;
            camera.position.y -= stepY * 2.31;
            camera.position.z -= stepZ * 2.31;
        } else if( camera.position.x - targetX < -17 || camera.position.x - targetX > 17 ) {
            camera.position.x -= stepX * 2.2;
            camera.position.y -= stepY * 2.2;
            camera.position.z -= stepZ * 2.2;
        } else if( camera.position.x - targetX < -16 || camera.position.x - targetX > 16 ) {
            camera.position.x -= stepX * 2.05;
            camera.position.y -= stepY * 2.05;
            camera.position.z -= stepZ * 2.05;
        } else if( camera.position.x - targetX < -15 || camera.position.x - targetX > 15 ) {
            camera.position.x -= stepX * 1.98;
            camera.position.y -= stepY * 1.98;
            camera.position.z -= stepZ * 1.98;
        } else if( camera.position.x - targetX < -14 || camera.position.x - targetX > 14 ) {
            camera.position.x -= stepX * 1.82;
            camera.position.y -= stepY * 1.82;
            camera.position.z -= stepZ * 1.82;
        } else if( camera.position.x - targetX < -13 || camera.position.x - targetX > 13 ) {
            camera.position.x -= stepX * 1.7;
            camera.position.y -= stepY * 1.7;
            camera.position.z -= stepZ * 1.7;
        } else if( camera.position.x - targetX < -12 || camera.position.x - targetX > 12 ) {
            camera.position.x -= stepX * 1.6;
            camera.position.y -= stepY * 1.6;
            camera.position.z -= stepZ * 1.6;
        } else if( camera.position.x - targetX < -11 || camera.position.x - targetX > 11 ) {
            camera.position.x -= stepX * 1.5;
            camera.position.y -= stepY * 1.5;
            camera.position.z -= stepZ * 1.5;
        } else if( camera.position.x - targetX < -10 || camera.position.x - targetX > 10 ) {
            camera.position.x -= stepX * 1.4;
            camera.position.y -= stepY * 1.4;
            camera.position.z -= stepZ * 1.4;
        } else if( camera.position.x - targetX < -9 || camera.position.x - targetX > 9 ) {
            camera.position.x -= stepX * 1.3;
            camera.position.y -= stepY * 1.3;
            camera.position.z -= stepZ * 1.3;
        } else if( camera.position.x - targetX < -8 || camera.position.x - targetX > 8 ) {
            camera.position.x -= stepX * 1;
            camera.position.y -= stepY * 1;
            camera.position.z -= stepZ * 1;
        } else if( camera.position.x - targetX < -7 || camera.position.x - targetX > 7 ) {
            camera.position.x -= stepX * 1;
            camera.position.y -= stepY * 1;
            camera.position.z -= stepZ * 1;
        } else if( camera.position.x - targetX < -6 || camera.position.x - targetX > 6 ) {
            camera.position.x -= stepX * 1;
            camera.position.y -= stepY * 1;
            camera.position.z -= stepZ * 1;
        } else if( camera.position.x - targetX < -3 || camera.position.x - targetX > 3 ) {
            camera.position.x -= stepX * 1;
            camera.position.y -= stepY * 1;
            camera.position.z -= stepZ * 1;

            // Effect visible planePlan
            planePlan.position.set( targetX + 0.925, targetY - 0.95, targetZ - 1 ); 
            planePlan.visible = true;
            var tweenon = new TWEEN.Tween(planePlan.material).to({
                opacity: 1
            }, 2000).onComplete(function(){
                planePlan.material.transparent = false;
            });
            tweenon.start();

        } else if( camera.position.x - targetX < -1 || camera.position.x - targetX > 1 ) {
            camera.position.x -= stepX * 1;
            camera.position.y -= stepY * 1;
            camera.position.z -= stepZ * 1;           
        } else {
            cameraMove = false;
            cameraStop = true;
        }

        if( cameraMove === false && cameraStop === true ) {
            
        }
    }

    renderer.render( scene, camera );

}


function pointMonitor() {
    //console.log(camera.position);
    console.log( "DIST", camera.position.x - targetX, camera.position.y - targetY, camera.position.z - targetZ );
    //console.log( "VALUE", camera.position.x, camera.position.y, camera.position.z );
}


// animate
function animate() {
    
    requestAnimationFrame(animate); 
    
    render();

    TWEEN.update();

    //pointMonitor();

    //controls.update();

    stats.update();

}


