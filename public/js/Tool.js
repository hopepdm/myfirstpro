var Tool = (function() {

    var currentLight = 'light1';
    var model ={};

    //初始化所有的滑动条
    var selector = '[data-rangeslider]';
    var $inputRange = $(selector);
    $inputRange.rangeslider({
        polyfill: false
    });

    //菜单开关
    $('.menu_tag').click(function() {
        $('.menu_wrap').show()
    })
    $('.menu_close').click(function() {
        $(this).parent().parent().hide()
    })

    //菜单选项
    //这里暂时只能在每次打开菜单时渲染 因为菜单没打开时，元素相当于没有，
    //所有的事件注册会失败，无法实现旋转   (应该是这样的。。)
    //另一种情况是dom隐藏时宽高为0 旋转时获取的坐标不对
    $('[data-light]').click(function() {
        $('.light_set').fadeToggle(function() {

            showLightControl();
        }).siblings().not('.menu_wrap').hide();
    })
    $('[data-material]').click(function() {
        $('.material_set').fadeToggle(function() {
            showLightControl();
        }).siblings().not('.menu_wrap').hide();

    })
    $('[data-position]').click(function() {
        $('.position_set').fadeToggle(function() {
            showLightControl();
        }).siblings().not('.menu_wrap').hide();

    })
    $('[data-other]').click(function() {
        $('.other_set').fadeToggle(function() {
            showLightControl();
        }).siblings().not('.menu_wrap').hide();

    })


    /**
     * 灯光属性的设置
     */

    $('.light1').click(function() {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
        lightControl.attachLight('light1');
        currentLight = 'light1';
        //改变灯 拾色器也要对应
        $('#lightcol').colpickSetColor(lightList[currentLight].color.getHexString())

    })

    $('.light2').click(function() {
        $(this).addClass('active')
        $(this).siblings().removeClass('active')
        lightControl.attachLight('light2');
        currentLight = 'light2';
        $('#lightcol').colpickSetColor(lightList[currentLight].color.getHexString())
    })
    $('.light3').click(function() {
        $(this).addClass('active')
        $(this).siblings().removeClass('active')
        lightControl.attachLight('light3')
        currentLight = 'light3';
        $('#lightcol').colpickSetColor(lightList[currentLight].color.getHexString())
    })

    $('.light_intensity input[type="range"]').on('input', function() {
        lightList[currentLight].intensity = lightControl.changeIntensity($(this).val())
    })
    //禁用这个灯（强度为0）
    $('.light_intensity label').click(function() {
        var val = $('.light_intensity input[type="range"]').val()
        if ($(this).hasClass('true')) {
            $(this).removeClass('true').addClass('false')

            lightList[currentLight].intensity = 0;
            lightControl.changeIntensity(0)
        } else {
            $(this).removeClass('false').addClass('true')

            lightList[currentLight].intensity = val;
            lightControl.changeIntensity(val)
        }
    })
    $('#lightcol').colpick({
        flat: true,
        layout: 'hex',
        submit: 0,
        color: 'ffffff',
        onChange: function(hsb, hex, rgb, el, bySetColor) {
            console.log(currentLight);
            lightControl.changeColor('0x' + hex);
            lightList[currentLight].color.setHex('0x' + hex);
            // $('.lights .active').css('background-color','#'+hex);

        }
    });

    /**
     * 材质属性的设置
     */
    /**
    材质颜色：color:表示材质本身的颜色,ambient:材质环境色（被废弃）,specular:镜面反射色
    emissive:材质发射的色，不受其他色的影响，shininess:高光亮度，
    opacity:透明度 在transparent为true时才会起作用
     */

    $('.color').click(function() {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
        $('.material_color .tool_name').text('材质固有色');
        currentMat = 'color'; //注意要先改变当前属性，在改变颜色
        $('#matcol').colpickSetColor(getModelMatAttr(model, ['color']).color.getHexString());


    })
    $('.emissive').click(function() {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
        $('.material_color .tool_name').text('材质反射色');
        currentMat = 'emissive';
        $('#matcol').colpickSetColor(getModelMatAttr(model, ['emissive']).emissive.getHexString())

    })
    $('.specular').click(function() {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
        $('.material_color .tool_name').text('镜面反射色');
        currentMat = 'specular';
        $('#matcol').colpickSetColor(getModelMatAttr(model, ['specular']).specular.getHexString())

    })
    $('.material_opacity input[type="range"]').on('input', function() {

        changeModelMat(model, 'opacity', $(this).val())
    })
    $('.material_specularity input[type="range"]').on('input', function() {
        changeModelMat(model, 'shininess', $(this).val())
    })

    $('#matcol').colpick({
        flat: true,
        layout: 'hex',
        submit: 0,
        color: 'ffffff',
        onChange: function(hsb, hex, rgb, el, bySetColor) {
            console.log(currentMat);
            $('.materials .active').css('background-color', '#' + hex);
            changeModelMat(model, currentMat, new THREE.Color().setHex('0x' + hex))
        }
    })


    /**
     * [showLightControl description]
     * @method showLightControl
     * @return {[type]}         [description]
     */
    function showLightControl() {
        var visiable = $('.light_set').css('display') == 'block';
        // console.log(visiable);
        if (visiable) {
            var lights = getSceneAttr(scene);
            lightControl.create(lights);
        } else {
            lightControl.dispose();
        }
    };
    /**
     * [材质两种情况要分开处理
     * 1. group->children->mesh->material->MeshPhongMaterial
     * 2. group->children->mesh->material->MultiMaterial->materials->MeshPhongMaterial]
     * 透明度需要在transparent为true时起作用
     * @method changeModelMat
     * @param  {[type]}            model [需要改变的模型]
     * @param  {[type]}            type  [需要改变的属性]
     * @param  {[type]}            val   [需要改变的值]
     * @return {[type]}                  [description]
     */
    function changeModelMat(model, type, val) {
        if (!model) return;
        console.log(model);
        var children = model.children;
        var len = children.length;
        for (var i = 0; i < len; i++) {
            var mat = children[i].material;
            var matType = mat.type; //material 的type值
            if (matType == 'MeshPhongMaterial') {
                if (type == 'opacity') mat.transparent = true;
                mat[type] = val;
            } else if (matType == 'MultiMaterial') {
                var materials = mat.materials; //获取一个MultiMaterial的所有MeshPhongMaterial
                for (var j = 0; j < materials.length; j++) {
                    if (type == 'opacity') materials[j].transparent = true;
                    materials[j][type] = val;
                }
            }
        }

    };
    /**
     * [getSceneAttr description]
     * @method getSceneAttr
     * @param  {[object]}     scene [场景对象]
     * @return {[object]}           [返回所有的灯光信息(颜色、亮度、位置)]
     */

    function getSceneAttr(scene) {
        var children = scene.children;
        var len = children.length;
        var n = 1;
        var attrs = {};
        for (var i = 0; i < len; i++) {
            if (children[i] instanceof THREE.DirectionalLight) {
                var light = attrs['light' + n] = {};
                light.color = children[i].color;
                light.intensity = children[i].intensity;
                light.position = children[i].position;
                n++;
            } else if (children[i] instanceof THREE.AmbientLight) {
                attrs.ambientLight = {};
                attrs.ambientLight.color = children[i].color;
                attrs.ambientLight.intensity = children[i].intensity;
            }
        }

        return attrs;
    };
    /**
     * [getModelAttr 返回需要的材质属性值]
     * @method getModelAttr
     * @param  {[object]}     model [模型]
     * @param  {[array]}      type  [需要得到的属性数组,为空时返回所有属性]
     * @return {[object]}           [属性]
     */
    function getModelMatAttr(model, type) {
        var attr = {};
        if (model instanceof THREE.Group) {
            attr.matrix = model.matrix; //获取模型组的旋转矩阵
            var mat = model.children[0].material; //获取材质属性，所有的材质属性都应该保持一致
            var matType = mat.type;
            if (matType == 'MeshPhongMaterial') {
                attr.color = mat.color; //固有色
                attr.specular = mat.specular; //高亮色
                attr.emissive = mat.emissive; //材质反射色
                attr.opacity = mat.opacity; //透明度
                attr.shininess = mat.shininess; //高亮亮度
            } else if (matType == 'MultiMaterial') {
                mat = mat.materials[0];
                attr.color = mat.color; //固有色
                attr.specular = mat.specular; //高亮色
                attr.emissive = mat.emissive; //材质反射色
                attr.opacity = mat.opacity; //透明度
                attr.shininess = mat.shininess; //高亮亮度
            }

        }
        if (!type) return attr;
        var obj = {};
        for (var i = 0; i < type.length; i++) {
            obj[type[i]] = attr[type[i]]
        }
        return obj;
    };

    return {
      /**
       * [返回当前lightname]
       * @method
       * @return {[string]} [lightname]
       */
        getCurrentLight: function() {
            return currentLight;
        },
        /**
         * [设置当前模型]
         * @method
         * @param  {[object]} obj [模型对象]
         * @return {[type]}       [description]
         */
        setModel:function  (obj) {

            model = obj;

        }
    }

})()
