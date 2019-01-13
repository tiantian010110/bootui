/**
 * 田鑫龙
 */
boot.DragDrop = function(id){
	boot.DragDrop.superClass.constructor.call(this, id);
};

boot.extend(boot.DragDrop, boot.Rooter, {
	uiCls: "boot-dragdrop",
    type: "dragdrop",
	delay: 20,
    _resize: function(){//TODO
    	var me = this;
    	jQuery(window).resize(function(){
    		me.winWidth = $(window).width();
    	});
    },
	_bindEvents: function(){
//		if(this.dragable){
//			this._on(jQuery(document.body), '.dragdrop', 'mousedown', this._onMouseDown, this);
//		}
	},
	_onMouseEnter: function(e){
		
	},
	_onMouseLeave: function(e){
		
	},
	_onMouseDown: function(e){
		if(!this.dragable){
			return;
		}
		var self = this;
		jQuery(document.body).bind("mousemove.drag", function(e){
			self._onMouseMove.call(self, e);
		}).bind("mouseenter.drag", function(e){
			self._onMouseEnter.call(self, e);
		}).bind("mouseleave.drag", function(e){
			self._onMouseLeave.call(self, e);
		}).bind("mouseup.drag", function(e){
			self._onMouseUp.call(self, e);
		});
		this.el.bind("mousemove.drag", function(e){
			self._onMouseMove.call(self, e);
		})
		
		this.el.addClass("panel-drag");
		this.borderEl.css("visibility", 'hidden');
		
		this.winWidth = $(window).width();
		this.allowDrag = true;
		
		this.__oldMouse = {
				x: e.event.x,
				y: e.event.y
		};
		this.__offset = this._getBox();
	},
	_onMouseUp: function(e){
		this.allowDrag = false;
		jQuery(document.body).unbind(".drag");
		this.el.unbind(".drag");
		this.el.removeClass("panel-drag");
		this.borderEl.css("visibility", 'visible');
	},
	_onMouseMove: function(e){
		if(this.allowDrag){ 
			var top = this.__offset.top + e.pageY - this.__oldMouse.y;
			var left = this.__offset.left + e.pageX - this.__oldMouse.x;
			
			var box = this._getBox();
	    	if(box.left + box.width >= (this.winWidth - 2) && left + box.width >= (this.winWidth - 2)){
	    		left = this.winWidth - box.width - 2;
	    	}
			this.el.css({
				"top" : top <= 2 ? 2 : top,
				"left" : left <= 2 ? 2 : left
			});
		}
	},
	_setAllowDrag: function(){
		this.el.css('position', 'fixed');
		if(!this.dragable){
			this._on(jQuery(document.body), '.dragdrop', 'mousedown', this._onMouseDown, this);
		}
		this.dragable = true;
	},
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            bool : []
        }, attributes);
        return boot.DragDrop.superClass._getAttrs.call(this, attrs);
    }
});

boot.Register(boot.DragDrop, "dragdrop");