/**
 * @author 田鑫龙
 */
boot.Button = function(id){
    boot.Button.superClass.constructor.call(this, id);
};

boot.extend(boot.Button, boot.Rooter, {
    uiCls: "boot-button",
    type: "button",
    _initField: function(){
        this.iconCls = this.iconCls || "";
    },
    _create: function(){
        var text = this.el.text();
        if(text == ''){
            this.el.addClass("noText");
        }
        this.el.empty();
        this.el.attr("href", "javascript: void(0);");
        var iconEl = jQuery('<span class="button-icon button-'+ this.iconCls +'"></span>');
        var textEl = jQuery('<span class="button-text">'+ text +'</span>');
        iconEl.appendTo(this.el);
        textEl.appendTo(this.el);
    },
    _destroy: function(){
    	boot.Button.superClass._destroy.call(this);
    	this._un(this.el);
    	this.el.remove();
    },
    _bindEvents: function(){
        this._on(this.el, '.button-text', "click", this._onButtonClick, this);
        this._on(this.el, '.button-icon', "click", this._onButtonClick, this);
    },
    
    /*----- 事件 start ---------------*/
    _onButtonClick: function(e){
        this._fire("onclick", e);
    },
    /*----- 事件 end---------------*/
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ["id", "iconCls", "action"],
            number: ["width", "height"],
            bool : [],
            css : [],
            fn : ['onclick']
        }, attributes);
        return boot.Button.superClass._getAttrs.call(this, attrs);
    }
});

boot.Register(boot.Button, "button");
