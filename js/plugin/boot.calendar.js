/**
 * 田鑫龙
 */
boot.Calendar = function(id){
	boot.Calendar.superClass.constructor.call(this, id);
	this.format="yyyy-mm-dd hh:mi";
};

boot.extend(boot.Calendar, boot.DatePicker, {
	uiCls: "boot-calendar",
    type: "calendar",
    _initField: function(){
        boot.Calendar.superClass._initField.call(this);
        this.workTime = this.workTime || [9, 6];
        this.dateField = this.dateField || "date";
        this.todayDateTime = boot.formatDate("yyyy-mm-dd", new Date());
    },
	_create: function(){
		boot.Calendar.superClass._create.call(this);
		this.el.css({
			"width": 960,
			"left": "50%",
			"margin-left": -480
		});
		this.viewEl.css("width", "auto");
		this.bottomEl.hide();
		this._createPrompt();
	},
	_load: function(){
		boot.ajax({
			url: this.loadUrl,
			type: 'post',
			dataType: 'json',
			data: {
				"entityBean.startTime": this._startDateTime,
				"entityBean.endTime": this._endDateTime
			},
			context: this,
			success: this._loadSuccess
		})
	},
	_loadSuccess: function(result){
		if(result.success){
			var data = result.resultData;
			this._setHolidayAndRest(data.holiday, data.rest);
			var list = data.task || [];
			for(var i=0,len=list.length;i<len;i++){
				var task = list[i];
				this._renderTask(task.startTime, task.endTime, task.content);
			}
		}
	},
    _createPrompt: function(){
    	this.startEl = boot.newId();
    	this.endEl = boot.newId();
    	this.textEl = boot.newId();
    	var html = '<div class="calendar-prompt">';
    	html += '<table style="margin: auto">';
    	html += '<tr>';
    	html += '<td colspan="4" style="height: 40px;line-height: 40px;font-weight: bold;font-size: 13px;">日程安排：</td>';
    	html += '</tr>';
    	html += '<tr>';
    	html += '<td style="font-size: 12px;text-align: right;width: 40px;">时间：</td>';
    	html += '<td><input id="'+ this.startEl +'" class="boot-date" height="20" width="135" format="yyyy-mm-dd hh:mi" showTime="true" onlyTime="'+ this.onlyToday +'"/></td>';
    	html += '<td style="font-size: 12px;">至</td>';
    	html += '<td><input id="'+ this.endEl +'" class="boot-date" height="20" width="135" format="yyyy-mm-dd hh:mi" showTime="true" onlyTime="'+ this.onlyToday +'"/></td>';
    	html += '</tr>';
    	html += '<tr>';
    	html += '<td style="font-size: 12px;text-align: right;width: 40px;">备注：</td>';
    	html += '<td colspan="3"><div id="'+ this.textEl +'" class="boot-textarea" width="290" height="60"></div></td>';
    	html += '</tr>';
    	html += '<tr>';
    	html += '<td colspan="4" style="text-align: center;height: 40px;line-height: 40px;"><input type="button" class="sure" style="border: solid 1px #333;width: 50px;height: 20px;margin: 0 10px;" value="确定"/><input type="button" class="close" style="border: solid 1px #333;width: 50px;height: 20px;margin: 0 10px;" value="取消"/></td>';
    	html += '</tr>';
    	html += '</table>';
    	html += '</div>';
    	var prompt = jQuery('<div class="calendar-prompt" style="background-color: #fff;position: fixed;height: 180px;top: -310px;width: 360px;left: 50%;margin-left: -180px;border-width: 1px;border-style: solid;"></div>');
    	prompt.html(html);
    	prompt.appendTo(this.el);
    	boot.parseByParent(this.el);
    	
    	this.startEl = boot.get(this.startEl);
    	this.endEl = boot.get(this.endEl);
    	this.textEl = boot.get(this.textEl);
    	
    	this.promptEl = prompt;
    },
    _renderTask: function(startTime, endTime, text){
    	var start = boot.formatDate(this.format, startTime, true);
    	var end = boot.formatDate(this.format, endTime, true);
    	
    	var selector = "#datepicker\\$" + (start.getMonth() + 1) + '\\$' + start.getDate();
    	var startDay = jQuery(selector, this.viewEl);
    	var count = end.getDate() - start.getDate();
    	
    	if(count === 0) {
    		var range = start.getHours() + ':' + start.getMinutes() + '-' +  end.getHours() + ':' + end.getMinutes();
    		startDay.append(this._createTask(range + '  ' + text));
    	}else {
    		var range = start.getHours() + ':' + start.getMinutes() + '-' +  this.workTime[1] + ':00';
    		startDay.append(this._createTask(range + '  ' + text));
    		if(count > 1){
    			for (var i = 1; i < count; i++) {
    				range = this.workTime[0] + ':00-' + this.workTime[1] + ':00';
    				selector = "#datepicker\\$" + (start.getMonth() + 1) + '\\$' + (start.getDate() + i);
        			jQuery(selector, this.viewEl).append(this._createTask(range + '  ' + text));
    			}
    		}
    		range = this.workTime[0] + ':00-' + end.getHours() + ':' + end.getMinutes();
    		selector = "#datepicker\\$" + (start.getMonth() + 1) + '\\$' + (start.getDate() + count);
    		jQuery(selector, this.viewEl).append(this._createTask(range + '  ' + text));
    	}
    },
    _createTask: function(text){
    	var html = '<div class="task" style="font-size: 12px;text-align: left;margin: 1px;border-radius: 4px;color: #FFF;">';
    	html += '<div class="text" style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;width: 100%;cursor: pointer;" title="'+ text +'">'+ text +'</div>';
    	html += '<div class="remove"></div>';
    	html += '</div>';
    	return html;
    },
    _setDayEnabled: function(day, fixed){
    	var year = this.yearEl.text().replace("年", '');
    	var month = this.monthEl.text().replace("月", '');
    	var cur = year + '-' + (Number(month) + fixed) + '-' + day;
    	if(boot.formatDate("yyyy-mm-dd", cur) >= this.todayDateTime){
    		return " calendarEvent";
    	}
    	return " disabled";
    },
    _setHolidayAndRest: function(holiday, rest){
    	for (var i = 0, len = holiday.length; i < len; i++) {
			var date = boot.formatDate("yyyy-mm-dd", holiday[i][this.dateField], true);
			var selector = "#datepicker\\$" + (date.getMonth() + 1) + "\\$" + date.getDate();
			jQuery(selector, this.viewEl).removeClass(" calendarEvent").addClass(" disabled holiday");
		}
		for (var i = 0, len = rest.length; i < len; i++) {
			var date = boot.formatDate("yyyy-mm-dd", rest[i].date, true);
			var selector = "#datepicker\\$" + (date.getMonth() + 1) + "\\$" + date.getDate();
			jQuery(selector, this.viewEl).removeClass(" calendarEvent").addClass("disabled rest");
		}
    },
    _bindEvents : function() {
    	boot.Calendar.superClass._bindEvents.call(this);
    	this._on(this.viewEl, '.day', 'dblclick', this._onDayDBLClick, this);
    	this._on(this.el, '.close', 'click', this._onCloseButtonClick, this);
    	this._on(this.el, '.sure', 'click', this._onSureButtonClick, this);
    },
    _onDayDBLClick: function(e){
//    	var today = new Date().getTime();
//    	var date = boot.formatDate(this.format, this.value, true);
//    	if(today > date.getTime()){
//    		return;
//    	}
//    	
    	this.startEl.setValue(this.value);
    	this.endEl.setValue(this.value);
    	this.promptEl.animate({
    		top: -1
    	});
    },
    _onCloseButtonClick: function(e){
    	this._close();
    },
    _onSureButtonClick: function(e){
    	var startTime = this.startEl.getValue();
    	var endTime = this.endEl.getValue();
    	var text = this.textEl.getValue();
    	boot.ajax({
			url : this.addUrl,
			context : this,
			dataType: 'json',
			type: 'post',
			data : {
				"entityBean.startTime" : startTime,
				"entityBean.endTime" : endTime,
				"entityBean.content" : text
			},
			success: function(result){
				if(result.success){
			    	this._renderTask(startTime, endTime, text);
			    	this._close();
				}
			}
		});
    },
    _close: function(){
    	this.startEl.setValue("");
    	this.endEl.setValue("");
    	this.textEl.setValue("");
    	this.promptEl.animate({
    		top: -200
    	});
    },
    _getAttrs: function(attributes){
        var attrs = boot.concat({
            str: ["loadUrl", "addUrl", "removeUrl", "dateField"],
            bool: ["onlyToday"],
            json: ["workTime"]
        }, attributes || {});
        return boot.Calendar.superClass._getAttrs.call(this, attrs);
    }
});

boot.Register(boot.Calendar, "calendar");