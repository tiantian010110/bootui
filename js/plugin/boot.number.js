/**
 * @author 田鑫龙
 */
//Number类型
boot.Number = function(id) {
    boot.Number.superClass.constructor.call(this, id);
};
//format d:数字，p:百分比，默认：金额
boot.extend(boot.Number, boot.TextBox, {
    uiCls : "boot-number",
    type: "number",
    _initField : function() {
        boot.Number.superClass._initField.call(this);
        this.format = this.format || "d0";
        this.formatFixed = Number(this.format.replace(/[a-zA-Z]/g, ''));
        this.formatType = this.format.replace(/[0-9]/g, '');
        this.fixed = this.formatType == 'p' ? 100 : 1;
        this.value = this.value * this.fixed || 0;
        this.maxValue = this.maxValue || 9999999999;
        this.minValue = this.minValue || -9999999999;
        this.symbol = this.formatType == 'p' ? "%" : "&yen;";
    },
    _create : function() {
        boot.Number.superClass._create.call(this);
        this.textEl.css({
            "text-align" : "right",
            "ime-mode" : "disabled"
        });
        this._decimalFormat(this.value);
        if(this.formatType !== 'd'){
        	this.borderEl.css("padding-right", "18px");
        	this.symbolEl = jQuery('<span class="number-symbol">'+ this.symbol +'</span>');
        	this.borderEl.append(this.symbolEl);
        	
        	if(this.onlyView){
        		this.symbolEl.css({
        			"border-left": "none",
        			"background-color": "transparent"
        		});
        	}
        }
    },
    _setValue : function(value) {
        this._decimalFormat(value * this.fixed);
        this.textEl.trigger('click');
    },
    _bindEvents : function() {
        boot.Number.superClass._bindEvents.call(this);
    },
    _onTextFocus : function(e) {
        this.textEl.val(this.formatValue);
        this._fire('onfocus', e);
        var me = this;
        window.setTimeout(function() {
            me.textEl.select();
        }, 0);

    },
    _onTextKeyDown : function(e) {
        this._fire('onkeydown', e);
    },
    _onTextChange : function(e) {
        this._fire('onchange', e);
    },
    _onTextBlur : function(e) {
        var value = this._compare(this.textEl.val());
        this._decimalFormat(value);
        this._validate();
        this._fire('onblur', e);
    },
    //比较是否合法
    _compare: function(value){
        value = this._filterIllegalChar(value);
        var compareValue = value / this.fixed;
        if (compareValue > this.maxValue) {
            value = this.maxValue;
        }
        if (compareValue < this.minValue) {
            value = this.minValue;
        }
        return String(value);
    },
    //过滤非法字符
    _filterIllegalChar : function(value) {
        for (var i = 0; i < value.length; i++) {
            var _char = value.charAt(i);
            if (!/[0-9|\.|\-]/.test(_char)) {
                value = value.split(_char).join("");
            }
        }
        return value;
    },
	// 格式化方法
	_decimalFormat : function(number) {
		number = boot.formatDecimal(number, this.formatFixed);

		this.formatValue = number.replace(/\,/g, '');

		this.value = this.formatValue / this.fixed;

		this.textEl.val(number);

		return number;
	},
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ["format"],
            number : ["maxValue", "minValue"],
            fn : []
        }, attributes || {});
        return boot.Number.superClass._getAttrs.call(this, attrs);
    }
});

boot.Register(boot.Number, 'number'); 