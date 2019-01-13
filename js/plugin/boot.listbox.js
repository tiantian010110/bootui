/**
 * @author 田鑫龙
 */
//复选框
boot.ListBox = function(id) {
    boot.ListBox.superClass.constructor.call(this, id);
    this.autoLoad && this._load();
};

boot.extend(boot.ListBox, boot.Rooter, {
    uiCls : 'boot-listbox',
    type: "listbox",
    _initField : function() {
        boot.ListBox.superClass._initField.call(this);
        this.textField = this.textField || "name";
        this.valueField = this.valueField || "id";
        this.width = this.width || 150;
        this.height = this.height || 240;
        this.value = this.value || '';
        this.data = this.data || [];
        this.autoLoad = this.autoLoad === false ? false : true;
        this.params = this.params || {};
    },
    _create : function() {
        this.el.css({
            'display' : 'inline-block',
            'width': this.width
        });
        var border = jQuery('<div class="listbox-border" style="border-style: solid;border-width: 1px;overflow: auto;position:absolute;top: 0;left: 0;right: 0;bottom: 0;"></div>');
        border.appendTo(this.el);
        this.borderEl = border;
        
        var boxEl = jQuery('<div class="listbox"></div>');
        boxEl.appendTo(border);
        this.boxEl = boxEl;

        var errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '"></span>');
        errorEl.appendTo(this.el);
        this.errorEl = errorEl;
        
        this._setOnlyView(this.onlyView);
    },
    _setParameters: function(params){
    	this.params = params;
    },
    _setEnabled: function(flag){
    	this.enabled = flag;
    },
    _setOnlyView: function(onlyView){
    	this.onlyView = onlyView;
    	if(onlyView){
    		this.el.addClass("_onlyView");
    	}else {
    		this.el.removeClass("_onlyView");
    	}
    },
    _validate : function() {
        var v = new boot.Validate();
        v.setRequired(this.required);
        v.setValue(this._getValue());
        v.setVType(this.vType);
        v.setErrorText(this.errorText);
        var result = v.execute();
        if(!result){
            this.el.removeClass("error");
        }else{
            this.el.addClass('error');
        }
        this.errorEl.prop('title', result);
        this.validateValue = !result;
        return this.validateValue;
    },
    _load : function(options) {
        options = options || {};
        options.url = options.url || this.url, options.context = this;
        options.data = boot.concat(this.params, options.data || {});
        options.success = options.success || this._loadSuccess;
        if (options.url) {
    		boot.ajax(options);
        } else {
            this._loadData(this.data || []);
        }
    },
    _loadSuccess : function(result) {
    	var data = [];
    	if(jQuery.type(result) === 'array')
    		data = result || [];
    	else
    		data = result.resultData || [];
    	this.data = data;
        this._selectItem();
        if (this.showEmpty) {
            var empty = {};
            empty[this.textField] = '';
            empty[this.valueField] = "";
            empty._empty = true;
            var array = [empty];
            this.data = array.concat(data);
        }
        this._renderBox();
        this._fire('loadsuccess', {
            sender : this,
            data : this.data,
            text : this.text,
            value : this.value
        });
    },
    _loadData : function(data) {
        this._loadSuccess(data);
    },
    _selectItem : function() {
        var v = undefined;
        if(jQuery.type(this.value) == 'number'){
            v = [this.value];
        }else{
            v = this.value.split(",");
        }
        for (var j = 0, len = this.data.length; j < len; j++) {
        	var item = this.data[j];
	        for (var i = 0, length = v.length; i < length; i++) {
	            var vitem = v[i];
	            if(vitem !== undefined){
	            	var type = typeof vitem;
					type = type.charAt(0).toUpperCase() + type.substring(1, type.length);
					var __vitem = item[this.valueField] === '' ? '' : window[type](item[this.valueField]);
					if(__vitem === vitem){
						item._selected = true;
						break;
					}else{
						item._selected = false;
					}
	            }
            }
        }
        this._fire('valuechange', {
			text : this.text,
			value : this.value
		});
        
    },
    _setValue : function(value) {
        if (value != undefined) {
            this.value = value;
            this._selectItem();
            if(this.data && this.data.length > 0)
                this._renderBox();
	            this._fire('setvalue', {
					text : this.text,
					value : this.value
				});
        }
        this._validate();
    },
    _renderBox : function(data) {
    	data = data || this.data;
        var len = data.length;
        if (len > 0) {
            var height = len * 20 + 2;
            if (height > this.height) {
                height = this.height;
            }else{
                this.height = height;
            }
            this.el.css('height', height);
        }
        var html = '', valueArray = [], textArray = [];
        for (var i = 0; i < len; i++) {
            var item = data[i];
            item._uuid = item._uuid || boot.newId();
        	html += this._renderItem(item, this.showEmpty && item._empty);
            if (item._selected == true) {
                valueArray.push(item[this.valueField]);
                textArray.push(item[this.textField]);
            }
        }
        if(valueArray.length !== 0){
        	this.value = valueArray.join(',');
        }
        if(textArray.length !== 0){
        	this.text = textArray.join(',');
        }
        
        this.boxEl.html(html);
    },
    _renderItem : function(item, empty) {
        var selected = item._selected ? ' selected' : '';
        var title = typeof item[this.textField] === 'string' ? item[this.textField].replace(/<[^>]*>/g, "") : '';
        var html = '<div id="' + item._uuid + '" class="box-item' + selected + '" style="height: 20px;line-height: 20px;cursor: pointer;padding: 0 4px;">';
        html += '<div class="item" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;'+ (empty ? "color: #666;font-style: italic;" : "") +'" title="'+ title +'">';
        html += empty ? "请选择..." : item[this.textField];
        html += '</div></div>';
        return html;
    },
    _clearAll: function(){
        for (var i = 0, len = this.data.length; i < len; i++) {
            this.data[i]._selected = false;
            this._renderBox();
        }
    },
    _getItemByUUID : function(uuid) {
        for (var i = 0, len = this.data.length; i < len; i++) {
            var item = this.data[i];
            if (item._uuid === uuid) {
                return item;
            }
        }
    },
    _select: function(array){
        if(jQuery.type(array) == 'object'){
            array = [array];
        }
        var valueArray = [];
        for (var i = 0, len = this.data.length; i < len; i++) {
            var value = this.data[i][this.valueField];
            valueArray.push(value);
        }
        this._setValue(valueArray.join(','));
    },
    _changeSelected : function(uuid) {
        for (var i = 0, len = this.data.length; i < len; i++) {
            var item = this.data[i];
            if (!window._ctrl) {
                item._selected = false;
            }
            if (item._uuid === uuid) {
                if (window._ctrl) {
                    item._selected = !item._selected;
                } else {
                    item._selected = true;
                }
            }
        }
        this._renderBox();
    },
    _show: function(){
        this.el.show();
    },
    _hide: function(){
        if(!window._ctrl)
            this.el.hide();
    },
    _destroy: function(){
    	boot.ListBox.superClass._destroy.call(this);
    	this._un(this.el);
    	this.el.remove();
    },
    _bindEvents : function() {
        boot.ListBox.superClass._bindEvents.call(this);
        this._on(this.el, '.box-item', 'click', this._onItemClick, this);
        this._onCtrlKeyDown(this);
    },
    _onCtrlKeyDown : function(sender) {
        document.onkeydown = function(e) {
            var code = window.event && window.event.keyCode || e.keyCode || e.which;
            if (code == 17) {
                window._ctrl = true;
            }
        };
        document.onkeyup = function() {
            window._ctrl = false;
        };
    },
    _onItemClick : function(e) {
    	if(this.enabled == false || this.onlyView){
    		return ;
    	}
        var el = e.selector;
        var uuid = el.attr('id');
        var item = this._getItemByUUID(uuid);
        
        this.value = item[this.valueField];
        this.text = item[this.textField];
        
        this._changeSelected(uuid);
        e.item = item;
        e.status = item._selected;
        
        e.value = this.value;
        e.text = this.text;
        this._fire('itemclick', e);
        
        this._validate();
    },
    _getValue : function() {
        return this.value;
    },
    _getText: function(){
    	return this.text;
    },
    _getData : function() {
        return this.data;
    },
    _setHeight : function() {

    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ["url", "name", "value", "text", "textField", "valueField"],
            bool : ["autoLoad", "onlyView", "required"],
            number : ['width', 'height'],
            json : ["data"]
        }, attributes || {});
        return boot.ListBox.superClass._getAttrs.call(this, attrs);
    },
    clearAll: function(){
        this._clearAll();
    },
    select: function(array){
        this._select(array);
    },
    setValue: function(value){
    	this._setValue(value);
    },
    setEnabled: function(flag){
    	this._setEnabled(flag);
	},
	setOnlyView: function(flag){
		this._setOnlyView(flag);
	},
	getValue: function(){
		return this._getValue();
	},
	getText: function(){
		return this._getText();
	},
	getData: function(){
		return this._getData();
	}
});

boot.Register(boot.ListBox, 'listbox');
