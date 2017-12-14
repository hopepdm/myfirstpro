/**
 * 修改页面展示及控制面板
 *
 */
var scene,
    camera,
    cameraDistance = 3,
    objScele,
    renderer,
    android,
    geometrys,
    singleObj,
    dragRotateControls,

    //光源参数
    ambientLight,
    lightColor,
    lightIntensity,
    intensity,
    light1,
    light2,
    light3,
    light4,
    light5,
    light6,

    //面板参数
    materialColor,
    specularColor,
    materialShininess,
    materialOpacity,
    roamBoolean = false,
    isWireFrame = false,
    backGroundColor,
    controls,
    cameraPosition;

function initScene(obj) {
    console.log(THREE.DoubleSide, THREE.FrontSide);
    singleObj = obj;
    var modelPath = singleObj.objurl;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, singleObj.near, singleObj.far);
    //camera.position.set(0, 0, 0.1);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    //camera.up.set(0, 1, 0);
    scene.add(camera);

    //读取 .obj文物模型
    var manager = new THREE.LoadingManager();

    var arrs = modelPath.split(".");
    if (arrs[1] == "js") {
        var binaryLoader = new THREE.BinaryLoader(manager);
        binaryLoader.setCrossOrigin('');
        binaryLoader.load(modelPath, addModelToScene);

    } else if (arrs[1] == "obj") {
        var s = arrs[0].lastIndexOf('/');
        var basePath = arrs[0].substring(0, s + 1);
        var modelName = arrs[0].substring(s + 1);

        var mtlLoader = new THREE.MTLLoader(manager);
        mtlLoader.setCrossOrigin('');
        mtlLoader.setPath(basePath);

        mtlLoader.load(modelName + '.mtl', function(materials) {
            materials.preload();

            var objLoader = new THREE.OBJLoader(manager);
            objLoader.setMaterials(materials);
            objLoader.setPath(basePath);

            objLoader.load(modelName + '.obj', function(object) {
                android = object;

                android.rotation.x = singleObj.modelRotation.x || 0;
                android.rotation.y = singleObj.modelRotation.y || 0;
                android.rotation.z = singleObj.modelRotation.z || 0;
                android.position = singleObj.modelPosition || new THREE.Vector3(0, 0, 0);

                scene.add(android);

                adjustSceneParam();

                // 辅助线
                // var helperGrid = new THREE.GridHelper( 1,0.2, 0xFF0000, 0xFFFFFF );
                // helperGrid.position.set(0, -1, 0);
                // scene.add( helperGrid );

                // var arrowHelper = new THREE.AxisHelper(1);
                // scene.add( arrowHelper );
                //
                // 控制面板
                buildGui();

                onWindowResize();

            }, onProgress);

        }); // mtlLoader end
    } // if else end

    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            // console.log(percentComplete);

            // $("#bar")[0].style.width = Math.round(percentComplete, 2) + "%";
            // $("#bar").html(Math.round(percentComplete, 2) + "%");
            // if (Math.round(percentComplete, 2) == 100) {
            //     $("#loaderdiv").hide();
            // }
        }
    }; //onProgress end



    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.setClearColor(0x4f5355, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight - 60);
    // console.log(scene);

    document.getElementsByClassName('viewer')[0].appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);
    animate();

} // initScene end

function addModelToScene(geometry, materials) {
    var material = new THREE.MultiMaterial(materials);
    android = new THREE.Mesh(geometry, material);

    android.rotation.x = singleObj.modelRotation.x || 0;
    android.rotation.y = singleObj.modelRotation.y || 0;
    android.rotation.z = singleObj.modelRotation.z || 0;
    android.position = singleObj.modelPosition || new THREE.Vector3(0, 0, 0);

    scene.add(android);

    //geometrys = geometry;
    //geometrys.computeBoundingBox();
    adjustSceneParam();
    buildGui();
    onWindowResize();
} // addModelToScene end

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - 60);
    dragRotateControls = new THREE.DragRotateControls(camera, android, renderer.domElement);

} // onWindowResize end

