/**
 * @author 田鑫龙
 */
boot.TreeService = function(id) {
    this.showCheckbox = false;
    this.showIcon = true;
    this.autoLoad = true;
    this.showTools = false;
    this.showBorder = false;
    this.showClose = false;
    this.preventDrag = true;
    boot.TreeService.superClass.constructor.call(this, id);
};

boot.extend(boot.TreeService, boot.Panel, {
    _initField : function() {
        boot.TreeService.superClass._initField.call(this);
        this.idField = this.idField || 'id';
        this.prefix = this.prefix || "entityBean";
        this.parentidField = this.parentidField || 'parentid';
        this.childrenField = this.childrenField || 'children';
        this.textField = this.textField || 'text';
        this.loadType = this.loadType || 'full';
        this.selectedNode = {};
        this.parameters = {};
    },
    _create : function() {
        boot.TreeService.superClass._create.call(this);
    },
    _load : function(options) {
        options = options || {};
        boot.concat(this.parameters, options.parameters || options.data || {});
        options.data = boot.addPrefix(this.parameters, this.prefix),
        options.url = options.url || this.url;
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
    //设置参数
    _setParameters: function(params){
        this.parameters = params;
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
        this.resource = array;
    	this._fire('onbeforerender', {
    		sender: this,
    		source: this,
    		result: array
    	});
//    	this.data = this._makeTreeData(boot.clone(array));
        this.data = this._makeTreeData(array);
        this.bodyEl.html(this._makeNode(this.data));
        
        jQuery(".tree-node:first", this.bodyEl).addClass("first");
        
        this._fire("onloadsuccess", {
            sender : this,
            source : this,
            result : array,
            asTreeResult: this.data
        });
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
    //获取父节点
    _getParentNode: function(node){
        var pid = node[this.parentidField];
        return this._getNodeByUUID(pid, this.idField);
    },
    //获取所有checked节点
    _getCheckedNodes : function(onlyLeaf) {
        var nodes = [], me = this;
        function recursion(array) {
            for (var i = 0, len = array.length; i < len; i++) {
                var node = array[i];
                if(onlyLeaf){
                    if (node["_checked"] && (node["_isLeaf"] || node[me.childrenField].length == 0)) {
                        nodes.push(node);
                    }
                }else{
                    if (node["_checked"]) {
                        nodes.push(node);
                    }
                }
                 if(node[me.childrenField] && node[me.childrenField].length > 0)
                    recursion(node[me.childrenField]);
            }
        }
        recursion(this.data);
        return nodes;
    },
    //获取标记过的节点
    _getMarkedNodes : function(type) {
        var nodes = {
            "_add": [],
            "_update": [],
            "_remove": []
        };
        var me = this;
        function recursion(array) {
            for (var i = 0, len = array.length; i < len; i++) {
                var node = array[i];
                var _status = node["_status"];
                if (_status) {
                    nodes[_status].push(node);
                }
                if(node[me.childrenField] && node[me.childrenField].length > 0)
                    recursion(node[me.childrenField]);
            }
        }
        recursion(this.data);
        if(type){
            return nodes[type];
        }
        return nodes;
    },
    //获取当前节点的checkbox状态
    _getCheckStatus : function(node) {
        var children = node[this.childrenField] = node[this.childrenField] || [];
        var status = {
            full : Boolean(children.length) || node._checked,
            empty : true
        };
        var me = this;
        function recursion(list){
            for (var index = 0, length = list.length; index < length; index++) {
                var cnode = list[index];
                status.full = status.full && cnode._checked;
                if (cnode._checked) {
                    status.empty = false;
                } else {
                    if(!status.full && !status.empty){
                        break;
                    }else{
                        recursion(cnode[me.childrenField]);
                    }
                }
            }
        }
        recursion(children);
        
        node._checked = status.full || false;
        if (status.full) {
            return 'fullcheck';
        } else if (status.empty) {
            return '';
        } else {
            return 'halfcheck';
        }
    },
    //创建节点信息
    _makeNode : function(data) {
        var html = new boot.HTML();
        data = data || [];
        for (var index = 0, length = data.length; index < length; index++) {
            var node = this._addNodeIdentify(data, index);


            var cls = 'tree-node';
            if(node.custCls)//node节点添加自定义样式
            	cls += ' ' + node.custCls + '_node';
            //生成节点信息 
            html.push('<div id="' + node._uuid + '" class="'+ cls +'">');
            html.push(this._renderNode(node));
            html.push('</div>');
        }
        return html.concat();
    },
    //渲染node节点
    _renderNode : function(node) {
        var html = new boot.HTML();
        var actionIcon = this._makeActionIcon(node);
        var icon = this._makeIcon(node);
        var checkbox = this._makeCheckbox(node);
        var text = this._makeText(node);
        var tools = this._makeTools(node);
        var cls = this._renderNodeCls(node);
        var dirty = node._status ? 'dirty ' : '';

        if(node.custCls)//node节点添加自定义样式
        	cls += ' ' + node.custCls + '_border';
        html.push('<div id="' + node._uuid + '$border" class="' + cls + '">');
        html.push(actionIcon);
        html.push(checkbox);
        html.push('<div id="' + node._uuid + '$node" class="tree-node-innerInfo '+ dirty +'">' + icon + text + '</div>');
        html.push(tools);
        html.push('</div>');
        return html.concat();
    },
    //创建子节点
    _renderChildrenNodes : function(node) {
        node[this.childrenField] = node[this.childrenField] || [];
        var cls = "tree-node-children" + (node._showLine ? ' line' : '');
        if(node.custCls)//node节点添加自定义样式
        	cls += ' ' + node.custCls + '_children';
        return '<div id="' + node._uuid + '$children" class="' + cls + '">' + this._makeNode(node[this.childrenField], node) + '</div>';
    },
    //增加节点
    _addNodes : function(nodes, parentNode) {
        for(var index in nodes){
            var node = nodes[index];
            node["_status"] = "_add";
            node[this.childrenField] = node[this.childrenField] || [];
            if(parentNode && parentNode._uuid){
                node["_checked"] = parentNode["_checked"] || false;
                node[this.parentidField] = parentNode[this.idField];
                parentNode[this.childrenField].push(node);
            }else{
                node['_isLast'] = false;
                node[this.parentidField] = "";
                this.data.push(node);
                this._updateNodes(node);
            }
        }
        if(parentNode && parentNode._uuid){
            parentNode._expanded = true;
            parentNode._isLeaf = false;
            this._updateNodes(parentNode);
        }
    },
    //更新树节点
    _updateNodes : function(node) {
        var _uuid = node._uuid;
        var nodeEl = jQuery('#' + _uuid, this.bodyEl);
        if(nodeEl[0]){
            if(node._status == '_remove'){
                nodeEl.empty();
                return ;
            }
            var html = new boot.HTML();
            html.push(this._renderNode(node));
            if (node._expanded) {
                html.push(this._renderChildrenNodes(node));
            }
            nodeEl.html(html.concat());
        }else{
            this.bodyEl.prepend(this._makeNode([node]));
        }
    },
    //更新单个树节点
    _updateNode : function(node, record) {
        boot.concat(node, record);
        var _uuid = node._uuid;
        var nodeEl = jQuery('#' + _uuid + '\\$border', this.bodyEl);
        nodeEl.replaceWith(this._renderNode(node));
    },
    //改变checkbox状态
    _checkCheckBox: function(node, status){
		node = this._getNodeByUUID(node._uuid) || this._getNodeByUUID(node.id, "id");
		if(node){
    		node._checked = status;
    		this._updateNode(node, node);
		}
    },
    //给树节点添加标识
    _addNodeIdentify : function(data, index) {
        if (jQuery.type(data) == 'object') {
            data = [data];
        }
        if (index == undefined) {
            index = 0;
        }
        var node = data[index] || {};
        var size = data.length;
        var children = node[this.childrenField] = node[this.childrenField] || [];
        var isLeaf = children.length == 0;
        var isLast = index == size - 1;
        var showLine = !isLast && size > 1;
        
//      node["_uuid"] = node["_uuid"] || boot.newId();
        //是否叶子节点
        node['_isLeaf'] = node['_isLeaf'] !== undefined ? node['_isLeaf'] : isLeaf;
        //是否最后一个节点
        node['_isLast'] = node['_isLast'] !== undefined ? node['_isLast'] : isLast;
        //是否显示连接线
        node['_showLine'] = node['_showLine'] !== undefined ? node['_showLine'] : showLine;
        
        node['_checked'] = node['_checked'] === undefined ? false:  node['_checked'];
        return node;
    },
    //生成toolbar
    _makeTools : function(node) {
        var _uuid = node._uuid;
        if (this.showTools) {
            if(node._editting){
                return '<div class="tree-node-tools"><span id="' + _uuid + '$submit" class="tree-tools-btn submit"></span></div>';
            }else{
                var edit = '<span id="' + _uuid + '$edit" class="tree-tools-btn edit"></span>';
                var remove = '<span id="' + _uuid + '$remove" class="tree-tools-btn remove"></span>';
                return '<div class="tree-node-tools">' + edit + remove + '</div>';
            }
        }
        return '';
    },
    //生成折叠图标
    _makeActionIcon : function(node) {
        return '<span id="' + node._uuid + '$action" class="tree-node-actionIcon"></span>';
    },
    //生成文件图标
    _makeIcon : function(node) {
        if (this.showIcon) {
            return '<span id="' + node._uuid + '$icon" class="tree-node-icon"></span>';
        }
        return '';
    },
    //渲染node节点的图标样式
    _renderNodeCls : function(node) {
        var cls = 'tree-node-info ' + this._getCheckStatus(node) + ' ';
        var last = '';
        if(node._isLast){
            last = 'last';
        }
        if (node._isLeaf) {
            cls += last + 'line ';
        } else {
            if (node._expanded) {
                cls = cls + 'folderopen '+ last +'expand ';
            } else {
                cls = cls + 'folderclose  '+ last +'collapse ';
            }
        }
        if(this.selectedNode._uuid == node._uuid){
            cls += "selected ";
        }
        return cls;
    },
    //生成复选框
    _makeCheckbox : function(node) {
        if (this.showCheckbox) {
            return '<span id="' + node._uuid + '$checkbox" class="tree-node-checkbox"></span>';
        }
        return '';
    },
    //生成文本信息
    _makeText : function(node) {
        this.textEditorUUID = node._uuid;
        var text = node[this.textField];
        if (node._editting) {
            return '<span id="' + this.textEditorUUID + '$text" class="tree-node-text"><input id="' + this.textEditorUUID + '$editor" class="boot-textbox" value="' + text + '" height="20" style="width: auto;"/></span>';
        }
        return '<span id="' + this.textEditorUUID + '$text" class="tree-node-text">' + text + '</span>';
    },
    _makeTreeData : function(resource) {
    	var list = boot.clone(resource);
        var me = this;
        var maps = {}, ListInMap = [];
        //描述：将传入的json数据按{parentid:data}形式整理
        for (var i = 0, len = list.length; i < len; i++) {
            var node = list[i];
            node["_uuid"] = node["_uuid"] || boot.newId();//追加UUID
            resource[i]["_uuid"] = node["_uuid"];//原始数据追加UUID
            node[this.childrenField] = [];
            //初始化children数组
            var parentid = node[this.parentidField];
            parentid = parentid == null ? '' : parentid;
            if (!maps[parentid]) {//parentid不存在就初始化
                maps[parentid] = [];
            }
            maps[parentid].push(node);
        }
        //从maps中拿出第一个数组
        ListInMap = maps[''] || maps['null'];
        function recursion(children_list, level) {
            for (var i = 0, len = children_list.length; i < len; i++) {
                var node = children_list[i];
                var child = maps[node[me.idField]];
                child = child ? child : [];
                node[me.childrenField] = child;
                recursion(child, level++);
            }
        };
        if(ListInMap == undefined){
        	return list;
        }
        //描述：将整理好的maps循环递归调用recursion方法
        for (var i = 0, len = ListInMap.length; i < len; i++) {
            var node = ListInMap[i];
            var child = maps[node[this.idField]];
            //将在maps中找到的id与当前节点的parentid相同的节点放入chidren数组中
            child = child ? child : [];
            node[this.childrenField] = child;
            recursion(child, 1);
        }
        return ListInMap;
    },
    //递归加入删除标识
    _remarkChildrenRemoveFlag : function(node) {
        var children = node[this.childrenField];
        for (var i = 0, length = children.length; i < length; i++) {
            var cNode = children[i];
            cNode['_status'] = '_remove';
            this._remarkChildrenRemoveFlag(cNode);
        }
    },
    //递归check父节点
    _checkParentNodes : function(node) {
        var parentid = node[this.parentidField];
        var parent = this._getNodeByUUID(parentid, this.idField);
        if(parent == undefined){
            return ;
        }
        var status = this._getCheckStatus(parent);
        var selector = '#' + parent._uuid + '\\$border';
        var el = jQuery(selector, this.bodyEl);
        el.removeClass("fullcheck"),
        el.removeClass("halfcheck"),
        el.addClass(status);//提前移除
        this._checkParentNodes(parent);
    },
    //递归check子节点
    _checkChildNodes : function(parent) {
        var children = parent[this.childrenField];
        for (var i = 0, len = children.length; i < len; i++) {
            var node = children[i];
            node._checked = parent._checked || false;
            var selector = '#' + node._uuid + '\\$border';
            var el = jQuery(selector, this.bodyEl);
            if (node._checked) {
                el.addClass("fullcheck");
            } else {
                el.removeClass("fullcheck");
            }
            this._checkChildNodes(node);
        }
    },
    _destroy: function(){
    	boot.TreeService.superClass._destroy.call(this);
    	this._un(this.bodyEl);
    	var textEditor = boot.get('this.textEditorUUID');
    	if(textEditor)
    		textEditor._destroy();
    	this.el.remove();
    },
    _bindEvents : function() {
        this._on(this.bodyEl, '.tree-node-actionIcon', 'click', this._onActionIconClick, this);
        this._on(this.bodyEl, '.tree-node-innerInfo', 'click', this._onNodeClick, this);
        this._on(this.bodyEl, '.tree-node-checkbox', 'click', this._onCheckBoxClick, this);
    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ['idField', 'parentidField', 'childrenField', 'textField', 'url', 'loadType', "binding", "queryMethod", "action"],
            bool : ['showCheckbox', 'showIcon', 'showTools', "autoLoad"],
            css : [],
            fn : ['nodeclick']
        }, attributes);
        return boot.TreeService.superClass._getAttrs.call(this, attrs);
    },

    //API
    reload : function() {
        this._load();
    },
    load: function(options){
        this._load(options);
    },
    setUrl: function(url){
    	this._setUrl(url);
    },
    getSelectedNode : function() {
        return this.selectedNode;
    },
    getData: function(){
        return this.resource;
    },
    loadData: function(array){
        this._loadData(array);
    },
    getCheckedNodes: function(onlyLeaf){
        return this._getCheckedNodes(onlyLeaf);
    },
    getChangedNodes: function(type){
        return this._getMarkedNodes(type);
    },
    updateNode: function(node, record){
        this._updateNode(node, record);
    },
    setParamters: function(params){
        this._setParameters(params);
    },
    getParentNode: function(node){
        return this._getParentNode(node);
    },
    checkCheckBox: function(node, status){
    	this._checkCheckBox(node, status);
    }
});
