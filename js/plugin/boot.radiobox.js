/**
 * @author 田鑫龙
 */
//单选框
boot.RadioBox = function(id){
    boot.RadioBox.superClass.constructor.call(this, id);
};

boot.extend(boot.RadioBox, boot.CheckBox, {
    uiCls: 'boot-radiobox',
	type: 'radiobox',
    _renderItem: function(item){
        var selected = item._selected ? ' selected' : '';
        var html = '', checked = item._selected ? 'checked="cheded"' : '', disabled = this.onlyView ? 'disabled="disabled"' : '';
        html += '<div id="'+ item._uuid +'" class="box-item' + selected + '" style="';
        html += 'display: inline-block;position: relative;height: 20px;line-height: 20px;cursor: pointer;">';
        html += '<input class="box" type="radio" '+ checked +' '+ disabled +' style="position: absolute;z-index: 0;top: 4px;left: 4px;margin: 0;">';
        html += '<span style="padding-left: 22px;position: relative;">'+ item[this.textField] +'</span>';
        html += '</div>';
        return html;
    },
    _selectItem : function() {
        var v = undefined;
        if(jQuery.type(this.value) == 'number'){
            v = [this.value];
        }else{
            v = this.value.split(",");
        }
        for (var i = 0, length = v.length; i < length; i++) {
            var vitem = v[i];
            for (var j = 0, len = this.data.length; j < len; j++) {
                var item = this.data[j];
                item._selected = false;
                if (item[this.valueField] == vitem) {
                    item._selected = true;
                    break;
                }
            }
        }
        this._fire('valuechange', {
			text : this.text,
			value : this.value
		});
    },
    _changeSelected : function(uuid) {
        var valueArray = [], textArray = [];
        for (var i = 0, len = this.data.length; i < len; i++) {
            var item = this.data[i];
            item._selected = false;
            if (item._uuid === uuid) {
                item._selected = true;
            }
            if (item._selected == true) {
                this.value = item[this.valueField];
                this.text = item[this.textField];
            }
        }
        this._renderBox();
    }
});

boot.Register(boot.RadioBox, 'radiobox');