function adjustSceneParam() {
    var box3 = new THREE.Box3().setFromObject(android);
    var size = box3.size();

    var width = size.x;
    var height = (window.innerHeight / window.innerWidth) * width;
    if (height < size.y) {
        height = size.y;
        width = (window.innerWidth / window.innerHeight) * height;
    }
    var hw = height > width ? height : width;
    objScele = hw / 70;
    cameraDistance = 2 * hw;

    camera.position.set(0, 0, cameraDistance);

    // 光源
    if (singleObj.ambient) {
        ambientLight = new THREE.AmbientLight(0xffffff);
        scene.add(ambientLight);
    }

    lightColor = singleObj.lightSet[0].color;
    lightIntensity = singleObj.lightSet[0].intensity;

    light1 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light1.position.set(0, 0, cameraDistance / 2);
    light1.target = android;
    // var h1 = new THREE.DirectionalLightHelper(light1, 0.5);
    // scene.add(h1)
    scene.add(light1);

    light2 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light2.position.set(0, 0, -cameraDistance);
    light2.target = android;
    scene.add(light2);

    light3 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light3.position.set(0, cameraDistance, 0);
    light3.target = android;
    scene.add(light3);

    light4 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light4.position.set(0, -cameraDistance, 0);
    light4.target = android;
    scene.add(light4);

    light5 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light5.position.set(cameraDistance, 0, 0);
    light5.target = android;
    scene.add(light5);

    light6 = new THREE.DirectionalLight(lightColor, lightIntensity);
    light6.position.set(-cameraDistance, 0, 0);
    light6.target = android;

    scene.add(light6);


} // adjustSceneParam end

function animate() {
    renderer.render(scene, camera);
    if (roamBoolean) {
        android.rotation.x += 0.01;
        android.rotation.y += 0.02;
    }

    if (dragRotateControls) dragRotateControls.update();
    requestAnimationFrame(animate);


}

/**
 * 控制面板
 * @return {[type]} [description]
 */
