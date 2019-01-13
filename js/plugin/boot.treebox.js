/**
 * 田鑫龙
 */
boot.TreeBox = function(id){
	boot.TreeBox.superClass.constructor.call(this, id);
};

boot.extend(boot.TreeBox, boot.Rooter, {
	uiCls: "boot-treebox",
	type: 'treebox',
    _initField : function() {
        boot.TreeBox.superClass._initField.call(this);
        this.textField = this.textField || "name";
        this.valueField = this.valueField || "id";
        this.height = this.height || 220;
        this.width = this.width || 150;
        this.value = this.value || '';
        this.data = this.data || [];
        this.autoLoad = this.autoLoad = this.autoLoad === false ? false : true;
        this.idField = this.idField || "id";
        this.parentidField = this.parentidField || 'parentid';
        this.childrenField = this.childrenField || 'children';
        this.textField = this.textField || 'name';
    },
    _create : function() {
    	this.el.css({"height": this.height, "width": this.width, "z-index": 10});
        var border = jQuery('<div class="listbox-border" style="border-style: solid;border-width: 1px;overflow: auto;position:absolute;top: 0;left: 0;right: 0;bottom: 0;"></div>');
        border.appendTo(this.el);
        this.borderEl = border;
        
        var treeid = boot.newId();
        var html = '<div id="'+ treeid +'" class="boot-tree" loadType="lazy" autoLoad="'+ this.autoLoad +'" ';
        html += 'idField="'+ this.idField +'" textField="'+ this.textField +'" parentidField="'+ this.parentidField +'" childrenField="'+ this.childrenField +'" ';
    	if(this.showCheckBox){
    		html += 'showCheckbox="'+ this.showCheckBox +'" ';
    	}
        if(this.url){
            html += 'url="'+ this.url +'" ';
        }
        html += 'showBorder="false" style="width: 100%;height: 100%;"></div>';

        var boxEl = jQuery(html);
        boxEl.appendTo(border);
        boot.parse(treeid.replace('$', '\\$'));
        this.tree = boot.get(treeid);
        
        var errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '"></span>');
        errorEl.appendTo(this.el);
        this.errorEl = errorEl;
    },
    _setParameters: function(params){
    	this.tree._setParameters(params);
    },
    _show: function(){
        this.el.show();
    },
    _hide: function(){
        this.el.hide();
    },
    _setValue: function(value){
    	this.value = value;
    	this.tree._loadData(this.tree.resource);
    },
    _destroy: function(){
    	boot.TreeBox.superClass._destroy.call(this);
    	this._un(this.el);
    	this.tree._destroy();
    	this.el.remove();
    },
    _bindEvents : function() {
        boot.TreeBox.superClass._bindEvents.call(this);
        this._on(this.el, '.boot-tree', 'click', this._treeClick, this);
        this.tree.bind('nodeclick', this._onNodeClick, this);
        this.tree.bind('checkboxclick', this._onCheckBoxClick, this);
        this.tree.bind('beforerender', this._onTreeBeforeRender, this);
    },
    _onTreeBeforeRender: function(e){
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
    _onCheckBoxClick: function(e){
    	var source = e.sender;
    	var nodes = source.getCheckedNodes(true);
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
    _onNodeClick: function(e){
    	if(!this.showCheckBox){
        	var node = e.node;
        	if(!node._isLeaf && this.onlyLeaf){
        		return;
        	}
        	this.value = node[this.valueField];
        	this.text = node[this.textField];
        	
        	e.sender = this;
        	e.text = this.text;
        	e.value = this.value;
        	this._fire('onitemclick', e);
    	}
    },
    _treeClick: function(e){
    	e.stopPropagation();
    },
    _getAttrs: function(attributes){
        var attrs = boot.concat({
            str: ["url", "textField", "valueField", "value", "idField", "parentidField", "childrenField"],
            bool: ["showCheckBox", "onlyLeaf", "autoLoad"],
            json: ["data"],
            number: ["height", "width"]
        }, attributes || {});
        return boot.TreeBox.superClass._getAttrs.call(this, attrs);
    }
});

boot.Register(boot.TreeBox, "treebox");