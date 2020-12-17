import * as THREE from './three/build/three.module.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './three/examples/jsm/loaders/DRACOLoader.js';
import { EffectComposer } from './three/examples/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from './three/examples/jsm/postprocessing/OutlinePass.js';
import { RenderPass } from './three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from './three/examples/jsm/shaders/GammaCorrectionShader.js';
import { FXAAShader } from './three/examples/jsm/shaders/FXAAShader.js';
import { ColorifiedShader } from './three/examples/jsm/shaders/ColorifiedShader.js';
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import { TWEEN } from './tween/tween.js';

let mapData;
getJsonObject(onJsonLoaded, '../data/data.json');

let devMode = false;
if (devMode) {
    enableDevMode();
}

let controls;
let canvasElem;
let camera, scene, renderer, raycaster, composer, fxaaPass, outlinePass, selectedOutlinePass, pixelRatio;
let outlinedObjects = [];
let selectedObjects = [];

let colorifiedShader;
let noFade = { value: 0.0 };
let fadeAmount = { value: 1.0 };
let fullFade = { value: 1.0 };

// settings
let FOVRadians, hFOVRadians;

const cameraNearClipPlane = 40;
const cameraFarClipPlane = 1000;
let aspect = 0;
let cameraAspect;

let cameraDist;

let originPoint, chosenCameraPos;

let originCameraPosition = new THREE.Vector3(0, 0, 0);
let originCameraRotation = new THREE.Vector3(0, 0, 0);

let currentCameraPosition = new THREE.Vector3(0, 0, 0);
let currentCameraRotation = new THREE.Vector3(0, 0, 0);

let targetCameraPosition = new THREE.Vector3(0, 0, 0);
let targetCameraRotation = new THREE.Vector3(0, 0, 0);

let isZoomed = false;
let isZooming = false;

let mouseOffset = 0;
let sceneOffsetTarget = 0;
let currentSceneOffset = 0;

const shadow = {
    res: 2048,
    clip: 70,
    farClip: 100,
    bias: -0.008,
};

const hemiLightColour = new THREE.Color(0xbbbbff);
const hemiLightGroundColour = new THREE.Color(0xbbbbff);
const hemiLightBrightness = 0.4;
const hemiLightPosition = new THREE.Vector3(0, 100, 0);

const dirLightColour = new THREE.Color(0xffffbb);
const dirLightBrightness = 0.8;
const dirLightPosition = new THREE.Vector3(10, 60, 50);

const outlineFX = {
    edgeStrength: 6,
    edgeGlow: 0,
    edgeThickness: 2,
    pulsePeriod: 4,
    visibleEdgeColor: 0xfcd800,
    hiddenEdgeColor: 0x000000,
};

const selectedFX = {
    edgeStrength: 10,
    edgeGlow: 0,
    edgeThickness: 4,
    pulsePeriod: 4,
    visibleEdgeColor: 0x2266ff,
    hiddenEdgeColor: 0x000000,
};