function buildGui() {


    var frontVisualAngle = new THREE.Vector3(0, 0, cameraDistance);
    var backVisualAngle = new THREE.Vector3(0, 0, -cameraDistance);
    var leftVisualAngle = new THREE.Vector3(-cameraDistance, 0, 0);
    var rightVisualAngle = new THREE.Vector3(cameraDistance, 0, 0);
    var upVisualAngle = new THREE.Vector3(0, cameraDistance, 0);
    var downVisualAngle = new THREE.Vector3(0, -cameraDistance, 0);
    var innerVisualAngle = new THREE.Vector3(0, 0, 0.1);

    backGroundColor = {
        红皂: 0x4f5355,
        碧玉石: 0x569597,
        玉石蓝: 0x507883
    };

    cameraPosition = {
        前: frontVisualAngle,
        后: backVisualAngle,
        左: leftVisualAngle,
        右: rightVisualAngle,
        上: upVisualAngle,
        下: downVisualAngle,
        inner: innerVisualAngle
    };
    //改变透明度的前提需要 transparent 值为 true
    for (var i = 0; i < android.children.length; i++) {
        if (android.children[i].material.type == 'MultiMaterial') {
            for (var j = 0; j < android.children[i].material.materials.length; j++) {
                android.children[i].material.materials[j].transparent = true;
            }
        } else {
            android.children[i].material.transparent = true;
        }
    }

    //判断材质类型并获取初始值
    if (android.children[0].material.type == 'MultiMaterial') {
        materialColor = android.children[0].material.materials[0].color;
        specularColor = android.children[0].material.materials[0].specular;
        materialShininess = android.children[0].material.materials[0].shininess;
        materialOpacity = android.children[0].material.materials[0].opacity;


    } else {
        materialColor = android.children[0].material.color;
        specularColor = android.children[0].material.specular;
        materialShininess = android.children[0].material.shininess;
        materialOpacity = android.children[0].material.opacity;
    }

    controls = {
        灯光亮度: light1.intensity,
        灯光颜色: light1.color.getHex(),
        背景: Object.keys(backGroundColor)[0],
        材质固有色: materialColor.getHex(),
        高亮色: specularColor.getHex(),
        光滑度: materialShininess,
        透明度: materialOpacity,
        线框显示: isWireFrame,
        缩放速度: singleObj.zoomSpeed,
        旋转速度: singleObj.rotateSpeed,
        漫游: function() {
            roamBoolean = !roamBoolean;
            //漫游的逻辑写在 animate 中

        },
        reSet: function() {
            android.rotation.x = singleObj.modelRotation.x || 0;
            android.rotation.y = singleObj.modelRotation.y || 0;
            android.rotation.z = singleObj.modelRotation.z || 0;
            android.position = singleObj.modelPosition || new THREE.Vector3(0, 0, 0);

        },
        publish: function() {
            var $modal = $('.publish_confirm');
            var $abort = $('.publish_confirm .abort');
            var $cancel = $('.publish_confirm .cancel');
            var $close = $('.publish_confirm .close');
            $modal.slideDown(300, function() {
                $('.modal_content').animate({
                    'opacity': '1'
                }, 800);
            });

            $abort.on('click', function() {
                $.ajax({
                    type: 'post',
                    url: '/api/publish',
                    data: {
                        id: uid,
                        isEditor: true,
                        near: 0.001,
                        far: 10000,
                        minfov: 0.8,
                        maxfov: 1.5,
                        moveSpeed: 0.5,
                        rotateSpeed: singleObj.rotateSpeed || 0.2,
                        zoomSpeed: singleObj.zoomSpeed || 0.5,
                        modelPosition: { x: android.position.x, y: android.position.y, z: android.position.z },
                        modelRotation: { x: android.rotation.x, y: android.rotation.y, z: android.rotation.z },
                        lightSet: { intensity: light1.intensity || 1, color: light1.color.getHex() || 0xFFFFFF },
                        ambient: true,
                        bgColor: renderer.getClearColor().getHex(),
                        isMaterialColor: materialColor.getHex(),
                        isSpecularColor: specularColor.getHex(),
                        isMaterialShininess: materialShininess,
                        isMaterialOpacity: materialOpacity,
                        wireFrame: isWireFrame,

                    },
                    //dataType: 'json',
                    success: function() {
                        alert('发布成功');
                    },
                    error: function() {
                        console.log('发布失败');
                    }
                });
                $modal.animate({
                    'width': '0',
                    'opacity': '0'
                }, 500, function() {
                    $(this).css({
                        'width': '100%',
                        'display': 'none',
                        'opacity': '1'
                    });
                });
                //window.location.reload();
            });

            $cancel.on('click', function() {
                $modal.animate({
                    'width': '0',
                    'opacity': '0'
                }, 500, function() {
                    $(this).css({
                        'width': '100%',
                        'display': 'none',
                        'opacity': '1'
                    });
                });
            });

            $close.on('click', function() {
                $modal.animate({
                    'width': '0',
                    'opacity': '0'
                }, 500, function() {
                    $(this).css({
                        'width': '100%',
                        'display': 'none',
                        'opacity': '1'
                    });
                });
            });
        }
    };


    //GUI控制界面
    var gui = new dat.GUI();
    gui.domElement.style = 'position: absolute; top: 62px; left: 4px;';
    var sceneFolder = gui.addFolder('场景属性');
    sceneFolder.open();
    sceneFolder.add(controls, '灯光亮度', 0, 5).step(0.1).onChange(function(val) {
        light1.intensity = val;
        light2.intensity = val;
        light3.intensity = val;
        light4.intensity = val;
        light5.intensity = val;
        light6.intensity = val;

    });
    sceneFolder.addColor(controls, '灯光颜色').onChange(function(val) {
        light1.color.setHex(val);
        light2.color.setHex(val);
        light3.color.setHex(val);
        light4.color.setHex(val);
        light5.color.setHex(val);
        light6.color.setHex(val);
    });
    sceneFolder.add(controls, '背景', Object.keys(backGroundColor)).onChange(function(val) {
        console.log(backGroundColor[val]);
        renderer.setClearColor(backGroundColor[val]);
    });

    var materialsFolder = gui.addFolder('材质属性');
    materialsFolder.open();
    materialsFolder.addColor(controls, '材质固有色').onChange(function(val) {
        for (var i = 0; i < android.children.length; i++) {
            if (android.children[i].material.type == 'MultiMaterial') {
                for (var j = 0; j < android.children[i].material.materials.length; j++) {
                    android.children[i].material.materials[j].color.setHex(val);
                }
            } else {
                android.children[i].material.color.setHex(val);
            }
        }

    });
    materialsFolder.addColor(controls, '高亮色').onChange(function(val) {
        for (var i = 0; i < android.children.length; i++) {
            if (android.children[i].material.type == 'MultiMaterial') {
                for (var j = 0; j < android.children[i].material.materials.length; j++) {
                    android.children[i].material.materials[j].specular.setHex(val);
                }
            } else {
                android.children[i].material.specular.setHex(val);
            }
        }
    });
    materialsFolder.add(controls, '光滑度', 1, 100).step(1).onChange(function(val) {

        for (var i = 0; i < android.children.length; i++) {
            if (android.children[i].material.type == 'MultiMaterial') {
                for (var j = 0; j < android.children[i].material.materials.length; j++) {
                    android.children[i].material.materials[j].shininess = val;
                }
            } else {
                android.children[i].material.shininess = val;
            }
        }
        materialShininess = val;

    });
    materialsFolder.add(controls, '透明度', 0, 1).step(0.01).onChange(function(val) {
        for (var i = 0; i < android.children.length; i++) {
            if (android.children[i].material.type == 'MultiMaterial') {
                for (var j = 0; j < android.children[i].material.materials.length; j++) {
                    android.children[i].material.materials[j].opacity = val;
                }
            } else {
                android.children[i].material.opacity = val;
            }
        }
        materialOpacity = val;

    });
    materialsFolder.add(controls, '线框显示').onChange(function(val) {
        for (var i = 0; i < android.children.length; i++) {
            if (android.children[i].material.type == 'MultiMaterial') {
                for (var j = 0; j < android.children[i].material.materials.length; j++) {
                    android.children[i].material.materials[j].wireframe = val;
                    if (android.children[i].material.materials[j].wireframe) {
                        android.children[i].material.materials[j].emissive.setHex(0xFFFFFF);
                    } else {
                        android.children[i].material.materials[j].emissive.setHex(0x000000);
                    }
                }
            } else {
                android.children[i].material.wireframe = val;
                if (android.children[i].material.wireframe) {
                    android.children[i].material.emissive.setHex(0xFFFFFF);
                } else {
                    android.children[i].material.emissive.setHex(0x000000);
                }
            }
        }
        isWireFrame = val;

    });

    var positionFolder = gui.addFolder('位置属性');
    positionFolder.open();
    positionFolder.add(controls, '缩放速度', 0.2, 2).step(0.01).onChange(function(val) {
        singleObj.zoomSpeed = val;
    });
    positionFolder.add(controls, '旋转速度', 0.01, 0.4).step(0.01).onChange(function(val) {
        singleObj.rotateSpeed = val;
    });
    positionFolder.add(controls, '漫游');
    positionFolder.add(controls, 'reSet').name('复位');
    gui.add(controls, 'publish').name('发布');
}