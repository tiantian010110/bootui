/**
 * @author 田鑫龙
 */
// panel类
boot.Panel = function(id) {
    this.showHead = false;
    this.showFoot = false;
    this.showBorder = true;
    this.showClose = true;
    this.showMax = false;
    this.showToggle = false;
    boot.Panel.superClass.constructor.call(this, id);
    this._setBox();
    if(!this.preventDrag && this.dragable){
    	this._setAllowDrag();
    }
};

boot.extend(boot.Panel, boot.DragDrop, {
    uiCls : "boot-panel",
    type : "panel",
    _initField : function() {
        this.title = this.title || '';
    },
    //创建元素替代页面标记
    _create : function() {
        this.el.css({
            position : 'relative'
        });
        this._createBorder();

        this._createBody();
        this._createHead();
        this._createTools();
        this._createFoot();
        this._createResizer();
        this.el.css("visibility", "visible");
    },
    _setBox : function() {
        this.el.css({
            width : this.width || "100%",
            height : this.height || "100%"
        });
        var head = this.headEl.outerHeight(true);
        var foot = this.footEl.outerHeight(true);
        this.bodyEl.css({
            top : head,
            bottom : foot
        });
    },
    _setWidth : function(width) {
        if(width ==0 || width == undefined){
            return;
        }
        this.el.width(width);
        this.width = this.el.width();
    },
    _setHeight : function(height) {
        if(height ==0 || height == undefined){
            return;
        }
        this.el.height(height);
        this.height = this.el.height();
    },
    //创建border
    _createBorder : function() {
        this.borderEl = jQuery('.panel-border', this.el);
        if (this.borderEl[0] == undefined) {
            this.borderEl = jQuery('<div class="panel-border "></div>');
            this.borderEl.appendTo(this.el);
        }
        this.borderEl.css({
            position : 'absolute',
            top : 0,
            bottom : 0,
            left : 0,
            right : 0
        });
        if(!this.showBorder){
            this.borderEl.css({
                border: 'none'
            });
        }
    },
    //创建head
    _createHead : function() {
        this.headEl = jQuery('.panel-head', this.borderEl);
        if (this.headEl[0] == undefined) {
            var headEl = ['<div class="panel-head dragdrop" '];
            if (this.showHead) {
                headEl.push('><div class="panel-headInner">' + (this.title || '') + '</div></div>');
            } else {
                headEl.push('style="height: 0;border: none;"></div>');
            }
            this.headEl = jQuery(headEl.join("")).prependTo(this.borderEl);
        }
        this.headEl.css({
            position : 'relative'
        });
    },
    //创建body
    _createBody : function() {
        this.bodyEl = jQuery('.panel-body', this.borderEl);
        if (this.bodyEl[0] == undefined) {
            this.bodyEl = jQuery('<div class="panel-body"></div>');
            this.bodyEl.appendTo(this.borderEl);
        }
        this.bodyEl.css({
            position : 'absolute',
            width : '100%'
        });
    },
    _createTools : function() {
        var tools = jQuery('.panel-tools', this.borderEl);
        if (tools[0] == undefined) {
            tools = jQuery('<div></div>', {
                'class' : 'panel-tools'
            }).appendTo(this.headEl);
            var toolsHTML = "";
            if (this.showMin) {
                toolsHTML = toolsHTML + '<span class="panel-btn min"></span>';
            }
            if (this.showMax) {
                toolsHTML = toolsHTML + '<span class="panel-btn panelSize max"></span>';
            }
            if (this.showClose) {
                toolsHTML = toolsHTML + '<span class="panel-btn close"></span>';
            }
            tools.html(toolsHTML);
        }
        this.toolEl = tools;
    },
    //创建foot
    _createFoot : function() {
        this.footEl = jQuery('.panel-foot', this.borderEl);
        if (this.footEl[0] == undefined) {
            this.footEl = jQuery("<div class=\"panel-foot\" style=\"height: 26px;\"></div>");
            if (this.showFoot === false) {
            	this.footEl.css({
                    height : 0,
                    border : "none"
                });
            }
            this.footEl.appendTo(this.borderEl);
            this.footEl.css({
                position : 'absolute',
                bottom : 0
            });
        }
    },
    //创建resizable
    _createResizer : function() {
        var resizeEl = jQuery("<div>", {
            'class' : 'panel-resizer'
        }).appendTo(this.el);
        if (!this.resizable) {
            resizeEl.css({
                'height' : 0
            });
        }
        this.resizeEl = resizeEl;
    },
    //为body设置显示的内容
    _setView : function(html) {
        this.bodyEl.html(html);
    },
    //为foot设置显示的内容
    _setFoot : function(html) {
        this.footEl.html(html);
    },
    _destroy: function(){
    	boot.Panel.superClass._destroy.call(this);
    	this._un(this.toolEl);
    	this._un(this.bodyEl);
    	this._un(this.el);
    	this.el.remove();
    },
    _bindEvents : function() {
    	boot.Panel.superClass._bindEvents.call(this);
        this._on(this.toolEl, '.close', 'click', this._onCloseClick, this);
        this._on(this.toolEl, '.close', 'mousedown', this._onCloseMouseDown, this);
        this._on(this.toolEl, '.max', 'click', this._onMaxClick, this);
        this._on(this.toolEl, '.max', 'mousedown', this._onCloseMouseDown, this);
        this._on(this.toolEl, '.min', 'click', this._onMinClick, this);
        this._on(this.toolEl, '.min', 'mousedown', this._onCloseMouseDown, this);
    },
    //事件
    _onCloseMouseDown : function(e) {
    	e.stopPropagation();
    },
    _onCloseClick : function(e) {
        e.stopPropagation();
        this.el.hide();
        this._destroy();
        this._fire('oncloseclick', e);
    },
    _onMaxClick : function(e) {
        e.stopPropagation();
        this._fire('onmaxclick', e);
    },
    _onMinClick : function(e) {
        e.stopPropagation();
        this.el.hide();
        this._fire('onminclick', e);
    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ["title"],
            number : ["width", "height"],
            bool : ['dragable', 'showHead', 'showFoot', 'resizable', 'showClose', 'showMax', 'showMin', 'showBorder'],
            css : [],
            fn : []
        }, attributes);
        return boot.Panel.superClass._getAttrs.call(this, attrs);
    },
    setContentHTML: function(html){
    	this._setView(html);
    }
});
//注册panel类
boot.Register(boot.Panel, 'panel');
