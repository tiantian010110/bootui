/**
 * @author 田鑫龙
 */
//弹窗窗口按钮
boot.PopupEdit = function(id){
    boot.PopupEdit.superClass.constructor.call(this, id);
};

boot.extend(boot.PopupEdit, boot.TextBox, {
    uiCls: 'boot-popupedit',
	type: 'popupedit',
    _initField: function(){
        boot.PopupEdit.superClass._initField.call(this);
        this.textField = this.textField || this.name || "name";
        this.valueField = this.valueField || this.name || "id";
    },
    _create: function(){
        boot.PopupEdit.superClass._create.call(this);
        this.borderEl.css("padding-right", "22px");
        this.buttonEl = jQuery('<span class="popupedit-button-border"><span class="popupedit-button-icon popupedit-button-icon-hover"></span></span>');
        this.borderEl.append(this.buttonEl);
        this.clearEl = jQuery('<span class="clear-button-border" '+ (!this.showClear ? 'style="display: none;"' : '') +'><span class="icon-clear"></span></span>');
        this.borderEl.append(this.clearEl);
        this.textEl.attr("readonly", true);
        
        if(this.onlyView){
        	this._setOnlyView(true);
        }
    },
    _setEnabled: function(flag){
    	boot.PopupEdit.superClass._setEnabled.call(this, flag);
    	if(flag){
    		this.buttonEl && this.buttonEl.show();
    		this.clearEl && this.clearEl.show();
    	}else{
    		this.buttonEl && this.buttonEl.hide();
    		this.clearEl && this.clearEl.hide();
    	}
    },
    _setOnlyView: function(flag){
    	boot.PopupEdit.superClass._setOnlyView.call(this, flag);
    },
    _bindEvents: function(){
        boot.PopupEdit.superClass._bindEvents.call(this);
        this._on(this.el, '.clear-button-border', 'click', this._onButtonClearClick, this);
        this._on(this.el, '.popupedit-button-border', 'click', this._onButtonEditClick, this);
        this._on(this.el, '.popupedit-button-border', 'mouseenter', this._onButtonMouseEnter, this);
        this._on(this.el, '.popupedit-button-border', 'mouseleave', this._onButtonMouseLeave, this);
    },
    _onButtonMouseLeave: function(e){
        var el = e.selector;
        el.removeClass("popupedit-button-border-hover");
        this._fire("onbuttonhover", e);
    },
    _onButtonMouseEnter: function(e){
        var el = e.selector;
        el.addClass("popupedit-button-border-hover");
        this._fire("onbuttonunhover", e);
    },
    _onButtonClearClick: function(e){
    	e.stopPropagation();
    	e.history = {};
    	e.history.text = this.getText();
    	e.history.value = this.getValue();
    	this.setValue("");
    	this.setText("");
    	this._validate();
    	this._fire("onclearclick", e);
    },
    _onButtonEditClick: function(e){
    	e.stopPropagation();
        this._fire("onbuttonclick", e);
    },
    _onTextChange: function(e){
        this.text = this.textEl.val();
        if(this.textField == this.valueField){
            this.value = this.text;
            this._validate();
        }
        e.text = this.text;
        e.value = this.value;
        this._fire('onchange', e);
    },
    _setText: function(text){
        this.text = text;
        this.textEl.val(text);
        if(this.textField == this.valueField){
            this.value = text;
            this._validate();
        }
    },
    _setValue: function(value){
        this.value = value;
        if(this.textField == this.valueField){
            this.text = value;
        }
        this._validate();
    },
    _getText: function(){
        return this.text;
    },
    _getData: function(){
        return this.data;  
    },
    _getAttrs: function(attributes){
        var attrs = boot.concat({
            str: ["textField", "valueField"],
            bool: ["showClear"],
            css: [],
            fn: []
        }, attributes || {});
        return boot.PopupEdit.superClass._getAttrs.call(this, attrs);
    },
    
    //API
    setText: function(text){
        this._setText(text);
    },
    getText: function(){
        return this._getText();
    }
});

boot.Register(boot.PopupEdit, 'popupedit');