function init() {
    // canvas

    canvasElem = document.querySelector('#c');

    // scene setup

    scene = new THREE.Scene();

    // camera position

    aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(mapData.originCameraFOV, aspect, cameraNearClipPlane, cameraFarClipPlane);

    setCameraDistance();

    // devmode orbit
    if (devMode) {
        controls = new OrbitControls(camera, canvasElem);
    }

    // lights

    let hemiLight = new THREE.HemisphereLight(hemiLightColour, hemiLightGroundColour, hemiLightBrightness);
    hemiLight.position.copy(hemiLightPosition);
    scene.add(hemiLight);

    let dirLight = new THREE.DirectionalLight(dirLightColour, dirLightBrightness);
    dirLight.position.copy(dirLightPosition);
    scene.add(dirLight);

    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = shadow.res;
    dirLight.shadow.mapSize.height = shadow.res;
    dirLight.shadow.camera.left = -shadow.clip;
    dirLight.shadow.camera.right = shadow.clip;
    dirLight.shadow.camera.top = shadow.clip;
    dirLight.shadow.camera.bottom = -shadow.clip;
    dirLight.shadow.camera.far = shadow.farClip;
    dirLight.shadow.bias = shadow.bias;

    originPoint = new THREE.Vector3(mapData.originPoint.x, mapData.originPoint.y, mapData.originPoint.z);
    chosenCameraPos = new THREE.Vector3(mapData.chosenCameraPos.x, mapData.chosenCameraPos.y, mapData.chosenCameraPos.z);

    FOVRadians = mapData.originCameraFOV * (Math.PI / 180);

    // renderer

    renderer = new THREE.WebGLRenderer({ canvas: canvasElem, antialias: true, alpha: true });
    pixelRatio = window.devicePixelRatio || 1;
    if (pixelRatio > 2) {
        pixelRatio = 2;
    }
    console.log('pixel ratio: ' + pixelRatio);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // geometry
    const loadingManager = new THREE.LoadingManager(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');

        // optional: remove loader from DOM via event listener
        //loadingScreen.addEventListener('transitionend', onTransitionEnd);
    });

    const loader = new GLTFLoader(loadingManager);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./js/three/examples/jsm/loaders/draco-decoder/');
    dracoLoader.preload();
    loader.setDRACOLoader(dracoLoader);

    loader.load(mapData.scenePath, (gltf) => {
        let loadedScene = gltf.scene;
        for (let mesh of loadedScene.children) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            let clickObject = getClickObject(mesh);
            if (clickObject.name) {
                outlinedObjects.push(mesh);
                mapData.clickPoints.meshes.push(mesh);
                clickObject.mesh = mesh;
            }

            if (mesh.children.length > 0) {
                for (const meshChild of mesh.children) {
                    meshChild.castShadow = true;
                    meshChild.receiveShadow = true;
                }
            }
        }
        createOutlinePass();
        scene.add(loadedScene);
    });

    loader.load(mapData.clickObjectsPath, (gltf) => {
        let loadedScene = gltf.scene;
        for (let mesh of loadedScene.children) {
            mesh.visible = false;

            let clickObject = getClickObject(mesh);
            if (clickObject.name) {
                mapData.clickPoints.clickMeshes.push(mesh);
                clickObject.clickMesh = mesh;
            }
        }
        scene.add(loadedScene);
    });

    console.log(mapData.clickPoints);
    console.log(scene.children);

    // post processing

    composer = new EffectComposer(renderer);

    let renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    let gammaCorrection = new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaCorrection);

    colorifiedShader = new ShaderPass(ColorifiedShader);
    composer.addPass(colorifiedShader);

    fxaaPass = new ShaderPass(FXAAShader);
    pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (canvasElem.offsetWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (canvasElem.offsetHeight * pixelRatio);
    composer.addPass(fxaaPass);

    // raycaster
    raycaster = new THREE.Raycaster();

    // initialisation

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('message', function (event) {
        console.log(`recieved ${event.data} from ${event.origin}`);
        if (event.data == 'backClicked') {
            triggerZoomOut();
        }
    });
    renderer.setAnimationLoop(render);

    resize();

    let fadeIn = new TWEEN.Tween(fadeAmount).to(noFade, 2000).easing(TWEEN.Easing.Quadratic.InOut);
    fadeIn.onUpdate(function () {
        colorifiedShader.uniforms['fade'].value = fadeAmount.value;
    });
    fadeIn.start();
}

function getClickObject(object) {
    let returnedObject = {};
    Object.values(mapData.clickPoints.objects).forEach((clickObj) => {
        if (clickObj.name == object.name || clickObj.clickName == object.name) {
            returnedObject = clickObj;
        }
    });
    return returnedObject;
}

function createOutlinePass() {
    outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    composer.addPass(outlinePass);

    outlinePass.selectedObjects = outlinedObjects;

    outlinePass.edgeStrength = outlineFX.edgeStrength;
    outlinePass.edgeGlow = outlineFX.edgeGlow;
    outlinePass.edgeThickness = outlineFX.edgeThickness;
    outlinePass.pulsePeriod = outlineFX.pulsePeriod;
    outlinePass.visibleEdgeColor.set(outlineFX.visibleEdgeColor);
    outlinePass.hiddenEdgeColor.set(outlineFX.hiddenEdgeColor);

    selectedOutlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    composer.addPass(selectedOutlinePass);

    selectedOutlinePass.edgeStrength = selectedFX.edgeStrength;
    selectedOutlinePass.edgeGlow = selectedFX.edgeGlow;
    selectedOutlinePass.edgeThickness = selectedFX.edgeThickness;
    selectedOutlinePass.pulsePeriod = selectedFX.pulsePeriod;
    selectedOutlinePass.visibleEdgeColor.set(selectedFX.visibleEdgeColor);
    selectedOutlinePass.hiddenEdgeColor.set(selectedFX.hiddenEdgeColor);
}

