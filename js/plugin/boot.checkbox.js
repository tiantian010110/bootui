/**
 * @author 田鑫龙
 */
//复选框
boot.CheckBox = function(id){
    boot.CheckBox.superClass.constructor.call(this, id);
};

boot.extend(boot.CheckBox, boot.ListBox, {
    uiCls: 'boot-checkbox',
    type: "checkbox",
    _initField: function(){
        boot.CheckBox.superClass._initField.call(this);
        this.columnSize = this.columnSize || 0;
    },
    _create : function() {
        boot.CheckBox.superClass._create.call(this);
        this.borderEl.css({"position": 'static', "border": "none"});
    },
    _renderBox: function(){
        var len = this.data.length;
        var html = new boot.HTML(), textArray = [];
        html.push("<tr>");
        for (var i = 1; i <= len; i++) {
            var item = this.data[i - 1];
            item._uuid = boot.newId();
            html.push('<td>' + this._renderItem(item) + '</td>');
            if(item._selected)
                textArray.push(item[this.textField]);
            if(this.columnSize != 0 && i % this.columnSize == 0){
                html.push("</tr><tr>");
            }
        }
        html.push("</tr>");
        this.text = textArray.join(',');
        this.boxEl.html('<table style="width: 100%;table-layout: fixed;font-size: 12px;">' + html.concat() + '</table>');
    },
    _renderItem: function(item){
        var selected = item._selected ? ' selected' : '';
        var html = '', checked = item._selected ? 'checked="cheded"' : '', disabled = this.onlyView ? 'disabled="disabled"' : '';
        html += '<div id="'+ item._uuid +'" class="box-item' + selected + '" style="';
        html += 'display: inline-block;position: relative;height: 20px;line-height: 20px;cursor: pointer;">';
        html += '<input class="box" type="checkbox" '+ checked +' '+ disabled +' style="position: absolute;z-index: 0;top: 4px;left: 4px;margin: 0;">';
        html += '<span style="padding-left: 22px;position: relative;">'+ item[this.textField] +'</span>';
        html += '</div>';
        return html;
    },
    _changeSelected : function(uuid) {
        var valueArray = [], textArray = [];
        for (var i = 0, len = this.data.length; i < len; i++) {
            var item = this.data[i];
            if (item._uuid === uuid) {
                item._selected = !item._selected;
            }
            if (item._selected == true) {
                valueArray.push(item[this.valueField]);
                textArray.push(item[this.textField]);
            }
        }
        this.value = valueArray.join(',');
        this.text = textArray.join(',');
        this._renderBox();
    },
    _setEnabled: function(flag){
    	boot.CheckBox.superClass._setEnabled.call(this, flag);
    	if(flag){
    		jQuery('input.box', this.el).removeProp("disabled");
    	} else {
    		jQuery('input.box', this.el).prop("disabled", true);
    	}
    },
    _bindEvents: function(){
        boot.CheckBox.superClass._bindEvents.call(this);
    },
    _getAttrs: function(attributes){
        var attrs = boot.concat({
            str: [],
            bool: [],
            number: ["columnSize"]
        }, attributes || {});
        return boot.CheckBox.superClass._getAttrs.call(this, attrs);
    }
});

boot.Register(boot.CheckBox, 'checkbox');
