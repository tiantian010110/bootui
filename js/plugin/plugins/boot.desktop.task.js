/**
 * @author dragon
 */
boot.deskPlugins = boot.deskPlugins || {};

boot.deskPlugins.MyTask = function(url, removeUrl) {
	this.textField = "text";
    this._uuid = boot.newId();
    this.title = '个人快捷', this.height = 126, this.noFrame = true, this.selector = '#' + this._uuid + '\\$body';
    this.url = url;
    this.removeUrl = removeUrl;
};

boot.deskPlugins.MyTask.prototype = {
    execute : function(desk) {
        this.desk = desk;
        this.load();
        this.bindEvents(this);
    },
    load : function() {
        if (this.url) {
            boot.ajax({
                url : this.url,
                context : this,
                dataType: 'json',
                success : this.success
            });
        }
    },
    registerData : function() {
        boot.get(this.desk)._registerPluginDatas(this._uuid, this.data);
    },
    success : function(result) {
        this.data = result.resultData || [];
        this.registerData();
        this.render();
    },
    getViewEl : function() {
        this.viewEl = this.viewEl || jQuery(this.selector);
        return this.viewEl;
    },
    getNodeByUUID: function(id){
        for(var i=0,len=this.data.length;i<len;i++){
            var node = this.data[i];
            if(id === node._uuid){
                return node;
            }
        }
    },
    render : function() {
        var html = '<ul>';
        var data = this.data;
        for (var i = 0, len = data.length; i < len; i++) {
            var cell = data[i];
            html += '<li class="task-item"><div id="' + cell._uuid + '" class="task-context">' + cell[this.textField] + '<div id="' + cell._uuid + '$close" class="close"></div></div></li>';
        }
        html += '</ul>';
        this.getViewEl().html(html);
    },
    bindEvents : function(sender) {
        this.getViewEl().delegate('.task-context', 'click', function(e) {
            e.sender = sender;
            sender.onTaskClick.call(sender, e);
        });
        this.getViewEl().delegate('.task-context', 'mouseenter', function(e) {
            e.sender = sender;
            sender.onMouseEnter.call(sender, e);
        });
        this.getViewEl().delegate('.task-context', 'mouseleave', function(e) {
            e.sender = sender;
            sender.onMouseLeave.call(sender, e);
        });
        this.getViewEl().delegate('.close', 'click', function(e) {
            e.sender = sender;
            sender.onCloseClick.call(sender, e);
        });
    },
    onCloseClick : function(e) {
        e.stopPropagation();
        var el = e.target;
        var id = el.id.split('$')[0];
        var node = this.getNodeByUUID(id);
        if(confirm('确认删除!'))
            boot.ajax({
                url: this.removeUrl,
                data: boot.addPrefix(node, 'menuEntity'),
                success: function(result){
                    if(result.success){
                        jQuery(el.parentNode.parentNode).remove();
                    }
                }
            });
    },
    onMouseEnter : function(e) {
        var el = $(e.target);
        el.children().show();
    },
    onMouseLeave : function(e) {
        var el = $(e.target);
        el.children().hide();
    },
    onTaskClick : function(e) {
        var desktop = boot.get(this.desk);
        var plugin = desktop._getPluginByUUID(e.target.id);
        desktop.showWindow(plugin);
    }
};