function mouseRaycast(mousePosition, intersects) {
    let mouse = new THREE.Vector2();
    let rendererSize = new THREE.Vector2();
    renderer.getSize(rendererSize);
    mouse.x = (mousePosition.x / rendererSize.x) * 2 - 1;
    mouse.y = -(mousePosition.y / rendererSize.y) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    // ray visualiser
    //scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000));

    let intersectResult = raycaster.intersectObjects(intersects, true);
    return intersectResult;
}

function onDocumentMouseMove(event) {
    mouseOffset = (event.clientX / window.innerWidth - 0.5) * 2;
    let boundsRadians = (mapData.sceneRotationBounds * Math.PI) / 180;
    sceneOffsetTarget = mouseOffset * boundsRadians;

    let mousePos = new THREE.Vector2(event.clientX, event.clientY);
    let intersects = mouseRaycast(mousePos, mapData.clickPoints.meshes);
    let intersectsClick = mouseRaycast(mousePos, mapData.clickPoints.clickMeshes);

    let clickObject = {};
    if (intersects[0]) {
        clickObject = getClickObject(intersects[0].object.parent);
    }
    if (intersectsClick[0]) {
        clickObject = getClickObject(intersectsClick[0].object);
    }
    if (selectedOutlinePass) {
        if (clickObject.name) {
            selectedObjects = [];
            selectedObjects.push(clickObject.mesh);
            selectedOutlinePass.selectedObjects = selectedObjects;
        } else {
            selectedOutlinePass.selectedObjects = [];
        }
    }
}

function onDocumentTouchStart(event) {
    event.preventDefault();

    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    onDocumentMouseDown(event);
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    if (!devMode) {
        let mousePos = new THREE.Vector2(event.clientX, event.clientY);
        let intersects = mouseRaycast(mousePos, mapData.clickPoints.meshes);
        let intersectsClick = mouseRaycast(mousePos, mapData.clickPoints.clickMeshes);

        if (intersects.length > 0 || intersectsClick.length > 0) {
            let clickTarget = '';
            let clickObject = {};

            if (intersects[0]) {
                clickObject = getClickObject(intersects[0].object.parent);
            }
            if (intersectsClick[0]) {
                clickObject = getClickObject(intersectsClick[0].object);
            }
            if (clickObject.name) {
                if (!isZoomed && !isZooming) {
                    clickTarget = clickObject.clickEvent;

                    targetCameraPosition.copy(clickObject.zoom.position);
                    targetCameraRotation.copy(clickObject.zoom.rotation);

                    let posTween = new TWEEN.Tween(currentCameraPosition).to(targetCameraPosition, 1500).easing(TWEEN.Easing.Quadratic.InOut);
                    posTween.onUpdate(function () {
                        camera.position.x = currentCameraPosition.x;
                        camera.position.y = currentCameraPosition.y;
                        camera.position.z = currentCameraPosition.z;
                    });
                    posTween.start();

                    let rotTween = new TWEEN.Tween(currentCameraRotation).to(targetCameraRotation, 1500).easing(TWEEN.Easing.Sinusoidal.InOut);
                    rotTween.onUpdate(function () {
                        camera.rotation.x = currentCameraRotation.x;
                        camera.rotation.y = currentCameraRotation.y;
                        camera.rotation.z = currentCameraRotation.z;
                    });
                    rotTween.start();

                    if (clickObject.isTransition) {
                        let fadeIn = new TWEEN.Tween(fadeAmount).to(fullFade, 1500).easing(TWEEN.Easing.Quadratic.InOut);
                        fadeIn.onUpdate(function () {
                            colorifiedShader.uniforms['fade'].value = fadeAmount.value;
                        });
                        fadeIn.start();
                    }

                    isZooming = true;

                    posTween.onComplete(function () {
                        isZoomed = true;
                        isZooming = false;

                        console.log('clickTarget: ', clickTarget);
                        window.parent.postMessage('click:' + clickTarget, '*');
                    });
                }
            }
        }
        if (isZoomed && !isZooming) {
            triggerZoomOut();
        }
    }

    if (devMode) {
        console.log('position: { x:' + camera.position.x + ', y:' + camera.position.y + ', z:' + camera.position.z + ' },');
        console.log('rotation: { x:' + camera.rotation.x + ', y:' + camera.rotation.y + ', z:' + camera.rotation.z + ' },');
    }
}

