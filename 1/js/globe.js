    import * as THREE from '../../build/three.module.js';
    import { OrbitControls } from '../jsm/controls/OrbitControls.js';
    import { EffectComposer } from '../jsm/postprocessing/EffectComposer.js';
    import Stats from '../jsm/libs/stats.module.js';
    import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js';
    import { DRACOLoader } from '../jsm/loaders/DRACOLoader.js';
    import { OutlinePass } from '../jsm/postprocessing/OutlinePass.js';
    import { RenderPass } from '../jsm/postprocessing/RenderPass.js';
    import { ShaderPass } from '../jsm/postprocessing/ShaderPass.js';
    import { GammaCorrectionShader } from '../jsm/shaders/GammaCorrectionShader.js';
    import { FXAAShader } from '../jsm/shaders/FXAAShader.js';
    import { ColorifiedShader } from '../jsm/shaders/ColorifiedShader.js';

    // DEV MODE
    var dm=false;

    // INTERACTIVE SNOWFALL COUNT
    var sc2;
    var snowsize2=.6;

    var camxspeed=.7;
    var camyspeed=.05;
    var camzspeed=1;

    // BASIC
    var camera,controls,scene,renderer,container,p1,p2,outlinePass,composer,outlinePassBasic,fxaaPass,pixelRatio;
    var mouseX = 0;
    var mouseY = 0;
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2(), INTERSECTED;
    var mat, geo;
    let colorifiedShader;

    var windowHalfX = window.innerWidth/2;
    var windowHalfY = window.innerHeight/2;

    // SNOW
    var particles1=[];
    var particles2=[];
    var snowsize=.3;
    var sc=30;
    var clickable=true;
    var st=5000;
    var im;

    var p1,p1p,p2,p2p;

    // SNOW
    var model, mixer, clock;

    var mixers=[];
    var outlinedObjects=[];

    var outlineFXBasic={
        edgeStrength:1,
        edgeGlow:1,
        edgeThickness:1,
        visibleEdgeColor:0xffffff,
        hiddenEdgeColor:0xffffff,
    }
    
    var outlineFX={
        edgeStrength:2,
        edgeGlow:2,
        edgeThickness:2,
        pulsePeriod:0,
        visibleEdgeColor:0xffffff,
        hiddenEdgeColor:0xffffff,
    };

    var moving=false;
    var clickedstart=false;

    var o1,o2,o3,o4,o5,o6,o7,o8,o9,o10,o11;

    var viewbandstand,viewmarket,viewmarketleft,viewmarketright,viewpavilion,viewtree,viewicerink,viewsanta,viewpostbox=false;

    var marketcamdesktopleft=new THREE.Vector3(41,-6.5,12);
    var marketcamdesktopright=new THREE.Vector3(43,-6.5,5);
    var pavilioncamdesktop=new THREE.Vector3(0,-4,-52);
    var postboxcamdesktop=new THREE.Vector3(40,-4,-40);
    var treecamdesktop=new THREE.Vector3(-45,5,-33);
    var icerinkcamdesktop=new THREE.Vector3(-42,2,34);
    var santacamdesktop=new THREE.Vector3(3.9,-5,47);
    var bandstandcamdesktop=new THREE.Vector3(21,-6,28);

    var marketcammobileleft=new THREE.Vector3(41,-6.5,12);
    var marketcammobileright=new THREE.Vector3(43,-6.5,5);
    var pavilioncammobile=new THREE.Vector3(0,-4,-52);
    var postboxcammobile=new THREE.Vector3(40,-4,-40);
    var treecammobile=new THREE.Vector3(-45,5,-33);
    var icerinkcammobile=new THREE.Vector3(-42,2,34);
    var santacammobile=new THREE.Vector3(3.9,-5,47);
    var bandstandcammobile=new THREE.Vector3(21,-6,28);

