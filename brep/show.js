import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/OBJLoader.js';
export { render, stopAni, renderInit };
var ifloop;
var scene, renderer, camera;
function renderInit() {
    var canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({ canvas: canvas });
    var fov = 45;
    var aspect = 2; // the canvas default
    var near = 0.1;
    var far = 100;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);
    var controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();
    scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
    // {
    //     const planeSize = 40;
    //     const loader = new THREE.TextureLoader();
    //     const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
    //     texture.wrapS = THREE.RepeatWrapping;
    //     texture.wrapT = THREE.RepeatWrapping;
    //     texture.magFilter = THREE.NearestFilter;
    //     const repeats = planeSize / 2;
    //     texture.repeat.set(repeats, repeats);
    //     const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    //     const planeMat = new THREE.MeshPhongMaterial({
    //         map: texture,
    //         side: THREE.DoubleSide,
    //     });
    //     const mesh = new THREE.Mesh(planeGeo, planeMat);
    //     mesh.rotation.x = Math.PI * -.5;
    //     scene.add(mesh);
    // }
    {
        var skyColor = 0xB1E1FF; // light blue
        var groundColor = 0xB97A20; // brownish orange
        var intensity = 1;
        var light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
        scene.add(light);
    }
    {
        var color = 0xFFFFFF;
        var intensity = 1;
        var light = new THREE.DirectionalLight(color, intensity);
        light.position.set(0, 10, 0);
        light.target.position.set(-5, 0, 0);
        scene.add(light);
        scene.add(light.target);
    }
}
function render(objstring) {
    var objLoader = new OBJLoader();
    var myobj = objLoader.parse(objstring);
    // material = new THREE.MeshLambertMaterial ({ color: 0xFF00FF });
    myobj.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.color.setHex(0xffffff);
            child.material.side = THREE.DoubleSide;
        }
    });
    scene.add(myobj);
    function resizeRendererToDisplaySize(renderer) {
        var canvas = renderer.domElement;
        var width = canvas.clientWidth;
        var height = canvas.clientHeight;
        var needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }
    function renderLocal() {
        if (resizeRendererToDisplaySize(renderer)) {
            var canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
        if (!ifloop) {
            myobj.traverse(function (obj) {
                if (obj.type === 'Mesh') {
                    obj.geometry.dispose();
                    obj.material.dispose();
                }
            });
            // 删除场景对象scene的子对象group
            scene.remove(myobj);
            return;
        }
        requestAnimationFrame(renderLocal);
    }
    ifloop = true;
    requestAnimationFrame(renderLocal);
}
function stopAni() {
    ifloop = false;
}