function onWindowResize() {
    resize();
}

function resize() {
    aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);

    pixelRatio = renderer.getPixelRatio();
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (canvasElem.offsetWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (canvasElem.offsetHeight * pixelRatio);

    if (!isZoomed && !isZooming) {
        setCameraDistance();
    }
}

function setCameraDistance() {
    cameraAspect = aspect;
    if (cameraAspect > 1.5) {
        cameraAspect = 1.5;
    }
    hFOVRadians = 2 * Math.atan(Math.tan(FOVRadians / 2) * cameraAspect);
    cameraDist = Math.abs(mapData.boundsRadius / Math.sin(hFOVRadians / 2));

    let cameraPosVector = new THREE.Vector3();
    chosenCameraPos = mapData.chosenCameraPos;
    originPoint = mapData.originPoint;
    cameraPosVector.subVectors(chosenCameraPos, originPoint).normalize();

    let cameraDistanceVector = new THREE.Vector3();
    cameraDistanceVector.copy(cameraPosVector);
    cameraDistanceVector.multiplyScalar(cameraDist);

    camera.position.copy(cameraDistanceVector);
    camera.lookAt(originPoint.x, originPoint.y, originPoint.z);

    originCameraPosition.copy(camera.position);
    originCameraRotation.copy(camera.rotation);
    currentCameraPosition.copy(camera.position);
    currentCameraRotation.copy(camera.rotation);

    

}

function triggerZoomOut() {
    targetCameraPosition.copy(originCameraPosition);
    targetCameraRotation.copy(originCameraRotation);

    let posTween = new TWEEN.Tween(currentCameraPosition).to(targetCameraPosition, 1500).easing(TWEEN.Easing.Quadratic.InOut);
    posTween.onUpdate(function () {
        camera.position.x = currentCameraPosition.x;
        camera.position.y = currentCameraPosition.y;
        camera.position.z = currentCameraPosition.z;
    });
    posTween.start();

    let rotTween = new TWEEN.Tween(currentCameraRotation).to(targetCameraRotation, 1500).easing(TWEEN.Easing.Sinusoidal.InOut);
    rotTween.onUpdate(function () {
        camera.rotation.x = currentCameraRotation.x;
        camera.rotation.y = currentCameraRotation.y;
        camera.rotation.z = currentCameraRotation.z;
    });
    rotTween.start();

    isZooming = true;

    window.parent.postMessage('zoomOut', '*');
    console.log('Zoom Out');

    posTween.onComplete(function () {
        isZoomed = false;
        isZooming = false;
    });
}

function render(timestamp, frame) {
    composer.render(scene, camera);
    
    if (!devMode) {
        if (isZoomed || isZooming) {
            sceneOffsetTarget = 0;
        }
        let sceneTargetDiff = currentSceneOffset - sceneOffsetTarget;
        if (Math.abs(sceneTargetDiff) > 0.001) {
            currentSceneOffset -= sceneTargetDiff * 0.01;
            scene.rotation.y = currentSceneOffset;
        }
    }

    TWEEN.update();
    if (devMode) {
        controls.update();
    }
}

function enableDevMode() {
    let loadingScreen = document.querySelector('#loading-screen');
    loadingScreen.classList.add('unclickable');
}

function getJsonObject(callback, dataurl) {
    let request = new XMLHttpRequest();
    request.open('GET', dataurl, true);
    request.send(null);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            //let type = request.getResponseHeader('Content-Type');
            try {
                callback(JSON.parse(request.responseText));
            } catch (err) {
                callback(err);
            }
        }
    };
}

function onJsonLoaded(object) {
    mapData = object;
    init();
}