var arrowright, arrowleft;
var redArrow, greenArrow;
var arrowHovered = false;

    var fg=new THREE.Group();

    var stage_0=true;

    var rot, object;

    var cammovetime;
    var camrottime;

    var camp=new THREE.Vector3(0, 0, 0);
    var scamrot=new THREE.Vector3(0,0,0);
    var camt=new THREE.Vector3(0, 0, 0);

    var cameralookat=new THREE.Vector3(0, 0, 0);

    var day,night=false;

    var icm=11000;
    var icz=8500;

    var ca;

    var clp;

    var crx=0;
    var cry=-5;
    var crz=0;

    var isoverbutton=false;

    var cloudParticles = [];
    var cloudGeo;
    var cloudMaterial;

    var cloudmatopacity=.3;

    var clouds=new THREE.Group();

    init();

    function init() {

        if (dm==false) {
            icm=11000;
            icz=8500;
        }else{
            icm=300;
            icz=20; 
        }

        if (dm==true) {
            cammovetime=3000;
            camrottime=3000;
        }else{
            cammovetime=3000;
            camrottime=3000;
        }

        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours();
        var dateTime = time;
        if (dateTime>16||dateTime<5) {
            day=false; night=true;
        }
        else{
            day=true; night=false;
        }

        var canvasElem = document.querySelector('#canvas');

        document.getElementById('btnBringTheMagic').onclick = stage_01;
        
        clock = new THREE.Clock();

        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        im=true;}else{im=false;}

        if (im==true){$(".clickmei").hide();sc2=1000;$('#btnBringTheSnow').hide();shakebutton();}else{sc2=3000}

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );

        camera.position.set(38,78,144);
        camera.lookAt(0,0,0);

        scene = new THREE.Scene();

        let loader = new THREE.TextureLoader();
        loader.load("img/fogpink.png", function(texture){
          cloudGeo = new THREE.PlaneBufferGeometry(500,500);
          cloudMaterial = new THREE.MeshLambertMaterial({
            map:texture,
            transparent: true,
          });
          cloudMaterial.needsUpdate=true

          for(let p=0; p<50; p++) {
            let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
              cloud.position.set(
                Math.random()*200 -100,
                500,
                Math.random()*500-200
              );
              cloud.scale.set(4.5,4.5)
            cloud.rotation.x = 1.16;
            cloud.rotation.y = -0.12;
            cloud.rotation.z = Math.random()*2*Math.PI;
            cloud.material.opacity = cloudmatopacity;
            cloudParticles.push(cloud);
            clouds.add(cloud);
          }
        });

        for(let p=0; p<50; p++) {
          let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
          cloud.position.set(
            Math.random()*200 -100,
            500,
            Math.random()*500-200
          );
          cloud.scale.set(4.5,4.5)
          cloud.rotation.x = 1.16;
          cloud.rotation.y = -0.12;
          cloud.rotation.z = Math.random()*2*Math.PI;
          cloud.material.opacity = cloudmatopacity;
          cloudParticles.push(cloud);
          clouds.add(cloud);
        }

        clouds.scale.set(.025,.025,.025);
        clouds.position.set(7,22,50);
        clouds.rotation.z=Math.PI/2;
        clouds.rotation.x=Math.PI;
        clouds.rotation.y=Math.PI/2;
        // clouds.rotation.y=Math.PI;
        // scene.add(clouds);

        redArrow = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('img/arrow2.png') }); 
        greenArrow = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('img/arrow3.png') }); 
        greenArrow.transparent = true;
        greenArrow.opacity = 1;
        redArrow.map.needsUpdate = true;
        arrowright = new THREE.Mesh(new THREE.PlaneGeometry(200, 200),redArrow);
        arrowright.overdraw=true
        if (im==false) {
            arrowright.scale.set(.001,.001,.001);
            arrowright.position.set(.75,.5,-2);
        }
        else{
            arrowright.scale.set(.0006,.0006,.0006);
            arrowright.position.set(.35,.5,-2);
        }
        arrowright.material.transparent = true;
        arrowright.material.opacity = 1;
        arrowright.name="AR";
        //scene.add(camera)

        arrowleft = new THREE.Mesh(new THREE.PlaneGeometry(200, 200),redArrow);
        arrowleft.overdraw=true
        if (im==false) {
            arrowleft.scale.set(.001,.001,.001);
            arrowleft.position.set(-.75,.5,-2);
        }
        else{
            arrowleft.scale.set(.0006,.0006,.0006);
            arrowleft.position.set(-.35,.5,-2);
        }
        arrowleft.rotation.z=Math.PI;
        arrowleft.material.transparent = true;
        arrowleft.material.opacity = 1;
        arrowleft.name = "AL";
        
        scene.add(camera)

        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true, } );
        renderer.gammaFactor = 2.2;

        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(window.innerWidth,window.innerHeight);

        composer = new EffectComposer(renderer);

        var renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        var gammaCorrection = new ShaderPass(GammaCorrectionShader);
        composer.addPass(gammaCorrection);

        var material = new THREE.SpriteMaterial({map: new THREE.TextureLoader().load('img/flake.png') } );

        const light = new THREE.AmbientLight( 0xbbbbbb, .5 );
        scene.add( light );

        var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.set( 0.6, 0.75, 0.5 );
        hemiLight.groundColor.set( 0.095, 1, 0.5 );
        hemiLight.position.set( 0, 500, 0 );
        scene.add( hemiLight );

        var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.position.set( -1, 1, 1 );
        dirLight.position.multiplyScalar( 60);
        dirLight.name = "dirlight";
        scene.add( dirLight );
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = dirLight.shadow.mapSize.height = 1024;

        controls = new OrbitControls( camera, renderer.domElement );
        controls.update();
        if (dm==true){controls.enableRotate=true;controls.enablePan=true;controls.enableZoom=true;}
        if (dm==false){controls.enableRotate=false;controls.enablePan=false;controls.enableZoom=false;}
        
        container = document.getElementById( 'canvas' );
        container.appendChild( renderer.domElement );
        createOutlinePass();
        window.addEventListener( 'resize', onWindowResize, false );
        p1flow();
        loadModels();
        container.addEventListener('touchmove', function (event) {
          event.preventDefault()
        }, false)

        window.addEventListener('message', function (event) {
            console.log(`recieved ${event.data} from ${event.origin}`);
        if (event.data == 'shake') {
            console.log("shake!");
            shake();
        }
    });
    }

    function loadModels() {
      var onProgress = () => {};
      var onError = (errorMessage) => {
        console.log(errorMessage);
      };
        var globeposition = new THREE.Vector3(0, 0, 0);
        
    const loadingManager = new THREE.LoadingManager(() => {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');
    });
        
      var loader = new GLTFLoader(loadingManager);
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('jsm/loaders/draco-decoder/');
      dracoLoader.preload();
      loader.setDRACOLoader(dracoLoader);
      if (day==true) {
        loader.load('models/gltf/globe_day_compressed.glb', gltf => onLoad(gltf, globeposition), onProgress, onError);
      }
      if (day==false) {
        loader.load('models/gltf/globe_night_compressed.glb', gltf => onLoad(gltf, globeposition), onProgress, onError);
      }
      var onLoad = (gltf, position) => {
        animate();
        model=gltf.scene;
        model.position.y=-10;
        var animation = gltf.animations[0];
        var mixer=new THREE.AnimationMixer(model);
        mixers.push(mixer);
        var action=mixer.clipAction(animation);
        action.play();
          scene.add(model);
          scene.traverse( function( object ) {
            object.frustumCulled = false;
        } );
        scene.traverse( function ( child ) {
            if (child.material&&child.material.name==='Hoverarea' ) {
                child.material.transparent = true;
                child.material.opacity = 0; 
            }
        });
        /*
        var t1 = scene.getObjectByName("Bandstand_hoverarea");
        var t2 = scene.getObjectByName("Food_stall_hoverarea");
        var t3 = scene.getObjectByName("Games_stall_hoverarea");
        var t4 = scene.getObjectByName("Craft_Stall_hoverarea");
        var t5 = scene.getObjectByName("Cracker_stall_hoverarea");
        var t6 = scene.getObjectByName("Pavillion_hoverarea");
        var t7 = scene.getObjectByName("Post_box_hoverarea");
        var t8 = scene.getObjectByName("Christmas_hoerarea");
        var t8 = scene.getObjectByName("Ice_rink_hoverarea");
        var t9 = scene.getObjectByName("Santas_grotto_hoverarea");
        var t10 = scene.getObjectByName("Christmas_hoerarea");
        
        var parent = t1.parent;
        //parent.remove( t1,t2,t3,t4,t5,t6,t7,t8,t9,t10 );
        */

        o1=scene.getObjectByName("xmas_tree_click",true);
        o2=scene.getObjectByName("Pavillion_click",true);
        o3=scene.getObjectByName("iceRinkBuilding_click",true);
        o4=scene.getObjectByName("santasGrotto_click",true);
        o5=scene.getObjectByName("marketStall_Food_click",true);
        o6=scene.getObjectByName("marketStall_Games_click",true);
        o7=scene.getObjectByName("marketStall_Crafts_click",true);
        o8=scene.getObjectByName("marketStall_Cracker_click",true);
        o9=scene.getObjectByName("bandStand_click",true);
        o10=scene.getObjectByName("postBox_click",true);
        }
    }

        ca=[];

        if (im==true) {
            renderer.domElement.addEventListener('touchstart', function(event) {
                mouse.x = +(event.targetTouches[0].pageX / window.innerWidth) * 2 +-1;
                mouse.y = -(event.targetTouches[0].pageY / window.innerHeight) * 2 + 1;
                            var x = event.clientX; var y = event.clientY;
                            var newposX = x - 50; var newposY = y - 25;
                            if(viewbandstand==true){ca=["Bandstand_hoverarea","bandStand_click"];}
                            if(viewmarketleft==true){ca=["Food_stall_hoverarea","Games_stall_hoverarea"];}
                            if(viewmarketright==true){ca=["Craft_Stall_hoverarea","Cracker_stall_hoverarea"];}
                            if(viewpavilion==true){ca=["Pavillion_hoverarea"];}
                            if(viewpostbox==true){ca=["Post_box_hoverarea"];}
                            if(viewtree==true){ca=["Christmas_hoerarea"];}
                            if(viewicerink==true){ca=["Ice_rink_hoverarea"];}
                            if(viewsanta==true){ca=["Santas_grotto_hoverarea"];}
                            if(stage_0==false&&moving==false) {
                            raycaster.setFromCamera( mouse, camera );
                              var intersects = raycaster.intersectObjects(model.children);
                                if (intersects.length > 0) {
                                    if(ca.includes(intersects[0].object.name)) {
                                        document.querySelector('html').style.cursor = 'pointer'
                                        document.querySelector('body').style.cursor = 'pointer'
                                    if(intersects[0].object.name=="Christmas_hoerarea"){
                                        object=scene.getObjectByName("xmas_tree_click",true);outline();}
                                    if(intersects[0].object.name=="Pavillion_hoverarea"){
                                        object=scene.getObjectByName("Pavillion_click",true);outline();}
                                    if(intersects[0].object.name=="Pavillion_click"){
                                        object=scene.getObjectByName("Pavillion_click",true);outline();}
                                    if(intersects[0].object.name=="Ice_rink_hoverarea"){
                                        object=scene.getObjectByName("iceRinkBuilding_click",true);outline();}
                                    if(intersects[0].object.name=="Santas_grotto_hoverarea"){
                                        object=scene.getObjectByName("santasGrotto_click",true);outline();}
                                    if(intersects[0].object.name=="Food_stall_hoverarea"){
                                        object=scene.getObjectByName("marketStall_Food_click",true);outline();}
                                    if(intersects[0].object.name=="Games_stall_hoverarea"){
                                        object=scene.getObjectByName("marketStall_Games_click",true);outline();}
                                    if(intersects[0].object.name=="Craft_Stall_hoverarea"){
                                        object=scene.getObjectByName("marketStall_Crafts_click",true);outline();}
                                    if(intersects[0].object.name=="Cracker_stall_hoverarea"){
                                        object=scene.getObjectByName("marketStall_Cracker_click",true);outline();}
                                    if(intersects[0].object.name=="Bandstand_hoverarea"){
                                        object=scene.getObjectByName("bandStand_click",true);outline();}
                                    if(intersects[0].object.name=="Post_box_hoverarea"){
                                        object=scene.getObjectByName("postBox_click",true);outline();}
                               }
                                else{
                                    document.querySelector('html').style.cursor = 'default'
                                    document.querySelector('body').style.cursor = 'default'
                                    INTERSECTED = null;
                                    outlinePass.selectedObjects=0;
                                    $(".clickmei").hide();
                                    }
                                }
                            }else{
                                INTERSECTED = null;
                                outlinePass.selectedObjects = 0;
                                $(".clickmei").hide();
                            }
                        });
            renderer.domElement.addEventListener('touchend', function(event) {
                                    INTERSECTED = null;
                                    outlinePass.selectedObjects=0;
                                    $(".clickmei").hide();
            })
        }

        if (im == false) {
              renderer.domElement.addEventListener('mousemove', function(event) {
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
                var x = event.clientX;
                var y = event.clientY;
                var newposX = x - 50;
                  var newposY = y - 25;
                  /*
                if (im==false) {
                    $(".clickmei").css("transform","translate3d("+newposX+"px,"+newposY+"px,0px)");
                }
                */
                if(viewbandstand==true){ca=["Bandstand_hoverarea","bandStand_click"];}
                if(viewmarketleft==true){ca=["Food_stall_hoverarea","Games_stall_hoverarea"];}
                if(viewmarketright==true){ca=["Craft_Stall_hoverarea","Cracker_stall_hoverarea"];}
                if(viewpavilion==true){ca=["Pavillion_hoverarea"];}
                if(viewpostbox==true){ca=["Post_box_hoverarea"];}
                if(viewtree==true){ca=["Christmas_hoerarea"];}
                if(viewicerink==true){ca=["Ice_rink_hoverarea"];}
                if(viewsanta==true){ca=["Santas_grotto_hoverarea"];}
                if(stage_0==false&&moving==false) {
                raycaster.setFromCamera( mouse, camera );
                    var intersects = raycaster.intersectObjects(model.children);
                    var intersectsArrow = raycaster.intersectObjects(camera.children);
                    if (intersects.length > 0) {
                        if(ca.includes(intersects[0].object.name)) {
                            document.querySelector('html').style.cursor = 'pointer'
                            document.querySelector('body').style.cursor = 'pointer'
                        if (intersects[0].object.name == "Christmas_hoerarea") {
                            object=scene.getObjectByName("xmas_tree_click",true);outline();}
                        if(intersects[0].object.name=="Pavillion_hoverarea"){
                            object=scene.getObjectByName("Pavillion_click",true);outline();}
                        if(intersects[0].object.name=="Pavillion_click"){
                            object=scene.getObjectByName("Pavillion_click",true);outline();}
                        if(intersects[0].object.name=="Ice_rink_hoverarea"){
                            object=scene.getObjectByName("iceRinkBuilding_click",true);outline();}
                        if(intersects[0].object.name=="Santas_grotto_hoverarea"){
                            object=scene.getObjectByName("santasGrotto_click",true);outline();}
                        if(intersects[0].object.name=="Food_stall_hoverarea"){
                            object=scene.getObjectByName("marketStall_Food_click",true);outline();}
                        if(intersects[0].object.name=="Games_stall_hoverarea"){
                            object=scene.getObjectByName("marketStall_Games_click",true);outline();}
                        if(intersects[0].object.name=="Craft_Stall_hoverarea"){
                            object=scene.getObjectByName("marketStall_Crafts_click",true);outline();}
                        if(intersects[0].object.name=="Cracker_stall_hoverarea"){
                            object=scene.getObjectByName("marketStall_Cracker_click",true);outline();}
                        if(intersects[0].object.name=="Bandstand_hoverarea"){
                            object=scene.getObjectByName("bandStand_click",true);outline();}
                        if(intersects[0].object.name=="Post_box_hoverarea"){
                            object=scene.getObjectByName("postBox_click",true);outline();}
                    } else {
                        document.querySelector('html').style.cursor = 'default'
                        document.querySelector('body').style.cursor = 'default'
                        INTERSECTED = null;
                        outlinePass.selectedObjects=0;
                        $(".clickmei").hide();
                        }
                    }
                    if (!im) {
                        if (intersectsArrow.length > 0) {
                            document.querySelector('html').style.cursor = 'pointer';
                            document.querySelector('body').style.cursor = 'pointer';
                            intersectsArrow[0].object.material = greenArrow;
                            arrowHovered = true;
                        } else {
                            if (arrowHovered) {
                                arrowleft.material = redArrow;
                                arrowright.material = redArrow;
                                arrowHovered = false;
                            }
                        }
                    }
                    


                }else{
                    INTERSECTED = null;
                    outlinePass.selectedObjects = 0;
                    $(".clickmei").hide();
                }
            });
        }

        function mover(){
                camera.remove(arrowright);
                camera.remove(arrowleft);   
                moving=true;
                document.querySelector('html').style.cursor = 'default'
                document.querySelector('body').style.cursor = 'default'
                INTERSECTED = null;
                outlinePass.selectedObjects=0;
                $(".clickmei").hide();
                scene.remove(p1);
                lightdown();
            setTimeout(function(){
                camera.add(arrowright);
                camera.add(arrowleft);
                moving=false;
                scene.add(p1);
            }, cammovetime)
        }
        /*
        window.addEventListener('swiped-left', function(e) {
            if (moving==false&&stage_0==false) {
                camp={x:camera.position.x,y:camera.position.y,z:camera.position.z};
                            if (viewbandstand==true){
                                camt=marketcamdesktopleft; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){crx-=camxspeed; if (crx<=-95) {crx=-95} 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewbandstand=false;viewmarketleft=true;lightup()});}
                            if (viewmarketleft==true){
                                camt=marketcamdesktopright; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){crx+=camxspeed; if (crx>=30) {crx=30}
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewmarketleft=false;viewmarketright=true;lightup()});}
                            if (viewmarketright==true){
                                camt=postboxcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){crx-=camxspeed; if (crx<=0) {crx=0}
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewmarketright=false;viewpostbox=true;lightup()});}
                            if (viewpostbox==true){
                                camt=pavilioncamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewpostbox=false;viewpavilion=true;lightup()});}
                            if (viewpavilion==true){
                                camt=treecamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){cry+=camyspeed; if (cry>=10) {cry=10} 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewpavilion=false;viewtree=true;lightup()});}
                            if (viewtree==true){
                                camt=icerinkcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){cry-=camyspeed; if (cry<=-5) {cry=-5} 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewtree=false;viewicerink=true;lightup()});}
                            if (viewicerink==true){
                                camt=santacamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewicerink=false;viewsanta=true;lightup()});}
                            if (viewsanta==true){
                                camt=bandstandcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewsanta=false;viewbandstand=true;lightup()});}
                            t.easing(TWEEN.Easing.Sinusoidal.InOut).start();mover();              
                        }
                    })

        window.addEventListener('swiped-right', function(e) {
            if (moving==false&&stage_0==false) {
                camp={x:camera.position.x,y:camera.position.y,z:camera.position.z};
                            if (viewbandstand==true){
                                camt=santacamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewbandstand=false;viewsanta=true;lightup()});}
                            if (viewsanta==true){
                                camt=icerinkcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewsanta=false;viewicerink=true;lightup()});}
                            if (viewicerink==true){
                                camt=treecamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ cry+=camyspeed; if (cry>=10) {cry=10}
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewicerink=false;viewtree=true;lightup()});}
                            if (viewtree==true){
                                camt=pavilioncamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ cry-=camyspeed; if (cry<=-5) {cry=-5} 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewtree=false;viewpavilion=true;lightup()});}
                            if (viewpavilion==true){
                                camt=postboxcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewpavilion=false;viewpostbox=true;lightup()});}
                            if (viewpostbox==true){
                                camt=marketcamdesktopright; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ crx+=camxspeed/5; if (crx>=30) {crx=30}
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewpostbox=false;viewmarketright=true;lightup()});}
                            if (viewmarketright==true){
                                camt=marketcamdesktopleft; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ crx-=camxspeed; if (crx<=-95) {crx=-95} 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewmarketright=false;viewmarketleft=true;});lightup()}
                            if (viewmarketleft==true){
                                camt=bandstandcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ crx+=camxspeed; if (crx>=0) {crx=0}
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewmarketleft=false;viewbandstand=true;});lightup()}
                            t.easing(TWEEN.Easing.Sinusoidal.InOut).start();mover();   
                        }
                    })
            */
            $(document).on('click touchstart', function () {
             console.log(im);
            var bga=document.getElementById("bga");
                var element = document.getElementById("btnBringTheSnow");
                if (element.parentNode.querySelector(":hover") == element) {
                    //console.log("on snow")
                    isoverbutton=true;
                } else {
                    //console.log("off snow")
                    isoverbutton=false;
                }
            let clickObject = {};
            if (stage_0==false&&isoverbutton==false) {
                mouse.x = ( event.clientX / window.innerWidth )*2-1;
                mouse.y = - ( event.clientY / window.innerHeight )*2+1;
                raycaster.setFromCamera( mouse, camera );
                var ic1 = raycaster.intersectObjects(model.children);
                    if (ic1.length > 0) {
                        if(ic1[0].object.name=="Christmas_hoerarea" && viewtree){pauseMusic();window.parent.postMessage("btnBaubleEntry",'*');}
                        if(ic1[0].object.name=="Pavillion_hoverarea" && viewpavilion){pauseMusic();window.parent.postMessage("Pavillion_click",'*');}
                        if(ic1[0].object.name=="Pavillion_click" && viewpavilion){pauseMusic();window.parent.postMessage("Pavillion_click",'*');}
                        if(ic1[0].object.name=="Ice_rink_hoverarea" && viewicerink){pauseMusic();window.parent.postMessage("iceRinkBuilding_click",'*');}
                        if(ic1[0].object.name=="Santas_grotto_hoverarea" && viewsanta){pauseMusic();window.parent.postMessage("santasGrotto_click",'*');}
                        if(ic1[0].object.name=="Food_stall_hoverarea" && viewmarketleft){pauseMusic();window.parent.postMessage("btnRecipes",'*');}
                        if(ic1[0].object.name=="Games_stall_hoverarea" && viewmarketleft){pauseMusic();window.parent.postMessage("btnIframe_stack",'*');}
                        if(ic1[0].object.name=="Craft_Stall_hoverarea" && viewmarketright){pauseMusic();window.parent.postMessage("marketStall_Crafts_click",'*');}
                        if(ic1[0].object.name=="Cracker_stall_hoverarea" && viewmarketright){pauseMusic();window.parent.postMessage("btnJokes",'*');}
                        if(ic1[0].object.name=="Bandstand_hoverarea" && viewbandstand){pauseMusic();window.parent.postMessage("btnSpotify",'*');}
                        if(ic1[0].object.name=="Post_box_hoverarea" && viewpostbox){pauseMusic();window.parent.postMessage("postBox_click",'*');}
                    }
                  var intersects = raycaster.intersectObjects(camera.children);
                    if (intersects.length > 0) { //&& im == false
                        if(intersects[0].object.name=="AR"){
                            camp={x:camera.position.x,y:camera.position.y,z:camera.position.z};
                            scamrot=new THREE.Euler().copy(camera.rotation);
                            if (viewbandstand==true){
                                camt=marketcamdesktopleft; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ crx-=camxspeed; if (crx<=-95) {crx=-95} 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewbandstand=false;viewmarketleft=true;lightup()});}
                            if (viewmarketleft==true){
                                camt=marketcamdesktopright; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ crx+=camxspeed; if (crx>=30) {crx=30}
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewmarketleft=false;viewmarketright=true;lightup()});}
                            if (viewmarketright==true){
                                camt=postboxcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ crx-=camxspeed; if (crx<=0) {crx=0}
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewmarketright=false;viewpostbox=true;lightup()});}
                            if (viewpostbox==true){
                                camt=pavilioncamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewpostbox=false;viewpavilion=true;lightup()});}
                            if (viewpavilion==true){
                                camt=treecamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ cry+=camyspeed; if (cry>=10) {cry=10} 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewpavilion=false;viewtree=true;lightup()});}
                            if (viewtree==true){
                                camt=icerinkcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ cry-=camyspeed; if (cry<=-5) {cry=-5} 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewtree=false;viewicerink=true;lightup()});}
                            if (viewicerink==true){
                                camt=santacamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewicerink=false;viewsanta=true;lightup()});}
                            if (viewsanta==true){
                                camt=bandstandcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewsanta=false;viewbandstand=true;lightup()});}
                            t.easing(TWEEN.Easing.Sinusoidal.InOut).start();mover();   
                        }

                        if(intersects[0].object.name=="AL"){
                            camp={x:camera.position.x,y:camera.position.y,z:camera.position.z};
                            if (viewbandstand==true){
                                camt=santacamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewbandstand=false;viewsanta=true;lightup()});}
                            if (viewsanta==true){
                                camt=icerinkcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewsanta=false;viewicerink=true;lightup()});}
                            if (viewicerink==true){
                                camt=treecamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ cry+=camyspeed; if (cry>=10) {cry=10}
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewicerink=false;viewtree=true;lightup()});}
                            if (viewtree==true){
                                camt=pavilioncamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ cry-=camyspeed; if (cry<=-5) {cry=-5} 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewtree=false;viewpavilion=true;lightup()});}
                            if (viewpavilion==true){
                                camt=postboxcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewpavilion=false;viewpostbox=true;lightup()});}
                            if (viewpostbox==true){
                                camt=marketcamdesktopright; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ crx+=camxspeed/5; if (crx>=30) {crx=30}
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewpostbox=false;viewmarketright=true;lightup()});}
                            if (viewmarketright==true){
                                camt=marketcamdesktopleft; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ crx-=camxspeed; if (crx<=-95) {crx=-95} 
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewmarketright=false;viewmarketleft=true;});lightup()}
                            if (viewmarketleft==true){
                                camt=bandstandcamdesktop; var t=new TWEEN.Tween(camp).to(camt,cammovetime);
                                t.onUpdate(function(){ crx+=camxspeed; if (crx>=0) {crx=0}
                                camera.position.x=camp.x;camera.position.y=camp.y;camera.position.z=camp.z;})
                                t.onComplete(function(){viewmarketleft=false;viewbandstand=true;});lightup()}
                            t.easing(TWEEN.Easing.Sinusoidal.InOut).start();mover();   
                        }
                    }
                }
            })


    function pauseMusic() {
        var audioElement = document.getElementById("bga");
        $("#soundbutton").hide();
        $("#soundbuttonmute").show();
        audioElement.pause();
    }        

    function outline(){
    	scene.remove(p1)
        if (im==false) {
            $(".clickmei").show();
        }
        outlinePass.selectedObjects=[object]
    }

    window.addEventListener('swiped-up',function(e){e.preventDefault();});
    window.addEventListener('swiped-down',function(e){e.preventDefault();});

    function lightup(){
        if (viewbandstand==true){outlinePassBasic.selectedObjects=[o9];}
        if (viewmarketleft==true){outlinePassBasic.selectedObjects=[o5,o6];}
        if (viewmarketright==true){outlinePassBasic.selectedObjects=[o7,o8];}
        if (viewpavilion==true){outlinePassBasic.selectedObjects=[o2];}
        if (viewpostbox==true){outlinePassBasic.selectedObjects=[o10];}
        if (viewtree==true){outlinePassBasic.selectedObjects=[o1];}
        if (viewicerink==true){outlinePassBasic.selectedObjects=[o3];}
        if (viewsanta==true){outlinePassBasic.selectedObjects=[o4];}
        composer.addPass( outlinePass );
    }

    function lightdown(){
        outlinePassBasic.selectedObjects=[];
        composer.addPass( outlinePass );    
    }

    function stage_01(){
		var audioElement=document.getElementById("bga");
        audioElement.play();
        audioElement.volume = 0.4;
        $("#sound").fadeIn();
        $("#globe").fadeIn();
        $("#btnBringTheMagic").css("pointer-events","none");
        if (im==true) {requestT()}
        clickedstart=true;
        $("#snowfooter").delay(1000).fadeOut(2000);
        $("#btnBringTheMagic").delay(1000).fadeOut(2000);
        if (im==false) {
            $("#btnBringTheSnow").delay(11000).show().fadeTo( "slow", 1 );
        }
        var target={x:37,y:-5,z:45};
        var position={x:camera.position.x,y:camera.position.y,z:camera.position.z};
        var t=new TWEEN.Tween(position).to(target,3000);
        t.onUpdate(function(){camera.position.x=position.x;camera.position.y=position.y;camera.position.z=position.z;});
        t.easing(TWEEN.Easing.Sinusoidal.InOut)
        t.start();
        setTimeout(function(){arch();},icz);
        var t2 = new TWEEN.Tween(model.rotation).onComplete(function(){}).to({ y: "-"+Math.PI*2}, icm).easing(TWEEN.Easing.Sinusoidal.InOut).start();
        function arch(){
            var target={x:21,y:-6,z:28};
            var position={x:camera.position.x,y:camera.position.y,z:camera.position.z};
            var t=new TWEEN.Tween(position).to(target,4000);
            t.onUpdate(function(){camera.position.x=position.x;camera.position.y=position.y;camera.position.z=position.z;});
            t.easing(TWEEN.Easing.Sinusoidal.InOut)
            t.onComplete(function(){stage_0=false;stage_01=true;
            viewbandstand=true;
            lightup();
            camera.add(arrowright);
            camera.add(arrowleft);
            });
            t.start();
        }
    }
        

    function onWindowResize() {
        if (im==false && viewbandstand) {
            camera.add(arrowright);
            camera.add(arrowleft);
        }
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    }

