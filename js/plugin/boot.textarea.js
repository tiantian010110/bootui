/**
 * @author 田鑫龙
 */
//文本输入框
boot.TextArea = function(id){
    boot.TextArea.superClass.constructor.call(this, id);
};

boot.extend(boot.TextArea, boot.TextBox, {
    _initField: function(){
        boot.TextArea.superClass._initField.call(this);
        this.height = this.height || 48;
        this.width = this.width || 150;
    },
    uiCls: 'boot-textarea',
    type: 'textarea',
    _create: function(){
        var container = jQuery("<span id=\""+ this.id +"\" class=\"boot-textbox boot-textarea\"></span>");
        var borderHTML = '<span class="textbox-border textarea-border" style="display: block;position: relative;padding: 0 2px;';
        if(this.showBorder === false){
            borderHTML += 'border: none;';
        }
        borderHTML += '"></span>';
        var border = jQuery(borderHTML);
        var emptyEl = jQuery('<label style="'+ (this.value && this.value != '' ? 'display: none;' : '') +'position: absolute;top: 0;left :2px;color: gray;cursor: text;">' + this.emptyText + '</label>').appendTo(border);
        var textarea = jQuery("<textarea>", {
            name: this.name,
            id: this.id + '$text',
            "class": "textarea-text textbox-text",
            readonly: this.allowEdit === false ? true : false,
            disabled: this.enabeld === false ? true : false,
            value: this.value
        }).appendTo(border.appendTo(container)); 
        var errorEl = jQuery('<span class="error" title="'+ (this.errorText || '') +'"></span>');
        errorEl.appendTo(container);
        this.errorEl = errorEl;
        
        this.el.after(container);//插入新创建的元素
        this.el.remove();//移除旧的元素
        this.el = container;
        this.textEl = textarea;
        this.borderEl = border;
        this.emptyEl = emptyEl;
        
        if(this.onlyView){
        	this.textEl.prop("disabled", true);
        	this.textEl.css({"resize": "none"});
        	this.borderEl.css("border-color", "transparent");
        }
        this.textEl.css("resize", "none");
        
        this._setWidth();
        this._setHeight();
    },
    _setHeight : function(height) {
        this.borderEl.css({
            height : height || this.height
        });
    },
    _bindEvents: function(){
        this._on(this.el, "textarea", "change", this._onTextChange, this);
        this._on(this.el, "textarea", "change", this._onTextChangeForEmptyText, this);
        this._on(this.el, "textarea", "keypress", this._onEnterPress, this);
        
        this._on(this.el, "textarea", "keydown", this._onTextKeyDown, this);
        this._on(this.el, "textarea", "keyup", this._onTextKeyUp, this);
        this._on(this.el, "textarea", "blur", this._onTextBlur, this);
        this._on(this.el, "textarea", "focus", this._onTextFocus, this);
        this._on(this.el, "label", "click", this._onPlaceHorderClick, this);
    },
    _getAttrs: function(attributes){
        var attrs = boot.concat({
            str: [],
            bool: [],
            json: [],
            fn: []
        }, attributes || {});
        return boot.TextArea.superClass._getAttrs.call(this, attrs);
    }
});

boot.Register(boot.TextArea, 'textarea');
