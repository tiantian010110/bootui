/**
 * @author dragon
 */
boot.ContextMenu = function(parentEl) {
    this.textField = 'text';
    boot.ContextMenu.superClass.constructor.call(this, parentEl);
};

boot.extend(boot.ContextMenu, boot.Rooter, {
    uiCls: 'boot-contextmenu',
    type: "contextmenu",
    _initField : function() {
        this.childrenField = this.childrenField || 'children';
    },
    _init : function(el) {
        this.parentEl = el || jQuery(document.body);
        this.el = jQuery('<div id="' + this._uuid + '" style="position: absolute;display: none;z-index: 99;"></div>');
        this.maskEl = jQuery('<div id="' + this._uuid + '$mask" class="contextmenu-mask" style="position: fixed;display: none;top: 0;left: 0;right: 0;bottom: 0;z-index: 1;"></div>');
        this.el.appendTo(this.parentEl);
        this.maskEl.appendTo(this.el);
    },
    _create : function() {

    },
    //通过uuid获取node
    _getNodeByUUID : function(uuid) {
        var me = this;
        function recursion(array) {
            array = array || [];
            var find = undefined;
            for (var i = 0, len = array.length; i < len; i++) {
                var node = array[i];
                if (uuid === node["_uuid"]) {
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
    _show : function(e) {
        this._hide();
        this.contextEl = jQuery('<div class="contextmenu" style="position: relative;z-index: 1;"></div>');
        this.contextEl.appendTo(this.el);

        if (e) {
            var event = e.event;
            if(e instanceof jQuery.Event){
                event = e;
            }
            var top = event.pageY, left = event.pageX;
            this._setPosition({
                top : top,
                left : left
            });
        }

        this.contextEl.html(this._renderContextMenu());
        this.el.show();
        this.maskEl.show();
    },
    _hide: function(){
        this.el.children(":not('.contextmenu-mask')").remove();
        this.el.hide();
        this.maskEl.hide();
        this.data = boot.clone(this.clone);
    },
    _setData : function(data) {
        this.data = data;
        this.clone = data;
    },
    _setPosition : function(position) {
        this.el.css(position);
    },
    //渲染右击菜单
    _renderContextMenu : function(data) {
        var menu = data || this.data;
        var html = '<ul class="main">';
        for (var i = 0, len = menu.length; i < len; i++) {
            var item = menu[i];
            item['_uuid'] = boot.newId();
            var text = item[this.textField], id = item._uuid, action = item.action;
            html += '<li id="' + id + '$border" class="item-border">';
            html += '<div id="' + id + '" class="item">';
            if (item.children && item.children.length > 0) {
                html += '<span class="arrow"></span>';
            } else {
                html += '<span class=""></span>';
            }
            html += '<a class="text icon-' + action + '" href="javascript:void(0);">' + text + '</a>';
            html += '</div>';
            html += '</li>';
        }
        html += '</ul>';
        return html;
    },
    _renderNextLevel : function(el) {
        var id = el.attr("id");
        var node = this._getNodeByUUID(id);
        var offset = el.position();
        var top = offset.top, left = offset.left + el.width();
        var parentEl = el.parent();

        if (node.children && !node._show) {
            var html = '<div id="' + node._uuid + '$context" class="contextmenu nextlevel" style="position: absolute;top: ' + top + 'px;left: ' + left + 'px;">';
            html += this._renderContextMenu(node.children);
            html += '</div>';
            node._show = true;
            parentEl.append(html);
        } else if (node._show) {
            parentEl.children(".nextlevel").html(this._renderContextMenu(node.children)).show();
        }
    },
    _destroy: function(){
    	boot.ContextMenu.superClass._destroy.call(this);
    	this._un(this.el);
    	this.el.remove();
    },
    _bindEvents : function(sender) {
        this._on(this.el, '.item', 'mouseenter', this._onItemMouseEnter, this);
        this._on(this.el, '.item-border', 'mouseleave', this._onItemMouseLeave, this);
        this._on(this.el, '.item', 'click', this._onItemClick, this);
        this._on(this.el, '.contextmenu', 'click', this._onContextMenuClick, this);
        this._on(this.el, '.contextmenu-mask', 'contextmenu', this._preventContextMenu, this);
        this._on(this.el, '.contextmenu', 'contextmenu', this._preventContextMenu, this);
    },
    //右击菜单阻止冒泡事件
    _onContextMenuClick : function(e) {
        e.stopPropagation();
    },
    _preventContextMenu: function(e){
    	e.preventDefault();
    },
    _onItemMouseEnter : function(e) {
        var el = e.selector;
        this._renderNextLevel(el);
    },
    _onItemMouseLeave : function(e) {
        var el = e.selector;
        el.children(".nextlevel").hide();
        this._fire('onitemleave', e);
    },
    _onItemClick : function(e) {
        e.stopPropagation();
        var el = e.selector;
        var id = el.attr("id");
        var node = this._getNodeByUUID(id);
        e.item = node;
        if (!node.children || node.children && node.children.length == 0) {
            this._fire('itemclick', e);
            this._hide();
        }
    },
    
    //API
    //e参数接受jQuery.Event和boot.Event
    show : function(e) {
        this._show(e);
    },
    hide: function(){
        this._hide();
    },
    setData : function(data) {
        this._setData(data);
    },
    setPosition : function(position) {
        this._setPosition(position);
    }
});
