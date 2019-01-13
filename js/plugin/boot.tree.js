/**
 * @author 田鑫龙
 *@Discription: tree类，继承自panel。
 *
 **/
boot.Tree = function(id) {
    boot.Tree.superClass.constructor.call(this, id);
    if (this.autoLoad) {
        this._load();
    }
};

boot.extend(boot.Tree, boot.TreeService, {
    uiCls : 'boot-tree',
    type: 'tree',
    _bindEvents : function() {
        boot.Tree.superClass._bindEvents.call(this);
        this._on(this.bodyEl, '.edit', 'click', this._onEditButtonClick, this);
        this._on(this.bodyEl, '.submit', 'click', this._onSubmitButtonClick, this);
        this._on(this.bodyEl, '.remove', 'click', this._onRemoveButtonClick, this);
    },
    _onNodeClick : function(e) {
        var el = e.selector;
        var _uuid = el[0].id.split('$')[0];
        var node = this._getNodeByUUID(_uuid);
        
        var oldSelector = '#' + this.selectedNode._uuid + '\\$border';
        var oldEl = jQuery(oldSelector, this.bodyEl);
        oldEl.removeClass("selected");
        
        var selector = '#' + _uuid + '\\$border';
        var selected = jQuery(selector, this.bodyEl);
        selected.addClass("selected");
        
        this.selectedNode._selected = false;
        this.selectedNode = node;
        node._selected = true;

        var bind = boot.getBinding(this.id, this.binding);
        if (bind) {
            bind._triggerQuery({
                parentId : node[this.idField]
            });
        }
        e.node = node;
        this._fire('onnodeclick', e);
        //触发绑定事件
    },
    _onActionIconClick : function(e) {
    	e.stopPropagation();
        var el = e.selector;
        var _uuid = el[0].id.split('$')[0];
        var node = this._getNodeByUUID(_uuid);
        node._expanded = !node._expanded;
        this._updateNodes(node);
    },
    _onCheckBoxClick : function(e) {
        var el = e.selector;
        var _uuid = el[0].id.split('$')[0];
        var node = this._getNodeByUUID(_uuid);
        node._checked = !node._checked;
        var selector = '#' + node._uuid + '\\$border';
        var el = jQuery(selector, this.bodyEl);
        if(node._checked){
            el.addClass("fullcheck");
        }else{
            el.removeClass("fullcheck");
        }
        //响应checkbox点击事件
        this._checkChildNodes(node);
        this._checkParentNodes(node);

        e.node = node;
        this._fire("oncheckboxclick", e);
    },
    _onEditButtonClick : function(e) {
        var el = e.selector;
        var _uuid = el[0].id.split('$')[0];
        var node = this._getNodeByUUID(_uuid);
        node._editting = !node._editting;
        this._updateNodes(node);
        boot.parse(_uuid + "\\$editor");
    },
    //提交功能
    _onSubmitButtonClick : function(e) {
        var el = e.selector;
        var _uuid = el[0].id.split('$')[0];
        var node = this._getNodeByUUID(_uuid);
        var editor = boot.get(_uuid + "$editor");
        node._editting = !node._editting;
        var editorValue = editor.getValue();
        if(node[this.textField] != editorValue){
            node["_status"] = node["_status"] || "_update";
        }
        node[this.textField] = editorValue;
        //添加状态
        this._updateNodes(node);
        boot.Destroy(_uuid + "$editor");
    },
    _onRemoveButtonClick : function(e) {
        var el = e.selector;
        var _uuid = el[0].id.split('$')[0];
        var node = this._getNodeByUUID(_uuid);
        if(node[this.childrenField].length > 0){
            if(confirm('该节点包含子节点,确认删除?')){
                //添加状态
                node["_status"] = "_remove";
                this._remarkChildrenRemoveFlag(node);
                this._updateNodes(node);
            }
        }else{
            if(confirm('确认删除?')){
                //添加状态
                node["_status"] = "_remove";
                this._updateNodes(node);
            }
        }
    },
    
    //API
    //添加节点，如果parentNode不传入，代表增加根节点
    addNodes: function(nodes, parentNode){
        this._addNodes(nodes, parentNode);
    }
});

//注册tree类
boot.Register(boot.Tree, 'tree');
