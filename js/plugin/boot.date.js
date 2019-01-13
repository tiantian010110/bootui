/**
 * @author 田鑫龙
 */
//日期
boot.Date = function(id){
    boot.Date.superClass.constructor.call(this, id);
    this._renderDatePicker();
    this._bindAfterEvent();
};

boot.extend(boot.Date, boot.PopupEdit, {
    uiCls: 'boot-date',
    type: "date",
    _initField: function(){
        boot.Date.superClass._initField.call(this);
        this.format = this.format || 'YYYY-MM-DD';
        this.showTime = this.onlyTime == true ? true : this.showTime;
    },
    _create: function(){
    	this.type = 'datebox';//防止支持html5的浏览器使用html5日期控件导致日期异常
        boot.Date.superClass._create.call(this);
        this.value = this._getTime(this.value);
        this.textEl.val(this.value);
        this.type = 'date';
    },
    _getTime: function(time){
        time = time || "";
        if(time === ''){
            return '';
        }
        return boot.formatDate(this.format, time);
    },
    _setText: undefined,//注销setText方法
    _setValue: function(value){
        this.value = this._getTime(value);
        this.datePicker._setValue(this.value);
        this.textEl.val(this.value).trigger("change");
    },
    _getValue: function(){
        return this.value;
    },
    _renderDatePicker: function() {
    	var box = this._updateDatePickerLayout();
        var html = '<div id="'+ this._uuid +'$datepicker" class="boot-datepicker" ';
        html += 'format="'+ this.format +'" ';
        html += 'value="'+ this.value +'" ';
        html += 'showTime="'+ this.showTime +'" ';
        html += 'onlyTime="'+ this.onlyTime +'" ';
        html += 'style="top: '+ box.top +'px;left: '+ box.left +'px;display: none;z-index: 10;"';
        html += '></div>';
        jQuery(html).appendTo(document.body);
        this.datePicker = new boot.DatePicker(this._uuid +'\\$datepicker');
    },
    _updateDatePickerLayout: function(){
        var box = this._getBox();
        var winHeight = jQuery(document.body).height();
        var height = this.onlyTime ? '34' : '242';
        
        if (winHeight - box.top > height) {
            box.top = box.top + box.height;
        }else{
            box.top -= height;
        }
        
        if(this.datePicker){
        	this.datePicker.el.css({
        		top: box.top,
        		left: box.left
        	});
        }
        return box;
    },
    _destroy: function(){
    	this.datePicker._destroy();
    	boot.Date.superClass._destroy.call(this);
    	this.el.remove();
    },
    _bindAfterEvent: function(){
        this.datePicker._bind('sure', this._onTodayClick, this);
        this.datePicker._bind('today', this._onTodayClick, this);
        this.datePicker._bind('clear', this._onClearClick, this);
        this.datePicker._bind('dayclick', this._onDayClick, this);
        
        this.bind('bodyclick', this._onBodyClick, this);
    },
    _onBodyClick: function(){
        this.datePicker._hide();
    },
    _onTodayClick: function(e){
        this.setValue(e.value);
        this.datePicker._hide();
        this._validate();
    },
    _onClearClick: function(e){
        this.setValue('');
        this._validate();
    },
    _onDayClick: function(e){
        if(!this.showTime){
            this.setValue(e.value);
            this.datePicker._hide();
        }
        this._validate();
    },
    _onButtonEditClick: function(e){
        e.stopPropagation();
        this.datePicker._setValue(this.value);
        this._updateDatePickerLayout();
        this.datePicker._show();
        this._fire("onbuttonclick", e);
    },
    _getAttrs: function(attributes){
        var attrs = boot.concat({
            str: ["format"]
        }, attributes || {});
        return boot.Date.superClass._getAttrs.call(this, attrs);
    },
    
    
    //API
    getValue: function(){
        return this._getValue();
    },
    setValue: function(value){
        this._setValue(value);
    }
});

boot.Register(boot.Date, 'date');
