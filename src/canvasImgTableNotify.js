function CanvasImgTableNotify(tableId, canvasImg, style) {
    /*** ***************************************** **/
    /*** CanvasImage通知表格                        **/
    /*** ***************************************** **/

    var obj = this;
    obj.style = style;
    obj.cavasImg = canvasImg;
    obj.tableDiv = $(document.getElementById(tableId));

    return function (spirits) {
        obj.tableDiv.empty();

        var tableClass = obj.style ? obj.style.table : '';
        var tdClass = obj.style ? obj.style.td : '';
        var inputClass = obj.style ? obj.style.input : '';
        var table = '<table class="{tableClass}"><tr><th>名称</th><th>位置</th><th>链接</th></tr>';
        for (var i = 0; i < spirits.length; i++) {
            var spirit = spirits[i];

            var name = spirit.name;
            var point = '(' + spirit.beginPoint[0] + '%,' + spirit.beginPoint[1] + '%) - (' + spirit.endPoint[0] + '%,' + spirit.endPoint[1] + '%)';
            var link = '<input type="text" class="{inputClass}" value="' + spirit.link + '" data-id="' + spirit.id + '" />';
            var module = '<tr><td class="{tdClass}">{name}</td><td class="{tdClass}">{point}</td><td class="{tdClass}">{link}</td></tr>';

            module = module.replace('{name}', name).replace('{point}', point).replace('{link}', link).replace('{tdClass}', tdClass);
            table += module;
        }
        table += '</table>';

        var jtable = $(table);
        jtable.find('input').on('input', function () {
            var id = $(this).data('id');
            var value = $(this).val();

            for (var i = 0; i < spirits.length; i++) {
                var spirit = spirits[i];
                if (spirit.id == id) {
                    spirit.link = value;
                }
            }

            obj.cavasImg.spiritSave(spirits);
        });

        obj.tableDiv.append(jtable);
    };
}