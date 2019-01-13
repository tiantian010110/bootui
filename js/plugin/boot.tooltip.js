/**
 * @author 田鑫龙
 */
boot.Tooltip = function(id){
    boot.Tooltip.superClass.constructor.call(this, id);
};

boot.extend(boot.Tooltip, boot.Rooter, {
    uiCls: "boot-tooltip",
    type: "tooltip",
    _initField: function(){
    	this.width = this.width || 400;
    },
    _create: function(){
    	this.el.css({"max-width": this.width, "display": "none", "z-index": 100, "position": "absolute"});
    	this.borderEl = jQuery('<div class="tooltip-border" style="border-width: 1px;border-style: solid;max-width: '+ this.width +'px;"></div>');
    	this.el.append(this.borderEl);
    	this.textEl = jQuery('<div class="tooltip-text" style="word-wrap: break-word;"></div>');
    	this.borderEl.append(this.textEl);
    	this.arrowEl = jQuery('<div class="tooltip-arrow" style="position: absolute;left: 2px;z-index: 1;"></div>');
    	this.el.append(this.arrowEl);
    },
    _setPosition: function(selector){
    	var offset = selector.offset();
    	var win = jQuery(window);
    	var width = this.textEl.outerWidth(true), height = this.textEl.outerHeight(true);
    	var winWidth = win.width(), winHeight = win.height();
    	var left = offset.left + selector.width() / 2;
    	var elTop = offset.top - 2;
    	if(elTop >= height){
    		elTop -= height;
    		if(left + width > winWidth){
    			if(left <= width){
    				left = 0;
    			}else{
    				left -= width;
    			}
    			this._createArrow("top", "right");
    		}else {
    			this._createArrow("top", "left");
    		}
    	}else{
    		if(elTop + height + selector.height() <= winHeight){
    			elTop += selector.height() + 4;
    		}else{
    			elTop = 0;
    		}
    		if(left + width > winWidth){
    			if(left <= width){
    				left = 0;
    			}else{
    				left -= width;
    			}
    			this._createArrow("bottom", "right");
    		}else {
    			this._createArrow("bottom", "left");
    		}
    	}
    	this.el.css({top: elTop, left: left});
    },
    _createArrow: function(vertical, horizon){
    	var html = '<div style="border-style: solid;border-width: 5px;width: 0;border-color: #fff;';
    	if(vertical === 'top'){
    		html += 'border-left-color: transparent;border-right-color: transparent;border-bottom: none;margin-top: -1px;';
    		this.arrowEl.css({
    			"top": "auto"
    		});
    	}else if(vertical === 'bottom'){
    		html += 'border-left-color: transparent;border-right-color: transparent;border-top: none;margin-top: 1px;';
    		this.arrowEl.css({
    			"top": "-5px"
    		});
    	}
    	html += '"></div>';
    	this.arrowEl.html(html); 
    	if(horizon === 'left'){
    		this.arrowEl.css({
    			"left": "2px",
    			"right": "auto"
    		});
    	} else if(horizon === 'right'){
    		this.arrowEl.css({
    			"right": "2px",
    			"left": "auto"
    		});
    	}
    },
    _destroy: function(){
    	boot.Tooltip.superClass._destroy.call(this);
    	this._un(this.el);
    	this.el.remove();
    },
    _delegate: function(expression, el){
    	this._on(el, expression, 'mouseenter', this._onExpressionMouseEnter, this);
    	this._on(el, expression, 'mouseleave', this._onExpressionMouseLeave, this);
    },
    _onExpressionMouseEnter: function(e){
    	var el = e.selector;
    	var text = el.text();
    	if(text == ""){
    		return false;
    	}
		if(text.length > 1000)
			this.textEl.html(text.substr(1, 1000) + '<font style="font-size: 13px;">...</font>');
		else
			this.textEl.html(text);
    	this.el.css({"display": "inline-block"});
    	this._setPosition(e.selector);
    },
    _onExpressionMouseLeave: function(e){
    	this.textEl.empty();
    	this.el.hide();
    },
    //显示tooltip，参数为jQuery对象
    _show: function(el){
    	var text = el.text();
    	if(text == ""){
    		return false;
    	}
    	this.textEl.html(text);
    	this.el.css({"display": "inline-block"});
    	this._setPosition(el);
    },
    _hide: function(){
    	this.textEl.empty();
    	this.el.hide();
    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : [],
            number: ["width", "height"],
            bool : []
        }, attributes);
        return boot.Tooltip.superClass._getAttrs.call(this, attrs);
    },
    //API
    delegate: function(expression, el){
    	this._delegate(expression, el);
    },
    show: function(selector){
    	this._show(selector);
    },
    hide: function(){
    	this._hide();
    },
});

boot.Register(boot.Tooltip, "tooltip");