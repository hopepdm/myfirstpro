THREE.LightPositionControl = function(group,domElement) {
    var scope = this;
    this.domElement = (domElement !== undefined) ? domElement : document;
    this.rotationMatrix = new THREE.Matrix4();
    this.group = group;
    this.screen = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };
    this.light = new THREE.Object3D()


    var STATE = {
        NONE: -1,
        ROTATE: 0,
    };
    var _state = STATE.NONE;
    this.noRotate = false;
    var _movePrev = new THREE.Vector3();
    var _moveCurr = new THREE.Vector3();
    // for(var i=0;i<this.group.children.length;i++ ){
    //   if(this.group.children[i].type =="SpotLight"){
    //     this.light = this.group.children[i]
    //   }
    // }

    var changeEvent = {
        type: 'change'
    };
    var startEvent = {
        type: 'start'
    };
    var endEvent = {
        type: 'end'
    };
    this.domElement.addEventListener("mousedown", onDocumentMouseDown, false);
    this.dispose = function() {

        this.domElement.removeEventListener('mousedown', onDocumentMouseDown, false);

        document.removeEventListener('mousemove', onDocumentMouseMove, false);
        document.removeEventListener('mouseup', onDocumentMouseUp, false);

    };
    this.handleEvent = function(event) {
        if (typeof this[event.type] == 'function') {
            this[event.type](event);
        }
    };
    this.update = function() {

        scope.rotateModel();

    }
    this.rotateModel = (function() {

        var rotateObjQuaternion,
            axis = new THREE.Vector3(),
            quaternion = new THREE.Quaternion(),
            delta = new THREE.Vector3(),
            dynamicDampingFactor = 0.5,
            lastAngle,
            angle;

        return function rotateModel() {
            delta.set(_moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0);
            // console.log(delta);
            angle = delta.length();
            if (angle > 0) {
                axis.crossVectors(projectOnTrackball(_movePrev.x, -_movePrev.y), projectOnTrackball(_moveCurr.x, -_moveCurr.y)).normalize();
                angle *= 15;
                lastAngle = angle;
            }
            if (lastAngle) {
                lastAngle *= Math.sqrt(1.0 - dynamicDampingFactor);
                scope.rotationMatrix = rotateAroundWorldAxis(axis, lastAngle)
            }
            _movePrev.copy(_moveCurr);
        }
    }());
    function rotateAroundWorldAxis(axis, radians) {
      // console.log(scope.group.children);
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
        rotWorldMatrix.multiply(scope.group.matrix); // pre-multiply
        scope.group.matrix = rotWorldMatrix;
        scope.group.rotation.setFromRotationMatrix(scope.group.matrix);
        return rotWorldMatrix;

    }
    function onDocumentMouseDown(evt) {
        if (scope.enabled === false) return;

        evt.preventDefault();
        evt.stopPropagation();

        if (_state === STATE.NONE) {
            _state = evt.button;
        }
        if (_state === STATE.ROTATE && !scope.noRotate) {
            _moveCurr.copy(getMouseOnCircle(evt.clientX, evt.clientY));
            _movePrev.copy(_moveCurr);
        }
        // console.log(_moveCurr);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);

        scope.dispatchEvent(startEvent);
    }
    function onDocumentMouseMove(evt) {

        if (scope.enabled === false) return;

        evt.preventDefault();
        evt.stopPropagation();

        if (_state === STATE.ROTATE && !scope.noRotate) {
            _movePrev.copy(_moveCurr);
            _moveCurr.copy(getMouseOnCircle(evt.clientX, evt.clientY));
        }

    }
    function onDocumentMouseUp(evt) {

        if (scope.enabled === false) return;

        evt.preventDefault();
        evt.stopPropagation();

        _state = STATE.NONE;

        document.removeEventListener('mousemove', onDocumentMouseMove);
        document.removeEventListener('mouseup', onDocumentMouseUp);

        scope.dispatchEvent(endEvent);
    }
    function projectOnTrackball(dx, dy) {
        var mouse = {
            x: 1,
            y: 1
        };
        mouse.x = (dx / window.innerWidth) * 2 - 1;
        mouse.y = -(dy / window.innerHeight) * 2 + 1;
        var vector = new THREE.Vector3(-mouse.x, -mouse.y, 0.5);
        vector.unproject(camera);
        var v3 = new THREE.Vector3().subVectors(scope.group.position, vector);
        return v3;
    }


    function getSceneToWorld(dx, dy) {
        var mouse = {
            x: 1,
            y: 1
        };
        mouse.x = (dx / window.innerWidth) * 2 - 1;
        mouse.y = -(dy / window.innerHeight) * 2 + 1;
        var vector = new THREE.Vector3(-mouse.x, -mouse.y, 0.5);
        vector.unproject(camera);
        return vector;
    }
    this.handleResize = function() {

        if (this.domElement === document) {

            this.screen.left = 0;
            this.screen.top = 0;
            this.screen.width = window.innerWidth;
            this.screen.height = window.innerHeight;

        } else {

            var box = this.domElement.getBoundingClientRect();
            // console.log(box);
            // adjustments come from similar code in the jquery offset() function
            var d = this.domElement.ownerDocument.documentElement;
            this.screen.left = box.left + window.pageXOffset - d.clientLeft;
            this.screen.top = box.top + window.pageYOffset - d.clientTop;
            this.screen.width = box.width;
            this.screen.height = box.height;

        }

    };
    this.handleResize();
  // console.log(this.screen);
    var getMouseOnScreen = (function() {
        var vector = new THREE.Vector3();
        return function getMouseOnScreen(pageX, pageY) {
            vector.set(
                (pageX - scope.screen.left) / scope.screen.width,
                (pageY - scope.screen.top) / scope.screen.height, 0.5
            );
            return vector;
        };
    }());

    var getMouseOnCircle = (function() {
        var vector = new THREE.Vector3();
        return function getMouseOnCircle(pageX, pageY) {
          // console.log(pageX);
            vector.set(
                ((pageX - scope.screen.width * 0.5 - scope.screen.left) / (scope.screen.width * 0.5)),
                ((scope.screen.height + 2 * (scope.screen.top - pageY)) / scope.screen.width), 0.5 // screen.width intentional
            );
            // console.log(((pageX - scope.screen.width * 0.5 - scope.screen.left) / (scope.screen.width * 0.5)));
            return vector;
        };
    }());

}
THREE.LightPositionControl.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.LightPositionControl.prototype.constructor = THREE.LightPositionControls;
