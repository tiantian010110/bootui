/**
 * @author 田鑫龙
 */
boot.DatePicker = function(id) {
    this._uuid = boot.newId();
    this.lang = {
        chinese : {
            'year' : "年",
            'month' : "月",
            'day' : "日",
            'hour' : "时",
            'minute' : "分",
            'second' : "秒",
            'week' : "周"
        },
        english : {
            'year' : "year",
            'month' : "month",
            'day' : "day",
            'hour' : "hour",
            'minute' : "minute",
            'second' : "second",
            'week' : "week"
        }
    };
    this.months = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    this.styleCls = {
        dateArrow : 'width: 20px;height: 24px;display: inline-block;border-style: solid;border-width: 1px;position: relative;vertical-align: middle;cursor: pointer;',
        dateText : 'border-style: solid;border-width: 1px;display: inline-block;border-left: none;border-right: none;vertical-align: middle;height: 24px;line-height: 24px;text-align: center;cursor: pointer;',
        dateButton : 'width: 36px;height: 20px;line-height: 20px;display: inline-block;border-style: solid;border-width: 1px;vertical-align: middle;cursor: pointer;text-align: center;',
        arrowLeft : 'border-style: dashed solid dashed dashed;border-color: transparent #7E7D7D transparent transparent;top: 7px;left: 1px;',
        arrowRight : 'border-style: dashed dashed dashed solid;border-color: transparent transparent transparent #7E7D7D;top: 7px;left: 8px;',
        arrow : 'top: 11px;right: 30px;border-width: 5px;position: absolute;display: inline-block;height: 0;width: 0;',
        arrowTop : 'border-style: dashed dashed solid dashed;border-color: transparent transparent #7E7D7D transparent;top: 5px;right: auto;',
        arrowBottom : 'border-style: solid dashed dashed dashed;border-color: #7E7D7D transparent transparent transparent;top: 11px;right: 28px;',
        timeText : 'display: inline-block;width: 34px;text-align: center;border-right-style: solid;border-right-width: 1px;height: 20px;line-height: 20px;',
        time : 'width: 20px;height: 20px;line-height: 20px;border: none;text-align: center;font-size: 12px;cursor: pointer;margin-top: -1px !important;float: left;',
        monthItem : 'float: left;text-align: center;height: 22px;line-height: 22px;width: 41px;margin: 4px;',
        yearItem : 'float: left;text-align: center;height: 20px;line-height: 20px;'
    };
    boot.DatePicker.superClass.constructor.call(this, id);
    
};
boot.extend(boot.DatePicker, boot.Rooter, {
	uiCls: 'boot-datapicker',
    type: "datepicker",
    _initField : function() {
        this.format = this.format || 'yyyy-mm-dd';
        this.value = this.value || '';
        this.language = this.language === 'us' || this.language === 'english' ? 'english' : 'chinese';
        this.showTime = this.onlyTime == true ? true : this.showTime;
    },
    _create : function() {
        this.el.css({
            position : 'absolute'
        });
        //禁止选中文本
        this.el.attr('unselectable','on') 
        .css({'-moz-user-select':'-moz-none', 
        '-moz-user-select':'none', 
        '-o-user-select':'none', 
        '-khtml-user-select':'none', /* you could also put this in a class */ 
        '-webkit-user-select':'none',/* and add the CSS class here instead */ 
        '-ms-user-select':'none', 
        'user-select':'none' 
        }).bind('selectstart', function(){ return false; }); 
        
        var border = jQuery('<div class="date-border" style="font-size: 12px;"></div>');
        border.appendTo(this.el);
        this.borderEl = border;
        var head = jQuery('<div class="date-top" style="padding: 5px;overflow: hidden;"></div>');
        var view = jQuery('<div class="date-view" style="width: 230px;padding: 0 5px;"></div>');
        var bottom = jQuery('<div class="date-bottom" style="padding: 5px;overflow: hidden;"></div>');
        this.borderEl.append(head);
        this.headEl = head;
        this.borderEl.append(view);
        this.viewEl = view;
        this.borderEl.append(bottom);
        this.bottomEl = bottom;
        
        if(!/dd/i.test(this.format)){
        	view.hide();
        }
        if(!/yyyy-mm/i.test(this.format)){
        	head.hide();
        }
        
        this._createHead();
        this._createView();
        this._createBottom();
    },
    _updateDatePicker: function(){
        this.day = undefined;
        this.month = undefined;
        this.year = undefined;
        this.hour = undefined;
        this.minute = undefined;
        this.second = undefined;
        this.week = undefined;
        this._initDate();
        this.yearEl.text(this.year + this.lang[this.language]['year']);
        this.monthEl.text(this.month + this.lang[this.language]['month']);
        this.hourEl.val(this.hour);
        this.minuteEl.val(this.minute);
        this.secondEl.val(this.second);
    },
    _createHead : function() {
        this._initDate();
        var years = jQuery('<div class="date-years" style="display: inline-block;width: 120px;text-align: left;position: relative;float: left;"></div>');
        var months = jQuery('<div class="date-months" style="display: inline-block;width: 100px;text-align: right;margin-left: 10px;position: relative;float: left;"></div>');
        this.headEl.append(years);
        this.headEl.append(months);
        var yearsHTML = "", monthHTML = "";
        yearsHTML += '<a class="date-arrow year-prev" style="' + this.styleCls.dateArrow + '">';
        yearsHTML += '<cite class="buttonArrow left" style="' + this.styleCls.arrow + this.styleCls.arrowLeft + '"></cite>';
        yearsHTML += '</a>';
        yearsHTML += '<span id="' + this._uuid + '$year" class="date-text date-year" style="' + this.styleCls.dateText + 'width: 76px;">' + this.year + this.lang[this.language]['year'] + '</span>';
        yearsHTML += '<a class="date-arrow year-next" style="' + this.styleCls.dateArrow + '">';
        yearsHTML += '<cite class="buttonArrow right" style="' + this.styleCls.arrow + this.styleCls.arrowRight + '"></cite>';
        yearsHTML += '</a>';
        yearsHTML += '<cite class="buttonArrow arrow bottom" style="' + this.styleCls.arrow + this.styleCls.arrowBottom + '"></cite>';
        years.html(yearsHTML);
        monthHTML += '<a class="date-arrow month-prev" style="' + this.styleCls.dateArrow + '">';
        monthHTML += '<cite class="buttonArrow left" style="' + this.styleCls.arrow + this.styleCls.arrowLeft + '"></cite>';
        monthHTML += '</a>';
        monthHTML += '<span id="' + this._uuid + '$month" class="date-text date-month" style="' + this.styleCls.dateText + 'width: 56px;">' + this.month + this.lang[this.language]['month'] + '</span>';
        monthHTML += '<a class="date-arrow month-next" style="' + this.styleCls.dateArrow + '">';
        monthHTML += '<cite class="buttonArrow right" style="' + this.styleCls.arrow + this.styleCls.arrowRight + '"></cite>';
        monthHTML += '</a>';
        monthHTML += '<cite class="buttonArrow arrow bottom" style="' + this.styleCls.arrow + this.styleCls.arrowBottom + '"></cite>';
        months.html(monthHTML);
        this.yearEl = jQuery('#' + this._uuid + '\\$year', this.headEl);
        this.prevYearEl = this.yearEl.prev();
        this.nextYearEl = this.yearEl.next();
        this.monthEl = jQuery('#' + this._uuid + '\\$month', this.headEl);
        this.prevMonthEl = this.monthEl.prev();
        this.nextMonthEl = this.monthEl.next();

        var dateBox = jQuery('<div class="date-box" style="position: absolute;top: 31px;border-width: 1px;border-style: solid;display: none;"></div>');
        dateBox.appendTo(this.headEl);
        this.dateBoxEl = dateBox;
    },
    _createView : function() {
        var html = new boot.HTML();
        html.push('<table style="table-layout: fixed;border-collapse: collapse;width: 100%;text-align: center;" cellpadding="0" cellspacing="0">');
        html.push('<thead>');
        html.push('<tr>');
        if(this.language == 'english')
        	html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">日</td>');
        html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">一</td>');
        html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">二</td>');
        html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">三</td>');
        html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">四</td>');
        html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">五</td>');
        html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">六</td>');
        if(this.language == 'chinese')
        	html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">日</td>');
        html.push('</tr>');
        html.push('</thead>');
        html.push('</table>');
        this.viewEl.html(html.concat());
        var table = this.viewEl.children();
        var boxEl = jQuery('<tbody></tbody>');
        boxEl.appendTo(table);
        this.boxEl = boxEl;
        this._renderBox();
    },
    _renderYearBox : function(year) {
        year = year || this.year;
        var start = year - 1900 > 7 ? year - 7 : 1900;
        var target = this.year;
        var html = '<ul style="width: 118px;">';
        html += '<li class="up" style="' + this.styleCls.yearItem + ';width: 118px;height: 22px;position: relative;border-bottom-style: solid;border-bottom-width: 1px;"><cite class="buttonArrow bottom" style="' + this.styleCls.arrow + this.styleCls.arrowTop + 'margin-left: -5px;"></cite></li>';
        for (var i = 0; i < 14; i++, start++) {
            if (target == start) {
                html += '<li class="year selected" style="' + this.styleCls.yearItem + ';width: 59px;">' + start + '</li>';
            } else {
                html += '<li class="year" style="' + this.styleCls.yearItem + ';width: 59px;">' + start + '</li>';
            }
        }
        html += '<li class="down" style="' + this.styleCls.yearItem + ';width: 118px;height: 22px;position: relative;border-top-style: solid;border-top-width: 1px;"><cite class="buttonArrow bottom" style="' + this.styleCls.arrow + this.styleCls.arrowBottom + 'margin-left: -5px;top: 9px;right: auto;"></cite></li>';
        html += '</ul>';
        this.dateBoxEl.html(html);
        this.dateBoxEl.css({
            'left' : 6
        });
        this.dateBoxEl.show();
    },
    _renderMonthBox : function() {
        var target = this.month;
        var html = '<ul style="width: 98px;">';
        for (var index = 1; index <= 12; index++) {
            if (target == index) {
                html += '<li class="month selected" style="' + this.styleCls['monthItem'] + ';width:41px;">' + index + '</li>';
            } else {
                html += '<li class="month" style="' + this.styleCls['monthItem'] + ';width:41px;">' + index + '</li>';
            }
        }
        html += '</ul>';
        this.dateBoxEl.html(html);
        this.dateBoxEl.css({
            'left' : 136
        });
        this.dateBoxEl.show();
    },
    _renderTimeBox : function(type, size) {
        var target = this[type];
        var html = '<div class="head" style="position: relative;height: 24px;height: 20px;line-height: 20px;text-align: center;border-bottom-style: solid;border-bottom-width: 1px;">'+ this.lang[this.language][type];
        html += '<div class="close" style="position: absolute;right: 2px;top: 2px;bottom: 2px;width: 17px;cursor: pointer;line-height: 18px;">×</div>';
        html += '</div>';
        html += '<ul style="margin: 4px;">';
        for (var index = 0; index < size; index++) {
            if (target == index) {
                html += '<li class="'+ type +' selected" style="width: 22px;height: 23px;float: left;text-align: center;line-height: 22px;">' + index + '</li>';
            } else {
                html += '<li class="'+ type +'" style="width: 22px;height: 23px;float: left;text-align: center;line-height: 22px;">' + index + '</li>';
            }
        }
        html += '</ul>';
        this.timeBoxEl.html(html);
        this.timeBoxEl.show();
    },
    _getFebruaryDays : function() {
        return ((this.year % 4 == 0 && this.year % 100 != 0) || (this.year % 400 == 0)) ? 29 : 28;
    },
    _setPosition : function(position) {
        this.el.offset(position);
    },
    _initDate : function() {
        var date = boot.formatDate(this.format, this.value, true);
        if (date == ''){
            date = new Date();
        }
        this.day = date.getDate();
        this.month = (date.getMonth() + 1);
        this.year = date.getFullYear();
        this.hour = date.getHours();
        this.minute = date.getMinutes();
        this.second = date.getSeconds();
        this.week = date.getDay();
    },
    _getDate : function(fixed) {
        fixed = fixed || 0;
        var value = this._formatToValidate(fixed);
        this.value = boot.formatDate(this.format, new Date(value));
    },
    _setValue : function(value) {
        this.value = value;
        this._initDate();
        this._renderBox();
    },
    _getValue : function() {
        return this.value;
    },
    _formatToValidate : function(fixed) {
        var date = this.year, month = this.month;
        if (fixed == 1 && month == 12) {
            date++;
            month = 0;
        } else if (fixed == -1 && month == 1) {
            date--;
            month = 13;
        }
        month += fixed;
        date += '/';
        date += month < 10 ? ('0' + month) : month;
        date += '/';
        date += this.day < 10 ? ('0' + this.day) : this.day;
        date += ' ';
        date += this.hour < 10 ? ('0' + this.hour) : this.hour;
        date += ':';
        date += this.minute < 10 ? ('0' + this.minute) : this.minute;
        date += ':';
        date += this.second < 10 ? ('0' + this.second) : this.second;
        return date;
    },
    _renderBox : function() {
        var first = new Date(this.year, this.month - 1, 1);
        var fixed = first.getDay() || 7;
        if(this.language == 'chinese'){
        	fixed -= 1;
        }
        var prevMonthDays = this.months[this.month - 2] || this._getFebruaryDays();
        var currentMonthDays = this.months[this.month - 1] || this._getFebruaryDays();
        
        this._startDateTime = this.year + '-' + (this.month - 1) + '-' + (prevMonthDays - fixed + 1);
        
        var html = new boot.HTML('<tr>'), _day = prevMonthDays - fixed + 1;
        var cls = 'day prev-month-day';
        for (var i = fixed; i > 0; ) {
        	_day = prevMonthDays - --i;
            html.push('<td id="datepicker$'+ (this.month - 1) + '$' + _day +'" class="' + cls + '">');
            html.push('<div class="datepicker-day">' + _day + '</div>');
            html.push('</td>');
        }
        if (fixed == 7) {
            html.push("</tr><tr>");
        }
        var rows = 1;
        cls = 'day current-month-day';
        for (var i = 1; i <= currentMonthDays; i++) {
        	_day = i;
            html.push('<td id="datepicker$'+ this.month + '$' + i +'" class="' + cls + this._markToday(i) + '">');
            html.push('<div class="datepicker-day">' + i + '</div>');
            html.push('</td>');
            if ((i + fixed) % 7 === 0) {
                if (rows == 6) {
                    html.push("</tr>");
                    break;
                } else {
                    html.push("</tr><tr>");
                }
                rows++;
            }
        }
        cls = "day next-month-day", fixed = 42 - fixed - currentMonthDays;
        if (fixed <= 7) {
            for (var i = 1; i <= fixed; i++) {
            	_day = i;
                html.push('<td id="datepicker$'+ (this.month + 1) + '$' +  i +'" class="' + cls + '">');
                html.push('<div class="datepicker-day">' + i + '</div>');
                html.push('</td>');
            }
        } else {
            fixed -= 7;
            for (var i = 1; i <= fixed; i++) {
            	_day = i;
                html.push('<td id="datepicker$'+ (this.month + 1) + '$' +  i +'" class="' + cls + '">');
                html.push('<div class="datepicker-day">' + i + '</div>');
                html.push('</td>');
            }
            html.push("</tr><tr>");
            for (var i = 1; i <= 7; i++) {
            	_day = i + fixed;
                html.push('<td id="datepicker$'+ (this.month + 1) + '$' +  _day +'" class="' + cls + '">');
                html.push('<div class="datepicker-day">' + _day + '</div>');
                html.push('</td>');
            }
        }
        html.push("</tr>");
        this._endDateTime = this.year + '-' + (this.month + 1) + '-' + _day;
        this.boxEl.html(html.concat());
    },
    _markToday: function(day){
        if(day == this.day){
            return " selected";
        }
        return "";
    },
    _createBottom : function() {
        var timesHTML = '<div class="date-times" style="border-style: solid;border-width: 1px;display: inline-block;width: 108px;text-align: left;overflow: hidden;float: left;';
        if(!/hh|mi|ss/i.test(this.format)) // 通过正则表达式匹配时间是否显示
            timesHTML += 'visibility: hidden;';
        timesHTML += '"></div>';
        var times = jQuery(timesHTML);
        var buttons = jQuery('<div class="date-buttons" style="display: inline-block;width: 115px;text-align: right;margin-left: 5px;float: left;"></div>');
        this.bottomEl.append(times);
        this.bottomEl.append(buttons);
        var timeHTML = '<span class="time-text" style="' + this.styleCls.timeText + ';cursor: default;float: left;">时间</span>';
        timeHTML += '<span style="font-family: \'微软雅黑\';cursor: default;float: left;height: 20px;line-height: 20px;">';
        timeHTML += '<input class="time-hour" id="' + this._uuid + '$hour" readonly="true" style="' + this.styleCls.time + '" value="' + (this.hour < 10 ? ('0' + this.hour) : this.hour) + '">';
        timeHTML += ':</span>';
        timeHTML += '<span style="font-family: \'微软雅黑\';cursor: default;float: left;height: 20px;line-height: 20px;">';
        timeHTML += '<input class="time-minute" id="' + this._uuid + '$minute" readonly="true" style="' + this.styleCls.time + '" value="' + (this.minute < 10 ? ('0' + this.minute) : this.minute) + '">';
        timeHTML += ':</span>';
        timeHTML += '<span style="cursor: default;float: left;height: 20px;line-height: 20px;">';
        timeHTML += '<input class="time-second" id="' + this._uuid + '$second" readonly="true" style="' + this.styleCls.time + '" value="' + (this.second < 10 ? ('0' + this.second) : this.second) + '">';
        timeHTML += '</span>';
        times.html(timeHTML);
        var bottomHTML = '<a class="date-button date-clear" style="' + this.styleCls.dateButton + '">清空</a>';
        bottomHTML += '<a class="date-button date-today" style="' + this.styleCls.dateButton + ';margin-left: -1px;">当前</a>';
        bottomHTML += '<a class="date-button date-sure" style="' + this.styleCls.dateButton + ';margin-left: -1px;">确定</a>';
        // bottomHTML += '<a class="date-button date-close" style="' + this.styleCls.dateButton + ';margin-left: -1px;">关闭</a>';     
        buttons.html(bottomHTML);

        var timeBox = jQuery('<div class="date-box" style="position: absolute; left: 6px;right: 6px; bottom: 27px;border-style: solid;border-width: 1px;display: none;"></div>');
        timeBox.appendTo(this.bottomEl);
        this.timeBoxEl = timeBox;
        this.hourEl = jQuery("#" + this._uuid + "\\$hour", this.bottomEl);
        this.minuteEl = jQuery("#" + this._uuid + "\\$minute", this.bottomEl);
        this.secondEl = jQuery("#" + this._uuid + "\\$second", this.bottomEl);
    },
    _hide : function() {
        this.el.hide();
    },
    _show : function() {
        this._updateDatePicker();
        this.el.show();
    },
    _destroy: function(){
    	boot.DatePicker.superClass._destroy.call(this);
    	this._un(this.el);
    	this._un(this.headEl);
    	this._un(this.bottomEl);
    	this._un(this.viewEl);
    	this.el.remove();
    },
    _bindEvents : function() {
        this._on(this.headEl, '.up', 'click', this._onYearBoxUpClick, this);
        this._on(this.headEl, '.down', 'click', this._onYearBoxDownClick, this);
        this._on(this.headEl, '.year', 'click', this._onYearBoxClick, this);
        
        this._on(this.bottomEl, '.time-hour', 'click', this._onHourBoxClick, this);
        this._on(this.bottomEl, '.time-minute', 'click', this._onMinuteBoxClick, this);
        this._on(this.bottomEl, '.time-second', 'click', this._onSecondBoxClick, this);
        this._on(this.bottomEl, '.hour', 'click', this._onHourClick, this);
        this._on(this.bottomEl, '.minute', 'click', this._onMinuteClick, this);
        this._on(this.bottomEl, '.second', 'click', this._onSecondClick, this);
        this._on(this.bottomEl, '.close', 'click', this._onBodyClick, this);
        
        this._on(this.el, '.date-box', 'click', this._onStopPropagation, this);
        this._on(this.el, '.date-border', 'click', this._onStopPropagation, this);
        
        this._on(this.headEl, '.date-year', 'click', this._onYearClick, this);
        this._on(this.headEl, '.month', 'click', this._onMonthBoxClick, this);
        this._on(this.headEl, '.date-month', 'click', this._onMonthClick, this);
        this._on(this.headEl, '.year-prev', 'click', this._onPrevYearClick, this);
        this._on(this.headEl, '.year-next', 'click', this._onNextYearClick, this);
        this._on(this.headEl, '.month-prev', 'click', this._onPrevMonthClick, this);
        this._on(this.headEl, '.month-next', 'click', this._onNextMonthClick, this);
        this._on(this.viewEl, '.prev-month-day', 'click', this._onPrevMonthDayClick, this);
        this._on(this.viewEl, '.current-month-day', 'click', this._onCurrentMonthDayClick, this);
        this._on(this.viewEl, '.next-month-day', 'click', this._onNextMonthDayClick, this);
        
        this._on(this.bottomEl, '.date-clear', 'click', this._onClearButtonClick, this);
        this._on(this.bottomEl, '.date-today', 'click', this._onTodayButtonClick, this);
        this._on(this.bottomEl, '.date-sure', 'click', this._onSureButtonClick, this);
        
        this.bind('bodyclick', this._onBodyClick, this);
    },
    _onHourClick: function(e){
        var el = e.selector;
        var value = el.text();
        if(value < 10){
            value = '0' + value;
        }
        this.hour = value;
        this.hourEl.val(value);
        this.timeBoxEl.hide();
    },
    _onMinuteClick: function(e){
        var el = e.selector;
        var value = el.text();
        if(value < 10){
            value = '0' + value;
        }
        this.minute = value;
        this.minuteEl.val(value);
        this.timeBoxEl.hide();
    },
    _onSecondClick: function(e){
        var el = e.selector;
        var value = el.text();
        if(value < 10){
            value = '0' + value;
        }
        this.second = value;
        this.secondEl.val(value);
        this.timeBoxEl.hide();
    },
    _onHourBoxClick: function(e){
        this._onBodyClick();
        e.stopPropagation();
        this._renderTimeBox('hour', 24);
    },
    _onMinuteBoxClick: function(e){
        this._onBodyClick();
        e.stopPropagation();
        this._renderTimeBox('minute', 60);
    },
    _onSecondBoxClick: function(e){
        this._onBodyClick();
        e.stopPropagation();
        this._renderTimeBox('second', 60);
    },
    _onBodyClick: function(e){
        this.dateBoxEl.hide();
        this.timeBoxEl.hide();
        return false;
    },
    _onStopPropagation : function(e) {
        e.stopPropagation();
    },
    _onYearBoxDownClick : function(e) {
        e.stopPropagation();
        var el = e.selector;
        var max = Number(el.prev().text());
        if(max >= 2099){
            return ;
        }
        this._renderYearBox(max + 8);
    },
    _onYearBoxUpClick : function(e) {
        e.stopPropagation();
        var el = e.selector;
        var min = Number(el.next().text());
        if(min <= 1900){
            return ;
        }
        this._renderYearBox(min - 7);
    },
    _onYearClick : function(e) {
        this._onBodyClick();
        e.stopPropagation();
        this._renderYearBox();
    },
    _onYearBoxClick : function(e) {
        var el = e.selector;
        var value = el.text();
        this.year = value;
        this.yearEl.text(this.year + this.lang[this.language]['year']);
        this._renderBox();
        this.dateBoxEl.hide();
    },
    _onMonthClick : function(e) {
        this._onBodyClick();
        e.stopPropagation();
        this._renderMonthBox();
    },
    _onMonthBoxClick : function(e) {
        var el = e.selector;
        var value = Number(el.text());
        this.month = value;
        this.monthEl.text(this.month + this.lang[this.language]['month']);
        this._renderBox();
        this.dateBoxEl.hide();
    },
    _onClearButtonClick : function(e) {
        this.value = '';
        e.value = this.value;
        this._fire('onclear', e);
    },
    _onTodayButtonClick : function(e) {
        this.value = '';
        this._updateDatePicker();
        this._getDate(0);
        e.value = this.value;
        this._fire('ontoday', e);
    },
    _onSureButtonClick : function(e) {
        this._getDate(0);
        e.value = this.value;
        this._fire('onsure', e);
    },
    _onPrevYearClick : function(e) {
        this.year -= 1;
        this.yearEl.text(this.year + this.lang[this.language]['year']);
        this._renderBox();
    },
    _onNextYearClick : function(e) {
        this.year += 1;
        this.yearEl.text(this.year + this.lang[this.language]['year']);
        this._renderBox();
    },
    _onPrevMonthClick : function(e) {
        if (this.month == 1) {
            this.year -= 1;
            this.month = 12;
            this.yearEl.text(this.year + this.lang[this.language]['year']);
        } else {
            this.month -= 1;
        }
        this.monthEl.text(this.month + this.lang[this.language]['month']);
        this._renderBox();
    },
    _onNextMonthClick : function(e) {
        if (this.month == 12) {
            this.month = 1;
            this.year += 1;
            this.yearEl.text(this.year + this.lang[this.language]['year']);
        } else {
            this.month += 1;
        }
        this.monthEl.text(this.month + this.lang[this.language]['month']);
        this._renderBox();
    },
    _onPrevMonthDayClick : function(e) {
        e.stopPropagation();
        var el = e.selector;
        this.day = el.attr("id").split("$")[2];
        this._getDate(-1);
        e.value = this.value;
        this._fire('ondayclick', e);
        if(this.showTime){
            this._renderBox();
        }
    },
    _onCurrentMonthDayClick : function(e) {
        e.stopPropagation();
        var el = e.selector;
        this.day = el.attr("id").split("$")[2];
        this._getDate(0);
        e.value = this.value;
        this._fire('ondayclick', e);
        if(this.showTime){
            this._renderBox();
        }
    },
    _onNextMonthDayClick : function(e) {
        e.stopPropagation();
        var el = e.selector;
        this.day = el.attr("id").split("$")[2];
        this._getDate(1);
        e.value = this.value;
        this._fire('ondayclick', e);
        if(this.showTime){
            this._renderBox();
        }
    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ['format', 'value', 'language'],
            boolean: []
        }, attributes);
        return boot.DatePicker.superClass._getAttrs.call(this, attrs);
    }
});

boot.Register(boot.DatePicker, 'datepicker');