function p1flow() {
        /*
    	var pm1=new THREE.SpriteMaterial({map:new THREE.TextureLoader().load('http://i.imgur.com/cTALZ.png') } );
        for (var i=0;i<sc;i++){
            p1=new Particle3D(pm1);
            p1.position.x=Math.random()*50-25;p1.position.y=Math.random()*100-25;p1.position.z=Math.random()*50-25;
            p1.scale.x=snowsize;p1.scale.y=snowsize;
            scene.add(p1);
            particles1.push(p1);
        }
        */
    }

    function p2flow(){
    	var pm2=new THREE.SpriteMaterial({map:new THREE.TextureLoader().load('http://i.imgur.com/cTALZ.png') } );
        for (var i=0;i<sc2;i++){
            p2=new Particle3D(pm2);
            p2.position.x=Math.random()*50-25;p2.position.y=(225-Math.random()*200);p2.position.z=Math.random()*50-25;
            p2.scale.x=snowsize2;p2.scale.y=snowsize2;
            scene.add(p2);
            particles2.push(p2);
        }
    }

    function shakebutton(){
        if (location.protocol!='https:') {
        location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
        }
    }

    function requestT() {
        if (typeof(DeviceMotionEvent) !== 'undefined' && typeof(DeviceMotionEvent.requestPermission) === 'function') {
            DeviceMotionEvent.requestPermission()
            .then(response => {
              if (response == 'granted') {
                window.addEventListener('devicemotion', (e) => {
                })
              }
            })
        .catch(console.error)
        }else {
        }
    }

    $("#btnBringTheSnow").click(function(){
        if (stage_0==false) {
            shake();
        }
    })

    window.onload = function() {
            var myShakeEvent = new Shake({
                threshold: 10
            });
            myShakeEvent.start();
            window.addEventListener('shake', shakeEventDidOccur, false);
            function shakeEventDidOccur () {
                if (stage_0==false) {
                shake();
                }
            }       
    };

    function shake(){
        if (clickable==true) {
            p2flow();
            clickable=false;
            setTimeout(function(){
                clickable=true;
            },st)
        }
    }

    function createOutlinePass() {
        outlinePassBasic = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
        composer.addPass(outlinePassBasic);
        outlinePassBasic.selectedObjects = outlinedObjects;
        outlinePassBasic.edgeStrength = outlineFXBasic.edgeStrength;
        outlinePassBasic.edgeGlow = outlineFXBasic.edgeGlow;
        outlinePassBasic.edgeThickness = outlineFXBasic.edgeThickness;
        outlinePassBasic.visibleEdgeColor.set(outlineFXBasic.visibleEdgeColor);
        outlinePassBasic.hiddenEdgeColor.set(outlineFXBasic.hiddenEdgeColor);

        outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
        composer.addPass(outlinePass);
        outlinePass.selectedObjects = outlinedObjects;
        outlinePass.edgeStrength = outlineFX.edgeStrength;
        outlinePass.edgeGlow = outlineFX.edgeGlow;
        outlinePass.edgeThickness = outlineFX.edgeThickness;
        outlinePass.pulsePeriod = outlineFX.pulsePeriod;
        outlinePass.visibleEdgeColor.set(outlineFX.visibleEdgeColor);
        outlinePass.hiddenEdgeColor.set(outlineFX.hiddenEdgeColor);
    }

    var t = 0;

    function animate() {
        TWEEN.update();
        for(var i=0; i<particles1.length; i++) {
            p1=particles1[i];
                if(p1.position.y<-15) p1.position.y+=50;
                p1p=particles1[i];
                if (moving==false) {
            		p1p.updatePhysics();
        		}
        	}
        for(var i=0; i<particles2.length; i++) {
            p2=particles2[i];
                if(p2.position.y<-15)scene.remove(p2);
                p2p=particles2[i];
                if (moving==false) {
            		p2p.updatePhysics();
            	}
        	}

        if (dm==false) {
            if (clickedstart==false) {
                t+=0.02;
                camera.position.x=20*Math.cos(t)+0;
            }
        }
        camera.lookAt(crx,cry,crz);

        cloudParticles.forEach(p => {
          p.rotation.z -=0.001;
          p.scale.y -=.005
          p.scale.x -=.005
          if (p.scale.x<=0) {p.scale.x=0}
        });

        var delta = clock.getDelta();
        mixers.forEach((mixer)=>{mixer.update(delta);});    
        
        composer.render(scene, camera);
        requestAnimationFrame( animate );
};
