/**
 * 田鑫龙
 */
boot.Prompt = function(type){
	this.type = type;
	this._uuid = boot.newId();
	this.init();
	this.render();
	this.bindEvents();
};

boot.Prompt.prototype = {
		init: function(){
			var style = "position: fixed;z-index: 100000;top: -300px;left: 50%;";
			var footHeight = "44px", topHeight = "40px";
			if(this.type === 'tip'){
				style += "margin-left: -60px;width: 120px;height: 60px;color: #468847;background-color: #DFF0D8;border-color: #D6E9C6;";
				footHeight = "0px", topHeight = "0px";
			}else{
				style += "margin-left: -160px;width: 320px;height: 150px;";
			}
			var el = jQuery('<div id="'+ this._uuid +'" class="prompt" style="'+ style +'"></div>');
			var top = jQuery('<div class="prompt-head" style="height: '+ topHeight +';line-height: 40px;padding-left: 15px;overflow: hidden;">温馨提示：</div>');
			var body = jQuery('<div class="prompt-view" style="position: absolute;top: '+ topHeight +';left: 0;bottom: '+ footHeight +';right: 0;"></div>');
			var foot = jQuery('<div class="prompt-foot" style="position: absolute;left: 0;bottom: 0;height: '+ footHeight +';right: 0;overflow: hidden;"></div>');
			el.append(top).append(body).append(foot);
			
			this.el = el;
			this.viewEl = body;
			this.footEl = foot;
			this.headEl = top;
			
			//遮蔽层
			this.modalEl = new boot.Modal(document.body);
			this.modalEl._hideLoadingText();
			this.modalEl._setCss({"position": "fixed"});
			this.modalEl._show();
		},
		render: function(){
			this.renderButton();
			this.el.appendTo(document.body);
			
			this.el.animate({
				top: this.type === 'tip' ? -3 : 5
			}, 300);
		},
		renderTip: function(msg){
			var html = '<div class="prompt-'+ this.type +'" style="width: 100%;position: relative;overflow: hidden;">';
			html += '<div style="width: 120px;height: 60px;overflow: hidden;font-size: 12px;text-align: center;line-height: 60px;">' + (msg == undefined ? "" : msg) + '</div>'
			html += '</div>';
			this.viewEl.html(html);
		},
		renderContent: function(msg){
			var html = '<div class="prompt-'+ this.type +'" style="width: 100%;position: relative;overflow: hidden;">';
			html += '<div style="width: 200px;height: 55px;overflow: hidden;font-size: 12px;  margin: auto 15px;text-indent: 2em;">' + (msg == undefined ? "" : msg) + '</div>'
			html += '</div>';
			this.viewEl.html(html);
		},
		renderButton: function(){
			var html = '<div style="float: right;">';
			if(this.type === 'alert'){
				html += '<a href="javascript:void(0);" class="prompt-btn ensure">确 定</a>';
			}
			if(this.type === 'confirm'){
				html += '<a href="javascript:void(0);" class="prompt-btn yes">是</a>';
				html += '<a href="javascript:void(0);" class="prompt-btn no">否</a>';
			}
			html += '</div>';
			this.footEl.html(html);
		},
		bindEvents: function(){
			var me = this;
			this.el.on("click", '.ensure', {data: this}, function(event){
				me._ensureButtonClick(event);
			});
			this.el.on("click", '.yes', {data: this}, function(event){
				me._yesButtonClick(event);
			});
			this.el.on("click", '.no', {data: this}, function(event){
				me._noButtonClick(event);
			});
		},
		setCallback: function(callback, scope){
			this.scope = scope || this;
			this.callback = callback;
		},
		executeCallback: function(exec){
			var result = undefined;
			if(this.callback){
				result = this.callback.call(this.scope, exec)
			}
			return result;
		},
		setMessage: function(msg){
			if(this.type === 'tip'){
				this.renderTip(msg);
			}else{
				this.renderContent(msg);
			}
		},
		_ensureButtonClick: function(e){
			this.close(true);
		},
		_yesButtonClick: function(e){
			this.close(true);
		},
		_noButtonClick: function(e){
			this.close(false);
		},
		hideModal: function(){
			this.modalEl._hide();
		},
		close: function(flag){
			var me = this;
			this.el.animate({
				top: -300
			}, 500, function(e){
				jQuery(this).remove();
				me.modalEl.el.remove();
				me.executeCallback(flag);
			})
		}
};

boot.confirm = function(msg, callback){
	var pmt = new boot.Prompt('confirm');
	pmt.setCallback(callback);
	pmt.setMessage(msg);
	return pmt;
};

boot.alert = function(msg, callback, scope){
	var pmt = new boot.Prompt('alert');
	pmt.setCallback(callback, scope);
	pmt.setMessage(msg);
	return pmt;
};

boot.showTip = function(msg, callback, scope){
	var pmt = new boot.Prompt('tip');
	pmt.setCallback(callback, scope);
	pmt.setMessage(msg);
	pmt.hideModal();
	window.setTimeout(function(){
		pmt.close();
	}, 3000);
	return pmt;
};