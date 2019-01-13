/**
 * @author 田鑫龙
 */
boot.Accordion = function(id) {
    this.autoLoad = true;
    this.showBorder = false;
    boot.Accordion.superClass.constructor.call(this, id);
    this.autoLoad && this._load();
    this._resize()
};

boot.extend(boot.Accordion, boot.Panel, {
	uiCls: "boot-accordion",
    type: "accordion",
    _initField : function() {
        boot.Accordion.superClass._initField.call(this);
        this.idField = this.idField || 'id';
        this.parentidField = this.parentidField || 'parentid';
        this.childrenField = this.childrenField || 'children';
        this.textField = this.textField || 'text';
        this.loadType = this.loadType || 'full';
        this.accordionHeight = this.accordionHeight || 28;
        this.selectedNode = {};
        this._map = [];
    },
    _create : function() {
        boot.Accordion.superClass._create.call(this);
    },
    _resize: function(){//TODO
    	var me = this;
    	jQuery(window).resize(function(){
    		var height = me._calcNextLevelHeight();
    		me._updateChildHeight(height);
    	});
    },
    _load : function(options) {
        options = options || {};
        options.url = this.url;
        options.context = this;
        options.success = this._loadSuccess;
        
        if(options.url)
            boot.ajax(options);
    },
    //设置url
    _setUrl: function(url){
        this.url = url;
        this._load();
    },
    //加载成功
    _loadSuccess : function(result) {
    	if(jQuery.type(result) == 'array'){
    		this._loadData(result);
    	}else if (result.success) {
            this._loadData(result.resultData);
        }
    },
    _loadData : function(array) {
    	this.resource = array || [];
    	this.data = boot._makeTreeData(this.resource, this.idField, this.parentidField, this.childrenField);
        this.bodyEl.html(this._makeNode(this.data));
        
        this._loadNextLevel();
        
        this._fire("onloadsuccess", {
            sender : this,
            source : this,
            result : array
        });
    },
    //加载二级菜单数据
    _loadNextLevel: function(){
    	var me = this;
        //转换树
        boot.parseByParent(this.bodyEl);
        //加载二级数据
        for(var i = 0, len = this._map.length; i < len; i++){
    		var map = this._map[i];
    		var tree = boot.get(map.tree);
    		tree.loadData(map.array);
    		//绑定click事件
    		tree.bind('nodeclick', function(e){
    			e.sender = me;
    			me._fire("nodeclick", e);
    		});
    	}
    },
    //通过uuid获取node
    _getNodeByUUID : function(uuid, field) {
        field = field || "_uuid";
        var me = this;
        function recursion(array) {
            var find = undefined;
            for (var i = 0, len = array.length; i < len; i++) {
                var node = array[i];
                if (uuid === node[field]) {
                    find = node;
                } else  if(node[me.childrenField] && node[me.childrenField].length > 0){
                    find = recursion(node[me.childrenField]);
                }
                if (find) {
                    break;
                }
            }
            return find;
        }
        return recursion(this.data);
    },
    //创建节点信息
    _makeNode : function(array) {
        var html = new boot.HTML(), array = array || [], length = array.length;
        
        var height = this._calcNextLevelHeight(length);
        for (var index = 0; index < length; index++) {
            var node = array[index];
            
            //生成节点信息 
            if(index == 0){
            	node._open = true;
            	this.selectedNode = node;
            	html.push('<div id="' + node._uuid + '$node" class="accordion-node" style="overflow: hidden;">');
            }else{
            	html.push('<div id="' + node._uuid + '$node" class="accordion-node" style="overflow: hidden;height:'+ this.accordionHeight +'px;">');
            }
            html.push(this._renderNode(node, height));
            html.push(this._renderChildren(node, height));
            html.push('</div>');
        }
        return html.concat();
    },
    //计算剩余可显示二级菜单的高度
    _calcNextLevelHeight: function(length){
    	length = length || this.data.length;
    	var box = this._getBox(this.bodyEl);
    	return box.height - length * this.accordionHeight - 1;
    },
    //渲染node节点
    _renderNode : function(node) {
        var icon = this._makeIcon(node);
        var text = this._makeText(node);
        var actionIcon = this._makeActionIcon(node);
        return '<div id="' + node._uuid + '$head" class="accordion-node-head" style="height:'+ this.accordionHeight +'px;line-height: '+ this.accordionHeight +'px;">' + icon + text + actionIcon +'</div>';
    },
    //创建二级菜单
    _renderChildren : function(node, height) {
        node[this.childrenField] = node[this.childrenField] || [];
        var id = boot.newId();
        this._map.push({
        		_parentid: node._uuid,
        		tree: id,
        		array: node[this.childrenField]
        });
        var tree = '<div id="'+ id +'" class="boot-tree" loadType="'+ this.loadType +'" showBorder="false" style="width: 100%;height: 100%;"></div>';
        return '<div id="' + node._uuid + '$child" class="accordion-node-children" style="height: '+ height +'px;">' + tree + '</div>';
    },
    //更新单个节点
    _updateNode : function(node, record) {
        boot.concat(node, record);
        var _uuid = node._uuid;
        var nodeEl = jQuery('#' + _uuid + '\\$head', this.bodyEl);
        nodeEl.replaceWith(this._renderNode(node));
    },
    //更新所有二级菜单的高度
    _updateChildHeight : function(height) {
    	for(var i = 0, len = this._map.length; i < len; i++){
    		var map = this._map[i];
    		var childEl = jQuery('#' + map._parentid + '\\$child', this.bodyEl);
    		childEl.height(height);
    	}
    },
    //生成折叠图标
    _makeActionIcon : function(node) {
    	var cls = node._open ? ' open' : ' close';
        return '<span id="' + node._uuid + '$action" class="accordion-node-actionIcon'+ cls +'"></span>';
    },
    //生成文本信息
    _makeText : function(node) {
        var _uuid = node._uuid;
        var text = node[this.textField];
        if (node._editting) {
            return '<span class="accordion-node-text"></span>';
        }
        return '<span class="accordion-node-text">' + text + '</span>';
    },
    //生成文件图标
    _makeIcon : function(node) {
       return '<span class="accordion-node-icon"></span>';
    },
    //TODO 销毁没有销毁tree
    _destroy: function(){
    	boot.Accordion.superClass._destroy.call(this);
    },
    _bindEvents : function() {
        this._on(this.bodyEl, '.accordion-node-head', 'click', this._onNodeHeadClick, this);
    },
    _onNodeHeadClick: function(e){
    	var el = e.selector;
    	var uuid = el[0].id.split("\$")[0];
    	
    	if(this.selectedNode._uuid == uuid)
    		return;
    	
    	var activedNodeEl = jQuery('#' + this.selectedNode._uuid + '\\$node', this.bodyEl);
    	var visitedNodeEl = jQuery('#' + uuid + '\\$node', this.bodyEl);
    	
    	this.selectedNode._open = false;
    	this._updateNode(this.selectedNode, this.selectedNode);
    	
    	this.selectedNode = this._getNodeByUUID(uuid);
    	this.selectedNode._open = true;
    	this._updateNode(this.selectedNode, this.selectedNode);
    	
    	activedNodeEl.animate({
    		height: this.accordionHeight
    	}, "fast");
    	visitedNodeEl.animate({
    		height: this.accordionHeight + this._calcNextLevelHeight()
    	}, "fast");
    	
    	this._fire("itemclick", e);
    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ['idField', 'parentidField', 'childrenField', 'textField', 'url', 'loadType', "binding",],
            bool : ["autoLoad"],
            number: ['accordionHeight'],
            css : []
        }, attributes);
        return boot.Accordion.superClass._getAttrs.call(this, attrs);
    },

    //API
    getSelected : function() {
        return this.selectedNode;
    },
    getData: function(){
        return this.resource;
    },
    loadData: function(array){
        this._loadData(array);
    }
});

//注册accordion类
boot.Register(boot.Accordion, 'accordion');