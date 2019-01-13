/**
 * @author 田鑫龙
 */
// 富文本编辑
boot.RichText = function(id) {
	boot.RichText.superClass.constructor.call(this, id);
};

boot.extend(boot.RichText, boot.TextBox, {
	_initField : function() {
		boot.RichText.superClass._initField.call(this);
		this.height = this.height < 160 ? 160 : this.height;
		this.width = this.width < 400 ? 400 : this.height;
		this.uploadUrl = this.uploadUrl || '../jsp/upload_json.jsp';
		this.uploadLimit = this.uploadLimit || 10;
	},
	uiCls : 'boot-richtext',
	type: 'richtext',
	_create : function() {
		var container = jQuery("<div id=\"" + this.id + "\" class=\"boot-textbox boot-richtext\"></div>");
		var borderHTML = '<span class="textbox-border richtext-border" style="display: block;position: relative;padding: 0;clear: both;';
		if (this.showBorder === false) {
			borderHTML += 'border: none;';
		}
		borderHTML += '"></span>';
		var border = jQuery(borderHTML);
		var emptyEl = jQuery(
				'<label style="' + (this.value && this.value != '' ? 'display: none;' : '') + 'position: absolute;top: 0;left :2px;color: gray;cursor: text;">' + this.emptyText
						+ '</label>').appendTo(border);
		var richtext = jQuery(
				'<textArea name="' + this.name + '" id="' + this.id + '$text" class="richtext-text textbox-text" style="width:100%;height: '
						+ (this.height - 2) + 'px;">' + this.value + '</textArea>').appendTo(border.appendTo(container));
		var errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '"></span>');
		errorEl.appendTo(container);
		jQuery('<div style="clear: both;"></div>').appendTo(container);
		this.errorEl = errorEl;

		this.el.after(container);// 插入新创建的元素
		this.el.remove();// 移除旧的元素
		this.el = container;
		this.borderEl = border;
		this.emptyEl = emptyEl;

		var self = this;
		
		var items = [ 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline', 'removeformat', '|', 'justifyleft', 'justifycenter',
						'justifyright', 'insertorderedlist', 'insertunorderedlist', '|', 'fullscreen' ];
		if(this.allowImg){
			items = boot.concat(['|', 'image', 'multiimage', '|'], items);
		}
		KindEditor.ready(function(K) {
			self.editor = K.create('#' + self.id + '\\$text', {
				resizeType : self.allowResize ? 1 : 0,
				minWidth : (self.width - 2),
				readonlyMode : self.onlyView || self.readonly,
				items : self.items || items,
				onValueChange: function(e){
					self._onTextChange(e);
				},
				uploadJson: self.uploadUrl,
				fileUploadLimit: self.uploadLimit
			});
			if (self.onlyView) {
				jQuery(".ke-toolbar,.ke-statusbar", self.el).hide();
				self.el.addClass("_onlyView");
			}
		});
	},
	_setHeight : function(height) {
	},
	_bindEvents : function() {
		this._on(this.el, "label", "click", this._onPlaceHorderClick, this);
	},
	_onTextChange: function(e){
		this.value = this.editor.html();
        this._validate();
        e.value = this.value;
		this._fire('onchange', e);
	},
    _setAllowEdit: function(flag){
    	this.allowEdit = flag;
    	if(flag)
    		this.editor.readonly(true);
    	else
    		this.editor.readonly(false);
    },
    _setEnabled: function(flag){
    	this.enabled = flag;
    	if(flag)
    		this.editor.readonly(false);
    	else
    		this.editor.readonly(true);
    },
    _setOnlyView: function(onlyView){
    	this.onlyView = onlyView;
    	if(onlyView){
    		jQuery(".ke-toolbar,.ke-statusbar", this.el).hide();
    		this.editor.readonly(onlyView);
    		this.el.addClass("_onlyView");
    	}else {
    		jQuery(".ke-toolbar,.ke-statusbar", this.el).show();
    		this.editor.readonly(onlyView);
    		this.el.removeClass("_onlyView");
    	}
    },
	_getFullHtml : function() {
		return this.editor.fullHtml();
	},
	_getHtml : function() {
		return this.editor.html();
	},
	_setHtml : function(html) {
		var self = this;
		KindEditor.ready(function(K) {
			self.editor.html(html);
		});
	},
	_getText : function() {
		return this.editor.text();
	},
	_setValue : function(value) {
		this.value = value;
		this._setHtml(value);
	},
	_setText : function(text) {
		var self = this;
		KindEditor.ready(function(K) {
			self.editor.text(text);
		});
	},
	_validate : function() {
		var v = new boot.Validate();
		v.setRequired(this.required);
		v.setValue(this._getText());
		v.setVType(this.vType);
		v.setErrorText(this.errorText);
		var result = v.execute();
		if (!result) {
			this.el.removeClass("error");
		} else {
			this.el.addClass('error');
		}

		this.errorEl.css('width', "auto");
		this.errorEl.prop('title', result);
		this.errorEl.html(result);
		this.errorEl.css('position', "relative");
		this.errorEl.css('background', "none");
		
		this.validateValue = !result;
		return this.validateValue;
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ 'uploadUrl' ],
			bool : [ 'allowResize', 'readonly', 'allowImg' ],
			json : [ 'items' ],
			number: ['uploadLimit']
		}, attributes || {});
		return boot.RichText.superClass._getAttrs.call(this, attrs);
	},
	getFullHtml : function() {
		return this._getFullHtml();
	},
	getHtml : function() {
		return this._getHtml();
	},
	setHtml : function(html) {
		return this._setHtml(html);
	},
	getText : function() {
		return this._getText();
	},
	setText : function(text) {
		return this._setText(text);
	},
	getValue: function(){
		return this.getHtml();
	},
	setValue: function(value){
		this.setHtml(value);
	}
});

boot.Register(boot.RichText, 'richtext');
