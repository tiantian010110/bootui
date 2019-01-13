boot.Chatting = function(id) {
	boot.Chatting.superClass.constructor.call(this, id);
	this._testConnection();
	this._syncMessage();
}

boot.extend(boot.Chatting, boot.Rooter, {
	uiCls : "boot-chatting",
    type: "chatting",
	_initField : function() {
		this.allowSync = false;
	},
	_create : function() {
		this.borderEl = jQuery('<div class="chatting-border"></div>');
		this.borderEl.appendTo(this.el);
		if (this.asService) {
			this.headEl = jQuery('<div class="head"></div>').appendTo(this.borderEl);
			this.customeButtonEl = jQuery('<input type="button" class="button getCustome" value="连接客户" style="display: none;"/>').appendTo(
					jQuery('<div class="buttons"></div>').appendTo(this.headEl));
		}
		this.viewEl = jQuery('<div class="view" style="' + (this.asService ? 'top: 41px;border-top: solid 1px #999;' : '') + '"></div>').appendTo(this.borderEl);
		this.controlEl = jQuery('<div class="control"></div>').appendTo(this.borderEl);
		this.panelEl = jQuery('<div class="text-panel"></div>').appendTo(this.borderEl);
		this.textEl = jQuery('<textarea rows="" cols="" class="cell"></textarea>').appendTo(this.panelEl);

		this.buttonEl = jQuery('<input type="button" class="button send" value="发送" />').appendTo(jQuery('<div class="buttons"></div>').appendTo(this.borderEl));
	},
	_appendServiceMessage : function(array) {
		array = array || [];
		for ( var index in array) {
			var time = array[index].time;
			var html = '<div class="service" id="'+ time +'">' + '<div class="user">' + (this.asService ? '客户' : '客服') + ' 说(' + time + ')：</div>' + '<div class="message">'
					+ '<span class="text">' + array[index].text + '</span>' + '</div>' + '</div>';
			this.viewEl.append(html);
			this.viewEl.animate({
				scrollTop : this.viewEl.height()
			}, 100);
		}
	},
	_sendMyMessage : function(text) {
		var syncTime = boot.formatDate('yyyy-mm-dd hh:mi:ss', new Date());
		var html = '<div class="custome">' + '<div class="user">我 说(' + syncTime + ')：</div>' + '<div class="message">' + '<span class="text">' + text + '</span>' + '</div>'
				+ '</div>';
		this.viewEl.append(html);
		this.viewEl.animate({
			scrollTop : this.viewEl.height()
		}, 100);
		boot.ajax({
			url : this.sendUrl,
			context : this,
			data : {
				"entityBean.text" : text,
				"entityBean.type" : this.asService ? 1 : 0
			},
			success : function(result) {
				if (result.success) {
					if (result.message === 'success') {
						!this.asService && this._sendSystemMessage("工号：" + result.resultData + "客服代表为您服务!");
						this.allowSync = true;
					}
				} else {
					this._sendSystemMessage(result.message);
				}
			}
		});
	},
	_sendSystemMessage : function(text, time) {
		var html = '<div class="service system">' + '<div class="user">System 说(' + boot.formatDate('yyyy-mm-dd hh:mi:ss', new Date()) + ')：</div>' + '<div class="message">'
				+ '<span class="text">' + text + '</span>' + '</div>' + '</div>';
		this.viewEl.append(html);
	},
	_syncMessage : function() {
		var me = this;
		window.setInterval(function() {
			me.allowSync && boot.ajax({
				url : me.syncUrl,
				context : me,
				data : {
					"entityBean.type" : me.asService ? 1 : 0
				},
				success : function(result) {
					if (result.success) {
						this._appendServiceMessage(result.resultData);
					} else {
						this.allowSync = false;
						this._sendSystemMessage(result.message);
					}
				}
			});
		}, 5000);
	},
	_testConnection : function() {
		boot.ajax({
			url : this.testUrl,
			context : this,
			success : function(result) {
				if (result.success) {
					this.allowSync = true;
				}
			}
		});
	},
	_autoConnectCustome : function(e) {
		if (!this.asService)
			return;
		boot.ajax({
			url : this.autoCustomeUrl,
			context : this,
			success : function(result) {
				this.viewEl.empty();// 清屏
				if (result.success) {
					this.allowSync = true;// 允许自动同步客户聊天记录
					this.customeButtonEl.hide();
				} else {
					this.customeButtonEl.show();
				}
				this._sendSystemMessage(result.message, boot.formatDate('yyyy-mm-dd hh:mi:ss', new Date()));
			}
		});
	},
	_bindEvents : function() {
		this._on(this.el, '.cell', 'keyup', this._sendMessage);
		this._on(this.el, '.getCustome', 'click', this._autoConnectCustome);
		this._on(this.el, '.send', 'click', this._sendMessageClick);
	},
	_sendMessageClick : function(e) {
		this._sendMyMessage(this.textEl.val());
		this.textEl.val("");
		this._fire("sendmessage", e);
	},
	_sendMessage : function(e) {
		var keyCode = e.jQueryEvent.keyCode;
		if (keyCode == 13 && e.target.val() != '') {
			this._sendMyMessage(e.target.val());
			e.target.val("");
			this._fire("sendmessage", e);
		}
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "syncUrl", "sendUrl", "autoCustomeUrl", "testUrl" ],
			number : [],
			bool : [ "asService" ],
			css : [],
			fn : []
		}, attributes);
		return boot.Chatting.superClass._getAttrs.call(this, attrs);
	}
});

boot.Register(boot.Chatting, 'chatting');