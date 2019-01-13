/**
 * 田鑫龙
 */
boot.GridBox = function(id){
	boot.GridBox.superClass.constructor.call(this, id);
};

boot.extend(boot.GridBox, boot.Rooter, {
	uiCls: "boot-gridbox",
    type: "gridbox",
    _initField : function() {
        boot.GridBox.superClass._initField.call(this);
        this.textField = this.textField || "name";
        this.valueField = this.valueField || "id";
        this.height = this.height || 450;
        this.width = this.width || 350;
        this.value = this.value || '';
        this.data = this.data || [];
        this.autoLoad = this.autoLoad === false ? false : true;
        this.idField = this.idField || "id";
        this.parentidField = this.parentidField || 'parentid';
        this.childrenField = this.childrenField || 'children';
        this.textField = this.textField || 'name';
    },
    _create : function() {
    	this.columnEls = this.el.html();
    	this.el.empty();
    	
    	this.el.css({"height": this.height, "width": this.width, "z-index": 10});
        var border = jQuery('<div class="listbox-border" style="border-style: solid;border-width: 1px;overflow: auto;position:absolute;top: 0;left: 0;right: 0;bottom: 0;"></div>');
        border.appendTo(this.el);
        this.borderEl = border;
        
        var gridKey = boot.newId();
        var html = '<div id="'+ gridKey +'" class="boot-datagrid" cacheRow="true" autoLoad="'+ this.autoLoad +'" ';
        html += 'idField="'+ this.idField +'" textField="'+ this.textField +'" parentidField="'+ this.parentidField +'" childrenField="'+ this.childrenField +'" ';
    	if(this.showCheckBox){
    		html += 'showSelectBox="'+ this.showCheckBox +'" ';
    	}
    	if(this.simplePager){
    		html += 'simplePager="'+ this.simplePager +'" ';
    	}
    	if(this.showPager){
    		html += 'showPager="'+ this.showPager +'" ';
    	}
        if(this.url){
            html += 'url="'+ this.url +'" ';
        }
        html += 'showBorder="false" style="width: 100%;height: 100%;">'+ this.columnEls +'</div>';

        var boxEl = jQuery(html);
        boxEl.appendTo(border);
        boot.parse(gridKey.replace('$', '\\$'));
        this.grid = boot.get(gridKey);

        var errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '"></span>');
        errorEl.appendTo(this.el);
        this.errorEl = errorEl;
    },
    _setValue: function(value){
    	if (value != undefined) {
            this.value = value;
            this.grid._reload();
            this._fire('setvalue', {
				value : this.value
			});
        }
    },
    _show: function(){
        this.el.show();
        this.grid._resize();
    },
    _hide: function(){
        this.el.hide();
    },
    _setParameters: function(params){
    	this.grid._setParameters(params);
    },
    _destroy: function(){
    	boot.GridBox.superClass._destroy.call(this);
    	this._un(this.el);
    	this.grid._destroy();
    	this.el.remove();
    },
    _bindEvents : function() {
        boot.GridBox.superClass._bindEvents.call(this);
        this._on(this.el, '.boot-datagrid', 'click', this._gridClick, this);
        this.grid.bind('rowclick', this._onRowClick, this);
        this.grid.bind('select', this._onCheckBoxClick, this);
        this.grid.bind('checkall', this._onTotalCheckBoxClick, this);
        this.grid.bind('beforerender', this._onGridBeforeRender, this);
    },
    _onGridBeforeRender: function(e){
    	var result = e.result;
    	if(this.value != undefined){
    		var array = this.value.toString().split(","), textArray = [];
    		for(var i = 0, len = result.length; i < len; i++){
    			var node = result[i];
    			node._checked = false;
    			for(var j = 0; j < array.length; j++){
    				var value = array[j];
    				if(node[this.valueField] === value){
    					node._checked = true;
    					textArray.push(node[this.textField]);
    					array.splice(j, 1);
    					break;
    				}
    			}
    		}
    		this.text = textArray.join(",");
    		
    		e.sender = this;
    		e.text = this.text;
    		e.value = this.value;
    		this._fire('loadsuccess', e);
    	}
    },
    _onTotalCheckBoxClick: function(e){
    	var source = e.sender;
    	var nodes = e.rows;
    	var valueArray = [], textArray = [];
    	for(var i = 0, len = nodes.length;i < len; i++){
    		var node = nodes[i];
    		valueArray.push(node[this.valueField]);
    		textArray.push(node[this.textField]);
    	}
    	this.value = valueArray.join(",");
    	this.text = textArray.join(",");
    	
    	e.sender = this;
    	e.value = this.value;
    	e.text = this.text;
    	this._fire("oncheckboxclick", e);
    },
    _onCheckBoxClick: function(e){
    	var source = e.sender;
    	var nodes = source._getSelectedRows();
    	var valueArray = [], textArray = [];
    	for(var i = 0, len = nodes.length;i < len; i++){
    		var node = nodes[i];
    		valueArray.push(node[this.valueField]);
    		textArray.push(node[this.textField]);
    	}
    	this.value = valueArray.join(",");
    	this.text = textArray.join(",");
    	
    	e.sender = this;
    	e.value = this.value;
    	e.text = this.text;
        this._fire("oncheckboxclick", e);
    },
    _onRowClick: function(e){
    	if(!this.showCheckBox){
    		var row = e.row;
    		this.value = row[this.valueField];
    		this.text = row[this.textField];
    		
    		e.sender = this;
    		e.text = this.text;
    		e.value = this.value;
    		this._fire('onitemclick', e);
    	}
    },
    _gridClick: function(e){
    	e.stopPropagation();
    },
    _getAttrs: function(attributes){
        var attrs = boot.concat({
            str: ["url", "textField", "valueField", "value", "idField", "parentidField", "childrenField"],
            bool: ["showCheckBox", "autoLoad", "showPager", "simplePager"],
            json: ["data"],
            number: ["height", "width"]
        }, attributes || {});
        return boot.GridBox.superClass._getAttrs.call(this, attrs);
    }
});

boot.Register(boot.GridBox, "gridbox");