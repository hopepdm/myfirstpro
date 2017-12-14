var lightControl = (function() {
    var _camera, _renderer, _scene, _group;
    var _container;
    var _width;
    var _height;
    var _control;
    var _lightList = {};
    var _currentLight;
    var _mesh;
    var _light1, _light2, _light3;
    var FACTOR= 40; //控制区域到实际区域的比例系数


    function initScene() {
        _container = document.getElementById('lightControl');
        _width = 150;
        _height = 150;
        _camera = new THREE.PerspectiveCamera(45, _width / _height, 1, 1000)
        _camera.position.set(0, 0, 1000);
        _scene = new THREE.Scene();
        _scene.add(_camera);
        _camera.lookAt(new THREE.Vector3(0, 0, 0));
        _renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        _group = new THREE.Group();
        _renderer.setClearColor(0x4f4f4f, 1);
        _renderer.setPixelRatio(window.devicePixelRatio);

        _container.appendChild(_renderer.domElement);
        _renderer.setSize(_width, _height);





    }

    function animate() {
        requestAnimationFrame(animate);
        _renderer.render(_scene, _camera);
        _control.update();

    }
    initScene()
    return {
        create: function(lights) {
            // console.log(lights);
            var geometry = new THREE.SphereGeometry(350, 16, 16);
            var material = new THREE.MeshPhongMaterial({});
            _mesh = new THREE.Mesh(geometry, material);
            // _scene.add(_mesh);

            _group.add(_mesh);

            _light1 = new THREE.SpotLight();
            _light1.color = lights.light1.color;
            _light1.position.copy(lights.light1.position);
            _light1.target = _mesh;
            _light1.angle = 0.6;
            _light1.intensity = 1;
            // light1.distance = 120;
            _lightList.light1 = _light1;
            _light1.name = 'light1';

            // _scene.add(light1);
            _currentLight = _light1;
            _group.add(_light1)


            _light2 = new THREE.SpotLight();
            _light2.color = lights.light2.color;
            _light2.position.copy(lights.light2.position);
            _light2.target = _mesh;
            _light2.angle = 0.6;
            _light2.name = 'light2';
            _light2.intensity = 1;
            _lightList.light2 = _light2;

            _scene.add(_light2);


            _light3 = new THREE.SpotLight();
            _light3.color = lights.light3.color;
            _light3.position.copy(lights.light3.position);
            _light3.target = _mesh;
            _light3.angle = 0.6;
            _light3.intensity = 1;
            _light3.name = 'light3';
            _lightList.light3 = _light3;

            _scene.add(_light3);



            _scene.add(_group);

            _control = new THREE.LightPositionControl(_group, _container);
            console.log(_lightList);
            animate()

        },
        dispose: function() {
            if (_mesh && _mesh.parent) {
                _mesh.parent.remove(_mesh)
                _mesh.geometry.dispose();
                _mesh.material.dispose();
            };
            for (var light in _lightList) {
                if (_lightList[light] && _lightList[light].parent) {
                    _lightList[light].parent.remove(_lightList[light])

                }
            }
            // console.log(_scene);

        },
        attachLight: function(light) {
            // console.log(light1);
            if (_group) {
                var mt = _group.clone().matrix;

                _currentLight.position.applyMatrix4(mt);

                while (_group.children.length > 0) {
                    _group.remove(_group.children[0]);
                }
                _scene.add(_currentLight);

                if (_lightList[light]) {
                    _lightList[light].position.applyMatrix4(new THREE.Matrix4().getInverse(mt));
                    _group.add(_lightList[light])
                    _group.add(_mesh)
                }

                _currentLight = _lightList[light];

            }
            return light;
        },
        changeIntensity: function(intensity) {
            _currentLight.intensity = intensity;
            return intensity;
        },
        changeColor: function(color) {
            _currentLight.color.setHex(color); //设置颜色不能直接赋值
            return color;
        },
        getPosition: function(light) {

            if (_control) {
                var position = _lightList[light].position.clone().applyMatrix4(_control.rotationMatrix);
                // console.log(position.x);
                return position
            } else {
                return false;
            }
        }

    }

})()
