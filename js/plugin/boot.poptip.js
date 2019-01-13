/**
 * 田鑫龙
 */
boot.PopupTip = function(id){
	boot.PopupTip.superClass.constructor.call(this, id);
	this._loadMessage();
};

boot.extend(boot.PopupTip, boot.Panel, {
	uiCls: "boot-popuptip",
	type: 'popuptip',
	_initField: function(){
		boot.PopupTip.superClass._initField.call(this);
		this.showFoot = false;
		this.showHead = true;
		this.width = 200;
		this.height = 160;
		this.autoHide = this.autoHide = this.autoHide === false ? false : true;
		this.delay = this.delay || 30000;
		this.title = '提醒：';
	},
	_create: function(){
		boot.PopupTip.superClass._create.call(this);
		this.el.css({
			"position": "fixed",
			"bottom": -200,
			"right": 5,
			"background-color": "#fff",
			"z-index": 1000
		});
	},
	_loadMessage: function(){
		if(this.url)
			boot.ajax({
				url: this.url,
				type: 'post',
				dataType: 'json',
				success: this._loadSuccess,
				context: this
			});
	},
	_loadSuccess: function(result){
		if(result && result.length > 0){
			this._renderMessage(result);
		}
		var me = this;
		window.setTimeout(function(){
			me._loadMessage();
		}, 1000 * 60 * 15);
	},
	_renderMessage: function(list){
		var html = "";
		html += '<ul >';
		for(var i=0,len=list.length;i<len;i++){
			var row = list[i];
			if(row.count === 0){
				continue;
			}
			html += '<li class="tip" style="font-size: 12px;height: 24px;line-height: 24px;padding-left: 28px;">'+ row.title +'<a target="_blank" href="'+ row.url +'"> '+ row.count +' </a>条</li>';
		}
		html += '</ul>';
		this.bodyEl.html(html);
		this._show();
	},
	_show: function(){
		var me = this;
		this.el.animate({
			bottom: 2
		}, 800, function(){
			if(me.autoHide){
				window.setTimeout(function(){
					me._hide();
				}, me.delay);
			}
		});
	},
	_hide: function(){
		this.el.animate({
			bottom: -200
		}, 800);
	},
	_bindEvents: function(){
		boot.PopupTip.superClass._bindEvents.call(this);
	},
    _getAttrs: function(attributes){
        var attrs = boot.concat({
            str: ["url", "delay"],
            json: ["autoHide"]
        }, attributes || {});
        return boot.PopupTip.superClass._getAttrs.call(this, attrs);
    }
});
boot.Register(boot.PopupTip, "popuptip");