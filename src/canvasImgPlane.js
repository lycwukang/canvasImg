function CanvasImgPlane(canvasDivId, imageUrl) {
    /*** ***************************************** **/
    /*** CanvasImage编辑面板                        **/
    /*** ***************************************** **/

    var obj = this;

    obj.canvasDiv = document.getElementById(canvasDivId);
    obj.canvas = document.createElement('canvas');
    obj.ctx = null;                                                 // 推迟创建

    /*** dom操作 ***/
    obj.canvasDiv.appendChild(obj.canvas);

    /*** 配置 ***/
    obj.config = {};
    obj.config.width = canvasDiv.clientWidth;                       // canvas宽度
    obj.config.height = 0;                                          // canvas高度，计算得出
    obj.config.borderWidth = 2;                                     // canvas边框宽度
    obj.config.borderStyle = '#aaa';                                // canvas边框样式
    obj.config.control = {};
    obj.config.control.defaultType = 'rect';                        // control默认操作
    obj.config.control.width = obj.config.width;                    // control宽度
    obj.config.control.height = 40;                                 // control高度，计算得出
    obj.config.control.fontWeight = '';                             // 字体加粗
    obj.config.control.fontSize = 14;                               // 字体大小
    obj.config.control.fontFamily = 'Arial';                        // 字体类型
    obj.config.control.fontStyle = '#666';                          // 字体样式
    obj.config.control.checkFontWeight = 'bold';                    // 选中后字体加粗
    obj.config.control.checkFontSize = 14;                          // 选中后字体大小
    obj.config.control.checkFontFamily = 'Arial';                   // 选中后字体类型
    obj.config.control.checkFontStyle = '#000';                     // 选中后字体样式
    obj.config.control.saveFontWeight = '';                         // 保存字体加粗
    obj.config.control.saveFontSize = 14;                           // 保存字体大小
    obj.config.control.saveFontFamily = 'Arial';                    // 保存字体类型
    obj.config.control.saveFontStyle = 'green';                     // 保存字体样式
    obj.config.image = {};
    obj.config.image.url = imageUrl;                                // 图片地址
    obj.config.image.ratio = 0;                                     // 像素比例，计算得出
    obj.config.image.width = obj.config.width;                      // image宽度
    obj.config.image.height = 0;                                    // image高度，计算得出
    obj.config.image.fontWeight = '';                               // 字体加粗
    obj.config.image.fontSize = 14;                                 // 字体大小
    obj.config.image.fontFamily = 'Arial';                          // 字体类型
    obj.config.image.fontStyle = '#ea5500';                         // 字体样式
    obj.config.image.linkFontWeight = '';                           // 字体加粗
    obj.config.image.linkFontSize = 12;                             // 字体大小
    obj.config.image.linkFontFamily = 'Arial';                      // 字体类型
    obj.config.image.linkFontStyle = '#ea5500';                     // 字体样式
    obj.config.image.borderWidth = 2;                               // 图形宽度
    obj.config.image.borderStyle = '#ea5500';                       // 图形样式
    obj.config.image.zoomSpace = 2;                                 // 缩放区域
    obj.config.image.measureLineWidth = 2;                          // 测量线宽度
    obj.config.image.measureLineStyle = '#aaa';                     // 测量线样式
    obj.config.image.removeLineWidth = 2;                           // 删除线宽度
    obj.config.image.removeLineStyle = '#aaa';                      // 删除线样式

    obj.event = {};
    obj.event.spiritChange = function (spirits) {                   // 精灵状态变更通知
        if (obj.event.spiritChangeNotify)
            obj.event.spiritChangeNotify(spirits);
    };
    obj.event.spiritSave = function (spirits) {                     // 精灵状态保存
        obj.imagePlane.spiritSave(spirits);
    };
    obj.event.spiritChangeNotify = null;                            // 自定义精灵状态变更

    /*** 保存精灵状态 ***/
    obj.spiritSave = function (spirits) {
        obj.event.spiritSave(spirits);
        obj.draw();
    };
    /*** 设置状态变更回调 ***/
    obj.setSpiritChange = function (func) {
        obj.event.spiritChangeNotify = func;
    };
    /*** 获取数据 ***/
    obj.getSpiritData = function () {
        return obj.imagePlane.getSpiritData();
    };
    /*** 获取数据 ***/
    obj.getData = function () {
        var data = obj.getSpiritData();
        if (data.length == 0) return '';
        var str = '';
        for (var i = 0; i < data.length; i++) {
            str += '&' + data[i].type + ',' +
                data[i].range[0] + ',' +
                data[i].range[1] + ',' +
                data[i].range[2] + ',' +
                data[i].range[3] + ',' +
                encodeURIComponent(data[i].link);
        }
        return str.substring(1);
    };

    /*** 加载 ***/
    obj.load = function (width, height) {
        var canvasRatio = obj.config.width / width;
        var imageHeight = Math.floor(canvasRatio * height);

        obj.config.height = imageHeight + obj.config.control.height;
        obj.config.image.height = imageHeight;

        // 设置canvas的宽度和高度
        obj.canvas.setAttribute('width', obj.config.width + "px");
        obj.canvas.setAttribute('height', obj.config.height + "px");

        obj.ctx = obj.canvas.getContext("2d");
        obj.config.image.ratio = obj.getPixelRatio(obj.ctx);

        obj.registerEvent();
        obj.draw();
    };

    /*** 绘制 ***/
    obj.draw = function () {
        var event = {};
        event.status = {};
        event.status.type = obj.controlPlane.type;
        event.status.mousePoint = obj.imagePlane.mousePoint;
        var deviation = new DeviationCalculator(obj.ctx);
        deviation.translate(0, obj.config.control.height);
        obj.imagePlane.draw(obj.ctx, event);
        deviation.translate(0, 0);
        obj.controlPlane.draw(obj.ctx, event);
        // 绘制边框
        deviation.translate(0, 0);
        obj.drawBorder(obj.ctx, event);
        deviation.reset();
    };

    /*** 绘制边框 ***/
    obj.drawBorder = function (ctx) {
        ctx.lineWidth = obj.config.borderWidth;
        ctx.strokeStyle = obj.config.borderStyle;

        ctx.beginPath();
        ctx.rect(0, 0, obj.config.width, obj.config.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, obj.config.control.height);
        ctx.lineTo(obj.config.width, obj.config.control.height);
        ctx.stroke();
    };

    /*** 获取像素系数 ***/
    obj.getPixelRatio = function (context) {
        var backingStore =
            context.backingStorePixelRatio ||
            context.webkitBackingStorePixelRatio ||
            context.mozBackingStorePixelRatio ||
            context.msBackingStorePixelRatio ||
            context.oBackingStorePixelRatio ||
            context.backingStorePixelRatio || 1;

        return (window.devicePixelRatio || 1) / backingStore;
    };

    /*** 注册事件 ***/
    obj.registerEvent = function () {

        setCanvasEvent('onmousedown');
        setCanvasEvent('onmousemove');
        setCanvasEvent('onmouseup');
        setCanvasEvent('onmouseout');
        setCanvasEvent('onclick');

        /*** 设置事件 ***/
        function setCanvasEvent(eventName) {
            obj.canvas[eventName] = function (event) {
                var planes = getPlanes(event);

                for (var i = 0; i < planes.length; i++) {
                    if (common.isCoincidence(planes[i].range, planes[i].point)) {
                        if (planes[i].obj[eventName]) planes[i].obj[eventName](planes[i].event);
                    } else if (planes[i].obj.onmouseout) planes[i].obj.onmouseout(planes[i].event);
                }
            };
        }

        /*** 获取画板信息 ***/
        function getPlanes(event) {
            var control = {};
            control.range = [0, 0, obj.controlPlane.config.width, obj.controlPlane.config.height];
            control.point = [event.layerX, event.layerY];
            control.obj = obj.controlPlane;
            control.event = {};
            control.event.cursor = setCursor;
            control.event.flush = flush;
            control.event.point = [event.layerX - control.range[0], event.layerY - control.range[1]];
            control.event.status = {};
            control.event.status.type = obj.controlPlane.type;

            var image = {};
            image.range = [0, obj.controlPlane.config.height, obj.imagePlane.config.width, obj.imagePlane.config.height];
            image.point = [event.layerX, event.layerY];
            image.obj = obj.imagePlane;
            image.event = {};
            image.event.cursor = setCursor;
            image.event.flush = flush;
            image.event.point = [event.layerX - image.range[0], event.layerY - image.range[1]];
            image.event.status = {};
            image.event.status.type = obj.controlPlane.type;

            return [control, image];
        }

        /*** 设置鼠标样式 ***/
        function setCursor(cursor) {
            obj.canvas.style.cursor = cursor;
        }

        /*** 刷新 ***/
        function flush() {
            obj.draw();
        }
    };

    obj.controlPlane =
        new ControlPlane(obj.config);                               // 控制面板
    obj.imagePlane =
        new ImagePlane(obj.config, obj.load, obj.event);            // 图片画板


    function ControlPlane(config) {
        /*** ***************************************** **/
        /*** 控制面板                                   **/
        /*** ***************************************** **/

        var obj = this;

        obj.config = config.control;                                // 控制面板配置
        obj.buttons = [];                                           // 按钮
        obj.type = config.control.defaultType;                      // 当前状态

        // 平分4个按钮
        var interval = Math.floor(obj.config.width / 4);
        var defaultButtonConfig = {
            fontWeight: obj.config.fontWeight,
            fontSize: obj.config.fontSize,
            fontFamily: obj.config.fontFamily,
            fontStyle: obj.config.fontStyle,
            checkFontWeight: obj.config.checkFontWeight,
            checkFontSize: obj.config.checkFontSize,
            checkFontFamily: obj.config.checkFontFamily,
            checkFontStyle: obj.config.checkFontStyle
        };
        var saveButtonConfig = {
            fontWeight: obj.config.fontWeight,
            fontSize: obj.config.fontSize,
            fontFamily: obj.config.fontFamily,
            fontStyle: obj.config.fontStyle,
            checkFontWeight: obj.config.saveFontWeight,
            checkFontSize: obj.config.saveFontSize,
            checkFontFamily: obj.config.saveFontFamily,
            checkFontStyle: obj.config.saveFontStyle
        };

        obj.buttons.push(new ControlButton({
            text: '绘制矩形',
            type: 'rect',
            range: [0, 0, interval, obj.config.height]
        }, defaultButtonConfig));

        obj.buttons.push(new ControlButton({
            text: '绘制圆形',
            type: 'arc',
            range: [interval, 0, interval, obj.config.height]
        }, defaultButtonConfig));

        obj.buttons.push(new ControlButton({
            text: '删除图形',
            type: 'remove',
            range: [interval * 2, 0, interval, obj.config.height]
        }, defaultButtonConfig));

        obj.buttons.push(new ControlButton({
            text: '锁定内容',
            type: 'save',
            range: [interval * 3, 0, interval, obj.config.height]
        }, saveButtonConfig));

        /*** 绘制 ***/
        obj.draw = function (ctx, event) {
            obj.clearPlane(ctx, event);
            obj.drawButton(ctx, event);
        };
        /*** 清空面板 ***/
        obj.clearPlane = function (ctx, event) {
            ctx.clearRect(0, 0, obj.config.width, obj.config.height);
        };
        /*** 绘制按钮 ***/
        obj.drawButton = function (ctx, event) {
            for (var i = 0; i < obj.buttons.length; i++) {
                obj.buttons[i].draw(ctx, obj.type);
            }
        };

        /*** 鼠标移动 ***/
        obj.onmousemove = function (event) {
            event.cursor('pointer');
            event.flush();
        };
        /*** 鼠标点击 ***/
        obj.onclick = function (event) {
            for (var i = 0; i < obj.buttons.length; i++) {
                var button = obj.buttons[i];
                if (button.checkRange(event.point)) {
                    obj.type = button.type;
                    event.flush();
                    break;
                }
            }
        };


        function ControlButton(data, config) {
            /*** ***************************************** **/
            /*** 控制按钮                                   **/
            /*** ***************************************** **/

            var obj = this;

            obj.config = config;                                    // 获取配置
            obj.text = data.text;                                   // 按钮文字
            obj.type = data.type;                                   // 按钮类型
            obj.range = data.range;                                 // 按钮区域

            /*** 绘制 ***/
            obj.draw = function (ctx, type) {
                ctx.font = type == obj.type ?
                    common.getFont(obj.config.checkFontWeight, obj.config.checkFontSize, obj.config.checkFontFamily) :
                    common.getFont(obj.config.fontWeight, obj.config.fontSize, obj.config.fontFamily);
                ctx.fillStyle = type == obj.type ?
                    obj.config.checkFontStyle : obj.config.fontStyle;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                var x = obj.range[0] + Math.floor(obj.range[2] / 2);
                var y = obj.range[1] + Math.floor(obj.range[3] / 2);

                ctx.fillText(obj.text, x, y);
            };

            /*** 检查是否重合 ***/
            obj.checkRange = function (point) {
                return common.isCoincidence(obj.range, point);
            };
        }
    }


    function ImagePlane(config, load, event) {
        /*** ***************************************** **/
        /*** 图片画板                                   **/
        /*** ***************************************** **/

        var obj = this;

        obj.config = config.image;                                  // 配置
        obj.event = event;                                          // 事件
        obj.spirits = [];                                           // 画板中的精灵
        obj.spirit = null;                                          // 操作中的精灵
        obj.spiritDrawing = null;                                   // 绘制中的精灵
        obj.mousePoint = null;                                      // 鼠标在图片中的位置

        /*** 加载图片 ***/
        obj.image = new Image();                                    // 画板需要绘制的图片
        obj.image.onload = function () {
            load(obj.image.width, obj.image.height);
        };
        obj.image.src = obj.config.url;

        /*** 绘制 ***/
        obj.draw = function (ctx, event) {
            obj.clearPlane(ctx, event);
            obj.drawImage(ctx, event);
            obj.drawSpirits(ctx, event);
        };
        /*** 清空面板 ***/
        obj.clearPlane = function (ctx, event) {
            ctx.clearRect(0, 0, obj.config.width, obj.config.height);
        };
        /*** 绘制图片 ***/
        obj.drawImage = function (ctx, event) {
            ctx.drawImage(obj.image, 0, 0, obj.config.width * obj.config.ratio, obj.config.height * obj.config.ratio);
        };
        /*** 绘制精灵 ***/
        obj.drawSpirits = function (ctx, event) {
            for (var i = 0; i < obj.spirits.length; i++) {
                obj.spirits[i].draw(ctx, event);
            }
            if (obj.spiritDrawing) obj.spiritDrawing.draw(ctx, event);
        };

        /*** 添加精灵 ***/
        obj.addSpirit = function (spirit) {
            obj.spirits.push(spirit);
            obj.spiritChange();
        };

        /*** 删除精灵，并重新排序 ***/
        obj.removeSpirit = function (index) {
            obj.spirits.splice(index, 1);
            for (var i = 0; i < obj.spirits.length; i++) {
                obj.spirits[i].name = (i + 1) + "";
            }
            obj.spiritChange();
        };

        /*** 获取精灵状态 ***/
        obj.getSpiritData = function () {
            var data = [];
            for (var i = 0; i < obj.spirits.length; i++) {
                var spirit = obj.spirits[i];
                // 换算百分比
                var x = Math.floor(spirit.range[0] * 100 / obj.config.width), y = Math.floor(spirit.range[1] * 100 / obj.config.height);
                var width = Math.floor(spirit.range[2] * 100 / obj.config.width), height = Math.floor(spirit.range[3] * 100 / obj.config.height);
                var beginPoint = [x, y];
                var endPoint = [x + width, y + height];

                data.push({
                    id: spirit.id,
                    type: spirit.type,
                    link: spirit.link,
                    name: (spirit.type == 'rect' ? "R" : "C") + spirit.name,
                    beginPoint: beginPoint,
                    endPoint: endPoint,
                    range: [x, y, width, height]
                });
            }
            return data;
        };

        /*** 精灵状态变更 ***/
        obj.spiritChange = function () {
            if (obj.event.spiritChange)
                obj.event.spiritChange(obj.getSpiritData());
        };

        /*** 精灵状态保存 ***/
        obj.spiritSave = function (spirits) {
            for (var i = 0; i < spirits.length; i++) {
                var spirit = spirits[i];

                for (var j = 0; j < obj.spirits.length; j++) {
                    if (obj.spirits[j].id == spirit.id) {
                        obj.spirits[j].link = spirit.link;
                        break;
                    }
                }
            }
        };

        /*** 鼠标事件 ***/
        obj.onmousedown = function (event) {
            // 记录鼠标位置
            obj.mousePoint = event.point;

            if (event.status.type == 'save') return;
            if (event.status.type == 'remove') return;

            if (event.status.type == 'rect' || event.status.type == 'arc') {
                var spirit = null;
                for (var i = 0; i < obj.spirits.length; i++) {
                    if (obj.spirits[i].checkCursorRange(event.point)) {
                        spirit = obj.spirits[i];
                        break;
                    }
                }

                if (spirit) {
                    obj.spirit = spirit;
                    obj.spirit.onmousedown(event.point);
                } else {
                    obj.spiritDrawing = new SpiritDrawing({
                        id: new Date().getTime(),
                        link: '',
                        type: event.status.type,
                        name: obj.spirits.length + 1
                    }, obj.config);
                    obj.spiritDrawing.onmousedown(event.point);
                }
            }

            event.flush();
        };
        obj.onmousemove = function (event) {
            // 记录鼠标位置
            obj.mousePoint = event.point;

            if (obj.spiritDrawing) {
                obj.spiritDrawing.onmousemove(event.point);
            } else if (obj.spirit) {
                obj.spirit.onmousemove(event.point);
            } else {
                var cursor = 'auto';
                if (event.status.type == 'rect' || event.status.type == 'arc') {
                    for (var i = 0; i < obj.spirits.length; i++) {
                        if (obj.spirits[i].checkCursorRange(event.point)) {
                            cursor = obj.spirits[i].checkCursor(event.point);
                            break;
                        }
                    }
                }
                if (event.status.type == 'remove') {
                    for (var i = 0; i < obj.spirits.length; i++) {
                        if (obj.spirits[i].checkRange(event.point)) {
                            cursor = 'pointer';
                            break;
                        }
                    }
                }
                event.cursor(cursor);
            }
            event.flush();
        };
        obj.onmouseup = function (event) {
            // 记录鼠标位置
            obj.mousePoint = event.point;

            if (obj.spiritDrawing) {
                var spirit = obj.spiritDrawing.onmouseup();
                if (spirit) obj.addSpirit(spirit);
                obj.spiritDrawing = null;
            } else if (obj.spirit) {
                obj.spirit.onmouseup();
                obj.spirit = null;
                obj.spiritChange();
            }
            event.flush();
        };
        obj.onmouseout = function (event) {
            obj.onmouseup(event);

            // 删除鼠标位置
            obj.mousePoint = null;
        };
        obj.onclick = function (event) {
            if (event.status.type == 'remove') {
                for (var i = 0; i < obj.spirits.length; i++) {
                    if (obj.spirits[i].checkRange(event.point)) {
                        obj.removeSpirit(i);
                        break;
                    }
                }
            }
            event.flush();
        };


        function SpiritDrawing(data, config) {
            /*** ***************************************** **/
            /*** 正在绘制中的精灵                            **/
            /*** ***************************************** **/

            var obj = this;

            obj.id = data.id;                                           // 编号
            obj.link = data.link;                                       // 链接
            obj.type = data.type;                                       // rect:矩形 arc:椭圆
            obj.name = data.name;                                       // 需要绘制的名称
            obj.config = config;                                        // 设置

            /*** 精灵显示所在的矩形 ***/
            /*** 椭圆是矩形的内切圆 ***/
            obj.beginPoint = null;                                      // [x, y]
            obj.endPoint = null;                                        // [x, y]

            /*** 鼠标事件处理 ***/
            obj.onmousedown = function (point) {
                obj.endPoint = obj.beginPoint = point;
            };
            obj.onmousemove = function (point) {
                obj.endPoint = point;
            };
            obj.onmouseup = function () {
                // 返回一个新的精灵信息
                var range = obj.getRange();
                if (range[2] <= 0 || range[3] <= 0) return null;

                var data = {
                    id: obj.id,
                    link: obj.link,
                    name: obj.name,
                    type: obj.type,
                    range: range
                };
                return new Spirit(data, obj.config);
            };

            /*** 获得要绘制的区域 ***/
            obj.getRange = function () {
                var m = obj.beginPoint[0], n = obj.beginPoint[1], x = obj.endPoint[0], y = obj.endPoint[1];
                var a = m <= x, b = n <= y;

                return [a ? m : x, b ? n : y, Math.abs(m - x), Math.abs(n - y)];
            };

            /*** 绘制 ***/
            obj.draw = function (ctx, event) {
                if (obj.type == 'rect') {
                    obj.drawRect(ctx, event);
                } else if (obj.type == 'arc') {
                    obj.drawArc(ctx, event);
                }
            };
            /*** 绘制矩形 ***/
            obj.drawRect = function (ctx, event) {
                var range = obj.getRange();
                if (range[2] > 0 || range[3] > 0) {
                    ctx.beginPath();
                    ctx.font = common.getFont(null, obj.config.fontSize, obj.config.fontFamily);
                    ctx.fillStyle = obj.config.fontStyle;
                    ctx.textAlign = "center";
                    ctx.textBaseline = 'middle';
                    ctx.lineWidth = obj.config.borderWidth;
                    ctx.strokeStyle = obj.config.borderStyle;

                    var x = range[0], y = range[1], width = range[2], height = range[3];
                    var radiiWidth = Math.floor(width / 2), radiiHeight = Math.floor(height / 2);

                    var radii = Math.floor(obj.config.borderWidth / 2);
                    var radii2 = 2 * radii;
                    ctx.rect(x + radii, y + radii, width - radii2, height - radii2);
                    // 文字
                    ctx.fillText((data.type == 'rect' ? "R" : "C") + obj.name, x + radiiWidth, y + radiiHeight);
                    ctx.stroke();
                }
            };
            /*** 绘制圆形 ***/
            obj.drawArc = function (ctx, event) {
                var range = obj.getRange();
                if (range[2] > 0 || range[3] > 0) {
                    ctx.font = common.getFont(null, obj.config.fontSize, obj.config.fontFamily);
                    ctx.fillStyle = obj.config.fontStyle;
                    ctx.textAlign = "center";
                    ctx.textBaseline = 'middle';
                    ctx.lineWidth = obj.config.borderWidth;
                    ctx.strokeStyle = obj.config.borderStyle;

                    var x = range[0], y = range[1], width = range[2], height = range[3];

                    var radii = Math.floor(obj.config.measureLineWidth / 2);
                    var radii2 = 2 * radii;
                    var radiiWidth = Math.floor(width / 2) - radii2 - radii,
                        radiiHeight = Math.floor(height / 2) - radii2 - radii,
                        dotX = x + radiiWidth + radii2 + radii,
                        dotY = y + radiiHeight + radii2 + radii;
                    var step = (radiiWidth > radiiHeight) ? 1 / radiiWidth : 1 / radiiHeight;

                    if (radiiWidth > 0 && radiiHeight > 0) {
                        // 主体
                        ctx.beginPath();
                        ctx.moveTo(dotX + radiiWidth, dotY);
                        for (var i = 0; i < 2 * Math.PI; i += step) {
                            ctx.lineTo(dotX + radiiWidth * Math.cos(i), dotY + radiiHeight * Math.sin(i));
                        }
                        ctx.lineTo(dotX + radiiWidth * Math.cos(2 * Math.PI), dotY + radiiHeight * Math.sin(2 * Math.PI));
                    }

                    // 文字
                    ctx.fillText((data.type == 'rect' ? "R" : "C") + obj.name, x + radiiWidth, y + radiiHeight);
                    ctx.stroke();

                    // 边框
                    ctx.beginPath();
                    ctx.lineWidth = obj.config.measureLineWidth;
                    ctx.strokeStyle = obj.config.measureLineStyle;
                    ctx.rect(x + radii, y + radii, width - radii2, height - radii2);
                    ctx.stroke();
                }
            };
        }


        function Spirit(data, config) {
            /*** ***************************************** **/
            /*** 绘制精灵                                   **/
            /*** ***************************************** **/

            var obj = this;

            obj.id = data.id;                                           // 编号
            obj.link = data.link;                                       // 链接
            obj.config = config;                                        // 配置
            obj.name = data.name;                                       // 需要绘制的名称
            obj.type = data.type;                                       // rect:矩形 arc:椭圆

            /*** 精灵显示所在的矩形 ***/
            /*** 椭圆是矩形的内切圆 ***/
            obj.range = data.range;                                     // [beginX, beginY, endX, endY]

            /*** 精灵状态 ***/
            obj.status = {};
            obj.status.type = null;                                     // 'move':移动中, 'zoom':缩放中

            /*** 移动功能 ***/
            obj.status.moveStartPoint = null;                           // 移动开始时坐标
            obj.status.moveEndPoint = null;                             // 移动结束时坐标

            /*** 缩放功能 ***/
            obj.zoom = {};
            obj.zoom.leftZoom = 1 << 0;                                 // 可以调整左边线的位置
            obj.zoom.rightZoom = 1 << 1;                                // 可以调整右边线的位置
            obj.zoom.topZoom = 1 << 2;                                  // 可以调整上面线的位置
            obj.zoom.bottomZoom = 1 << 3;                               // 可以调整下面线的位置

            obj.status.zoomType = null;                                 // 缩放类型
            obj.status.zoomStartPoint = null;                           // 缩放开始时坐标
            obj.status.zoomEndPoint = null;                             // 缩放结束时坐标

            /*** 移动功能操作 ***/
            obj.moveBegin = function (point) {
                obj.status.type = 'move';
                obj.status.moveEndPoint = obj.status.moveStartPoint = point;
            };
            obj.moveUpdate = function (point) {
                // 检查边界
                var moveDiffX = point[0] - obj.status.moveStartPoint[0];
                var moveDiffY = point[1] - obj.status.moveStartPoint[1];
                var x = obj.range[0], y = obj.range[1], width = obj.range[2], height = obj.range[3];
                var moveX = point[0], moveY = point[1];

                if (x + moveDiffX < 0) {
                    moveX = obj.status.moveStartPoint[0] - x;
                } else if (x + width + moveDiffX > obj.config.width) {
                    moveX = obj.status.moveStartPoint[0] + obj.config.width - x - width;
                }
                if (y + moveDiffY < 0) {
                    moveY = obj.status.moveStartPoint[1] - obj.range[1];
                } else if (y + height + moveDiffY > obj.config.height) {
                    moveY = obj.status.moveStartPoint[1] + obj.config.height - y - height;
                }

                obj.status.moveEndPoint = [moveX, moveY];
            };
            obj.moveEnd = function () {
                obj.range = obj.moveRange();

                obj.status.type = null;
                obj.status.moveEndPoint = obj.status.moveStartPoint = null;
            };
            obj.moveRange = function () {
                var moveDiffX = obj.status.moveEndPoint[0] - obj.status.moveStartPoint[0];
                var moveDiffY = obj.status.moveEndPoint[1] - obj.status.moveStartPoint[1];

                return [obj.range[0] + moveDiffX, obj.range[1] + moveDiffY, obj.range[2], obj.range[3]];
            };
            // 检查是否可以移动
            obj.checkMove = function (point) {
                return common.isCoincidence(obj.range, point);
            };

            /*** 缩放功能操作 ***/
            obj.zoomBegin = function (point) {
                // 检查zoomType
                var type = obj.checkZoom(point);

                obj.status.type = 'zoom';
                obj.status.zoomType = type;
                obj.status.zoomEndPoint = obj.status.zoomStartPoint = point;
            };
            obj.zoomUpdate = function (point) {
                // 检查边界
                var diffX = point[0] - obj.status.zoomStartPoint[0];
                var diffY = point[1] - obj.status.zoomStartPoint[1];
                var width = obj.range[2], height = obj.range[3];
                var moveX = point[0], moveY = point[1];

                if ((obj.status.zoomType & obj.zoom.leftZoom) == obj.zoom.leftZoom) {
                    // left
                    if (width - diffX <= 0) {
                        moveX -= diffX - width + 1;
                    }
                }
                if ((obj.status.zoomType & obj.zoom.rightZoom) == obj.zoom.rightZoom) {
                    // right
                    if (width + diffX <= 0) {
                        moveX += diffX - width + 1;
                    }
                }
                if ((obj.status.zoomType & obj.zoom.topZoom) == obj.zoom.topZoom) {
                    // top
                    if (height - diffY <= 0) {
                        moveY -= diffY - height + 1;
                    }
                }
                if ((obj.status.zoomType & obj.zoom.bottomZoom) == obj.zoom.bottomZoom) {
                    // bottom
                    if (height + diffY <= 0) {
                        moveY += diffY - height + 1;
                    }
                }

                obj.status.zoomEndPoint = [moveX, moveY];
            };
            obj.zoomEnd = function (point) {
                obj.range = obj.zoomRange(point);

                obj.status.type = null;
                obj.status.zoomType = null;
                obj.status.zoomEndPoint = obj.status.zoomStartPoint = null;
            };
            obj.zoomRange = function () {
                var diffX = obj.status.zoomEndPoint[0] - obj.status.zoomStartPoint[0];
                var diffY = obj.status.zoomEndPoint[1] - obj.status.zoomStartPoint[1];

                var rectX = obj.range[0], rectY = obj.range[1];
                var rectWidth = obj.range[2], rectHeight = obj.range[3];

                if ((obj.status.zoomType & obj.zoom.leftZoom) == obj.zoom.leftZoom) {
                    // left
                    rectX = rectX + diffX;
                    rectWidth = rectWidth - diffX;
                }
                if ((obj.status.zoomType & obj.zoom.rightZoom) == obj.zoom.rightZoom) {
                    // right
                    rectWidth = rectWidth + diffX;
                }
                if ((obj.status.zoomType & obj.zoom.topZoom) == obj.zoom.topZoom) {
                    // top
                    rectY = rectY + diffY;
                    rectHeight = rectHeight - diffY;
                }
                if ((obj.status.zoomType & obj.zoom.bottomZoom) == obj.zoom.bottomZoom) {
                    // bottom
                    rectHeight = rectHeight + diffY;
                }

                rectX = rectX < 0 ? 0 : rectX;
                rectY = rectY < 0 ? 0 : rectY;
                rectWidth = rectWidth > 0 ? rectWidth : 1;
                rectHeight = rectHeight > 0 ? rectHeight : 1;

                rectWidth = rectX + rectWidth > obj.config.width ? obj.config.width - rectX : rectWidth;
                rectHeight = rectY + rectHeight > obj.config.height ? obj.config.height - rectY : rectHeight;

                return [rectX, rectY, rectWidth, rectHeight];
            };
            // 检查是否可以缩放
            obj.checkZoom = function (point) {
                var result = 0;

                var x = obj.range[0], y = obj.range[1];
                var width = obj.range[2], height = obj.range[3], space = obj.config.zoomSpace;
                // 四个边上可以拉伸
                var left = [x - space, y, 2 * space, height];
                var right = [x + width - space, y, 2 * space, height];
                var top = [x, y - space, width, 2 * space];
                var bottom = [x, y + height - space, width, 2 * space];
                if (common.isCoincidence(left, point)) {
                    result = obj.zoom.leftZoom;
                }
                if (common.isCoincidence(right, point)) {
                    result = obj.zoom.rightZoom;
                }
                if (common.isCoincidence(top, point)) {
                    result = obj.zoom.topZoom;
                }
                if (common.isCoincidence(bottom, point)) {
                    result = obj.zoom.bottomZoom;
                }
                // 四个角可以拉伸
                var a = [x - space, y - space, 2 * space, 2 * space];
                var b = [x + width - space, y - space, 2 * space, 2 * space];
                var c = [x - space, y + height - space, 2 * space, 2 * space];
                var d = [x + width - space, y + height - space, 2 * space, 2 * space];
                if (common.isCoincidence(a, point)) {
                    result = obj.zoom.leftZoom | obj.zoom.topZoom;
                }
                if (common.isCoincidence(b, point)) {
                    result = obj.zoom.rightZoom | obj.zoom.topZoom;
                }
                if (common.isCoincidence(c, point)) {
                    result = obj.zoom.leftZoom | obj.zoom.bottomZoom;
                }
                if (common.isCoincidence(d, point)) {
                    result = obj.zoom.rightZoom | obj.zoom.bottomZoom;
                }

                return result;
            };

            /*** 检查焦点区域 ***/
            obj.checkCursorRange = function (point) {
                var x = obj.range[0], y = obj.range[1];
                var width = obj.range[2], height = obj.range[3], space = obj.config.zoomSpace;

                return common.isCoincidence([x - space, y - space, width + 2 * space, height + 2 * space], point);
            };

            /*** 检查区域 ***/
            obj.checkRange = function (point) {
                return common.isCoincidence(obj.range, point);
            };

            /*** 获取焦点类型 ***/
            obj.checkCursor = function (point) {
                var zoomType = obj.checkZoom(point);
                if (zoomType == (obj.zoom.leftZoom | obj.zoom.topZoom)) {
                    return 'nw-resize';
                } else if (zoomType == (obj.zoom.rightZoom | obj.zoom.topZoom)) {
                    return 'ne-resize';
                } else if (zoomType == (obj.zoom.leftZoom | obj.zoom.bottomZoom)) {
                    return 'sw-resize';
                } else if (zoomType == (obj.zoom.rightZoom | obj.zoom.bottomZoom)) {
                    return 'se-resize';
                } else if (zoomType == obj.zoom.leftZoom) {
                    return 'w-resize';
                } else if (zoomType == obj.zoom.rightZoom) {
                    return 'e-resize';
                } else if (zoomType == obj.zoom.topZoom) {
                    return 'n-resize';
                } else if (zoomType == obj.zoom.bottomZoom) {
                    return 's-resize';
                }

                return 'move';
            };

            /*** 鼠标事件处理 ***/
            obj.onmousedown = function (point) {
                if (obj.checkZoom(point) > 0) {
                    obj.zoomBegin(point);
                } else if (obj.checkMove(point)) {
                    obj.moveBegin(point);
                }
            };
            obj.onmousemove = function (point) {
                if (obj.status.type == 'move') {
                    obj.moveUpdate(point);
                } else if (obj.status.type == 'zoom') {
                    obj.zoomUpdate(point);
                }
            };
            obj.onmouseup = function () {
                if (obj.status.type == 'move') {
                    obj.moveEnd();
                } else if (obj.status.type == 'zoom') {
                    obj.zoomEnd();
                }
            };

            /*** 获取当前状态的矩形 ***/
            obj.getRealRange = function () {
                if (obj.status.type == 'move') {
                    return obj.moveRange();
                } else if (obj.status.type == 'zoom') {
                    return obj.zoomRange();
                } else {
                    return obj.range;
                }
            };

            /*** 绘制 ***/
            obj.draw = function (ctx, event) {
                if (obj.type == 'rect') {
                    obj.drawRect(ctx, event);
                } else if (obj.type == 'arc') {
                    obj.drawArc(ctx, event);
                }
            };
            obj.drawRect = function (ctx, event) {
                ctx.font = common.getFont(null, obj.config.fontSize, obj.config.fontFamily);
                ctx.fillStyle = obj.config.fontStyle;
                ctx.textAlign = "center";
                ctx.textBaseline = 'middle';

                var range = obj.getRealRange();
                var x = range[0], y = range[1], width = range[2], height = range[3];
                var radiiWidth = Math.floor(width / 2), radiiHeight = Math.floor(height / 2);

                if (event.status.type == 'remove') {
                    ctx.lineWidth = obj.config.removeLineWidth;
                    ctx.strokeStyle = obj.config.removeLineStyle;

                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + width, y + height);
                    ctx.moveTo(x, y + height);
                    ctx.lineTo(x + width, y);
                    ctx.stroke();
                }

                ctx.lineWidth = obj.config.borderWidth;
                ctx.strokeStyle = obj.config.borderStyle;

                ctx.beginPath();
                var radii = Math.floor(obj.config.borderWidth / 2);
                var radii2 = 2 * radii;
                ctx.rect(x + radii, y + radii, width - radii2, height - radii2);
                // 文字
                ctx.fillText((data.type == 'rect' ? "R" : "C") + obj.name, x + radiiWidth, y + radiiHeight);
                // 链接
                if (event.status.mousePoint && common.isCoincidence(range, event.status.mousePoint)) {
                    ctx.font = common.getFont(obj.config.linkFontSize, obj.config.linkFontSize, obj.config.linkFontFamily);
                    ctx.fillStyle = obj.config.linkFontStyle;
                    ctx.fillText(obj.link, x + radiiWidth, y + radiiHeight + obj.config.fontSize);
                }
                ctx.stroke();
            };
            obj.drawArc = function (ctx, event) {
                // 主体
                ctx.beginPath();
                ctx.font = common.getFont(null, obj.config.fontSize, obj.config.fontFamily);
                ctx.fillStyle = obj.config.fontStyle;
                ctx.textAlign = "center";
                ctx.textBaseline = 'middle';

                var range = obj.getRealRange();
                var x = range[0], y = range[1], width = range[2], height = range[3];

                var radii = Math.floor(obj.config.measureLineWidth / 2);
                var radii2 = 2 * radii;
                var radiiWidth = Math.floor(width / 2) - radii2 - radii,
                    radiiHeight = Math.floor(height / 2) - radii2 - radii,
                    dotX = x + radiiWidth + radii2 + radii,
                    dotY = y + radiiHeight + radii2 + radii;
                var step = (radiiWidth > radiiHeight) ? 1 / radiiWidth : 1 / radiiHeight;

                if (event.status.type == 'remove') {
                    ctx.lineWidth = obj.config.removeLineWidth;
                    ctx.strokeStyle = obj.config.removeLineStyle;

                    ctx.beginPath();
                    ctx.moveTo(x - obj.config.measureLineWidth, y - obj.config.measureLineWidth);
                    ctx.lineTo(x + width + obj.config.measureLineWidth, y + height + obj.config.measureLineWidth);
                    ctx.moveTo(x - obj.config.measureLineWidth, y + height + obj.config.measureLineWidth);
                    ctx.lineTo(x + width + obj.config.measureLineWidth, y - obj.config.measureLineWidth);
                    ctx.stroke();
                }

                ctx.lineWidth = obj.config.borderWidth;
                ctx.strokeStyle = obj.config.borderStyle;

                if (radiiWidth > 0 && radiiHeight > 0) {
                    ctx.beginPath();
                    ctx.moveTo(dotX + radiiWidth, dotY);
                    for (var i = 0; i < 2 * Math.PI; i += step) {
                        ctx.lineTo(dotX + radiiWidth * Math.cos(i), dotY + radiiHeight * Math.sin(i));
                    }
                    ctx.lineTo(dotX + radiiWidth * Math.cos(2 * Math.PI), dotY + radiiHeight * Math.sin(2 * Math.PI));
                }

                // 文字
                ctx.fillText((data.type == 'rect' ? "R" : "C") + obj.name, x + radiiWidth, y + radiiHeight);
                // 链接
                if (event.status.mousePoint && common.isCoincidence(range, event.status.mousePoint)) {
                    ctx.font = common.getFont(obj.config.linkFontSize, obj.config.linkFontSize, obj.config.linkFontFamily);
                    ctx.fillStyle = obj.config.linkFontStyle;
                    ctx.fillText(obj.link, x + radiiWidth, y + radiiHeight + obj.config.fontSize);
                }
                ctx.stroke();

                // 边框
                ctx.beginPath();
                ctx.lineWidth = obj.config.measureLineWidth;
                ctx.strokeStyle = obj.config.measureLineStyle;
                ctx.rect(x + radii, y + radii, width - radii2, height - radii2);
                ctx.stroke();
            };
        }
    }

    /*** 偏移量计算器 ***/
    /*** 使用时只需关注原始的xy坐标 ***/
    function DeviationCalculator(ctx) {

        var obj = this;

        obj.deviation = [0, 0];

        // 设置偏移
        obj.translate = function (x, y) {
            x = obj.deviation[0] * -1 + x;
            y = obj.deviation[1] * -1 + y;

            ctx.translate(x, y);

            obj.deviation[0] += x;
            obj.deviation[1] += y;
        };

        // 重置
        obj.reset = function () {
            obj.translate(0, 0);
        };
    }

    /*** 工具 ***/
    var common = {
        isCoincidence: function (rect, point) {
            return rect[0] <= point[0]
                && (rect[0] + rect[2]) >= point[0]
                && rect[1] <= point[1]
                && (rect[1] + rect[3]) >= point[1];
        },
        getFont: function (weight, size, family) {
            var font = '';
            if (weight) font += weight + ' ';
            return font + size + 'px ' + family;
        }
    };
}