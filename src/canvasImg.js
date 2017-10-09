function CanvasImg(selecter) {
    /*** ***************************************** **/
    /*** CanvasImage作用面板                        **/
    /*** ***************************************** **/

    var obj = this;

    obj.doms = $(selecter);                                     // DOM对象
    obj.elements = [];                                          // 焦点对象
    obj.event = {};
    obj.event.trigger = null;                                   // 点击触发

    /*** 设置trigger ***/
    obj.setTrigger = function (fn) {
        obj.event.trigger = fn;
    };

    /*** 查找属性 ***/
    obj.attr = function (id) {
        for (var i = 0; i < obj.elements.length; i++) {
            var data = obj.elements[i].dom.data(id);
            // 解析
            obj.elements[i].spirits = obj.parseData(data);
        }
        obj.bind();
    };
    /*** 直接给予数据 ***/
    obj.data = function (data) {
        var spirits = obj.parseData(data);
        for (var i = 0; i < obj.elements.length; i++) {
            obj.elements[i].spirits = spirits;
        }
        obj.bind();
    };
    /*** 转换数据 ***/
    obj.parseData = function (data) {
        var spirits = [];
        var spiritData = data.split('&');
        for (var i = 0; i < spiritData.length; i++) {
            var splitData = spiritData[i].split(',');
            var spirit = {
                type: splitData[0],
                range: [parseInt(splitData[1]), parseInt(splitData[2]), parseInt(splitData[3]), parseInt(splitData[4])],
                link: decodeURIComponent(splitData[5])
            };
            spirits.push(spirit);
        }
        return spirits;
    };
    /*** 事件绑定 ***/
    obj.bind = function () {
        for (var i = 0; i < obj.elements.length; i++) {
            obj.elements[i].dom.data('spirit-id', obj.elements[i].id).off('click').on('click', function (event) {
                var img = $(this);
                var point = [Math.floor(event.offsetX * 100 / img.width()), Math.floor(event.offsetY * 100 / img.height())];
                var id = img.data('spirit-id');
                var element = null;
                for (var j = 0; j < obj.elements.length; j++) {
                    if (obj.elements[j].id == id) {
                        element = obj.elements[j];
                        break;
                    }
                }
                for (var j = 0; j < element.spirits.length; j++) {
                    var spirit = element.spirits[j];
                    if (spirit.type == 'rect') {
                        if (common.isCoincidence(spirit.range, point)) {
                            obj.trigger(spirit.link);
                            break;
                        }
                    } else if (spirit.type == 'arc') {
                        var a = Math.ceil(spirit.range[2] / 2), b = Math.ceil(spirit.range[3] / 2);
                        var x = point[0] - Math.ceil(spirit.range[0] + spirit.range[2] / 2),
                            y = Math.ceil(spirit.range[1] + spirit.range[3] / 2) - point[1];

                        if ((x * x) / (a * a) + (y * y) / (b * b) <= 1) {
                            obj.trigger(spirit.link);
                            break;
                        }
                    }
                }
            });
        }
    };
    /*** 点击触发 ***/
    obj.trigger = function (link) {
        if (obj.event.trigger) {
            if (obj.event.trigger(link))
                window.location.href = link;
        } else {
            window.location.href = link;
        }
    };

    /*** 初始化 ***/
    for (var i = 0; i < obj.doms.length; i++) {
        obj.elements.push({
            id: i + 1,
            dom: $(obj.doms[i]),
            spirits: []
        });
    }

    /*** 工具 ***/
    var common = {
        isCoincidence: function (rect, point) {
            return rect[0] <= point[0]
                && (rect[0] + rect[2]) >= point[0]
                && rect[1] <= point[1]
                && (rect[1] + rect[3]) >= point[1];
        }
    };

    return obj;
}