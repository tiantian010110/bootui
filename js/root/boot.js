/**
 * @author 田鑫龙
 */
var boot = {
	isDate : function(value) {
		return !!(value && value.getTime);
	},
	isArray : function(value) {
		return !!(value && !!value.push);
	},
	isNull : function(value) {
		return value === null || value === undefined;
	},

	isNumber : function(value) {
		return !isNaN(value) && typeof value == 'number';
	},
	formatDate : function(format, time, returnDate) {
		if (time == undefined || time == '') {
			return "";
		}
		if (window.jQuery.type(time) == 'string') {
			time = time.replace(/T/i, " ");// 针对date类型查询时间带T
			time = time.replace(/\.\d+/i, "");// 针对IE 对应数据库datetime
			time = time.replace(/-/g, "/");
			var _T = time.split(" ");
			var _d = _T[0], _t = _T[1];
			if (/:/.test(_d)) {
				_d = undefined;
				_t = _T[0];
			}
			var __D = new Date();
			if (_t && _d) {
				var _ds = _d.split("/"), _ts = _t.split(":");
				time = new Date(Number(_ds[0] || __D.getFullYear()), Number(_ds[1] ? _ds[1] - 1 : __D.getMonth()), Number(_ds[2] || __D.getDate()),
						Number(_ts[0] || __D.getHours()), Number(_ts[1] || __D.getMinutes()), Number(_ts[2] || __D.getSeconds()));
			} else if (_d) {
				var _ds = _d.split("/");
				time = new Date(Number(_ds[0] || __D.getFullYear()), Number(_ds[1] ? _ds[1] - 1 : __D.getMonth()), Number(_ds[2] || __D.getDate()), 0, 0, 0);
			} else if (_t) {
				var _ts = _t.split(":");
				time = new Date(__D.getFullYear(), __D.getMonth(), __D.getDate(), Number(_ts[0] || __D.getHours()), Number(_ts[1] || __D.getMinutes()), Number(_ts[2]
						|| __D.getSeconds()));
			}

			if (returnDate) {
				return time;
			}
		}
		var Week = [ '日', '一', '二', '三', '四', '五', '六' ];
		format = format.replace(/YYYY/i, time.getFullYear());
		format = format.replace(/YY/i, (time.getYear() % 100) > 9 ? (time.getYear() % 100).toString() : '0' + (time.getYear() % 100));
		format = format.replace(/MM/i, (time.getMonth() + 1) > 9 ? (time.getMonth() + 1).toString() : '0' + (time.getMonth() + 1));
		format = format.replace(/W/g, Week[time.getDay()]);
		format = format.replace(/DD/i, time.getDate() > 9 ? time.getDate().toString() : '0' + time.getDate());
		format = format.replace(/HH/i, time.getHours() > 9 ? time.getHours().toString() : '0' + time.getHours());
		format = format.replace(/MI/i, time.getMinutes() > 9 ? time.getMinutes().toString() : '0' + time.getMinutes());
		format = format.replace(/SS/i, time.getSeconds() > 9 ? time.getSeconds().toString() : '0' + time.getSeconds());
		return format;
	},
	formatDecimal : function(number, formatFixed) {
		if (formatFixed === undefined) {
			formatFixed = "2";
		}
		if(jQuery.type(formatFixed) == 'string')
			formatFixed = Number(formatFixed.replace(/[a-zA-Z]/g, ''));
		// 格式化方法
		function _splitByGroup(str) {
			var len = str.length, array = [], start = 0, end = len % 3, step = Math.ceil(len / 3);

			for (var i = 0; i <= step; i++) {
				var subStr = str.substring(start, end);
				if (subStr != '')
					array.push(subStr);
				start = end;
				end = start + 3;
			}
			return array.join(',') || "0";
		}

		number = String(number) || "";
		var clearRegExp = /\D*/ig, empty = '';
		var minus = /\-/.test(number) ? -1 : 1;
		var numbers = number.split('.'), number0 = numbers[0].replace(clearRegExp, empty), number1 = (numbers[1] || "").replace(clearRegExp, empty);

		number0 = _splitByGroup(number0);
		number1 = (Number(number1) * Math.pow(0.1, number1.length)).toFixed(formatFixed) * Math.pow(10, formatFixed);
		number1 = parseInt(number1 || 0);

		if (number1 == 0) {
			number1 = new Array(formatFixed + 1).join("0");
		}else {
			if(number1 < 10 && formatFixed >= 2){
				number1 = new Array(formatFixed).join("0") + number1;
			}
		}

		if (formatFixed == 0) {
			number = number0;
		} else {
			number = number0 + "." + number1;
		}
		return number;
	},
	UUID : {
		random : function(len, radix) {
			var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
			var chars = CHARS, uuid = [], i;
			radix = radix || chars.length;
			if (len) {
				for (i = 0; i < len; i++)
					uuid[i] = chars[0 | Math.random() * radix];
			} else {
				var r;
				uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
				uuid[14] = '4';
				for (i = 0; i < 36; i++) {
					if (!uuid[i]) {
						r = 0 | Math.random() * 16;
						uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
					}
				}
			}
			return uuid.join('');
		}
	},

    /**
	 * 把数组转换成树形结构数据
	 * 
	 * @param resource：源数据
	 * @param idField：主键字段
	 * @param parentidField：父id字段
	 */
    _makeTreeData : function(resource, idField, parentidField, childrenField) {
    	var list = boot.clone(resource);
        var maps = {}, ListInMap = [];
        // 描述：将传入的json数据按{parentid:data}形式整理
        for (var i = 0, len = list.length; i < len; i++) {
            var node = list[i];
            node["_uuid"] = node["_uuid"] || boot.newId();// 追加UUID
            resource[i]["_uuid"] = node["_uuid"];// 原始数据追加UUID
            node[childrenField] = [];
            // 初始化children数组
            var parentid = node[parentidField];
            parentid = parentid == null ? '' : parentid;
            if (!maps[parentid]) {// parentid不存在就初始化
                maps[parentid] = [];
            }
            maps[parentid].push(node);
        }
      // 从maps中拿出第一个数组
        ListInMap = maps[''] || maps['null'];
        function recursion(children_list, level) {
            for (var i = 0, len = children_list.length; i < len; i++) {
                var node = children_list[i];
                var child = maps[node[idField]];
                child = child ? child : [];
                node[childrenField] = child;
                recursion(child, level++);
            }
        };
        if(ListInMap == undefined){
        	return list;
        }
        // 描述：将整理好的maps循环递归调用recursion方法
        for (var i = 0, len = ListInMap.length; i < len; i++) {
            var node = ListInMap[i];
            var child = maps[node[idField]];
            // 将在maps中找到的id与当前节点的parentid相同的节点放入chidren数组中
            child = child ? child : [];
            node[childrenField] = child;
            recursion(child, 1);
        }
        return ListInMap;
    }
};
/*------------类继承--------------*/
boot.extend = function(subFun, superFun, prototype) {
	var superClass = function() {
	};
	superClass.prototype = superFun.prototype;

	superClass.constructor = superFun.constructor;
	superClass.prototype.constructor = superFun;
	subFun.prototype = new superClass();
	subFun.prototype.constructor = subFun;
	if (prototype) {
		for ( var key in prototype) {
			subFun.prototype[key] = prototype[key];
		}
	}
	subFun.superClass = superFun.prototype;
	// 如果父类superclass.prototype.constructor没有被自定义，则自定义
	if (superFun.prototype.constructor == Object.prototype.constructor) {
		superFun.prototype.constructor = superFun;
	}
};

/*--------------newId----------------*/
boot._index = 0;
boot.newId = function(prefix) {
	prefix = prefix || 'boot';
	var id = prefix + '-' + this._index++;
	return id;
};
boot._uuid = boot.newId();

/*------------------组建寄存器---------------------*/
boot.components = {};
boot.bindings = {};
boot.Deposit = function(id, comp) {
	var storage = boot.components;
	if (boot.Binding && comp instanceof boot.Binding) {
		storage = boot.bindings;
	}
	if (!storage[id]) {
		storage[id] = comp;
	} else {
		alert(id + '只能注册一次!');
	}
};

/*------------------组建销毁--------------------*/
boot.Destroy = function(id) {
	if (this.components[id]) {
		delete this.components[id];
	} else if (this.bindings[id]) {
		delete this.bindings[id];
	}
};

/*------------------注册中心---------------------*/
boot.registers = {};
boot.Register = function(bean, uiType) {
	if (!this.registers[uiType]) {
		this.registers[uiType] = bean;
		bean.prototype.type = uiType;
	} else {
		alert(uiType + ' 只能注册一次!');
	}
};

/*-------------------通过id属性提取注册的组件--------------------*/
boot.get = function(id) {
	if (this.components[id]) {
		return this.components[id];
	} else if (this.bindings[id]) {
		return this.bindings[id];
	}
};

/*-------------------通过name属性提取注册的组件--------------------*/
boot.getByName = function(name, parent) {
	var rs = boot.components;
	if (parent) {
		var _uuid = parent._uuid;
		rs = boot.relationship[_uuid] || [];
	}
	for ( var index in rs) {
		var comp = rs[index];
		if (comp.name == name) {
			return comp;
		}
	}
};

/*-------------------html转换成组件--------------------*/
boot.parse = function(id) {
	if (id) {
		var jQel = jQuery('#' + id);
		if (jQel[0]) {
			boot.__parse(jQel[0]);
		}
	} else {
		if (this._firstParse !== true) {
			boot._firstParse = true;
			var els = jQuery('*[class*="boot-"]');
			els.each(function(index, el) {
				boot.__parse(el);
			});
			els = null;
		}
	}

};
boot.__parse = function(el) {
	var id = el.id;
	if (id != undefined && id != '') {
		if (boot.get(id)) {
			return false;
		}
	}
	var allCls = el.className || "";
	var clses = allCls.split(' ');
	for (var i = 0, length = clses.length; i < length; i++) {
		var cls = clses[i];
		var uiCls = cls.replace('boot-', '');
		if (/boot-/.test(cls) && boot.registers[uiCls]) {
			var bean = boot.registers[uiCls];
			if (id == '' || id == undefined) {
				id = boot.newId();
				el.id = id;
			}
			var instance = new bean(jQuery(el));
			boot.Deposit(id, instance);
			break;
		}
	}
};

/*--------------通过父元素转换子元素组件---------------*/
boot.parseByParent = function(parent) {
	var els = jQuery('*[class*="boot-"]', parent);
	els.each(function(index, el) {
		boot.__parse(el);
	});

};
/*-------------------ajax异步请求--------------------*/
boot.ajax = function(options) {
	var _default = {
		dataType : 'json',
		timeout : 120000,
		success : function(result) {
			alert(result.message);
		},
		error : function(e) {
			window.console && console.log(e);
		},
		complate: function(){
			this.isLoading = false;
		}
	};
	_default = jQuery.extend(true, _default, options);
	// ajax的请求永远被默认为post请求和无缓存
	_default.type = 'post';
	_default.cache = false;
	// ajax的beforeSend事件，返回false阻止ajax运行
	if (_default.before && jQuery.type(_default.before) === 'function') {
		_default.beforeSend = options.before;
		delete _default.before;
	}
	// ajax的完成事件，无论请求结果怎样都会执行
	if (_default.after && jQuery.type(_default.before) === 'function') {
		_default.complete = options.after;
		delete _default.after;
	}
	jQuery.ajax(_default);
};

/*------------克隆数据---------------*/
boot.clone = function(target) {
	return eval("(" + JSON.stringify(target) + ")");
};

/*----------------------------------------------*/
boot.addPrefix = function(data, prefix) {
	var result = {};
	if (jQuery.type(data) == 'array') {
		for (var i = 0, len = data.length; i < len; i++) {
			var row = data[i];
			for ( var key in row) {
				result[prefix + "[" + i + "]." + key] = row[key];
			}
		}
	} else {
		if (prefix == undefined) {
			prefix = "";
		} else {
			prefix = prefix + ".";
		}
		for ( var key in data) {
			result[prefix + key] = data[key];
		}
	}
	return result;
};

/** ---------------------遮蔽层-------------------------* */

boot.Modal = function(parent) {
	this.id = boot.newId();
	this._create(parent);
};

boot.Modal.prototype = {
	_create : function(parent) {
		this.el = jQuery('<div id="' + this.id + '" class="boot-modal" style="display: none;"></div>');
		this.bgEl = jQuery('<div class="modal-background"></div>');
		this.textEl = jQuery('<div class="modal-text modal-loading">加载中...</div>');

		this.bgEl.appendTo(this.el);
		this.textEl.appendTo(this.el);

		if (parent instanceof jQuery) {
			this.el.appendTo(parent);
		} else {
			parent.appendChild(this.el[0]);
		}
	},
	_show : function() {
		this.el.show();
		this._update();
	},
	_hide : function() {
		this.el.hide();
	},
	_setText : function(text) {
		this.textEl.text(text);
	},
	_hideLoadingText : function() {
		this.textEl.hide();
	},
	_setCss : function(css) {
		this.el.css(css);
	},
	_update : function() {
		var width = this.textEl.outerWidth();
		var height = this.textEl.outerHeight();
		this.textEl.css({
			"margin-left" : -width / 2,
			"margin-top" : -height / 2
		});
	},
	show : function() {
		this._show();
	},
	hide : function() {
		this._hide();
	}
};

/*----------------------合并对象的方法----------------------------*/
// 对象的合并方法，支持无限参数合并到第一个对象
boot.concat = function() {
	var concat = function(source, target) {
		for ( var key in target) {
			var value = target[key];
			if (jQuery.type(value) == "array") {
				var sourceValue = source[key] = source[key] || [];
				concat(sourceValue, value);
			} else if (jQuery.type(value) == "object") {
				var sourceValue = source[key] = source[key] || {};
				concat(sourceValue, value);
			} else {
				if (jQuery.type(source) == "array") {
					source.push(value);
				} else {
					source[key] = value;
				}
			}
		}
		return source;
	};

	try {
		if (arguments.length === 0) {
			throw "没有足够的参数!";
		}
		if (arguments.length === 1) {
			throw "没有足够的参数,请输入两个或以上参数!";
		}
		var subObject = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			var targetObject = arguments[i];
			concat(subObject, targetObject);
		}
		return subObject;
	} catch (ex) {
		alert(ex);
		window.console && console.error(ex);
	}
};

/** -------------------查找子元素----------------------* */
// 记录各个组件之间的关系，例如：form下的各种组件
boot.relationship = {};
boot.findChildComponents = function() {
	var controls = [];
	for ( var key in boot.components) {
		var component = boot.components[key];
		var el = component.el;
		var parent = el.parents("#" + this.id);
		if (parent[0] != undefined) {
			controls.push(component);
		}
	}
	boot.relationship[this._uuid] = controls;
};

/*----------------转换属性-----------------*/
boot._getBasicAttrs = function(el, attrs) {
	attrs = attrs || {};
	var num = boot._parseNumber(el, attrs.number || []);
	var str = boot._parseString(el, attrs.str || []);
	var bool = boot._parseBool(el, attrs.bool || []);
	var json = boot._parseJSON(el, attrs.json || []);

	var o = {};
	o = boot.concat(o, str, bool, num, json);
	return o;
};
boot._parseString = function(el, attrs) {
	return this._parseProperty(el, attrs, "string");
};
boot._parseBool = function(el, attrs) {
	return this._parseProperty(el, attrs, "boolean");
};
boot._parseNumber = function(el, attrs) {
	return this._parseProperty(el, attrs, "number");
};
boot._parseEvent = function(el, attrs) {
	return this._parseProperty(el, attrs, "event");
};
boot._parseJSON = function(el, attrs) {
	return this._parseProperty(el, attrs, "json");
};
boot._parseProperty = function(el, attrs, type) {
	var config = {};
	for (var i = 0, l = attrs.length; i < l; i++) {
		var property = attrs[i];
		var value = el.attr(property);
		if (value) {
			switch (type) {
			case 'string':
				config[property] = value;
				break;
			case 'boolean':
				config[property] = (value == "true" || value === property) ? true : false;
				break;
			case 'json':
				config[property] = eval("(" + value + ")");
				break;
			case 'number':
				config[property] = Number(value.replace(/px/i, ""));
				break;
			case 'event':
				config[property] = (function(_fn) {
					return function(e) {
						var fn = eval(_fn);
						if (jQuery.type(fn) == 'function') {
							return fn.call(this, e);
						}
					};
				})(value);
				break;
			}
			el.removeAttr(property);
		}
	}
	return config;
};
/** **********HTML处理器************* */
boot.HTML = function(html) {
	this.array = [];
	this.push(html);
};
boot.HTML.prototype = {
	push : function(html) {
		if (html && html != '') {
			if (html instanceof boot.HTML) {
				this.array = this.array.concat(html.array);
			} else if (jQuery.isArray(html)) {
				this.array = this.array.concat(html);
			} else {
				this.array.push(html);
			}
		}
	},
	concat : function(split) {
		split = split || "";
		return this.array.join(split);
	},
	empty : function() {
		this.array = [];
	},
	isEmpty : function() {
		return !Boolean(this.array.length);
	}
};

/*---------------Rooter-----------------*/
boot.Rooter = function(el) {
	this.events = {};
	this._uuid = boot.newId();
	this._init(el);
	this._getAttrs();
	this._initField();
	this._create();
	this._resetProperty();
	this._getBox();
	this._bindEvents();
	this._documentEvent();
};

boot.Rooter.prototype = {
	uiCls : "",
	_initField : function() {
	},
	_create : function() {

	},
	_resetProperty : function() {
		// 还原id属性
		this.el.attr("id", this.id);
		this.el.addClass(this.uiCls);
		this.el.addClass(this['class']);
		var style = this.el.attr("style") || "";
		if (style != "") {
			style += ";" + (this.style || "");
		} else {
			style = this.style || "";
		}
		if (style != "")
			this.el.attr("style", style);
	},
	_init : function(el) {
		if (jQuery.type(el) === 'string') {
			this.id = el;
			this.el = jQuery('#' + this.id);
		} else {
			this.el = el;
			this.id = el[0].id;
		}
	},
	// el支持dom元素和jQuery对象, 此方法是用来获取dom元素的位置信息包括offset和width、height
	_getBox : function(el) {
		el = el || this.el;
		if (el) {
			if (/HTML\w+ELEMENT/.test(el.constructor.name)) {
				el = jQuery(el);
			} else if (el.isControl) {
				el = jQuery(el.el);
			}
		}
		var box = el.offset();
		box.width = el.outerWidth();
		box.height = el.outerHeight();
		return box;
	},
	_triggerHandler : function(e) {
		var event = new boot.Event(e);
		event._execute();
	},
	_on : function(el, selector, eventType, fn, sender) {
		var ev = {
			sender : sender || this,
			source : sender || this,
			handler : fn,
			eventType : eventType
		};
		el.delegate(selector, eventType, ev, this._triggerHandler);
	},
	_bindEvents : function() {

	},
	_bind : function(type, fn, scope) {
		scope = scope || this;
		type = type.toLowerCase();
		if (/^on/.test(type) == false)
			type = "on" + type;
		var handlers = this.events[type] = this.events[type] || [];
		handlers.push([ fn, scope ]);
	},
	// 触发通过bind方法或属性自定义方法绑定的数据
	_fire : function(type, ev) {
		if (!/^on/.test(type)) {
			type = "on" + type;
		}
		var events = this.events[type] || [];
		for (var i = 0, length = events.length; i < length; i++) {
			var event = events[i];
			event[0].call(event[1], ev);
		}
	},
	_evalEvents : function(fns) {
		for ( var type in fns) {
			this._bind(type, fns[type], this);
		}
	},
	_documentEvent : function() {
		var me = this;
		jQuery(document.body).on('click', function(e) {
			var event = new boot.Event(e);
			event._execute();
			me._fire('onbodyclick', event);
		});
	},
	_getAttrs : function(attrs) {
		attrs = boot.concat({
			str : [ "id", "class", "style" ],
			json : [ "customOptions" ]
		}, attrs || {});
		var str = boot._parseString(this.el, attrs.str || []);
		var bool = boot._parseBool(this.el, attrs.bool || []);
		var json = boot._parseJSON(this.el, attrs.json || []);
		var num = boot._parseNumber(this.el, attrs.number || []);
		var fn = boot._parseEvent(this.el, attrs.fn || []);
		this._evalEvents(fn);

		var o = {};
		o = boot.concat(o, str, bool, num, json);
		boot.concat(this, o);
		o = boot.concat(o, fn);
		return o;
	},
	// API
	bind : function(type, fn, scope) {
		this._bind(type, fn, scope);
	}
};

/*---------------Event-----------------*/
boot.Event = function(e, options) {
	this.event = e.originalEvent || e;
	this.jQueryEvent = e;
	this.target = jQuery(e.target);
	this.selector = jQuery(e.currentTarget);
	this._appendOptions(boot.concat(e.data, options || {}));
};

boot.Event.prototype = {
	_execute : function() {
		if (this.handler)
			this.handler.call(this.sender, this);
	},
	_appendOptions : function(options) {
		for ( var key in options) {
			this[key] = options[key];
		}
	},
	preventDefault : function() {
		this.jQueryEvent.preventDefault();
	},
	stopPropagation : function() {
		this.jQueryEvent.stopPropagation();
	}
};

/** ---------------dialog------------------------* */
// 弹出窗口
boot.dialog = function(options) {
	return new boot.Window(options);
};

/** -----------------vType----------------------* */
boot.VTypes = {
	required : function(v, args) {
		if (boot.isNull(v) || v === "")
			return true;
		return false;
	},
	email : function(v) {
		if (this.required(v))
			return true;
		if (v.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1)
			return true;
		else
			return false;
	},
	url : function(v) {
		if (this.required(v))
			return true;
		function IsURL(str_url) {
			str_url = str_url.toLowerCase().split("?")[0];
			var strRegex = "^((https|http|ftp|rtsp|mms)?:\/\/)" + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + "(([0-9]{1,3}\.){3}[0-9]{1,3}" + "|"
					+ "([0-9a-z_!~*'()-]+\.)*" + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." + "[a-z]{2,6})" + "(:[0-9]{1,5})?" + "((/?)|" + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
			var re = new RegExp(strRegex);

			if (re.test(str_url)) {
				return (true);
			} else {
				return (false);
			}
		}

		return IsURL(v);
	},
	"int" : function(v) {
		if (this.required(v))
			return true;
		function isInteger(s) {
			if (s < 0) {
				s = -s;
			}
			var n = String(s);
			return n.length > 0 && !(/[^0-9]/).test(n);
		}

		return isInteger(v);
	},
	"float" : function(v) {
		if (this.required(v))
			return true;
		function isFloat(s) {
			if (s < 0) {
				s = -s;
			}
			var n = String(s);
			if (n.split(".").length > 2)
				return false;
			return n.length > 0 && !(/[^0-9.]/).test(n);
		}

		return isFloat(v);
	},
	date : function(v, args) {
		if (this.required(v))
			return true;
		if (!v)
			return false;
		var d = null;
		var format = args[0];

		if (format) {
			d = boot.parseDate(v, format);
			if (d && d.getFullYear) {
				if (boot.formatDate(d, format) == v)
					return true;
			}
		} else {
			d = boot.parseDate(v, "yyyy-MM-dd");
			if (!d)
				d = boot.parseDate(v, "yyyy/MM/dd");
			if (!d)
				d = boot.parseDate(v, "MM/dd/yyyy");
			if (d && d.getFullYear)
				return true;
		}

		return false;
	}
};
/*-----------------------layout-------------------------*/
/**
 * @author 田鑫龙
 */
boot.Layout = function(id) {
	this.layoutAttrs = {
		head : {
			visible : true
		},
		foot : {
			visible : true
		},
		left : {
			visible : true
		},
		right : {
			visible : true
		}
	};
	boot.Layout.superClass.constructor.call(this, id);
	this._getLayoutAttrs();
	this._doLayout();
	this.el.css("visibility", 'visible');
};

boot.extend(boot.Layout, boot.Rooter, {
	uiCls : "boot-layout",
	type : "layout",
	_initField : function() {
		this.splitSize = this.splitSize || 0;
	},
	_create : function() {
		this.el.attr("id", this.id);
		this._createHead();
		this._createMiddle();
		this._createLeft();
		this._createCenter();
		this._createRight();
		this._createFoot();
	},
	_doLayout : function() {
		var top = 0, bottom = 0, left = 0, right = 0;
		if (this.headEl[0]) {
			var headAttrs = this.layoutAttrs["head"];
			if (headAttrs.visible === false || headAttrs.height == 0) {
				top = 0;
				this.headEl.css({
					border : 'none',
					height : 0
				});
			} else {
				top = headAttrs.height || 60;
			}
			this.headEl.css("height", top);
		}
		if (this.footEl[0]) {
			var footAttrs = this.layoutAttrs["foot"];
			if (footAttrs.visible === false || footAttrs.height == 0) {
				bottom = 0;
				this.footEl.css({
					border : 'none',
					height : 0
				});
			} else {
				bottom = footAttrs.height || 60;
			}
			this.footEl.css("height", bottom);
		}
		if (this.leftEl[0]) {
			var leftAttrs = this.layoutAttrs["left"];
			if (leftAttrs.visible === false || leftAttrs.width == 0) {
				left = 0;
				this.leftEl.css({
					"width" : left,
					"border" : "none"
				});
			} else {
				left = leftAttrs.width || 120;
				this.leftEl.css("width", left);
				left += this.splitSize;
			}
		}
		if (this.rightEl[0]) {
			var rightAttrs = this.layoutAttrs["right"];
			if (rightAttrs.visible === false || leftAttrs.width == 0) {
				right = 0;
				this.rightEl.css({
					"width" : right,
					"border" : "none"
				});
			} else {
				right = rightAttrs.width || 100;
				this.rightEl.css("width", right);
				right += this.splitSize;
			}
		}
		this.middleEl.css({
			top : top,
			bottom : bottom
		});
		this.centerEl.css({
			'margin-left' : left,
			"margin-right" : right
		});
	},
	_createHead : function() {
		this.headEl = this.el.children(".layout-head") || jQuery(".layout-head", this.el);
	},
	_createMiddle : function() {
		this.middleEl = this.el.children(".layout-middle") || jQuery(".layout-middle", this.el);
	},
	_createFoot : function() {
		this.footEl = this.el.children(".layout-foot") || jQuery(".layout-foot", this.el);
	},
	_createLeft : function() {
		this.leftEl = this.middleEl.children(".layout-middle-left") || jQuery(".layout-middle-left", this.middleEl);
	},
	_createCenter : function() {
		this.centerEl = this.middleEl.children(".layout-middle-center") || jQuery(".layout-middle-center", this.middleEl);
	},
	_createRight : function() {
		this.rightEl = this.middleEl.children(".layout-middle-right") || jQuery(".layout-middle-right", this.middleEl);
	},
	_getLayoutAttrs : function() {
		this.layoutAttrs.head = boot._getBasicAttrs(this.headEl, {
			number : [ "height" ],
			bool : [ "visible" ]
		});
		this.layoutAttrs.left = boot._getBasicAttrs(this.leftEl, {
			number : [ "width" ],
			bool : [ "visible" ]
		});
		this.layoutAttrs.right = boot._getBasicAttrs(this.rightEl, {
			number : [ "width" ],
			bool : [ "visible" ]
		});
		this.layoutAttrs.foot = boot._getBasicAttrs(this.footEl, {
			number : [ "height" ],
			bool : [ "visible" ]
		});
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [],
			number : [ "width", "height", "splitSize" ],
			bool : [],
			css : [],
			fn : []
		}, attributes);

		return boot.Layout.superClass._getAttrs.call(this, attrs);
	}
});

boot.Register(boot.Layout, "layout");

/*-----------------------validate-------------------------*/
/**
 * @author 田鑫龙
 */
// 验证
boot.Validate = function() {
	this.numberErrorText = "不是正确的数字!";
	this.emailErrorText = "不是正确的邮件地址!";
	this.urlErrorText = "不是正确的网址!";
	this.mobileErrorText = "不是正确的手机号!";
	this.phoneErrorText = "不是正确的座机号!";
};

boot.Validate.prototype = {
	_isEmail : function() {
		if (this._isNull() || this._isEmpty())
			return true;
		return !/^([a-zA-Z0-9_])+([a-zA-Z0-9_\.\-])*\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(this.value);
	},
	_isUrl : function(v, args) {
		if (this._isNull() || this._isEmpty())
			return true;
		var value = this.value.toLowerCase().split("?")[0];
		var strRegex = "^((https|http|ftp|rtsp|mms)?:\/\/)" + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + "(([0-9]{1,3}\.){3}[0-9]{1,3}" + "|"
				+ "([0-9a-z_!~*'()-]+\.)*" + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." + "[a-z]{2,6})" + "(:[0-9]{1,5})?" + "((/?)|" + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
		var re = new RegExp(strRegex);
		return !re.test(value);
	},
	_isNull : function() {
		return this.value === null || this.value === undefined;
	},
	_isEmpty : function() {
		return String(this.value).replace(/(^\s*)|(\s*$)/g, "") === '';
	},
	_isNumber : function() {
		return !isNaN(this.value) && typeof this.value == 'number';
	},
	_isLess : function(value) {
		var result = Number(this.value) < Number(value);
		if (!result) {
			this.lessErrorText = "当前数值不应大于" + Number(value) + ", 请重新输入!";
		}
		return !result;
	},
	_isGreat : function(value) {
		var result = Number(this.value) > Number(value);
		if (!result) {
			this.lessErrorText = "当前数值不应小于" + Number(value) + ", 请重新输入!";
		}
		return !result;
	},
	_isMobile : function() {
		return !/^1\d{10}$/.test(this.value);
	},
	_isPhone : function() {
		return !/^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/.test(this.value);
	},
	_isLength : function(info) {// TODO
		var infos = info.split("-");
		var max = Number(infos[1] || infos[0]);
		var min = Number(infos[0] == max ? 0 : infos[0]);
		if (this.value.length <= max && this.value.length >= min) {
			return false;
		} else {
			this.lengthErrorText = "文本长度必须在" + min + "到" + max + "之间!";
			return true;
		}
	},
	_isRange : function(info) {// TODO
		var infos = info.split("-");
		var max = Number(infos[1] || infos[0]);
		var min = Number(infos[0] == max ? 0 : infos[0]);
		if (Number(this.value) <= max && Number(this.value) >= min) {
			return false;
		} else {
			this.rangeErrorText = "数值大小必须在" + min + "到" + max + "之间!";
			return true;
		}
	},
	_isIdentify : function() {
		/*
		 * 根据〖中华人民共和国国家标准 GB
		 * 11643-1999〗中有关公民身份号码的规定，公民身份号码是特征组合码，由十七位数字本体码和一位数字校验码组成。排列顺序从左至右依次为：六位数字地址码，八位数字出生日期码，三位数字顺序码和一位数字校验码。
		 * 地址码表示编码对象常住户口所在县(市、旗、区)的行政区划代码。
		 * 出生日期码表示编码对象出生的年、月、日，其中年份用四位数字表示，年、月、日之间不用分隔符。
		 * 顺序码表示同一地址码所标识的区域范围内，对同年、月、日出生的人员编定的顺序号。顺序码的奇数分给男性，偶数分给女性。
		 * 校验码是根据前面十七位数字码，按照ISO 7064:1983.MOD 11-2校验码计算出来的检验码。
		 * 
		 * 出生日期计算方法。 15位的身份证编码首先把出生年扩展为4位，简单的就是增加一个19或18,这样就包含了所有1800-1999年出生的人;
		 * 2000年后出生的肯定都是18位的了没有这个烦恼，至于1800年前出生的,那啥那时应该还没身份证号这个东东，⊙﹏⊙b汗...
		 * 下面是正则表达式: 出生日期1800-2099
		 * (18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01]) 身份证正则表达式
		 * /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i
		 * 15位校验规则 6位地址编码+6位出生日期+3位顺序号 18位校验规则 6位地址编码+8位出生日期+3位顺序号+1位校验位
		 * 
		 * 校验位规则 公式:∑(ai×Wi)(mod 11)……………………………………(1) 公式(1)中：
		 * i----表示号码字符从由至左包括校验码在内的位置序号； ai----表示第i位置上的号码字符值；
		 * Wi----示第i位置上的加权因子，其数值依据公式Wi=2^(n-1）(mod 11)计算得出。 i 18 17 16 15 14 13
		 * 12 11 10 9 8 7 6 5 4 3 2 1 Wi 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2 1
		 * 
		 */
		// 身份证号合法性验证
		// 支持15位和18位身份证号
		// 支持地址编码、出生日期、校验位验证
		var code = this.value;
		var city = {
			11 : "北京",
			12 : "天津",
			13 : "河北",
			14 : "山西",
			15 : "内蒙古",
			21 : "辽宁",
			22 : "吉林",
			23 : "黑龙江 ",
			31 : "上海",
			32 : "江苏",
			33 : "浙江",
			34 : "安徽",
			35 : "福建",
			36 : "江西",
			37 : "山东",
			41 : "河南",
			42 : "湖北 ",
			43 : "湖南",
			44 : "广东",
			45 : "广西",
			46 : "海南",
			50 : "重庆",
			51 : "四川",
			52 : "贵州",
			53 : "云南",
			54 : "西藏 ",
			61 : "陕西",
			62 : "甘肃",
			63 : "青海",
			64 : "宁夏",
			65 : "新疆",
			71 : "台湾",
			81 : "香港",
			82 : "澳门",
			91 : "国外 "
		};
		var tip = "";

		if (!code || !/^[1-9][0-9]{5}(19[0-9]{2}|20[0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[0-9]{3}[0-9xX]$/i.test(code)) {
			this.identifyErrorText = "身份证号格式错误";
			return true;
		}

		else if (!city[code.substr(0, 2)]) {
			this.identifyErrorText = "地址编码错误";
			return true;
		} else {
			// 18位身份证需要验证最后一位校验位
			if (code.length == 18) {
				code = code.split('');
				// ∑(ai×Wi)(mod 11)
				// 加权因子
				var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
				// 校验位
				var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
				var sum = 0;
				var ai = 0;
				var wi = 0;
				for (var i = 0; i < 17; i++) {
					ai = code[i];
					wi = factor[i];
					sum += ai * wi;
				}
				var last = parity[sum % 11];
				if (String(last).toLowerCase() != code[17].toLowerCase()) {
					this.identifyErrorText = "校验位错误";
					return true;
				}
			}
		}
	},
	getVFunction : function(vType) {// TODO
		if (vType != undefined || vType != '') {
			var _char = vType.charAt(0);
			_char = _char.toUpperCase();
			vType = vType.replace(/^\w/i, _char);
		}
		return '_is' + vType;
	},
	setVType : function(vType) {
		if (vType != undefined) {
			var vTypes = vType.split(",");
			for (var i = 0, len = vTypes.length; i < len; i++) {
				var vType = vTypes[i];
				var vTypeArray = vType.split(":");
				if (vTypeArray.length > 1) {
					vTypes[i] = {
						type : vTypeArray[0],
						value : vTypeArray[1]
					};
				} else {
					vTypes[i] = {
						type : vTypeArray[0]
					};
				}
			}
			this.vType = vTypes;
		}
	},
	setValue : function(value) {
		this.value = value || "";
	},
	setErrorText : function(text) {
		this.errorText = text;
	},
	setRequired : function(required) {
		this.required = required;
	},
	execute : function() {
		if (this.required) {
			if (this._isEmpty()) {
				return "不能为空!";
			}
		}
		if (this.vType != undefined && this.vType != '')
			for (var i = 0, len = this.vType.length; i < len; i++) {
				var item = this.vType[i];
				if (this.value != undefined && this.value != '') {
					if (this[this.getVFunction(item.type)](item.value))
						return this.errorText || this[item.type + 'ErrorText'];
				}
			}
		return "";
	}
};
/*------------------------binding------------------------*/
/**
 * @author 田鑫龙
 */
boot.Binding = function(arg1, arg2) {
	this.id = boot.newId();
	this._execute(arg1, arg2);
};

boot.Binding.prototype = {
	_execute : function(arg1, arg2) {
		var master = arg1;
		var slave = [];
		if (jQuery.type(arg1) == 'string') {
			master = boot.get(arg1);
		}
		if (jQuery.type(arg2) != 'array') {
			slave = arg2 == undefined ? [] : [ arg2 ];
		} else {
			slave = arg2;
		}

		master._binding = this.id;
		for (var i = 0, len = slave.length; i < len; i++) {
			slave[i]._binding = this.id;
		}

		this.master = master;
		this.slave = slave;
	},
	_validate : function() {
		this.master._validate();
		for (var i = 0, len = this.slave.length; i < len; i++) {
			var comp = boot.get(this.slave[i]);
			if (comp && comp._validate) {
				this.master.validateValue = comp._validate() && this.master.validateValue;
			}
		}
	},
	_getSubmitData : function() {// TODO 验证功能
		this.master._validate();
		var data = this.master._getData(true);
		for (var i = 0, len = this.slave.length; i < len; i++) {
			var comp = boot.get(this.slave[i]);
			if (comp) {
				this.master.validateValue = this.master.validateValue && comp._validate();
				if (!this.master.validateValue) {
					return {};
				}
				var changeds = comp._getMixData();
				boot.concat(data, boot.addPrefix(changeds, comp.savePrefix));
			}
		}
		return data;
	},
	_triggerQuery : function(parameters) {
		for (var i = 0, len = this.slave.length; i < len; i++) {
			var comp = boot.get(this.slave[i]);
			if (comp) {
				comp._setParameters(parameters);
				comp._setPageIndex();
				comp._load();
			}
		}
	},
	_triggerAdapt : function() {
		for (var i = 0, len = this.slave.length; i < len; i++) {
			var comp = boot.get(this.slave[i]);
			if (comp) {
				comp._adaptive && comp._adaptive();
			}
		}
	},
	_load : function(parameters) {
		this._triggerQuery(parameters);
	}
};

boot.getBinding = function(id, binding) {
	var instance = boot.get(id);
	if (instance instanceof boot.Binding) {
		return instance;
	} else {
		var bind = new boot.Binding(id, binding);
		boot.Deposit(bind.id, bind);
		return bind;
	}
};

/*-----------------------drag-------------------------*/
/**
 * 田鑫龙
 */
boot.DragDrop = function(id) {
	boot.DragDrop.superClass.constructor.call(this, id);
};

boot
		.extend(
				boot.DragDrop,
				boot.Rooter,
				{
					uiCls : "boot-dragdrop",
					_bindEvents : function() {
						this.dragable = true
						if (this.dragable) {
							this._on(this.el, '.dragdrop', 'mouseon', this._onMouseOn, this);
							this._on(this.el, '.dragdrop', 'mouseleave', this._onMouseLeave, this);
							this._on(this.el, '.dragdrop', 'mousedown', this._onMouseDown, this);
							this._on(this.el, '.dragdrop', 'mouseup', this._onMouseUp, this);
							this._on(this.el, '.dragdrop', 'mousemove', this._onMouseMove, this);
						}
					},
					_onMouseOn : function(e) {

					},
					_onMouseLeave : function(e) {

					},
					_onMouseDown : function(e) {
						this.__beginDrag = true;
						this.borderEl.css("visibility", "hidden");
						if (!this.__dragTempEl) {
							this.__dragTempEl = jQuery('<div class="dragdrop" style="position:absolute;top: 0;left: 0;right: 0;bottom: 0;border: solid 1px;background: #999;opacity: .3;filter: alpha(opacity=30);cursor: move;"></div>');
						}
						this.__dragTempEl.appendTo(this.el);

						var event = e.event;
						this.__oldMouse = {
							x : event.x,
							y : event.y
						};
						this.__offset = this._getBox();
					},
					_onMouseUp : function(e) {
						var el = e.selector;
						this.borderEl.css("visibility", "visible");
						if (this.__dragTempEl) {
							this.__dragTempEl.remove();
							delete this.__dragTempEl;
						}
						this.__beginDrag = false;
					},
					_onMouseMove : function(e) {
						if (this.__beginDrag) {
							var event = e.event;
							this.el.offset({
								top : this.__offset.top + event.y - this.__oldMouse.y,
								left : this.__offset.left + event.x - this.__oldMouse.x
							});
						}
					},
					_getAttrs : function(attributes) {
						var attrs = boot.concat({
							bool : [ 'dragable' ]
						}, attributes);
						return boot.DragDrop.superClass._getAttrs.call(this, attrs);
					}
				});

boot.Register(boot.DragDrop, "dragdrop");
/*-----------------------panel-------------------------*/
/**
 * @author 田鑫龙
 */
// panel类
boot.Panel = function(id) {
	this.showHead = false;
	this.showFoot = false;
	this.showBorder = true;
	this.showClose = true;
	this.showMax = false;
	this.showToggle = false;
	boot.Panel.superClass.constructor.call(this, id);
	this._setBox();
	this.el.css({
		'visibility' : 'visible'
	});
};

boot.extend(boot.Panel, boot.DragDrop, {
	uiCls : "boot-panel",
	type : "panel",
	_initField : function() {
		this.title = this.title || '';
	},
	// 创建元素替代页面标记
	_create : function() {
		this.el.css({
			position : 'relative'
		});
		this._createBorder();

		this._createBody();
		this._createHead();
		this._createTools();
		this._createFoot();
		this._createResizer();

	},
	_setBox : function() {
		this.el.css({
			width : this.width || "100%",
			height : this.height || "100%"
		});
		var head = this.headEl.outerHeight(true);
		var foot = this.footEl.outerHeight(true);
		this.bodyEl.css({
			top : head,
			bottom : foot
		});
	},
	_setWidth : function(width) {
		if (width == 0 || width == undefined) {
			return;
		}
		this.el.width(width);
		this.width = this.el.width();
	},
	_setHeight : function(height) {
		if (height == 0 || height == undefined) {
			return;
		}
		this.el.height(height);
		this.height = this.el.height();
	},
	// 创建border
	_createBorder : function() {
		this.borderEl = jQuery('.panel-border', this.el);
		if (this.borderEl[0] == undefined) {
			this.borderEl = jQuery('<div class="panel-border "></div>');
			this.borderEl.appendTo(this.el);
		}
		this.borderEl.css({
			position : 'absolute',
			top : 0,
			bottom : 0,
			left : 0,
			right : 0
		});
		if (!this.showBorder) {
			this.borderEl.css({
				border : 'none'
			});
		}
	},
	// 创建head
	_createHead : function() {
		this.headEl = jQuery('.panel-head', this.borderEl);
		if (this.headEl[0] == undefined) {
			var headEl = [ '<div class="panel-head dragdrop" ' ];
			if (this.showHead) {
				headEl.push('><div class="panel-headInner">' + (this.title || '') + '</div></div>');
			} else {
				headEl.push('style="height: 0;border: none;"></div>');
			}
			this.headEl = jQuery(headEl.join("")).prependTo(this.borderEl);
		}
		this.headEl.css({
			position : 'relative'
		});
	},
	// 创建body
	_createBody : function() {
		this.bodyEl = jQuery('.panel-body', this.borderEl);
		if (this.bodyEl[0] == undefined) {
			this.bodyEl = jQuery('<div class="panel-body"></div>');
			this.bodyEl.appendTo(this.borderEl);
		}
		this.bodyEl.css({
			position : 'absolute',
			width : '100%'
		});
	},
	_createTools : function() {
		var tools = jQuery('.panel-tools', this.borderEl);
		if (tools[0] == undefined) {
			tools = jQuery('<div></div>', {
				'class' : 'panel-tools'
			}).appendTo(this.headEl);
			var toolsHTML = "";
			if (this.showMin) {
				toolsHTML = toolsHTML + '<span class="panel-btn min"></span>';
			}
			if (this.showMax) {
				toolsHTML = toolsHTML + '<span class="panel-btn panelSize max"></span>';
			}
			if (this.showClose) {
				toolsHTML = toolsHTML + '<span class="panel-btn close"></span>';
			}
			tools.html(toolsHTML);
		}
		this.toolEl = tools;
	},
	// 创建foot
	_createFoot : function() {
		this.footEl = jQuery('.panel-foot', this.borderEl);
		if (this.footEl[0] == undefined) {
			this.footEl = jQuery("<div class=\"panel-foot\" style=\"height: 26px;\"></div>");
			if (this.showFoot === false) {
				this.footEl.css({
					height : 0,
					border : "none"
				});
			}
			this.footEl.appendTo(this.borderEl);
			this.footEl.css({
				position : 'absolute',
				bottom : 0
			});
		}
	},
	// 创建resizable
	_createResizer : function() {
		var resizeEl = jQuery("<div>", {
			'class' : 'panel-resizer'
		}).appendTo(this.el);
		if (!this.resizable) {
			resizeEl.css({
				'height' : 0
			});
		}
		this.resizeEl = resizeEl;
	},
	// 为body设置显示的内容
	_setView : function(html) {
		this.bodyEl.html(html);
	},
	// 为foot设置显示的内容
	_setFoot : function(html) {
		this.footEl.html(html);
	},
	_bindEvents : function() {
		boot.Panel.superClass._bindEvents.call(this);
		this._on(this.toolEl, '.close', 'click', this._onCloseClick, this);
		this._on(this.toolEl, '.close', 'mousedown', this._onCloseMouseDown, this);
		this._on(this.toolEl, '.max', 'click', this._onMaxClick, this);
		this._on(this.toolEl, '.max', 'mousedown', this._onCloseMouseDown, this);
		this._on(this.toolEl, '.min', 'click', this._onMinClick, this);
		this._on(this.toolEl, '.min', 'mousedown', this._onCloseMouseDown, this);
	},
	// 事件
	_onCloseMouseDown : function(e) {
		e.stopPropagation();
	},
	_onCloseClick : function(e) {
		e.stopPropagation();
		this.el.hide();
		this.el.remove();
		this._fire('oncloseclick', e);
	},
	_onMaxClick : function(e) {
		e.stopPropagation();
		this._fire('onmaxclick', e);
	},
	_onMinClick : function(e) {
		e.stopPropagation();
		this.el.hide();
		this._fire('onminclick', e);
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "title" ],
			number : [ "width", "height" ],
			bool : [ 'dragable', 'showHead', 'showFoot', 'resizable', 'showClose', 'showMax', 'showMin', 'showBorder' ],
			css : [],
			fn : []
		}, attributes);
		return boot.Panel.superClass._getAttrs.call(this, attrs);
	}
});
// 注册panel类
boot.Register(boot.Panel, 'panel');
/**
 * @author 田鑫龙
 */
boot.Accordion = function(id) {
    this.autoLoad = true;
    this.showBorder = false;
    boot.Accordion.superClass.constructor.call(this, id);
    this.autoLoad && this._load();
    this._resize()
};

boot.extend(boot.Accordion, boot.Panel, {
	uiCls: "boot-accordion",
    type: "accordion",
    _initField : function() {
        boot.Accordion.superClass._initField.call(this);
        this.idField = this.idField || 'id';
        this.parentidField = this.parentidField || 'parentid';
        this.childrenField = this.childrenField || 'children';
        this.textField = this.textField || 'text';
        this.loadType = this.loadType || 'full';
        this.accordionHeight = this.accordionHeight || 28;
        this.selectedNode = {};
        this._map = [];
    },
    _create : function() {
        boot.Accordion.superClass._create.call(this);
    },
    _resize: function(){// TODO
    	var me = this;
    	jQuery(window).resize(function(){
    		var height = me._calcNextLevelHeight();
    		me._updateChildHeight(height);
    	});
    },
    _load : function(options) {
        options = options || {};
        options.url = this.url;
        options.context = this;
        options.success = this._loadSuccess;
        
        if(options.url)
            boot.ajax(options);
    },
    // 设置url
    _setUrl: function(url){
        this.url = url;
        this._load();
    },
    // 加载成功
    _loadSuccess : function(result) {
    	if(jQuery.type(result) == 'array'){
    		this._loadData(result);
    	}else if (result.success) {
            this._loadData(result.resultData);
        }
    },
    _loadData : function(array) {
    	this.resource = array || [];
    	this.data = boot._makeTreeData(this.resource, this.idField, this.parentidField, this.childrenField);
        this.bodyEl.html(this._makeNode(this.data));
        
        this._loadNextLevel();
        
        this._fire("onloadsuccess", {
            sender : this,
            source : this,
            result : array
        });
    },
    // 加载二级菜单数据
    _loadNextLevel: function(){
    	var me = this;
        // 转换树
        boot.parseByParent(this.bodyEl);
        // 加载二级数据
        for(var i = 0, len = this._map.length; i < len; i++){
    		var map = this._map[i];
    		var tree = boot.get(map.tree);
    		tree.loadData(map.array);
    		// 绑定click事件
    		tree.bind('nodeclick', function(e){
    			e.sender = me;
    			me._fire("nodeclick", e);
    		});
    	}
    },
    // 通过uuid获取node
    _getNodeByUUID : function(uuid, field) {
        field = field || "_uuid";
        var me = this;
        function recursion(array) {
            var find = undefined;
            for (var i = 0, len = array.length; i < len; i++) {
                var node = array[i];
                if (uuid === node[field]) {
                    find = node;
                } else  if(node[me.childrenField] && node[me.childrenField].length > 0){
                    find = recursion(node[me.childrenField]);
                }
                if (find) {
                    break;
                }
            }
            return find;
        }
        return recursion(this.data);
    },
    // 创建节点信息
    _makeNode : function(array) {
        var html = new boot.HTML(), array = array || [], length = array.length;
        
        var height = this._calcNextLevelHeight(length);
        for (var index = 0; index < length; index++) {
            var node = array[index];
            
            // 生成节点信息
            if(index == 0){
            	node._open = true;
            	this.selectedNode = node;
            	html.push('<div id="' + node._uuid + '$node" class="accordion-node" style="overflow: hidden;">');
            }else{
            	html.push('<div id="' + node._uuid + '$node" class="accordion-node" style="overflow: hidden;height:'+ this.accordionHeight +'px;">');
            }
            html.push(this._renderNode(node, height));
            html.push(this._renderChildren(node, height));
            html.push('</div>');
        }
        return html.concat();
    },
    // 计算剩余可显示二级菜单的高度
    _calcNextLevelHeight: function(length){
    	length = length || this.data.length;
    	var box = this._getBox(this.bodyEl);
    	return box.height - length * this.accordionHeight - 1;
    },
    // 渲染node节点
    _renderNode : function(node) {
        var icon = this._makeIcon(node);
        var text = this._makeText(node);
        var actionIcon = this._makeActionIcon(node);
        return '<div id="' + node._uuid + '$head" class="accordion-node-head" style="height:'+ this.accordionHeight +'px;line-height: '+ this.accordionHeight +'px;">' + icon + text + actionIcon +'</div>';
    },
    // 创建二级菜单
    _renderChildren : function(node, height) {
        node[this.childrenField] = node[this.childrenField] || [];
        var id = boot.newId();
        this._map.push({
        		_parentid: node._uuid,
        		tree: id,
        		array: node[this.childrenField]
        });
        var tree = '<div id="'+ id +'" class="boot-tree" loadType="'+ this.loadType +'" showBorder="false" style="width: 100%;height: 100%;"></div>';
        return '<div id="' + node._uuid + '$child" class="accordion-node-children" style="height: '+ height +'px;">' + tree + '</div>';
    },
    // 更新单个节点
    _updateNode : function(node, record) {
        boot.concat(node, record);
        var _uuid = node._uuid;
        var nodeEl = jQuery('#' + _uuid + '\\$head', this.bodyEl);
        nodeEl.replaceWith(this._renderNode(node));
    },
    // 更新所有二级菜单的高度
    _updateChildHeight : function(height) {
    	for(var i = 0, len = this._map.length; i < len; i++){
    		var map = this._map[i];
    		var childEl = jQuery('#' + map._parentid + '\\$child', this.bodyEl);
    		childEl.height(height);
    	}
    },
    // 生成折叠图标
    _makeActionIcon : function(node) {
    	var cls = node._open ? ' open' : ' close';
        return '<span id="' + node._uuid + '$action" class="accordion-node-actionIcon'+ cls +'"></span>';
    },
    // 生成文本信息
    _makeText : function(node) {
        var _uuid = node._uuid;
        var text = node[this.textField];
        if (node._editting) {
            return '<span class="accordion-node-text"></span>';
        }
        return '<span class="accordion-node-text">' + text + '</span>';
    },
    // 生成文件图标
    _makeIcon : function(node) {
       return '<span class="accordion-node-icon"></span>';
    },
    // TODO 销毁没有销毁tree
    _destroy: function(){
    	boot.Accordion.superClass._destroy.call(this);
    },
    _bindEvents : function() {
        this._on(this.bodyEl, '.accordion-node-head', 'click', this._onNodeHeadClick, this);
    },
    _onNodeHeadClick: function(e){
    	var el = e.selector;
    	var uuid = el[0].id.split("\$")[0];
    	
    	if(this.selectedNode._uuid == uuid)
    		return;
    	
    	var activedNodeEl = jQuery('#' + this.selectedNode._uuid + '\\$node', this.bodyEl);
    	var visitedNodeEl = jQuery('#' + uuid + '\\$node', this.bodyEl);
    	
    	this.selectedNode._open = false;
    	this._updateNode(this.selectedNode, this.selectedNode);
    	
    	this.selectedNode = this._getNodeByUUID(uuid);
    	this.selectedNode._open = true;
    	this._updateNode(this.selectedNode, this.selectedNode);
    	
    	activedNodeEl.animate({
    		height: this.accordionHeight
    	}, "fast");
    	visitedNodeEl.animate({
    		height: this.accordionHeight + this._calcNextLevelHeight()
    	}, "fast");
    	
    	this._fire("itemclick", e);
    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ['idField', 'parentidField', 'childrenField', 'textField', 'url', 'loadType', "binding",],
            bool : ["autoLoad"],
            number: ['accordionHeight'],
            css : []
        }, attributes);
        return boot.Accordion.superClass._getAttrs.call(this, attrs);
    },

    // API
    getSelected : function() {
        return this.selectedNode;
    },
    getData: function(){
        return this.resource;
    },
    loadData: function(array){
        this._loadData(array);
    }
});

// 注册accordion类
boot.Register(boot.Accordion, 'accordion');
/*-----------------------dataform-------------------------*/
/**
 * @author 田鑫龙
 */
// 表单类
boot.DataForm = function(id) {
	boot.DataForm.superClass.constructor.call(this, id);
	this.currentAction = null;
	this._getFields();
	if (this.results) {
		this._setData(this.results);
	}
	if (this.el)
		this.el.css("visibility", "visible");
};

boot.extend(boot.DataForm, boot.Rooter, {
	uiCls : "boot-dataform",
	type : "form",
	_initField : function() {
		this.validateValue = true;
		this.idField = this.idField || "id";
		this.parameters = this.parameters || {};
		this.prefix = this.prefix || "entityBean";
		this.queryMethod = this.queryMethod || "queryDetail.action";
		this.createMethod = this.createMethod || "create.action";
		this.saveMethod = this.saveMethod || "save.action";
		this.updateMethod = this.updateMethod || "update.action";
	},
	_create : function() {
		this.el.attr("id", this.id);
		this.modal = new boot.Modal(document.body);
		this.modal._hideLoadingText();
	},
	_getFields : function() {
		boot.parseByParent(this.el);
		boot.findChildComponents.call(this);
	},
	_validate : function() {// TODO 验证
		this.validateValue = true;
		var rs = boot.relationship[this._uuid];
		for (var i = 0, len = rs.length; i < len; i++) {
			var ctl = rs[i];
			if (ctl && ctl.type == 'button' || ctl.type == 'datagrid') {
				continue;
			}
			if (ctl && ctl._validate) {
				this.validateValue = ctl._validate() && this.validateValue;
			}
		}
		return this.validateValue;
	},
	_getData : function(addPrefix) {
		var result = {};
		var rs = boot.relationship[this._uuid];
		for (var i = 0, len = rs.length; i < len; i++) {
			var ctl = rs[i];
			if (ctl && ctl.type == 'button' || ctl.type == 'datagrid') {
				continue;
			}
			if (ctl && ctl.type == 'fileupload') {
				this.files = this.files || [];
				this.files.push(ctl);
				result[ctl.pathField] = ctl.getPath();
			}
			if (ctl && ctl.getValue) {
				result[ctl.name] = ctl.getValue();
			}
			if (ctl && ctl._validate) {
				var v = ctl._validate();
				this.validateValue = this.validateValue && v;
			}
		}
		if (addPrefix) {
			result = boot.addPrefix(result, this.prefix);
		}
		return result;
	},
    _setOnlyView: function(flag){
    	var rs = boot.relationship[this._uuid];
    	for(var i=0,len=rs.length;i<len;i++){
            var ctl = rs[i];
            if(ctl._setOnlyView){
            	ctl._setOnlyView(flag);
            }
        }
    },
	_setData : function(data) {
		var rs = boot.relationship[this._uuid];
		for (var i = 0, len = rs.length; i < len; i++) {
			var ctl = rs[i];
			if (ctl._setValue) {
				var value = data[ctl.name];
				if(ctl.type == 'popupedit'){
					value = data[ctl.valueField];
				}
				if (value !== undefined) {
					ctl._setValue(value);
				}
			}
			if (ctl._setText) {
				var text = data[ctl.textField];
				if (text !== undefined) {
					ctl._setText(text);
				}
			}
			if (ctl.type === 'fileupload') {
				var path = data[ctl.pathField];
				if (path !== undefined) {
					ctl._setPath(path);
				}
			}
		}
	},
	_queryMethod : function(options) {
		this.currentAction = "query";
		this._load(options);
	},
	_createMethod : function(options) {
		this.currentAction = "create";
		this._load(options);
	},
	_saveMethod : function(options) {
		this.currentAction = "save";
		this._load(options);
	},
	_submit : function() {
		this._load({
			data : this._getData()
		});
	},
	_load : function(url) {
		if(this.isLoading == true){
			var tip = top.boot ? top.boot.showTip : boot.showTip;
			tip('数据处理中...');
			return false;
		}else{
			this.isLoading = true;
		}
		var options = {
			url : (this.action ? (this.action + '_' + this[this.currentAction + 'Method']) : this.url),
			success : this._loadSuccess,
			context : this
		};
		// 提交前获取数据
		if (this.currentAction == "save" || this.currentAction == "update") {
			var bind = boot.getBinding(this.id, this.binding);
			if (bind) {
				options.data = bind._getSubmitData();
			} else {
				this._validate();
			}
		}
		// 验证
		if (!this.validateValue) {
			var tip = top.boot ? top.boot.showTip : boot.showTip;
			tip('数据验证不通过!');
			return false;
		}
		if (jQuery.type(url) === "string") {
			options.url = url;
		} else {
			url = url || {};
			url.data = boot.addPrefix(url.data || {}, this.prefix);
			boot.concat(options, url);
		}
		options.url = options.url || this.url;

		if (options.url) {
			this.modal._show();
			boot.ajax(options);
		}
	},
	_loadSuccess : function(result) {
		this.isLoading = false;
		if (result.success) {
			result.resultData && this._setData(result.resultData);
			if (this.currentAction == 'query') {
				if (this.binding) {
					var bind = boot.getBinding(this.id, this.binding);
					if (bind) {
						bind._load({
							parentId : result.resultData[this.idField]
						});
					}
				}
			}
		}
		this._fire('onloadsuccess', {
			result : result,
			sender : this
		});
		if (this.currentAction == "save" || this.currentAction == "update") {
			var me = this;
			this._uploadFile(function(sender) {
				var tip = top.boot ? top.boot.showTip : boot.showTip;
				tip(result.message, function() {
					me.modal._hide();
					window.closeWindow && window.closeWindow();
				}, sender);
				me._fire('onfileuploaded', {
					result : result,
					sender : me
				});
			});
		}
		if (this.currentAction == "save" || this.currentAction == "query") {
			this.modal._hide();
			this.currentAction = "update";
		}
		if (this.currentAction == "create") {
			this.modal._hide();
			this.currentAction = "save";
		}
	},
	_uploadFile : function(callback) {
		var me = this;
		// 每次保存成功校验上传文件
		if (this.files) {
			for (var i = 0, len = this.files.length; i < len; i++) {
				var file = this.files[i];
				file.upload();// 开始上传
			}
			var checkFinished = window.setInterval(function() {
				var finished = false;
				for (var i = 0, len = me.files.length; i < len; i++) {
					var file = me.files[i];
					if (file.finished) {
						finished = file.finished;
					} else {
						finished = file.finished;
						break;
					}
				}
				if (finished) {
					window.clearInterval(checkFinished);
					callback && callback(me);
				}
			}, 200);
		} else {
			callback && callback(this);
		}
	},
	_setPrefix : function(prefix) {
		this.prefix = prefix;
	},
	_setParameters : function(data, prefix) {
		this.parameters = boot.addPrefix(data, prefix || this.prefix);
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "id", "prefix", "action", "queryMethod", "updateMethod", "createMethod", "saveMethod", "viewPage", "editPage", "binding", "idField" ],
			bool : [],
			json : [ "parameters", "results" ],
			fn : []
		}, attributes || {});
		return boot.DataForm.superClass._getAttrs.call(this, attrs);
	},

	// API
	setPrefix : function(prefix) {
		this._setPrefix(prefix);
	},
	getData : function() {
		return this._getData();
	},
	setData : function(data) {
		this._setData(data);
	},
	query : function(options) {
		this._queryMethod(options);
	},
	create : function(options) {
		this._createMethod(options);
	},
	save : function(options) {
		this._saveMethod(options);
	},
	setParameters : function(data, prefix) {
		this._setParameters(data, prefix);
	},
	submit : function() {
		this._submit();
	},
    setOnlyView: function(flag){
    	this._setOnlyView(flag);
    }
});

boot.Register(boot.DataForm, "dataform");
/*----------------------textbox--------------------------*/
/**
 * @author 田鑫龙
 */
// 文本输入框
boot.TextBox = function(id) {
	this.required = false;
	boot.TextBox.superClass.constructor.call(this, id);
	this._setWidth();
    this._setHeight();
};

boot.extend(boot.TextBox, boot.Rooter,
		{
			uiCls : 'boot-textbox',
			type : "text",
			_initField : function() {
				this.validateValue = true;
				boot.TextBox.superClass._initField.call(this);
				this.maxLength = this.maxLength || 1024;
				this.minLength = this.minLength || 0;
				this.emptyText = this.emptyText ? ('请输入' + this.emptyText) : '';
				this.width = this.width || 150;
				this.height = this.height || 22;
				this.value = this.value || "";
			},
			_create : function() {
				this.el.css("visibility", "hidden");
				var container = jQuery('<span id="' + this.id
						+ '" class="boot-textbox" style="display: inline-block;overflow: hidden;position: relative;vertical-align: middle;line-height: ' + this.height + 'px;"></span>');
				var borderHTML = '<span class="textbox-border" style="display: block;position: relative;padding: 0 2px;';
				if (this.showBorder === false) {
					borderHTML += 'border: none;';
				}
				borderHTML += '"></span>';
				var border = jQuery(borderHTML);
				var emptyEl = jQuery(
						'<label style="' + (this.value && this.value != '' ? 'display: none;' : '') + 'line-height: ' + this.height
								+ 'px;height: 100%;position: absolute;top: 0;left :2px;color: gray;cursor: text;">' + this.emptyText + '</label>').appendTo(border);
				var input = jQuery("<input>", {
					name : this.name,
					id : this.id + '$text',
					type : "text",
					readonly : this.allowEdit === false ? true : false,
					disabled : this.enabled === false ? true : false,
					"class" : "textbox-text",
					value : this.value
				}).appendTo(border.appendTo(container));

				var errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '" style="color: red;"></span>');
				errorEl.appendTo(container);
				this.errorEl = errorEl;

				this.el.after(container);
				// 插入新创建的元素
				this.el.remove();
				// 移除旧的元素
				this.el = container;
				this.textEl = input;
				this.borderEl = border;
				this.emptyEl = emptyEl;

				if (this.onlyView) {
					this._setOnlyView(true);
				}
			},
			_setWidth : function(width) {
				if (!/\;*\s*width\s*:\s*/.test(this.style)) {
					this.el.css({
						width : width || this.width
					});
				}
			},
			_setHeight : function(height) {
				this.borderEl.css({
					"line-height" : (height || this.height) + 'px',
					height : height || this.height
				});
		        if(this.textEl){
		        	this.textEl.css({
		        		"line-height" : (height || this.height) + 'px',
		                height : height || this.height
		        	});
		        }
			},
			_show: function(){
				this.el.show();
			},
			_hide: function(){
				this.el.hide();
			},
			_setValue : function(value) {
				this.value = value;
				this.textEl.val(value).trigger("change");
			},
			_getValue : function() {
				return this.value;
			},
			_setAllowEdit : function(bool) {
				if (bool)
					this.textEl.prop('readonly', true);
				else
					this.textEl.removeProp('readonly');
			},
		    _setEnabled: function(flag){
		    	this.enabled = flag;
		    	if(flag)
		    		this.textEl.removeProp('disabled');
		    	else
		    		this.textEl.prop('disabled', true);
		    },
		    _setOnlyView: function(onlyView){
		    	this.onlyView = onlyView;
		    	if(onlyView){
		    		this.el.addClass("_onlyView");
		    	}else {
		    		this.el.removeClass("_onlyView");
		    	}
		    	this._setEnabled(!onlyView);
		    },
			_getData : function() {
				return this.data;
			},
			_validate : function() {
				var v = new boot.Validate();
				v.setRequired(this.required);
				v.setValue(this._getValue());
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
			_showError : function(errorMsg) {
				this.el.addClass('error');
				this.errorEl.prop('title', errorMsg || this.errorText);
				this.validateValue = false;
			},
			_hideError : function(errorMsg) {
				this.el.removeClass('error');
				this.errorEl.prop('title', '');
				this.validateValue = true;
			},
			_bindEvents : function() {
				this._on(this.el, ":text", "change", this._onTextChange, this);
				this._on(this.el, ":text", "change", this._onTextChangeForEmptyText, this);
				this._on(this.el, ":text", "keypress", this._onEnterPress, this);

				this._on(this.el, ":text", "keydown", this._onTextKeyDown, this);
				this._on(this.el, ":text", "keyup", this._onTextKeyUp, this);
				this._on(this.el, ":text", "blur", this._onTextBlur, this);
				this._on(this.el, ":text", "focus", this._onTextFocus, this);

				this._on(this.el, "label", "click", this._onPlaceHorderClick, this);
			},
			_onTextChangeForEmptyText : function() {
				if (this.emptyText != '') {
					if (this.textEl.val() != '') {
						this.emptyEl.hide();
					} else {
						this.emptyEl.show();
					}
				}
			},
			_onTextChange : function(e) {
				this.value = this.textEl.val();
				this._validate();
				e.value = this.value;
				this._fire('onchange', e);
			},
			_onEnterPress : function(e) {
				if (e.event.keyCode == "13") {
					e.value = this.textEl.val();
					e.oldValue = this.value;
					this._fire('onenterpress', e);
				}
			},
			_onTextKeyDown : function(e) {
				var value = this.textEl.val();
				var keycode = e.event.keyCode;
				if (keycode >= 48 && keycode <= 111 && keycode != 108 || keycode >= 186 && keycode <= 222 || keycode == 32) {
					if (value.length < this.minLength) {
						e.event.preventDefault();
						var tip = top.boot ? top.boot.showTip : boot.showTip;
						tip('不得少于' + this.minLength + '限制!');
						return false;
					}
					if (value.length >= this.maxLength) {
						e.event.preventDefault();
						var tip = top.boot ? top.boot.showTip : boot.showTip;
						tip('不得超过' + this.maxLength + '限制!');
						return false;
					}
				}
				this._fire('onkeydown', e);
			},
			_onTextKeyUp : function(e) {
				if (this.emptyText != '') {
					if (this.textEl.val() != '') {
						this.emptyEl.hide();
					} else {
						this.emptyEl.show();
					}
				}
				this._fire('onkeyup', e);
			},
			_onTextFocus : function(e) {
				this._fire('onfocus', e);
			},
			_onTextBlur : function(e) {
				this._validate();
				this._fire('onblur', e);
			},
			_onPlaceHorderClick : function() {
				this.textEl && this.textEl.trigger('focus');
			},
			_getAttrs : function(attributes) {
				var attrs = boot.concat({
					str : [ "name", "value", "style", "emptyText", "vType", "errorText" ],
					number : [ "width", "height", "maxLength", "minLength" ],
					bool : [ "allowEdit", "enabled", "required", "showBorder", "onlyView" ],
					json : [],
					fn : [ "onchange", "onblur" ]
				}, attributes || {});
				return boot.TextBox.superClass._getAttrs.call(this, attrs);
			},

			// API
			getValue : function() {
				return this._getValue();
			},
			setValue : function(value) {
				this._setValue(value);
			},
		    setAllowEdit: function(flag){
		    	this._setAllowEdit(flag);
		    },
		    setEnabled: function(flag){
		    	this._setEnabled(flag);
		    },
		    setOnlyView: function(flag){
		    	this._setOnlyView(flag);
		    },
		    show: function(){
		    	this._show();
		    },
		    hide: function(){
		    	this._hide();
		    }
		});

boot.Register(boot.TextBox, 'textbox');
/*----------------------search--------------------------*/
/**
 * @author 田鑫龙
 */
boot.SearchBuilder = function(id) {
	boot.SearchBuilder.superClass.constructor.call(this, id);
	this._getFields();
	this._bindAfterEvents();
	this.el.height(this.height);
	this.el.css("visibility", 'visible');
};

boot.extend(boot.SearchBuilder, boot.Rooter, {
	uiCls : "boot-search",
	_initField : function() {
		this.simpleSearch = true;
		this.showField = this.showField || [ "key" ];
		this.prefix = this.prefix || "entityBean";
		this.height = this.height || 'auto';
	},
	_create : function() {
		this.el.css("overflow", 'hidden');
		var showEl = jQuery('<div class="search-show" style=""></div>');
		showEl.appendTo(this.el);
		var queryId = boot.newId();
		var clearId = boot.newId();
		var queryButtonEl = jQuery('<a id="' + queryId + '" class="boot-button" iconCls="search" style="margin: auto 10px;">查询</a>');
		var clearButtonEl = jQuery('<a id="' + clearId + '" class="boot-button" iconCls="clear" style="margin: auto 10px;">清除</a>');
		this.queryButtonEl = queryId;
		this.clearButtonEl = clearId;

		showEl.append(queryButtonEl).append(clearButtonEl);
		this.showEl = showEl;
	},
	_getFields : function() {
		boot.parseByParent(this.el);
		this.queryButtonEl = boot.get(this.queryButtonEl);
		this.clearButtonEl = boot.get(this.clearButtonEl);
		boot.findChildComponents.call(this);
		this._findSimpleSearch();
	},
	_findSimpleSearch : function() {
		if (jQuery.type(this.showField) == 'string') {
			this.showField = [ this.showField ];
		}
		var temp = jQuery("<div></div>");
		for (var i = 0, len = this.showField.length; i < len; i++) {
			var name = this.showField[i];
			var comp = boot.getByName(name, this);
			if (comp) {
				comp.el.appendTo(temp);
			}
		}
		this.showEl.prepend(temp.children());
		temp = null;
	},
	_bindAfterEvents : function() {
		this.queryButtonEl.bind('click', this._onSearchClick, this);
		this.clearButtonEl.bind('click', this._onClearClick, this);
	},
	_onSearchClick : function(e) {
		var bind = boot.getBinding(this.id, this.binding);
		if (bind) {
			var data = this._getData();
			bind._triggerQuery(data);
			// this._clearSearchText(true);
		}
	},
	_onClearClick : function(e) {
		this._clearSearchText(true);
		var bind = boot.getBinding(this.id, this.binding);
		if (bind) {
			var data = this._getData();
			bind._triggerQuery(data);
			bind._triggerAdapt && bind._triggerAdapt();
		}
	},
	// 清空字段值
	_clearSearchText : function(full) {
		var rs = boot.relationship[this._uuid];
		for (var i = 0, len = rs.length; i < len; i++) {
			var ctl = rs[i];
			if (ctl.type != 'button' && (ctl.name != this.showField || full === true)) {
				ctl.setValue("");
				ctl.setText && ctl.setText("");
			}
		}
	},
	// 获取数据，空值或undefined的组件跳过
	_getData : function(prefix) {
		var result = {};
		var rs = boot.relationship[this._uuid];
		for (var i = 0, len = rs.length; i < len; i++) {
			var ctl = rs[i];
			if (ctl.type == 'button') {
				continue;
			}
			var value = ctl.getValue();
			if (value && value != '') {
				result[ctl.name] = ctl.getValue();
			}
		}
		if (prefix) {
			return boot.addPrefix(result, this.prefix);
		}
		return result;
	},

	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "binding", "showField" ],
			bool : [],
			json : [],
			fn : []
		}, attributes || {});
		return boot.SearchBuilder.superClass._getAttrs.call(this, attrs);
	},

	// API
	getData : function(prefix) {
		this._getData(prefix);
	},
	search : function() {
		this._onSearchClick();
	},
	clear : function() {
		this._onClearClick();
	}
});

boot.Register(boot.SearchBuilder, 'search');

/*----------------------number--------------------------*/
/**
 * @author 田鑫龙
 */
// Number类型
boot.Number = function(id) {
	boot.Number.superClass.constructor.call(this, id);
};

boot.extend(boot.Number, boot.TextBox, {
	uiCls : "boot-number",
	_initField : function() {
		boot.Number.superClass._initField.call(this);
		this.format = this.format || "d0";
		this.formatFixed = Number(this.format.replace(/[a-zA-Z]/g, ''));
		this.formatType = this.format.replace(/[0-9]/g, '');
		this.fixed = this.formatType == 'p' ? 100 : 1;
		this.value = this.value * this.fixed || 0;
		this.maxValue = this.maxValue || 9999999999999;
		this.minValue = this.minValue || -9999999999999;
		this.symbol = this.formatType == 'p' ? "%" : "&yen;";
	},
	_create : function() {
		boot.Number.superClass._create.call(this);
		this.textEl.css({
			"text-align" : "right",
			"ime-mode" : "disabled"
		});
		this._decimalFormat(this.value);
		if (this.formatType !== 'd') {
			this.borderEl.css("padding-right", "18px");
			this.symbolEl = jQuery('<span class="number-symbol">' + this.symbol + '</span>');
			this.borderEl.append(this.symbolEl);

			if (this.onlyView) {
				this.symbolEl.css({
					"border-left" : "none",
					"background-color" : "transparent"
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
	// 比较是否合法
	_compare : function(value) {
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
	// 过滤非法字符
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
			str : [ "format" ],
			number : [ "maxValue", "minValue" ],
			fn : []
		}, attributes || {});
		return boot.Number.superClass._getAttrs.call(this, attrs);
	}
});

boot.Register(boot.Number, 'number');
/*----------------------hidden--------------------------*/
/**
 * @author 田鑫龙
 */
// 文本输入框
boot.Hidden = function(id) {
	boot.Hidden.superClass.constructor.call(this, id);
};

boot.extend(boot.Hidden, boot.TextBox, {
	uiCls : 'boot-hidden',
	_create : function() {
		boot.Hidden.superClass._create.call(this);
		this.el.css("display", 'none');
	}
});

boot.Register(boot.Hidden, 'hidden');

/*----------------------password--------------------------*/
/**
 * @author 田鑫龙
 */
// 密码输入框
boot.Password = function(id) {
	boot.Password.superClass.constructor.call(this, id);
};

boot.extend(boot.Password, boot.TextBox, {
	uiCls : 'boot-password',
	_create : function() {
		var container = jQuery("<span id=\"" + this.id + "\" class=\"boot-password boot-textbox\"></span>");
		var borderHTML = '<span class="textbox-border textarea-border" style="display: block;position: relative;padding: 0 2px;';
		if (this.showBorder === false) {
			borderHTML += 'border: none;';
		}
		borderHTML += '"></span>';
		var border = jQuery(borderHTML);
		var emptyEl = jQuery(
				'<label style="' + (this.value && this.value != '' ? 'display: none;' : '') + 'position: absolute;top: 0;left :2px;color: gray;cursor: text;">' + this.emptyText
						+ '</label>').appendTo(border);
		var input = jQuery("<input>", {
			id : this.id + '$text',
			name : this.name,
			type : "password",
			"class" : "textbox-text",
			value : this.value,
			readonly : this.allowEdit === false ? true : false,
			disabled : this.enabled === false ? true : false
		}).appendTo(border.appendTo(container));
		var errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '" style="color: red;"></span>');
		errorEl.appendTo(container);
		this.errorEl = errorEl;

		this.el.after(container);// 插入新创建的元素
		this.el.remove();// 移除旧的元素
		this.el = container;
		this.textEl = input;
		this.borderEl = border;
		this.emptyEl = emptyEl;

		if (this.onlyView) {
			this.textEl.prop("disabled", true);
			this.borderEl.css("border-color", "transparent");
		}
	},
	_bindEvents : function() {
		this._on(this.el, ":password", "change", this._onTextChange, this);
		this._on(this.el, ":password", "change", this._onTextChangeForEmptyText, this);
		this._on(this.el, ":password", "keypress", this._onEnterPress, this);
		this._on(this.el, ":password", "keydown", this._onTextKeyDown, this);
		this._on(this.el, ":password", "keyup", this._onTextKeyUp, this);
		this._on(this.el, ":password", "blur", this._onTextBlur, this);
		this._on(this.el, ":password", "focus", this._onTextFocus, this);
		this._on(this.el, "label", "click", this._onPlaceHorderClick, this);
	}
});

boot.Register(boot.Password, 'password');

/*----------------------textarea--------------------------*/
/**
 * @author 田鑫龙
 */
// 文本输入框
boot.TextArea = function(id) {
	boot.TextArea.superClass.constructor.call(this, id);
};

boot.extend(boot.TextArea, boot.TextBox, {
	_initField : function() {
		boot.TextArea.superClass._initField.call(this);
		this.height = this.height || 48;
		this.width = this.width || 150;
	},
	uiCls : 'boot-textarea',
	_create : function() {
		var container = jQuery("<span id=\"" + this.id + "\" class=\"boot-textbox boot-textarea\"></span>");
		var borderHTML = '<span class="textbox-border textarea-border" style="display: block;position: relative;padding: 0 2px;';
		if (this.showBorder === false) {
			borderHTML += 'border: none;';
		}
		borderHTML += '"></span>';
		var border = jQuery(borderHTML);
		var emptyEl = jQuery(
				'<label style="' + (this.value && this.value != '' ? 'display: none;' : '') + 'position: absolute;top: 0;left :2px;color: gray;cursor: text;">' + this.emptyText
						+ '</label>').appendTo(border);
		var textarea = jQuery("<textarea>", {
			name : this.name,
			id : this.id + '$text',
			"class" : "textarea-text textbox-text",
			readonly : this.allowEdit === false ? true : false,
			disabled : this.enabeld === false ? true : false,
			value : this.value
		}).appendTo(border.appendTo(container));
		var errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '" style="color: red;"></span>');
		errorEl.appendTo(container);
		this.errorEl = errorEl;

		this.el.after(container);// 插入新创建的元素
		this.el.remove();// 移除旧的元素
		this.el = container;
		this.textEl = textarea;
		this.borderEl = border;
		this.emptyEl = emptyEl;

		if (this.onlyView) {
			this.textEl.prop("disabled", true);
			this.textEl.css({
				"resize" : "none"
			});
			this.borderEl.css("border-color", "transparent");
		}
		this.textEl.css({
			"resize" : "none"
		});
	},
    _setHeight : function(height) {
        this.borderEl.css({
            height : height || this.height
        });
    },
	_bindEvents : function() {
		this._on(this.el, "textarea", "change", this._onTextChange, this);
		this._on(this.el, "textarea", "change", this._onTextChangeForEmptyText, this);
		this._on(this.el, "textarea", "keypress", this._onEnterPress, this);

		this._on(this.el, "textarea", "keydown", this._onTextKeyDown, this);
		this._on(this.el, "textarea", "keyup", this._onTextKeyUp, this);
		this._on(this.el, "textarea", "blur", this._onTextBlur, this);
		this._on(this.el, "textarea", "focus", this._onTextFocus, this);
		this._on(this.el, "label", "click", this._onPlaceHorderClick, this);
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [],
			bool : [],
			json : [],
			fn : []
		}, attributes || {});
		return boot.TextArea.superClass._getAttrs.call(this, attrs);
	}
});

boot.Register(boot.TextArea, 'textarea');

/*----------------------popupedit--------------------------*/
/**
 * @author 田鑫龙
 */
// 弹窗窗口按钮
boot.PopupEdit = function(id){
    boot.PopupEdit.superClass.constructor.call(this, id);
};

boot.extend(boot.PopupEdit, boot.TextBox, {
	type: 'popupedit',
    uiCls: 'boot-popupedit',
    _initField: function(){
        boot.PopupEdit.superClass._initField.call(this);
        this.textField = this.textField || "name";
		this.emptyText = this.emptyText ? this.emptyText.replace("输入", "选择") : '';
        this.valueField = this.valueField || this.name || "id";
        this.showClose = this.showClose === false ? false : true;
    },
    _create: function(){
        boot.PopupEdit.superClass._create.call(this);
        this.borderEl.css("padding-right", "22px");
        this.buttonEl = jQuery('<span class="popupedit-button-border"><span class="popupedit-button-icon popupedit-button-icon-hover"></span></span>');
        this.borderEl.append(this.buttonEl);
        this.clearEl = jQuery('<span class="clear-button-border"><span class="icon-clear"></span></span>');
        this.borderEl.append(this.clearEl);
        this.textEl.attr("readonly", true);

        if(this.onlyView){
        	this._setOnlyView(true);
        }
        
    	this._setShowClose(this.showClose);
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
    _setShowClose: function(flag){
    	if(flag)
    		this.clearEl.show();
    	else
    		this.clearEl.hide();
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
// if(this.textField == this.valueField){
// this.value = text;
// this._validate();
// }
    }, 
    _setValue: function(value){
        this.value = value; 
// if(this.textField == this.valueField){
// this.text = value;
// }
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
    
    // API
    setText: function(text){
        this._setText(text);
    },
    getText: function(){
        return this._getText();
    }
});

boot.Register(boot.PopupEdit, 'popupedit');
/*----------------------popupwindow--------------------------*/
/**
 * @author 田鑫龙
 */
// 弹窗窗口按钮
boot.PopupWindow = function(id) {
	boot.PopupWindow.superClass.constructor.call(this, id);
};

boot.extend(boot.PopupWindow, boot.PopupEdit, {
	uiCls : 'boot-popupwindow',
	_initField : function() {
		boot.PopupWindow.superClass._initField.call(this);
		this.popupWidth = this.popupWidth || 600;
		this.popupHeight = this.popupHeight || 500;
	},
	_onButtonEditClick : function(e) {
		this._showWindow();
	},
	_showWindow : function() {
		var me = this;
		if (this.url) {
			boot.dialog({
				url : this.url,
				title : "",
				showHead : true,
				showBorder : true,
				height : this.popupHeight,
				width : this.popupWidth,
				onload : function(e) {
					e.cellEditor = me;
					e.contentWindow = this;
					me._fire('onload', e);
				},
				ondestroy : function(e) {
					e.cellEditor = me;
					e.window = this;
					me._fire('ondestroy', e);
				}
			});
		}

	},
	_setUrl : function(url) {
		this.url = url;
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "url", "popupTitle" ],
			bool : [ "fullScreen" ],
			number : [ "popupWidth", "popupHeight" ],
			fn : [ "onload", "ondestroy" ]
		}, attributes || {});
		return boot.PopupWindow.superClass._getAttrs.call(this, attrs);
	}
// API
});

boot.Register(boot.PopupWindow, 'popupwindow');
/*----------------------listbox--------------------------*/
/**
 * @author 田鑫龙
 */
// 复选框
boot.ListBox = function(id) {
	boot.ListBox.superClass.constructor.call(this, id);
	this.autoLoad && this._load();
};

boot.extend(boot.ListBox, boot.Rooter, {
	uiCls : 'boot-listbox',
	_initField : function() {
		boot.ListBox.superClass._initField.call(this);
		this.textField = this.textField || "name";
		this.valueField = this.valueField || "id";
		this.width = this.width || 150;
		this.height = this.height || 120;
		this.value = this.value || '';
		this.data = this.data || [];
		this.autoLoad = this.autoLoad === false ? false : true;
		this.params = this.params || {};
	},
	_create : function() {
		this.el.css({
			'display' : 'inline-block',
			'width' : this.width
		});
		var border = jQuery('<div class="listbox-border" style="overflow: auto;position:absolute;top: 0;left: 0;right: 0;bottom: 0;"></div>');
		border.appendTo(this.el);
		this.borderEl = border;

		var boxEl = jQuery('<div class="listbox"></div>');
		boxEl.appendTo(border);
		this.boxEl = boxEl;

		var errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '" style="color: red;"></span>');
		errorEl.appendTo(this.el);
		this.errorEl = errorEl;

		this._setOnlyView(this.onlyView);
	},
	_setParameters : function(params) {
		this.params = params;
	},
	_setEnabled : function(flag) {
		this.enabled = flag;
	},
	_setOnlyView : function(onlyView) {
		this.onlyView = onlyView;
		if (onlyView) {
			this.el.addClass("_onlyView");
		} else {
			this.el.removeClass("_onlyView");
		}
	},
	_validate : function() {
		var v = new boot.Validate();
		v.setRequired(this.required);
		v.setValue(this._getValue());
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
	_load : function(options) {
		options = options || {};
		options.url = options.url || this.url, options.context = this;
		options.data = boot.concat(this.params, options.data || {});
		options.success = options.success || this._loadSuccess;
		if (options.url) {
			boot.ajax(options);
		} else {
			this._loadData(this.data || []);
		}
	},
	_loadSuccess : function(result) {
		var data = [];
		if (jQuery.type(result) === 'array')
			data = result || [];
		else
			data = result.resultData || [];
		this.data = data;
		this._selectItem();
		if (this.showEmpty) {
			var empty = {};
			empty[this.textField] = '';
			empty[this.valueField] = "";
			empty._empty = true;
			var array = [ empty ];
			this.data = array.concat(data);
		}
		this._renderBox();
		this._fire('loadsuccess', {
			sender : this,
			data : this.data,
			text : this.text,
			value : this.value
		});
	},
	_loadData : function(data) {
		this._loadSuccess(data);
	},
	_selectItem : function() {
		var v = undefined;
		if (jQuery.type(this.value) == 'number') {
			v = [ this.value ];
		} else {
			v = this.value.split(",");
		}
		for (var j = 0, len = this.data.length; j < len; j++) {
			var item = this.data[j];
			for (var i = 0, length = v.length; i < length; i++) {
				var vitem = v[i];
				if (vitem !== undefined) {
					var type = typeof vitem;
					type = type.charAt(0).toUpperCase() + type.substring(1, type.length);
					var __vitem = item[this.valueField] === '' ? '' : window[type](item[this.valueField]);
					if (__vitem === vitem) {
						item._selected = true;
						break;
					} else {
						item._selected = false;
					}
				}
			}
		}
	},
	_setValue : function(value) {
		if (value != undefined) {
			this.value = value;
			this._selectItem();
			if (this.data && this.data.length > 0)
				this._renderBox();
			this._fire('setvalue', {
				text : this.text,
				value : this.value
			});
		}
		this._validate();
	},
	_renderBox : function(data) {
		data = data || this.data;
		var len = data.length;
		if (len > 0) {
			var height = len * 20 + 2;
			if (height > this.height) {
				height = this.height;
			}
			this.el.css('height', height);
		}
		var html = '', valueArray = [], textArray = [];
		for (var i = 0; i < len; i++) {
			var item = data[i];
			item._uuid = item._uuid || boot.newId();
			html += this._renderItem(item, this.showEmpty && item._empty);
			if (item._selected == true) {
				valueArray.push(item[this.valueField]);
				textArray.push(item[this.textField]);
			}
		}
		if (valueArray.length !== 0) {
			this.value = valueArray.join(',');
		}
		if (textArray.length !== 0) {
			this.text = textArray.join(',');
		}

		this.boxEl.html(html);
	},
	_renderItem : function(item, empty) {
		var selected = item._selected ? ' selected' : '';
		var title = typeof item[this.textField] === 'string' ? item[this.textField].replace(/<[^>]*>/g, "") : '';
		var html = '<div id="' + item._uuid + '" class="box-item' + selected + '" style="height: 20px;line-height: 20px;cursor: pointer;padding: 0 4px;">';
		html += '<div class="item" style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;' + (empty ? "color: #666;font-style: italic;" : "") + '" title="' + title
				+ '">';
		html += empty ? "请选择..." : item[this.textField];
		html += '</div></div>';
		return html;
	},
	_clearAll : function() {
		for (var i = 0, len = this.data.length; i < len; i++) {
			this.data[i]._selected = false;
			this._renderBox();
		}
	},
	_getItemByUUID : function(uuid) {
		for (var i = 0, len = this.data.length; i < len; i++) {
			var item = this.data[i];
			if (item._uuid === uuid) {
				return item;
			}
		}
	},
	_select : function(array) {
		if (jQuery.type(array) == 'object') {
			array = [ array ];
		}
		var valueArray = [];
		for (var i = 0, len = this.data.length; i < len; i++) {
			var value = this.data[i][this.valueField];
			valueArray.push(value);
		}
		this._setValue(valueArray.join(','));
	},
	_changeSelected : function(uuid) {
		for (var i = 0, len = this.data.length; i < len; i++) {
			var item = this.data[i];
			if (!window._ctrl) {
				item._selected = false;
			}
			if (item._uuid === uuid) {
				if (window._ctrl) {
					item._selected = !item._selected;
				} else {
					item._selected = true;
				}
			}
		}
		this._renderBox();
	},
	_show : function() {
		this.el.show();
	},
	_hide : function() {
		if (!window._ctrl)
			this.el.hide();
	},
	_bindEvents : function() {
		boot.ListBox.superClass._bindEvents.call(this);
		this._on(this.el, '.box-item', 'click', this._onItemClick, this);
		this._onCtrlKeyDown(this);
	},
	_onCtrlKeyDown : function(sender) {
		document.onkeydown = function(e) {
			var code = window.event && window.event.keyCode || e.keyCode || e.which;
			if (code == 17) {
				window._ctrl = true;
			}
		};
		document.onkeyup = function() {
			window._ctrl = false;
		};
	},
	_onItemClick : function(e) {
		if (this.enabled == false || this.onlyView) {
			return;
		}
		var el = e.selector;
		var uuid = el.attr('id');
		var item = this._getItemByUUID(uuid);

		this.value = item[this.valueField];
		this.text = item[this.textField];

		this._changeSelected(uuid);
		e.item = item;
		e.status = item._selected;

		e.value = this.value;
		e.text = this.text;

		this._fire('itemclick', e);

		this._validate();
	},
	_getValue : function() {
		return this.value;
	},
	_getData : function() {
		return this.data;
	},
	_setHeight : function() {

	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "url", "name", "value", "text", "textField", "valueField" ],
			bool : [ "autoLoad", "onlyView", "required" ],
			number : [ 'width', 'height' ],
			json : [ "data" ]
		}, attributes || {});
		return boot.ListBox.superClass._getAttrs.call(this, attrs);
	},
	clearAll : function() {
		this._clearAll();
	},
	select : function(array) {
		this._select(array);
	},
	setValue : function(value) {
		this._setValue(value);
	},
	setEnabled : function(flag) {
		this._setEnabled(flag);
	},
	setOnlyView : function(flag) {
		this._setOnlyView(flag);
	},
	getValue : function() {
		return this._getValue();
	}
});

boot.Register(boot.ListBox, 'listbox');
/*----------------------combobox--------------------------*/
/**
 * @author 田鑫龙
 */
// 下拉框
boot.ComboBox = function(id) {
	this.data = [];
	boot.ComboBox.superClass.constructor.call(this, id);
};

boot.extend(boot.ComboBox, boot.PopupEdit, {
	uiCls : 'boot-combobox',
	_initField : function() {
		// 跨过popupedit，直接继承textbox
		boot.ComboBox.superClass.constructor.superClass._initField.call(this);
		this.popupHeight = this.popupHeight || 120;
		this.popupWidth = this.popupWidth;
		this.showEmpty = this.showEmpty === false ? false : true;
		this.idField = this.idField || "id";
		this.parentidField = this.parentidField || 'parentid';
		this.childrenField = this.childrenField || 'children';
		this.textField = this.textField || 'name';
		this.valueField = this.valueField || 'id';
		this.autoLoad = this.autoLoad === false ? false : true;
        this.showClose = this.showClose === false ? false : true;
		this.emptyText = this.emptyText ? this.emptyText.replace("输入", "选择") : '';
	},
	_create : function() {
		if (this.asGrid) {
			this.columnEls = this.el.html();
			this.el.empty();
		}
		boot.ComboBox.superClass._create.call(this);
		if (this.allowFilter) {
			this.textEl.attr("readonly", false);
		}
		this._createListBox();
	},
	_createListBox : function() {
		var id = this._uuid + '$box';
		this.popupWidth = (this.popupWidth || this.el.width() - 2);
		var html = '<div id="' + id + '" value="' + this.value + '" textField="' + this.textField + '" valueField="' + this.valueField + '" ';
		html += 'idField="' + this.idField + '" parentidField="' + this.parentidField + '" childrenField="' + this.childrenField + '" ';
		if (this.asTree) {// 树形下拉框
			html += 'class="boot-treebox" ';
			if (this.showCheckBox) {
				html += 'showCheckBox="' + this.showCheckBox + '" ';
			}
			if (this.onlyLeaf) {
				html += 'onlyLeaf="' + this.onlyLeaf + '" ';
			}
			this.popupWidth = this.popupWidth < 220 ? 220 : this.popupWidth;
		}
		if (this.asGrid) {// 表格下拉框
			html += 'class="boot-gridbox" simplePager="true" ';
			if (this.showCheckBox) {
				html += 'showCheckBox="' + this.showCheckBox + '" ';
			}
			if (this.showPager) {
				html += 'showPager="' + this.showPager + '" ';
			}
			this.popupWidth = this.popupWidth < 500 ? 500 : this.popupWidth;
			this.popupHeight = this.popupHeight < 300 ? 300 : this.popupHeight;
		} else {// 普通下拉框
			html += 'class="boot-listbox" ';
		}
		html += 'width="' + this.popupWidth + '" height="' + this.popupHeight + '" ';
		if (this.url) {
			html += 'url="' + this.url + '" ';
		} else {
			html += 'autoLoad="false" ';
		}
		html += 'style="position:absolute;display: none;">';
		if (this.asGrid) {
			html += this.columnEls;
		}
		html += '</div>';
		jQuery(document.body).append(html);
		boot.parse(id.replace('$', '\\$'));
		this.listBox = boot.get(id);
		this.listBox.showEmpty = this.showEmpty;
		this.listBox.el.addClass("combobox-listbox");

		var me = this;
		window.setTimeout(function() {
			if (me.data.length > 0)
				me.listBox._loadData(me.data);
		}, 0);
	},
	_loadData : function(data) {
		this.listBox._loadData(data);
	},
	_setUrl : function(url) {
		this.url = url;
		this.listBox.url = url;
		if (this.asTree) {
			this.listBox.tree._load({
				data : this.params
			});
		} else if (this.asGrid) {
			this.listBox.grid._load({
				data : this.params
			});
		} else
			this.listBox._load({
				data : this.params
			});
	},
	_load : function(params) {
		params = params || this.params;
		if (this.asTree) {
			this.listBox.tree._load({
				data : params
			});
		} else if (this.asGrid) {
			this.listBox.grid._load({
				data : params
			});
		} else
			this.listBox._load({
				data : params
			});
	},
	_setParameters : function(params) {
		this.params = params || {};
		this.listBox._setParameters(this.params);
	},
	_setText : function(text) {
	},
	_setValue : function(value) {
		this.listBox._setValue(value);
		this.value = value;
		this.textEl.val(this.listBox.text);
	},
	_setPopupListPosition : function(box) {
		var winHeight = jQuery(document.body).height();
		var winWidth = jQuery(document.body).width();
		box.width = this.popupWidth || box.width;
		if (box.width <= 0) {
			box.width = this.el.width();
		}
		if (winHeight - box.top > this.listBox.height) {
			box.top = box.top + box.height;
		} else {
			box.top -= this.listBox.height;
		}

		if (box.left + box.width > winWidth) {
			var elWidth = this.el.width();
			if (box.left + elWidth > box.width) {
				box.left += elWidth - box.width;
			}
		}

		box.height = this.popupHeight;
		(this.asGrid || this.asTree) && delete box.width;
		this.listBox.el.css(box);
		this.listBox._show();
	},

	_bindEvents : function() {
		boot.ComboBox.superClass._bindEvents.call(this);
		this.listBox.bind('itemclick', this._onItemClick, this);
		this.listBox.bind('checkboxclick', this._onCheckBoxClick, this);
		this.listBox.bind('setvalue', this._onListBoxLoadSuccess, this);
		this.listBox.bind('loadsuccess', this._onListBoxLoadSuccess, this);
		this.bind('bodyclick', this._onBodyClick, this);
		if (this.listBox.grid) {
			this.listBox.grid.pager.pageSizeEl.bind("beforebuttonaction", this._stopHideGridBox, this);
		}
		if (this.allowFilter) {
			this._on(this.el, '.textbox-text', 'keyup', this._onTextFilter, this);
		}
	},
	_onTextFilter : function(e) {
		var data = boot.clone(this.listBox.data);
		var filter = this.textEl.val();
		for (var i = 0; i < data.length; i++) {
			var row = data[i];
			var text = row[this.textField];
			if (!new RegExp(filter).test(text)) {
				data.splice(i, 1);
				i--;
			} else {
				row[this.textField] = text.replace(filter, '<font style=\'color: brown;font-weight: bolder;font-family: cursive;\'>' + filter + '</font>');
			}
		}
		this.listBox._renderBox(data);
		this.textEl.val(filter);
		var box = this._getBox();
		this._setPopupListPosition(box);
	},
	_stopHideGridBox : function(e) {
		e.sender = this;
		this.listBox._show();
	},
	_onListBoxLoadSuccess : function(e) {
		this.value = e.value;
		this.text = e.text;
		this.textEl.val(this.text);
		this.textEl.trigger('change');

		e.sender = this;
		this._fire("loadsuccess", e);
	},
	_onBodyClick : function() {
		this.listBox._hide();
	},
	_onButtonEditClick : function(e) {
		e.stopPropagation();
		e.sender = this;

		jQuery(".combobox-listbox").hide(); // 隐藏其他下拉框

		this._fire("beforebuttonaction", e);

		var box = this._getBox();
		this._setPopupListPosition(box);

		this._fire("buttonclick", e);
	},
	_onCheckBoxClick : function(e) {
		e.stopPropagation();
		this.value = e.value;
		this.text = e.text;
		this.textEl.val(this.text);
		this.textEl.trigger('change');
		this._validate();

		e.sender = this;
		this._fire("checkboxclick", e);
	},
	_onItemClick : function(e) {
		e.stopPropagation();
		this.value = e.value;
		this.text = e.text;
		this.textEl.val(this.text);
		this.textEl.trigger('change');
		this._validate();
		this.listBox._hide();

		e.sender = this;
		this._fire("itemclick", e);
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "url", "popupHeight", "popupWidth", "idField", "parentidField", "childrenField" ],
			bool : [ "showEmpty", "asTree", "asGrid", "showCheckBox", "onlyLeaf", "showPager", "allowFilter", "showClose" ],
			json : [ "data" ],
			fn : []
		}, attributes || {});
		return boot.ComboBox.superClass._getAttrs.call(this, attrs);
	},

	// API
	getData : function() {
		return this.listBox._getData();
	},
	setData : function(data) {
		this.listBox._loadData(data);
	},
	setUrl : function(url) {
		this._setUrl(url);
	},
	clearAll : function() {
		this.listBox.clearAll();
	},
	load : function(params) {
		this._load(params);
	}
});

boot.Register(boot.ComboBox, 'combobox');
/*----------------------checkbox--------------------------*/
/**
 * @author 田鑫龙
 */
// 复选框
boot.CheckBox = function(id) {
	boot.CheckBox.superClass.constructor.call(this, id);
};

boot.extend(boot.CheckBox, boot.ListBox, {
	uiCls : 'boot-checkbox',
	_initField : function() {
		boot.CheckBox.superClass._initField.call(this);
		this.columnSize = this.columnSize || 0;
	},
	_create : function() {
		boot.CheckBox.superClass._create.call(this);
		this.borderEl.css("position", 'static');
	},
	_renderBox : function() {
		var len = this.data.length;
		var html = new boot.HTML(), textArray = [];
		html.push("<tr>");
		for (var i = 1; i <= len; i++) {
			var item = this.data[i - 1];
			item._uuid = boot.newId();
			html.push('<td>' + this._renderItem(item) + '</td>');
			if (item._selected)
				textArray.push(item[this.textField]);
			if (this.columnSize != 0 && i % this.columnSize == 0) {
				html.push("</tr><tr>");
			}
		}
		html.push("</tr>");
		this.text = textArray.join(',');
		this.boxEl.html('<table style="width: 100%;table-layout: fixed;">' + html.concat() + '</table>');
	},
	_renderItem : function(item) {
		var html = '', checked = item._selected ? 'checked="cheded"' : '', disabled = this.onlyView ? 'disabled="disabled"' : '';
		html += '<div id="' + item._uuid + '" class="box-item" style="';
		html += 'display: inline-block;position: relative;height: 20px;line-height: 20px;cursor: pointer;">';
		html += '<input type="checkbox" ' + checked + ' ' + disabled + ' style="position: absolute;z-index: 0;top: 4px;left: 4px;margin: 0;">';
		html += '<span style="padding-left: 22px;position: relative;">' + item[this.textField] + '</span>';
		html += '</div>';
		return html;
	},
	_changeSelected : function(uuid) {
		var valueArray = [], textArray = [];
		for (var i = 0, len = this.data.length; i < len; i++) {
			var item = this.data[i];
			if (item._uuid === uuid) {
				item._selected = !item._selected;
			}
			if (item._selected == true) {
				valueArray.push(item[this.valueField]);
				textArray.push(item[this.textField]);
			}
		}
		this.value = valueArray.join(',');
		this.text = textArray.join(',');
		this._renderBox();
	},
	_bindEvents : function() {
		boot.CheckBox.superClass._bindEvents.call(this);
	},
	_getData : function() {
		return this.data;
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [],
			bool : [],
			number : [ "columnSize" ]
		}, attributes || {});
		return boot.CheckBox.superClass._getAttrs.call(this, attrs);
	}
});

boot.Register(boot.CheckBox, 'checkbox');

/*----------------------radiobox--------------------------*/
/**
 * @author 田鑫龙
 */
// 单选框
boot.RadioBox = function(id) {
	boot.RadioBox.superClass.constructor.call(this, id);
};

boot.extend(boot.RadioBox, boot.CheckBox, {
	uiCls : 'boot-radiobox',
	_renderItem : function(item) {
		var html = '', checked = item._selected ? 'checked="cheded"' : '', disabled = this.onlyView ? 'disabled="disabled"' : '';
		html += '<div id="' + item._uuid + '" class="box-item" style="';
		html += 'display: inline-block;position: relative;height: 20px;line-height: 20px;cursor: pointer;">';
		html += '<input type="radio" ' + checked + ' ' + disabled + ' style="position: absolute;z-index: 0;top: 4px;left: 4px;margin: 0;">';
		html += '<span style="padding-left: 22px;position: relative;">' + item[this.textField] + '</span>';
		html += '</div>';
		return html;
	},
	_selectItem : function() {
		for (var j = 0, len = this.data.length; j < len; j++) {
			var item = this.data[j];
			var type = typeof this.value;
			type = type.charAt(0).toUpperCase() + type.substring(1, type.length);
			var convertValue = item[this.valueField] === '' ? '' : window[type](item[this.valueField]);
			if (convertValue === this.value) {
				item._selected = true;
			} else {
				item._selected = false;
			}
		}
	},
	_changeSelected : function(uuid) {
		var valueArray = [], textArray = [];
		for (var i = 0, len = this.data.length; i < len; i++) {
			var item = this.data[i];
			item._selected = false;
			if (item._uuid === uuid) {
				item._selected = true;
			}
			if (item._selected == true) {
				this.value = item[this.valueField];
				this.text = item[this.textField];
			}
		}
		this._renderBox();
	}
});

boot.Register(boot.RadioBox, 'radiobox');

/*----------------------toolbar--------------------------*/
/**
 * @author 田鑫龙
 */
boot.Toolbar = function(id) {
	boot.Toolbar.superClass.constructor.call(this, id);
	this._getFields();
};

boot.extend(boot.Toolbar, boot.Rooter, {
	uiCls : "boot-toolbar",
	type : "toolbar",
	_getFields : function() {
		boot.findChildComponents.call(this);
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [],
			number : [ "width", "height" ],
			bool : [],
			css : [],
			fn : []
		}, attributes);
		return boot.Toolbar.superClass._getAttrs.call(this, attrs);
	}
});

boot.Register(boot.Toolbar, "toolbar");
/*----------------------button--------------------------*/
/**
 * @author 田鑫龙
 */
boot.Button = function(id) {
	boot.Button.superClass.constructor.call(this, id);
};

boot.extend(boot.Button, boot.Rooter, {
	uiCls : "boot-button",
	type : "button",
	_initField : function() {
		this.iconCls = this.iconCls || "";
	},
	_create : function() {
		var text = this.el.text();
		if (text == '') {
			this.el.addClass("noText");
		}
		this.el.empty();
		this.el.attr("href", "javascript: void(0);");
		var iconEl = jQuery('<span class="button-icon button-' + this.iconCls + '"></span>');
		var textEl = jQuery('<span class="button-text">' + text + '</span>');
		iconEl.appendTo(this.el);
		textEl.appendTo(this.el);
	},
	_bindEvents : function() {
		this._on(this.el, '.button-text', "click", this._onButtonClick, this);
		this._on(this.el, '.button-icon', "click", this._onButtonClick, this);
	},

	/*----- 事件 start ---------------*/
	_onButtonClick : function(e) {
		this._fire("onclick", e);
	},
	/*----- 事件 end---------------*/
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "id", "iconCls", "action" ],
			number : [ "width", "height" ],
			bool : [],
			css : [],
			fn : [ 'onclick' ]
		}, attributes);
		return boot.Button.superClass._getAttrs.call(this, attrs);
	}
});

boot.Register(boot.Button, "button");

/*----------------------treeservice--------------------------*/
/**
 * @author 田鑫龙
 */
boot.TreeService = function(id) {
	this.showCheckbox = false;
	this.showIcon = true;
	this.autoLoad = true;
	this.showTools = false;
	this.showBorder = false;
	this.showClose = false;
	boot.TreeService.superClass.constructor.call(this, id);
};

boot.extend(boot.TreeService, boot.Panel, {
	_initField : function() {
		boot.TreeService.superClass._initField.call(this);
		this.idField = this.idField || 'id';
		this.prefix = this.prefix || "entityBean";
		this.parentidField = this.parentidField || 'parentid';
		this.childrenField = this.childrenField || 'children';
		this.textField = this.textField || 'text';
		this.loadType = this.loadType || 'full';
		this.selectedNode = {};
		this.parameters = {};
	},
	_create : function() {
		boot.TreeService.superClass._create.call(this);
	},
	_load : function(options) {
		options = options || {};
		boot.concat(this.parameters, options.parameters || options.data || {});
		options.data = boot.addPrefix(this.parameters, this.prefix), options.url = options.url || this.url;
		options.context = this;
		options.success = this._loadSuccess;

		if (options.url)
			boot.ajax(options);
	},
	// 设置url
	_setUrl : function(url) {
		this.url = url;
		this._load();
	},
	// 设置参数
	_setParameters : function(params) {
		this.parameters = params;
	},
	// 加载成功
	_loadSuccess : function(result) {
		if (jQuery.type(result) == 'array') {
			this._loadData(result);
		} else if (result.success) {
			this._loadData(result.resultData);
		}
	},
	_loadData : function(array) {
		this.resource = array;
		this._fire('onbeforerender', {
			sender : this,
			source : this,
			result : array
		});
		// this.data = this._makeTreeData(boot.clone(array));
		this.data = this._makeTreeData(array);
		this.bodyEl.html(this._makeNode(this.data));
		this._fire("onloadsuccess", {
			sender : this,
			source : this,
			result : array,
			asTreeResult : this.data
		});
	},
	// 通过uuid获取node
	_getNodeByUUID : function(uuid, field) {
		field = field || "_uuid";
		var me = this;
		function recursion(array) {
			var find = undefined;
			for (var i = 0, len = array.length; i < len; i++) {
				var node = array[i];
				if (uuid === node[field]) {
					find = node;
				} else if (node[me.childrenField] && node[me.childrenField].length > 0) {
					find = recursion(node[me.childrenField]);
				}
				if (find) {
					break;
				}
			}
			return find;
		}
		return recursion(this.data);
	},
	// 获取父节点
	_getParentNode : function(node) {
		var pid = node[this.parentidField];
		return this._getNodeByUUID(pid, this.idField);
	},
	// 获取所有checked节点
	_getCheckedNodes : function(onlyLeaf) {
		var nodes = [], me = this;
		function recursion(array) {
			for (var i = 0, len = array.length; i < len; i++) {
				var node = array[i];
				if (onlyLeaf) {
					if (node["_checked"] && (node["_isLeaf"] || node[me.childrenField].length == 0)) {
						nodes.push(node);
					}
				} else {
					if (node["_checked"]) {
						nodes.push(node);
					}
				}
				if (node[me.childrenField] && node[me.childrenField].length > 0)
					recursion(node[me.childrenField]);
			}
		}
		recursion(this.data);
		return nodes;
	},
	// 通过uuid获取node
	_getMarkedNodes : function(type) {
		var nodes = {
			"_add" : [],
			"_update" : [],
			"_remove" : []
		};
		var me = this;
		function recursion(array) {
			for (var i = 0, len = array.length; i < len; i++) {
				var node = array[i];
				var _status = node["_status"];
				if (_status) {
					nodes[_status].push(node);
				}
				if (node[me.childrenField] && node[me.childrenField].length > 0)
					recursion(node[me.childrenField]);
			}
		}
		recursion(this.data);
		if (type) {
			return nodes[type];
		}
		return nodes;
	},
	// 获取当前节点的checkbox状态
	_getCheckStatus : function(node) {
		var children = node[this.childrenField] = node[this.childrenField] || [];
		var status = {
			full : Boolean(children.length) || node._checked,
			empty : true
		};
		var me = this;
		function recursion(list) {
			for (var index = 0, length = list.length; index < length; index++) {
				var cnode = list[index];
				status.full = status.full && cnode._checked;
				if (cnode._checked) {
					status.empty = false;
				} else {
					if (!status.full && !status.empty) {
						break;
					} else {
						recursion(cnode[me.childrenField]);
					}
				}
			}
		}
		recursion(children);

		node._checked = status.full || false;
		if (status.full) {
			return 'fullcheck';
		} else if (status.empty) {
			return '';
		} else {
			return 'halfcheck';
		}
	},
	// 创建节点信息
	_makeNode : function(data) {
		var html = new boot.HTML();
		data = data || [];
		for (var index = 0, length = data.length; index < length; index++) {
			var node = this._addNodeIdentify(data, index);

			// 生成节点信息
			html.push('<div id="' + node._uuid + '" class="tree-node">');
			html.push(this._renderNode(node));
			html.push('</div>');
		}
		return html.concat();
	},
	// 渲染node节点
	_renderNode : function(node) {
		var html = new boot.HTML();
		var actionIcon = this._makeActionIcon(node);
		var icon = this._makeIcon(node);
		var checkbox = this._makeCheckbox(node);
		var text = this._makeText(node);
		var tools = this._makeTools(node);
		var cls = this._renderNodeCls(node);
		var dirty = node._status ? 'dirty ' : '';

		html.push('<div id="' + node._uuid + '$border" class="' + cls + '">');
		html.push(actionIcon);
		html.push(checkbox);
		html.push('<div id="' + node._uuid + '$node" class="tree-node-innerInfo ' + dirty + '">' + icon + text + '</div>');
		html.push(tools);
		html.push('</div>');
		return html.concat();
	},
	// 创建子节点
	_renderChildrenNodes : function(node) {
		node[this.childrenField] = node[this.childrenField] || [];
		var cls = "tree-node-children" + (node._showLine ? ' line' : '');
		return '<div id="' + node._uuid + '$children" class="' + cls + '">' + this._makeNode(node[this.childrenField], node) + '</div>';
	},
	// 增加节点
	_addNodes : function(nodes, parentNode) {
		for ( var index in nodes) {
			var node = nodes[index];
			node["_status"] = "_add";
			node[this.childrenField] = node[this.childrenField] || [];
			if (parentNode && parentNode._uuid) {
				node["_checked"] = parentNode["_checked"] || false;
				node[this.parentidField] = parentNode[this.idField];
				parentNode[this.childrenField].push(node);
			} else {
				node['_isLast'] = false;
				node[this.parentidField] = "";
				this.data.push(node);
				this._updateNodes(node);
			}
		}
		if (parentNode && parentNode._uuid) {
			parentNode._expanded = true;
			parentNode._isLeaf = false;
			this._updateNodes(parentNode);
		}
	},
	// 更新树节点
	_updateNodes : function(node) {
		var _uuid = node._uuid;
		var nodeEl = jQuery('#' + _uuid, this.bodyEl);
		if (nodeEl[0]) {
			if (node._status == '_remove') {
				nodeEl.empty();
				return;
			}
			var html = new boot.HTML();
			html.push(this._renderNode(node));
			if (node._expanded) {
				html.push(this._renderChildrenNodes(node));
			}
			nodeEl.html(html.concat());
		} else {
			this.bodyEl.prepend(this._makeNode([ node ]));
		}
	},
	// 更新单个树节点
	_updateNode : function(node, record) {
		boot.concat(node, record);
		var _uuid = node._uuid;
		var nodeEl = jQuery('#' + _uuid + '\\$border', this.bodyEl);
		nodeEl.replaceWith(this._renderNode(node));
	},
	// 改变checkbox状态
	_checkCheckBox : function(node, status) {
		node = this._getNodeByUUID(node._uuid) || this._getNodeByUUID(node.id, "id");
		if (node) {
			node._checked = status;
			this._updateNode(node, node);
		}
	},
	// 给树节点添加标识
	_addNodeIdentify : function(data, index) {
		if (jQuery.type(data) == 'object') {
			data = [ data ];
		}
		if (index == undefined) {
			index = 0;
		}
		var node = data[index] || {};
		var size = data.length;
		var children = node[this.childrenField] = node[this.childrenField] || [];
		var isLeaf = children.length == 0;
		var isLast = index == size - 1;
		var showLine = !isLast && size > 1;

		// node["_uuid"] = node["_uuid"] || boot.newId();
		// 是否叶子节点
		node['_isLeaf'] = node['_isLeaf'] !== undefined ? node['_isLeaf'] : isLeaf;
		// 是否最后一个节点
		node['_isLast'] = node['_isLast'] !== undefined ? node['_isLast'] : isLast;
		// 是否显示连接线
		node['_showLine'] = node['_showLine'] !== undefined ? node['_showLine'] : showLine;

		node['_checked'] = node['_checked'] === undefined ? false : node['_checked'];
		return node;
	},
	// 生成toolbar
	_makeTools : function(node) {
		var _uuid = node._uuid;
		if (this.showTools) {
			if (node._editting) {
				return '<div class="tree-node-tools"><span id="' + _uuid + '$submit" class="tree-tools-btn submit"></span></div>';
			} else {
				var edit = '<span id="' + _uuid + '$edit" class="tree-tools-btn edit"></span>';
				var remove = '<span id="' + _uuid + '$remove" class="tree-tools-btn remove"></span>';
				return '<div class="tree-node-tools">' + edit + remove + '</div>';
			}
		}
		return '';
	},
	// 生成折叠图标
	_makeActionIcon : function(node) {
		return '<span id="' + node._uuid + '$action" class="tree-node-actionIcon"></span>';
	},
	// 生成文件图标
	_makeIcon : function(node) {
		if (this.showIcon) {
			return '<span id="' + node._uuid + '$icon" class="tree-node-icon"></span>';
		}
		return '';
	},
	// 渲染node节点的图标样式
	_renderNodeCls : function(node) {
		var cls = 'tree-node-info ' + this._getCheckStatus(node) + ' ';
		var last = '';
		if (node._isLast) {
			last = 'last';
		}
		if (node._isLeaf) {
			cls += last + 'line ';
		} else {
			if (node._expanded) {
				cls = cls + 'folderopen ' + last + 'expand ';
			} else {
				cls = cls + 'folderclose  ' + last + 'collapse ';
			}
		}
		if (this.selectedNode._uuid == node._uuid) {
			cls += "selected ";
		}
		return cls;
	},
	// 生成复选框
	_makeCheckbox : function(node) {
		if (this.showCheckbox) {
			return '<span id="' + node._uuid + '$checkbox" class="tree-node-checkbox"></span>';
		}
		return '';
	},
	// 生成文本信息
	_makeText : function(node) {
		var _uuid = node._uuid;
		var text = node[this.textField];
		if (node._editting) {
			return '<span id="' + _uuid + '$text" class="tree-node-text"><input id="' + _uuid + '$editor" class="boot-textbox" value="' + text
					+ '" height="20" style="width: auto;"/></span>';
		}
		return '<span id="' + _uuid + '$text" class="tree-node-text">' + text + '</span>';
	},
	_makeTreeData : function(resource) {
    	var list = boot.clone(resource);
        var me = this;
        var maps = {}, ListInMap = [];
        // 描述：将传入的json数据按{parentid:data}形式整理
        for (var i = 0, len = list.length; i < len; i++) {
            var node = list[i];
            node["_uuid"] = node["_uuid"] || boot.newId();// 追加UUID
            resource[i]["_uuid"] = node["_uuid"];// 原始数据追加UUID
            node[this.childrenField] = [];
            // 初始化children数组
            var parentid = node[this.parentidField];
            parentid = parentid == null ? '' : parentid;
            if (!maps[parentid]) {// parentid不存在就初始化
                maps[parentid] = [];
            }
            maps[parentid].push(node);
        }
        // 从maps中拿出第一个数组
        ListInMap = maps[''] || maps['null'];
        function recursion(children_list, level) {
            for (var i = 0, len = children_list.length; i < len; i++) {
                var node = children_list[i];
                var child = maps[node[me.idField]];
                child = child ? child : [];
                node[me.childrenField] = child;
                recursion(child, level++);
            }
        };
        if(ListInMap == undefined){
        	return list;
        }
        // 描述：将整理好的maps循环递归调用recursion方法
        for (var i = 0, len = ListInMap.length; i < len; i++) {
            var node = ListInMap[i];
            var child = maps[node[this.idField]];
            // 将在maps中找到的id与当前节点的parentid相同的节点放入chidren数组中
            child = child ? child : [];
            node[this.childrenField] = child;
            recursion(child, 1);
        }
        return ListInMap;
    },
	// 递归加入删除标识
	_remarkChildrenRemoveFlag : function(node) {
		var children = node[this.childrenField];
		for (var i = 0, length = children.length; i < length; i++) {
			var cNode = children[i];
			cNode['_status'] = '_remove';
			this._remarkChildrenRemoveFlag(cNode);
		}
	},
	// 递归check父节点
	_checkParentNodes : function(node) {
		var parentid = node[this.parentidField];
		var parent = this._getNodeByUUID(parentid, this.idField);
		if (parent == undefined) {
			return;
		}
		var status = this._getCheckStatus(parent);
		var selector = '#' + parent._uuid + '\\$border';
		var el = jQuery(selector, this.bodyEl);
		el.removeClass("fullcheck"), el.removeClass("halfcheck"), el.addClass(status);// 提前移除
		this._checkParentNodes(parent);
	},
	// 递归check子节点
	_checkChildNodes : function(parent) {
		var children = parent[this.childrenField];
		for (var i = 0, len = children.length; i < len; i++) {
			var node = children[i];
			node._checked = parent._checked || false;
			var selector = '#' + node._uuid + '\\$border';
			var el = jQuery(selector, this.bodyEl);
			if (node._checked) {
				el.addClass("fullcheck");
			} else {
				el.removeClass("fullcheck");
			}
			this._checkChildNodes(node);
		}
	},
	_bindEvents : function() {
		this._on(this.bodyEl, '.tree-node-actionIcon', 'click', this._onActionIconClick, this);
		this._on(this.bodyEl, '.tree-node-innerInfo', 'click', this._onNodeClick, this);
		this._on(this.bodyEl, '.tree-node-checkbox', 'click', this._onCheckBoxClick, this);
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ 'idField', 'parentidField', 'childrenField', 'textField', 'url', 'loadType', "binding", "queryMethod", "action" ],
			bool : [ 'showCheckbox', 'showIcon', 'showTools', "autoLoad" ],
			css : [],
			fn : [ 'nodeclick' ]
		}, attributes);
		return boot.TreeService.superClass._getAttrs.call(this, attrs);
	},

	// API
	reload : function() {
		this._load();
	},
	load : function(options) {
		this._load(options);
	},
	setUrl : function(url) {
		this._setUrl(url);
	},
	getSelectedNode : function() {
		return this.selectedNode;
	},
	getData : function() {
		return this.resource;
	},
	loadData : function(array) {
		this._loadData(array);
	},
	getCheckedNodes : function(onlyLeaf) {
		return this._getCheckedNodes(onlyLeaf);
	},
	getChangedNodes : function(type) {
		return this._getMarkedNodes(type);
	},
	updateNode : function(node, record) {
		this._updateNode(node, record);
	},
	setParamters : function(params) {
		this._setParameters(params);
	},
	getParentNode : function(node) {
		return this._getParentNode(node);
	},
	checkCheckBox : function(node, status) {
		this._checkCheckBox(node, status);
	}
});
/*----------------------tree--------------------------*/
/**
 * @author 田鑫龙
 * @Discription: tree类，继承自panel。
 * 
 */
boot.Tree = function(id) {
	boot.Tree.superClass.constructor.call(this, id);
	if (this.autoLoad) {
		this._load();
	}
};

boot.extend(boot.Tree, boot.TreeService, {
	uiCls : 'boot-tree',
	_bindEvents : function() {
		boot.Tree.superClass._bindEvents.call(this);
		this._on(this.bodyEl, '.edit', 'click', this._onEditButtonClick, this);
		this._on(this.bodyEl, '.submit', 'click', this._onSubmitButtonClick, this);
		this._on(this.bodyEl, '.remove', 'click', this._onRemoveButtonClick, this);
	},
	_onNodeClick : function(e) {
		var el = e.selector;
		var _uuid = el[0].id.split('$')[0];
		var node = this._getNodeByUUID(_uuid);

		var oldSelector = '#' + this.selectedNode._uuid + '\\$border';
		var oldEl = jQuery(oldSelector, this.bodyEl);
		oldEl.removeClass("selected");

		var selector = '#' + _uuid + '\\$border';
		var selected = jQuery(selector, this.bodyEl);
		selected.addClass("selected");

		this.selectedNode._selected = false;
		this.selectedNode = node;
		node._selected = true;

		var bind = boot.getBinding(this.id, this.binding);
		if (bind) {
			bind._triggerQuery({
				parentId : node[this.idField]
			});
		}
		e.node = node;
		this._fire('onnodeclick', e);
		// 触发绑定事件
	},
	_onActionIconClick : function(e) {
		e.stopPropagation();
		var el = e.selector;
		var _uuid = el[0].id.split('$')[0];
		var node = this._getNodeByUUID(_uuid);
		node._expanded = !node._expanded;
		this._updateNodes(node);
	},
	_onCheckBoxClick : function(e) {
		var el = e.selector;
		var _uuid = el[0].id.split('$')[0];
		var node = this._getNodeByUUID(_uuid);
		node._checked = !node._checked;
		var selector = '#' + node._uuid + '\\$border';
		var el = jQuery(selector, this.bodyEl);
		if (node._checked) {
			el.addClass("fullcheck");
		} else {
			el.removeClass("fullcheck");
		}
		// 响应checkbox点击事件
		this._checkChildNodes(node);
		this._checkParentNodes(node);

		e.node = node;
		this._fire("oncheckboxclick", e);
	},
	_onEditButtonClick : function(e) {
		var el = e.selector;
		var _uuid = el[0].id.split('$')[0];
		var node = this._getNodeByUUID(_uuid);
		node._editting = !node._editting;
		this._updateNodes(node);
		boot.parse(_uuid + "\\$editor");
	},
	// 提交功能
	_onSubmitButtonClick : function(e) {
		var el = e.selector;
		var _uuid = el[0].id.split('$')[0];
		var node = this._getNodeByUUID(_uuid);
		var editor = boot.get(_uuid + "$editor");
		node._editting = !node._editting;
		var editorValue = editor.getValue();
		if (node[this.textField] != editorValue) {
			node["_status"] = node["_status"] || "_update";
		}
		node[this.textField] = editorValue;
		// 添加状态
		this._updateNodes(node);
		boot.Destroy(_uuid + "$editor");
	},
	_onRemoveButtonClick : function(e) {
		var el = e.selector;
		var _uuid = el[0].id.split('$')[0];
		var node = this._getNodeByUUID(_uuid);
		if (node[this.childrenField].length > 0) {
			if (confirm('该节点包含子节点,确认删除?')) {
				// 添加状态
				node["_status"] = "_remove";
				this._remarkChildrenRemoveFlag(node);
				this._updateNodes(node);
			}
		} else {
			if (confirm('确认删除?')) {
				// 添加状态
				node["_status"] = "_remove";
				this._updateNodes(node);
			}
		}
	},

	// API
	// 添加节点，如果parentNode不传入，代表增加根节点
	addNodes : function(nodes, parentNode) {
		this._addNodes(nodes, parentNode);
	}
});

// 注册tree类
boot.Register(boot.Tree, 'tree');

/*----------------------treebox--------------------------*/
/**
 * 田鑫龙
 */
boot.TreeBox = function(id) {
	boot.TreeBox.superClass.constructor.call(this, id);
};

boot
		.extend(
				boot.TreeBox,
				boot.Rooter,
				{
					uiCls : "boot-treebox",
					_initField : function() {
						boot.TreeBox.superClass._initField.call(this);
						this.textField = this.textField || "name";
						this.valueField = this.valueField || "id";
						this.height = this.height || 220;
						this.width = this.width || 150;
						this.value = this.value || '';
						this.data = this.data || [];
						this.autoLoad = this.autoLoad === false ? false : true;
						this.idField = this.idField || "id";
						this.parentidField = this.parentidField || 'parentid';
						this.childrenField = this.childrenField || 'children';
					},
					_create : function() {
						this.el.css({
							"height" : this.height,
							"width" : this.width,
							"z-index" : 10
						});
						var border = jQuery('<div class="listbox-border" style="border-style: solid;border-width: 1px;overflow: auto;position:absolute;top: 0;left: 0;right: 0;bottom: 0;"></div>');
						border.appendTo(this.el);
						this.borderEl = border;

						var treeid = boot.newId();
						var html = '<div id="' + treeid + '" class="boot-tree" loadType="lazy" autoLoad="' + this.autoLoad + '" ';
						html += 'idField="' + this.idField + '" textField="' + this.textField + '" parentidField="' + this.parentidField + '" childrenField="' + this.childrenField
								+ '" ';
						if (this.showCheckBox) {
							html += 'showCheckbox="' + this.showCheckBox + '" ';
						}
						if (this.url) {
							html += 'url="' + this.url + '" ';
						}
						html += 'showBorder="false" style="width: 100%;height: 100%;"></div>';

						var boxEl = jQuery(html);
						boxEl.appendTo(border);
						boot.parse(treeid.replace('$', '\\$'));
						this.treeEl = boot.get(treeid);

						var errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '" style="color: red;"></span>');
						errorEl.appendTo(this.el);
						this.errorEl = errorEl;
					},
					_setParameters : function(params) {
						this.tree._setParameters(params);
					},
					_show : function() {
						this.el.show();
					},
					_hide : function() {
						this.el.hide();
					},
					_setValue : function(value) {
						this.value = value;
						this.treeEl._loadData(this.treeEl.resource);
					},
					_bindEvents : function() {
						boot.TreeBox.superClass._bindEvents.call(this);
						this._on(this.el, '.boot-tree', 'click', this._treeClick, this);
						this.treeEl.bind('nodeclick', this._onNodeClick, this);
						this.treeEl.bind('checkboxclick', this._onCheckBoxClick, this);
						this.treeEl.bind('beforerender', this._onTreeBeforeRender, this);
					},
					_onTreeBeforeRender : function(e) {
						var result = e.result;
						if (this.value != undefined) {
							var array = this.value.toString().split(","), textArray = [];
							for (var i = 0, len = result.length; i < len; i++) {
								var node = result[i];
								node._checked = false;
								for (var j = 0; j < array.length; j++) {
									var value = array[j];
									if (node[this.valueField] === value) {
										node._checked = true;
										textArray.push(node[this.textField]);
										array.splice(j, 1);
										break;
									}
								}
							}
							this.text = textArray.join(",");

							e.sender = this;
							e.text = this.text;
							e.value = this.value;
							this._fire('loadsuccess', e);
						}
					},
					_onCheckBoxClick : function(e) {
						var source = e.sender;
						var nodes = source.getCheckedNodes(true);
						var valueArray = [], textArray = [];
						for (var i = 0, len = nodes.length; i < len; i++) {
							var node = nodes[i];
							valueArray.push(node[this.valueField]);
							textArray.push(node[this.textField]);
						}
						this.value = valueArray.join(",");
						this.text = textArray.join(",");

						e.sender = this;
						e.value = this.value;
						e.text = this.text;
						this._fire("oncheckboxclick", e);
					},
					_onNodeClick : function(e) {
						if (!this.showCheckBox) {
							var node = e.node;
							if (!node._isLeaf && this.onlyLeaf) {
								return;
							}
							this.value = node[this.valueField];
							this.text = node[this.textField];

							e.sender = this;
							e.text = this.text;
							e.value = this.value;
							this._fire('onitemclick', e);
						}
					},
					_treeClick : function(e) {
						e.stopPropagation();
					},
					_getAttrs : function(attributes) {
						var attrs = boot.concat({
							str : [ "url", "textField", "valueField", "value", "idField", "parentidField", "childrenField" ],
							bool : [ "showCheckBox", "onlyLeaf", "autoLoad" ],
							json : [ "data" ],
							number : [ "height", "width" ]
						}, attributes || {});
						return boot.TreeBox.superClass._getAttrs.call(this, attrs);
					}
				});

boot.Register(boot.TreeBox, "treebox");

/*-----------------------gridbox------------------------*/
/**
 * 田鑫龙
 */
boot.GridBox = function(id) {
	boot.GridBox.superClass.constructor.call(this, id);
};

boot
		.extend(
				boot.GridBox,
				boot.Rooter,
				{
					uiCls : "boot-gridbox",
					_initField : function() {
						boot.GridBox.superClass._initField.call(this);
						this.textField = this.textField || "name";
						this.valueField = this.valueField || "id";
						this.height = this.height || 450;
						this.width = this.width || 350;
						this.value = this.value || '';
						this.data = this.data || [];
						this.autoLoad = this.autoLoad === false ? false : true;
						this.idField = this.idField || "id";
						this.parentidField = this.parentidField || 'parentid';
						this.childrenField = this.childrenField || 'children';
					},
					_create : function() {
						this.columnEls = this.el.html();
						this.el.empty();

						this.el.css({
							"height" : this.height,
							"width" : this.width,
							"z-index" : 10
						});
						var border = jQuery('<div class="listbox-border" style="border-style: solid;border-width: 1px;overflow: auto;position:absolute;top: 0;left: 0;right: 0;bottom: 0;"></div>');
						border.appendTo(this.el);
						this.borderEl = border;

						var gridKey = boot.newId();
						var html = '<div id="' + gridKey + '" class="boot-datagrid" cacheRow="true" autoLoad="' + this.autoLoad + '" ';
						html += 'idField="' + this.idField + '" textField="' + this.textField + '" parentidField="' + this.parentidField + '" childrenField="' + this.childrenField
								+ '" ';
						if (this.showCheckBox) {
							html += 'showSelectBox="' + this.showCheckBox + '" ';
						}
						if (this.showPager) {
							html += 'showPager="' + this.showPager + '" ';
						}
						if (this.simplePager) {
							html += 'simplePager="' + this.simplePager + '" ';
						}
						if (this.url) {
							html += 'url="' + this.url + '" ';
						}
						html += 'showBorder="false" style="width: 100%;height: 100%;">' + this.columnEls + '</div>';

						var boxEl = jQuery(html);
						boxEl.appendTo(border);
						boot.parse(gridKey.replace('$', '\\$'));
						this.grid = boot.get(gridKey);

						var errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '" style="color: red;"></span>');
						errorEl.appendTo(this.el);
						this.errorEl = errorEl;
					},
					_setParameters : function(params) {
						this.grid._setParameters(params);
					},
					_show : function() {
						this.el.show();
						this.grid._resize();
					},
					_setValue : function(value) {
						if (value != undefined) {
							this.value = value;
							this.grid._reload();
							this._fire('setvalue', {
								value : this.value
							});
						}
					},
					_hide : function() {
						this.el.hide();
					},
					_bindEvents : function() {
						boot.GridBox.superClass._bindEvents.call(this);
						this._on(this.el, '.boot-datagrid', 'click', this._gridClick, this);
						this.grid.bind('rowclick', this._onRowClick, this);
						this.grid.bind('select', this._onCheckBoxClick, this);
						this.grid.bind('checkall', this._onTotalCheckBoxClick, this);
						this.grid.bind('beforerender', this._onGridBeforeRender, this);
					},
					_onGridBeforeRender : function(e) {
						var result = e.result;
						if (this.value != undefined) {
							var array = this.value.toString().split(","), textArray = [];
							for (var i = 0, len = result.length; i < len; i++) {
								var node = result[i];
								node._checked = false;
								for (var j = 0; j < array.length; j++) {
									var value = array[j];
									if (node[this.valueField] === value) {
										node._checked = true;
										textArray.push(node[this.textField]);
										array.splice(j, 1);
										break;
									}
								}
							}
							this.text = textArray.join(",");

							e.sender = this;
							e.text = this.text;
							e.value = this.value;
							this._fire('loadsuccess', e);
						}
					},
					_onTotalCheckBoxClick : function(e) {
						var source = e.sender;
						var nodes = e.rows;
						var valueArray = [], textArray = [];
						for (var i = 0, len = nodes.length; i < len; i++) {
							var node = nodes[i];
							valueArray.push(node[this.valueField]);
							textArray.push(node[this.textField]);
						}
						this.value = valueArray.join(",");
						this.text = textArray.join(",");

						e.sender = this;
						e.value = this.value;
						e.text = this.text;
						this._fire("oncheckboxclick", e);
					},
					_onCheckBoxClick : function(e) {
						var source = e.sender;
						var nodes = source._getSelectedRows();
						var valueArray = [], textArray = [];
						for (var i = 0, len = nodes.length; i < len; i++) {
							var node = nodes[i];
							valueArray.push(node[this.valueField]);
							textArray.push(node[this.textField]);
						}
						this.value = valueArray.join(",");
						this.text = textArray.join(",");

						e.sender = this;
						e.value = this.value;
						e.text = this.text;
						this._fire("oncheckboxclick", e);
					},
					_onRowClick : function(e) {
						if (!this.showCheckBox) {
							var row = e.row;
							this.value = row[this.valueField];
							this.text = row[this.textField];

							e.sender = this;
							e.text = this.text;
							e.value = this.value;
							this._fire('onitemclick', e);
						}
					},
					_gridClick : function(e) {
						e.stopPropagation();
					},
					_getAttrs : function(attributes) {
						var attrs = boot.concat({
							str : [ "url", "textField", "valueField", "value", "idField", "parentidField", "childrenField" ],
							bool : [ "showCheckBox", "autoLoad", "showPager", "simplePager" ],
							json : [ "data" ],
							number : [ "height", "width" ]
						}, attributes || {});
						return boot.GridBox.superClass._getAttrs.call(this, attrs);
					}
				});

boot.Register(boot.GridBox, "gridbox");
/*----------------------window--------------------------*/
/**
 * @author 田鑫龙
 */
boot.Window = function(id) {
	this.fullScreen = false;
	this.showModal = true;
	boot.Window.superClass.constructor.call(this, id);
	this._loadPage();
	if (this.el)
		this.el.css("visibility", "visible");
};

boot.extend(boot.Window, boot.Panel, {
	uiCls : "boot-window",
	type : "window",
	_initField : function() {
		this.width = this.width || 600;
		this.height = this.height || 500;
	},
	_init : function(el) {
		if (el) {
			if (jQuery.type(el) === 'string') {
				this.id = el;
				this.el = jQuery('#' + this.id);
			} else if (el instanceof jQuery) {
				this.el = el;
				this.id = el[0].id;
			} else {
				el["dragable"] = true;
				boot.concat(this, el);
				var win = jQuery('<div class="boot-panel" style="z-index: 100;position: fixed;"></div>');
				var showModal = this.showModal ? '' : 'display: none;';
				var shadow = jQuery('<div class="boot-shadow" style="position: fixed;background-color: #9EA9B3;top: 0;left: 0;bottom: 0;right: 0;z-index: 99;' + showModal
						+ '"></div>');
				jQuery(document.body).append(win).append(shadow);
				this.el = win;
				this.shadowEl = shadow;
			}
			this.box = this._getBox();
		} else {
			alert("new boot.Window时缺少参数!");
		}
	},
	_loadPage : function() {
		this._updateLayout();
		if (this.fullScreen) {
			this._bindResize();
		}
		if (this.url) {
			this.bodyEl.css("overflow", "hidden");
			this.iframe = jQuery("<iframe src=\"" + this.url + "\" style=\"width: 100%;height: 100%;border: none;margin: 0;padding: 0;\"></iframe>");
			this._setView(this.iframe);
			this._doOnload();
		}
	},
	_bindResize : function() {
		var me = this;
		jQuery(window).resize(function() {
			me._updateLayout(jQuery(this));
		});
	},
	_updateLayout : function(win) {
		win = win || jQuery(window);
		var width = win.width(), height = win.height();

		if (this.fullScreen) {
			// this._setWidth(width);
			// this._setHeight(height);
			this.offset = {
				top : 0,
				left : 0,
				width : '100%',
				height : '100%'
			};
		} else {
			var left = (width - (this.width || this.el.width())) / 2, top = (height - (this.height || this.el.height())) / 2;
			if (left <= 2) {
				left = 2;
			}
			if (top <= 2) {
				top = 2;
			}
			this.offset = this.offset || {
				left : left,
				top : top
			};
		}
		this.el.css(this.offset);
	},
	_doOnload : function() {
		var me = this;
		if (this.onload) {
			this.iframe.on('load', function(e) {
				if (this.contentWindow) {
					this.contentWindow.closeWindow = (function(sender) {
						return function() {
							if (!(this.allowAutoClose === false)) {
								sender.destroy();
								sender = null;
							}
						};
					})(me);
					this.contentWindow.hideWindow = (function(sender) {
						return function() {
							sender.hide();
						};
					})(me);
					me.onload.call(this.contentWindow, {
						parent : window,
						sender : me
					});
					me._fire('onload', e);
				}
			});
		}
	},
	// 销毁时调用
	_doOndestroy : function() {
		if (this.ondestroy) {
			var innerFrame = this.iframe[0];
			if (innerFrame) {
				var win = innerFrame.contentWindow;
				this.ondestroy.call(win, {
					parent : window,
					sender : this
				});
			} else {
				this.ondestroy.call(window, {
					parent : window,
					sender : this
				});
			}
		}
	},
	_setMaxWindow : function() {
		this.el.css({
			width : '100%',
			height : '100%'
		});
	},
	_bindEvent : function() {
		this._bind('maxclick', this._onMaxClick, this);
	},
	_onMaxClick : function(e) {
		this.__position = this.__position || this.el.offset();
		boot.concat(this.offset, this.__position);
		boot.concat(this.offset, {
			width : this.width,
			height : this.height
		});
		this.fullScreen = !this.fullScreen;
		this._updateLayout();
	},
	// 事件
	_onCloseClick : function(e) {
		e.stopPropagation();
		this._fire('oncloseclick', e);
		this._destory(e);
	},
	_destory : function(e) {
		this.el.hide();
		this._doOndestroy();
		this.iframe.attr("src", "about:blank");
		this.el.remove();
		this.shadowEl.remove();
		this._fire('ondestory', e);
	},

	// API
	destroy : function() {
		this._destory();
	},
	show : function() {
		this.el.show();
	},
	hide : function() {
		this.el.hide();
	}
});

boot.Register(boot.Window, "window");

/*----------------------pager--------------------------*/
/**
 * @author 田鑫龙
 */
boot.Pager = function(id) {
	boot.Pager.superClass.constructor.call(this, id);
};

boot.extend(boot.Pager, boot.Rooter, {
	uiCls : "boot-pager",
	type : "pager",
	_initField : function() {
		this.pageSizeEl = boot.newId();
		this.pageIndexEl = boot.newId();
		this.totalPageEl = boot.newId();
		this.infoEl = boot.newId();
		this.pageIndex = this.pageIndex || 1;
		this.historyIndex = this.pageIndex;
		this.sizeList = this.sizeList || [ 20, 50, 100, 1000 ];
		this.pageSize = this.pageSize || this.sizeList[0];
		this.total = this.total || 0;
		this.totalPageSize = Math.ceil(this.total / this.pageSize);
	},
	_create : function(parent) {
		var html = [];
		html.push('<div class="pager-border" style="height: 100%;">');
		html.push('<table cellspacing="0" cellpadding="0" border="0" style="width: 100%;height: 100%;font-size: 12px;text-align: center;">');
		html.push('<tr>');
		html.push('<td style="width: 70px;text-align: right;"><span id="' + this.pageSizeEl + '" value="' + this.pageSize
				+ '" class="boot-combobox" width="60" height="18" showEmpty="false"></span></td>');
		html.push('<td style="width: 10px;"><span class="separator"></span></td>');
		html.push('<td style="width: 34px;"><a class="pager-button" href="javascript: void(0);"><span class="icon pager-first"></span></a></td>');
		html.push('<td style="width: 34px;"><a class="pager-button" href="javascript: void(0);"><span class="icon pager-prev"></span></a></td>');
		html.push('<td style="width: 40px;"><input id="' + this.pageIndexEl + '" type="text" class="boot-textbox" width="40" height="18" value="1"/></td>');
		html.push('<td style="width: 60px;"><span id="' + this.totalPageEl + '" class="total">/ 1</span></td>');
		html.push('<td style="width: 34px;"><a class="pager-button" href="javascript: void(0);"><span class="icon pager-next"></span></a></td>');
		html.push('<td style="width: 34px;"><a class="pager-button" href="javascript: void(0);"><span class="icon pager-last"></span></a></td>');
		html.push('<td style="width: 10px;"><span class="separator"></span></td>');
		html.push('<td style="width: 34px;"><a class="pager-button" href="javascript: void(0);"><span class="icon pager-reload"></span></a></td>');
		html.push('<td id="' + this.infoEl + '" style="padding-right: 10px;text-align: right;"></td>');
		html.push('</tr>');
		html.push('</table>');
		html.push('</div>');

		this.el.html(html.join(""));
		boot.parse(this.pageSizeEl);
		boot.parse(this.pageIndexEl);

		this.pageSizeEl = boot.get(this.pageSizeEl);
		this.pageIndexEl = boot.get(this.pageIndexEl);
		this.totalPageEl = jQuery("#" + this.totalPageEl);
		this.infoEl = jQuery("#" + this.infoEl);

		this._setSizeList();
		// this.pageSizeEl.setValue(this.pageSize);

	},
	_setSizeList : function(list) {
		list = list || this.sizeList;
		for (var i = 0; i < list.length; i++) {
			var size = list[i];
			var o = {
				"id" : size,
				"name" : size
			};
			list[i] = o;
		}
		this.pageSizeEl._loadData(list);
	},
	_setPageSize : function(size) {
		if (this.pageSizeEl) {
			this.pageSizeEl.setValue(size || this.pageSize);
			this.pageSizeEl.setText(size || this.pageSize);
		}
	},
	_setPageIndex : function(pageIndex) {
		this.pageIndex = pageIndex;
		this.pageIndexEl.setValue(pageIndex);
	},
	_updatePager : function(total) {
		this.total = total;
		this.totalPageSize = Math.ceil(total / this.pageSize);
		this.totalPageEl.html('/ ' + this.totalPageSize);

		if (this.simplePager) {
			this.infoEl.html('共 ' + total + ' 条');
		} else {
			this.infoEl.html("当前第 " + this.pageIndex + ' 页,共 ' + this.totalPageSize + ' 页; 每页 ' + this.pageSize + ' 条,共 ' + total + ' 条');
		}
	},
	_bindEvents : function() {
		this._on(this.el, ".pager-first", 'click', this._onFirstButtonClick, this);
		this._on(this.el, ".pager-prev", 'click', this._onPrevButtonClick, this);
		this._on(this.el, ".pager-next", 'click', this._onNextButtonClick, this);
		this._on(this.el, ".pager-last", 'click', this._onLastButtonClick, this);
		this._on(this.el, ".pager-reload", 'click', this._onReloadButtonClick, this);
		this.pageSizeEl.bind('change', this._onPageSizeChange, this);
		this.pageIndexEl.bind("enterpress", this._onPageIndexChange, this);
	},
	_onPageSizeChange : function(e) {
		this.pageSize = Number(e.value);
		this.pageIndex = 1;
		this.pageIndexEl.setValue(1);
		e.sender = this;
		this._fire('pagesizechange', e);
	},
	_onPageIndexChange : function(e) {
		this.pageIndex = Number(e.value);
		if (this.pageIndex >= 1 && this.pageIndex <= this.totalPageSize && this.historyIndex != this.pageIndex) {
			this.historyIndex = this.pageIndex;
			e.sender = this;
			this._fire('pageskipchange', e);
		} else {
			this.pageIndex = this.historyIndex;
			e.sender.value = this.historyIndex;
			e.sender.textEl.val(this.historyIndex);
		}
	},
	_onFirstButtonClick : function(e) {
		if (this.pageIndex > 1) {
			this.pageIndex = 1;
			this.pageIndexEl.setValue(this.pageIndex);
			this.historyIndex = this.pageIndex;
			this._fire('pagerfirst', e);
		}
	},
	_onPrevButtonClick : function(e) {
		if (this.pageIndex > 1) {
			this.pageIndex -= 1;
			this.pageIndexEl.setValue(this.pageIndex);
			this.historyIndex = this.pageIndex;
			this._fire('pagerprevious', e);
		}
	},
	_onNextButtonClick : function(e) {
		if (this.pageIndex < this.totalPageSize) {
			this.pageIndex += 1;
			this.pageIndexEl.setValue(this.pageIndex);
			this.historyIndex = this.pageIndex;
			this._fire('pagernext', e);
		}
	},
	_onLastButtonClick : function(e) {
		if (this.pageIndex < this.totalPageSize) {
			this.pageIndex = this.totalPageSize;
			this.pageIndexEl.setValue(this.pageIndex);
			this.historyIndex = this.pageIndex;
			this._fire('pagerlast', e);
		}
	},
	_onReloadButtonClick : function(e) {
		this.pageIndex = 1;
		this.pageIndexEl.setValue(this.pageIndex);
		this.historyIndex = this.pageIndex;
		this._fire('pagerreload', e);
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "id", "style" ],
			bool : [ "simplePager" ],
			number : [ "pageIndex", "pageSize" ],
			json : [ "sizeList" ]
		}, attributes || {});
		return boot.Pager.superClass._getAttrs.call(this, attrs);
	}
});

boot.Register(boot.Pager, "pager");

/*----------------------tooltip--------------------------*/
/**
 * @author 田鑫龙
 */
boot.Tooltip = function(id) {
	boot.Tooltip.superClass.constructor.call(this, id);
};

boot.extend(boot.Tooltip, boot.Rooter, {
	uiCls : "boot-tooltip",
	type : "tooltip",
	_initField : function() {
		this.width = this.width || 400;
	},
	_create : function() {
		this.el.css({
			"max-width" : this.width,
			"display" : "none",
			"z-index" : 100,
			"position" : "absolute"
		});
		this.borderEl = jQuery('<div class="tooltip-border" style="border-width: 1px;border-style: solid;max-width: ' + this.width + 'px;"></div>');
		this.el.append(this.borderEl);
		this.textEl = jQuery('<div class="tooltip-text" style="word-wrap: break-word;"></div>');
		this.borderEl.append(this.textEl);
		this.arrowEl = jQuery('<div class="tooltip-arrow" style="position: absolute;left: 2px;"></div>');
		this.el.append(this.arrowEl);
	},
	_setPosition : function(e, text) {
		var event = e.event, offset = e.selector.offset();
		var win = jQuery(window);
		var width = this.textEl.outerWidth(true), height = this.textEl.outerHeight(true);
		var winWidth = win.width(), winHeight = win.height();
		var left = offset.left + e.selector.width() / 2;
		var elTop = offset.top - 2;
		if (elTop >= height) {
			elTop -= height;
			if (left + width > winWidth) {
				if (left <= width) {
					left = 0;
				} else {
					left -= width;
				}
				this._createArrow("top", "right");
			} else {
				this._createArrow("top", "left");
			}
		} else {
			if (elTop + height + e.selector.height() <= winHeight) {
				elTop += e.selector.height() + 4;
			} else {
				elTop = 0;
			}
			if (left + width > winWidth) {
				if (left <= width) {
					left = 0;
				} else {
					left -= width;
				}
				this._createArrow("bottom", "right");
			} else {
				this._createArrow("bottom", "left");
			}
		}
		this.el.css({
			top : elTop,
			left : left
		});
	},
	_createArrow : function(vertical, horizon) {
		var html = '<div style="border-style: solid;border-width: 5px;width: 0;border-color: #666;';
		if (vertical === 'top') {
			html += 'border-left-color: transparent;border-right-color: transparent;border-bottom: none;';
			this.arrowEl.css({
				"top" : "auto"
			});
		} else if (vertical === 'bottom') {
			html += 'border-left-color: transparent;border-right-color: transparent;border-top: none;';
			this.arrowEl.css({
				"top" : "-5px"
			});
		}
		html += '"></div>';
		this.arrowEl.html(html);
		if (horizon === 'left') {
			this.arrowEl.css({
				"left" : "2px",
				"right" : "auto"
			});
		} else if (horizon === 'right') {
			this.arrowEl.css({
				"right" : "2px",
				"left" : "auto"
			});
		}
	},
	_delegate : function(expression, el) {
		this._on(el, expression, 'mouseenter', this._onExpressionMouseEnter, this);
		this._on(el, expression, 'mouseleave', this._onExpressionMouseLeave, this);
	},
	_onExpressionMouseEnter : function(e) {
		var el = e.selector;
		var text = el.text();
		if (text == "") {
			return false;
		}
		if(text.length > 1000)
			this.textEl.html(text.substr(1, 1000) + '<font style="font-size: 13px;">...</font>');
		else
			this.textEl.html(text);
		this.el.css({
			"display" : "inline-block"
		});
		this._setPosition(e, text);
	},
	_onExpressionMouseLeave : function(e) {
		this.textEl.empty();
		this.el.hide();
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [],
			number : [ "width", "height" ],
			bool : []
		}, attributes);
		return boot.Tooltip.superClass._getAttrs.call(this, attrs);
	},
	// API
	delegate : function(expression, el) {
		this._delegate(expression, el);
	}
});

boot.Register(boot.Tooltip, "tooltip");
/*----------------------datagrid--------------------------*/
/**
 * @author 田鑫龙
 */
boot.DataGrid = function(id) {
	this.showIndex = true;
	this.showSelectBox = false;
	this.multiSelect = true;
	this.autoLoad = true;
	this.allowEdit = true;
	this.allowUpdate = true;
	this.allowRemove = true;
	this.autoAdapt = false;
	boot.DataGrid.superClass.constructor.call(this, id);
	this._createLock();
	this._createFreedom();
	this._createPager();
	this._createTooltip();
	this._createModal();
	this._bindAfterEvents();
	this._renderGridThead();
	this._adaptive();
	this._doDataRequest();
	var me = this;
	$(window).resize(function() {
		me._resize();
		me._adaptive();
	});
};

boot.extend(boot.DataGrid, boot.Panel, {
	uiCls : "boot-datagrid",
	type : "grid",
	_initField : function() {
		this.showTooltip = this.showTooltip === false ? false : true;
		this.showFoot = this.showPager;
		this.idField = this.idField || "id";
		this.pageIndex = this.pageIndex || 1;
		this.pageSize = this.pageSize || 20;
		this.rowHeight = this.rowHeight || 22;
		this.parameters = this.parameters || {};
		this.queryMethod = this.queryMethod || "queryList.action";
		this.createMethod = this.createMethod || "create.action";
		this.saveMethod = this.saveMethod || "save.action";
		this.removeMethod = this.removeMethod || "delete.action";
		this.mergeColumns = {};
		this.mergeArray = [];
		this.skip = 1;
		this.totalPage = 0;
		// 总页数
		this.total = 0;
		// 总条数
		this.activedRow = undefined;
		this.savePrefix = this.savePrefix || "detailBeans";
		this.delPrefix = this.delPrefix || "delBeans";
		this.data = this.data || [];
		this.cacheRows = [];
	},
	_init : function(el) {
		this.el = el;
		this.id = el[0].id;
	},
	_create : function() {
		boot.DataGrid.superClass._create.call(this);
		this.el.addClass("boot-panel");
		this.el.css({
			"position" : "relative"
		});
		this.bodyEl.css({
			'overflow' : 'hidden'
		});
	},
	// 自适应
	_adaptive : function() {
		if (this.autoAdapt) {
			var siblings = this.el.siblings().toArray();
			var parent = this.el.parent();
			parent.css('overflow', "hidden");
			var height = 0, winHeight = this.el.parent().height();
			for (var i = 0, len = siblings.length; i < len; i++) {
				var el = siblings[i];
				var tagName = el.tagName.toLowerCase();
				if (tagName == "style" || tagName == "script")
					continue;
				var pos = el.style.position;
				if (pos == "absolute" || pos == "fixed")
					continue;
				if (el.style.display == 'none' || el.style.visibility == 'hidden')
					continue;
				var jEl = jQuery(el);
				height += jEl.outerHeight(true);
			}
			this._setHeight(winHeight - height);
		}
	},
	_createLock : function() {
		var lockEl = jQuery('<div class="datagrid-lock"></div>');

		var lockHeadBorderEl = jQuery('<div class="datagrid-head"></div>');
		var lockHeadEl = jQuery('<table class="datagrid-table-head" cellpadding="0" cellspacing="0"></table>');
		lockHeadEl.appendTo(lockHeadBorderEl);

		var lockViewBorderEl = jQuery('<div class="datagrid-view datagrid-view-lock"></div>');
		var lockViewEl = jQuery('<table class="datagrid-table-view" cellpadding="0" cellspacing="0" style="margin-bottom: 26px;"><tbody></tbody></table>');
		lockViewEl.appendTo(lockViewBorderEl);
		var lockViewBodyEl = lockViewEl.children('tbody');

		lockHeadBorderEl.appendTo(lockEl);
		lockViewBorderEl.appendTo(lockEl);

		this.lockEl = lockEl;
		this.lockHeadEl = lockHeadEl;
		this.lockHeadBorderEl = lockHeadBorderEl;

		this.lockViewEl = lockViewEl;
		this.lockViewBorderEl = lockViewBorderEl;
		this.lockViewBodyEl = lockViewBodyEl;

		this.bodyEl.append(this.lockEl);
	},
	_createFreedom : function() {
		var freedomEl = jQuery('<div class="datagrid-freedom"></div>');

		var freedomHeadBorderEl = jQuery('<div class="datagrid-head"></div>');
		var freedomHeadEl = jQuery('<table class="datagrid-table-head" cellpadding="0" cellspacing="0"></table>');
		freedomHeadEl.appendTo(freedomHeadBorderEl);

		var freedomViewBorderEl = jQuery('<div class="datagrid-view datagrid-view-lock"></div>');
		var freedomViewEl = jQuery('<table class="datagrid-table-view" cellpadding="0" cellspacing="0"><tbody></tbody></table>');
		freedomViewEl.appendTo(freedomViewBorderEl);
		var freedomViewBodyEl = freedomViewEl.children('tbody');

		freedomHeadBorderEl.appendTo(freedomEl);
		freedomViewBorderEl.appendTo(freedomEl);

		this.freedomEl = freedomEl;
		this.freedomHeadEl = freedomHeadEl;
		this.freedomHeadBorderEl = freedomHeadBorderEl;

		this.freedomViewEl = freedomViewEl;
		this.freedomViewBorderEl = freedomViewBorderEl;
		this.freedomViewBodyEl = freedomViewBodyEl;

		this.bodyEl.append(this.freedomEl);
	},
	_createPager : function() {
		var pagerId = boot.newId();
		this.footEl.append('<div id="' + pagerId + '" simplePager="' + this.simplePager + '" pageSize="' + this.pageSize + '" class="boot-pager" sizeList="' + this.sizeList
				+ '" style="width: 100%;height: 100%;"></div>');
		boot.parse(pagerId);
		this.pager = boot.get(pagerId);
	},
	_createTooltip : function() {
		if (this.showTooltip) {
			var tip = boot.newId();
			jQuery(document.body).append('<div id="' + tip + '" class="boot-tooltip" style="display: none;"></div>');
			boot.parse(tip);
			this.tooltip = boot.get(tip);
			this.tooltip._delegate('td', this.freedomViewEl);
			this.tooltip._delegate('td', this.lockViewEl);
		}
	},
	_createModal : function() {
		this.modal = new boot.Modal(this.el);
		this.modal._setText("加载中...");
	},
	_getParameters : function() {
		return this.parameters;
	},
	_setParameters : function(params) {
		this.parameters = params;
	},
	_formatParameters : function(data) {
		var result = {}, index = 0;
		function getType(type) {
			switch (type) {
			case 'string':
				return "java.lang.String";
			case 'number':
				return "java.lang.Integer";
			}
		}

		function format(object) {
			for ( var name in object) {
				var value = object[name];
				result['params[' + index + '].value'] = value;
				result['params[' + index + '].name'] = name;
				result['params[' + index + '].type'] = getType(jQuery.type(value));
				index++;
			}
		}

		format(this.parameters);
		if (jQuery.type(data) == 'array') {
			for (var i = 0, len = data.length; i < len; i++) {
				format(data[i]);
			}
		} else {
			format(data);
		}
		result['pageIndex'] = this.pageIndex;
		result['pageSize'] = this.pageSize;
		result['sortField'] = this.sortField;
		result['sortOrder'] = this.sortOrder;
		return result;
	},
	_queryMethod : function(options) {
		this.currentAction = "query";
		this._load(options);
	},
	_doDataRequest : function() {
		if (this.autoLoad) {
			this._queryMethod();
		}
	},
	__save : function() {
	},
	__update : function() {
	},
	__remove : function(array) {
		if (this.beforeRemove) {
			var result = this.beforeRemove.call(this, {
				sender : this,
				rows : array
			});
			if (jQuery.type(result) == 'boolean' && result == false) {
				return result;
			}
		}
		var options = {
			data : boot.addPrefix(array, "delBeans"),
			url : this.action + "_" + this.removeMethod,
			context : this,
			success : function(result) {
				if (result.success) {
					var tip = top.boot ? top.boot.showTip : boot.showTip;
					tip("删除成功!");
				}
				var e = {
					sender : this,
					rows : array,
					success : result.success
				};
				this._fire('onrowremove', e);
				this._reload();
			}
		};
		boot.ajax(options);
	},
	_reload : function() {
		this.pageIndex = 1;
		this.pager._setPageIndex(this.pageIndex);
		this._queryMethod();
	},
	_setPageIndex : function(pageIndex) {
		this.pageIndex = pageIndex || 1;
		this.pager._setPageIndex(this.pageIndex);
	},
	// 获取url
	_getUrl : function(url) {
		return url || (this.action ? (this.action + "_" + this.queryMethod) : this.url);
	},
	// 加载数据方法
	_load : function(url, fn) {
		this.modal._show();
		this._callback = fn;
		var options = {
			success : this._loadSuccess,
			context : this
		};
		if (jQuery.type(url) === "string") {
			options.url = url;
		} else {
			boot.concat(options, url);
		}
		options.url = this._getUrl(options.url);
		options.data = this._formatParameters(options.data || {});
		if (options.url)
			boot.ajax(options);
	},
	_loadSuccess : function(result) {
		if (result.success) {
			var resultData = result.resultData || {};
			this.total = resultData.total || 0;
			this._loadData(resultData.data || []);
		}
	},
	_loadData : function(result) {
		this.mergeArray = [];
		var e = {
			sender : this,
			result : result
		};
		this._fire('onbeforerender', e);

		this.data = result;
		// this._adaptive();
		this.pager._updatePager(this.total);
		this._renderGridView();
		this._resize();

		if (this._callback) {
			this._callback.call(this, e);
			delete this._callback;
		}
		this._fire('onloadsuccess', e);

		if (this.cacheRow) {
			this._checkRows(this.cacheRows);
		}
		this._mergeCells();
		this._checkTotalCheckBox();
		this.modal._hide();
	},
	_renderGridThead : function() {
		var lockWidth = 0;
		var colspan = 0;
		var columns = this.columns;
		var lockHtml = [ "<thead><tr>" ], freedomHtml = [ "<thead><tr>" ];
		for (var i = 0, len = columns.length; i < len; i++) {
			var column = columns[i];
			if (column.show) {
				column.width = column.width || 100;
				var td = '<td style="width: ' + column.width + 'px;">' + column._renderHead() + '</td>';
				if (column.locked) {
					lockWidth += column.width + 1;
					lockHtml.push(td);
					colspan++;
				} else {
					freedomHtml.push(td);
				}
			}
		}
		lockHtml.push('</tr></thead>');
		freedomHtml.push("</tr></thead>");

		this.lockEl.css('width', (lockWidth + 1) + 'px');
		this.freedomEl.css("margin-left", lockWidth + 'px');

		this.lockHeadEl.append(lockHtml.join(""));
		this.freedomHeadEl.append(freedomHtml.join(""));

		this._hideHeadToView();
	},
	_renderGridView : function(data) {
		this.lockViewBodyEl.empty();
		this.freedomViewBodyEl.empty();
		data = data || this.data;
		var lockHtml = [], freedomHtml = [];
		var columns = this.columns;
		for (var index = 0, len = data.length; index < len; index++) {
			var row = data[index];
			this._addRow(row, index);
		}
	},
	_addRowIdentify : function(row, object) {
		boot.concat(row, object);
		// 添加唯一标识
		row._uuid = boot.newId();
		row._allowEdit = row._allowEdit !== undefined ? row._allowEdit : true;
		row._allowCheck = row._allowCheck !== undefined ? row._allowCheck : true;
		// 添加未选择标识
		row._checked = row._checked !== undefined ? row._checked : false;
		// 实际行号
		row._num = this.pageSize * (this.pageIndex - 1) + row._index + 1;

		return row;
	},
	_addRow : function(row, index) {

		row = this._addRowIdentify(row, {
			_index : index
		});

		var evenCls = "odd";
		if (index % 2 === 1) {
			evenCls = "even";
		}
		
		var height = '';
		if (this.rowHeight) {
			height = 'style="height: ' + this.rowHeight + 'px;"';
		}
		var columns = this.columns, lock = '<tr id="' + row._uuid + '$row$lock" class="' + evenCls + '" ' + height + '>', freedom = '<tr id="' + row._uuid + '$row$freedom" class="' + evenCls
				+ '" ' + height + '>';
		for (var i = 0, length = columns.length; i < length; i++) {
			var column = columns[i];
			var html = this._renderTD(row, column);
			if (column.locked) {
				lock += html;
			} else {
				freedom += html;
			}
		}
		lock += '</tr>', freedom += '</tr>';
		this.lockViewBodyEl.append(lock);
		this.freedomViewBodyEl.append(freedom);
		return {
			locked : lock,
			freedom : freedom
		};
	},
	_setMergeCell : function(field, value, key) {
		var merge = undefined;
		for (var i = 0; i < this.mergeArray.length; i++) {
			var object = this.mergeArray[i];
			if (object.value === value && object.field === field) {
				merge = object;
				merge.rowspan++;
				return true;
			} else if (object.field === field && object.value !== value) {
				this.mergeCells = this.mergeCells || [];
				this.mergeCells.push(object);
				this.mergeArray.splice(i, 1);
			}
		}
		if (merge === undefined) {
			merge = {};
			merge["rowspan"] = 1;
			merge["value"] = value;
			merge["id"] = key;
			merge["field"] = field;
			this.mergeArray.push(merge);
		}
	},
	// 渲染TD
	_renderTD : function(row, column) {
		var visible = column.show ? '' : 'hide';
		var id = row._uuid + '$cell$' + column._index;
		var value = row[column.field] || '';
		if (column.merge) {
			var result = this._setMergeCell(column.field, value, id);
			if (result) {
				return '';
			}
		}
		var cell = "";
		if (row._editting && column._renderEditor) {
			cell += column._renderEditor(row, this);
		} else {
			cell += column._renderCell(row, this);
		}

		var height = '';
// if (this.rowHeight) {
// height = 'style="height: ' + this.rowHeight + 'px;line-height: ' +
// this.rowHeight + 'px;"';
// }

		return '<td id="' + id + '" class="' + visible + '" ' + height + '>' + cell + '</td>';
	},
	// 合并单元格
	_mergeCells : function() {
		this.mergeCells = this.mergeCells || [];
		this.mergeCells = this.mergeCells.concat(this.mergeArray);
		for (var i = 0, len = this.mergeCells.length || 0; i < len; i++) {
			var merge = this.mergeCells[i];
			var selector = merge.id.replace(/\$/g, "\\$");
			var td = jQuery('#' + selector, this.bodyEl);
			var lineHeight = td.css("line-height").replace(/px/i, "") * merge.rowspan;
			td.prop("rowspan", merge.rowspan);
			td.css("line-height", lineHeight + "px");
		}
		this.mergeCells = [];
		this.mergeArray = [];
	},
	// api调用，有添加新增状态
	_addRows : function(rows, index) {
		if (index == undefined)
			index = this.data.length;
		if (jQuery.type(rows) == 'object') {
			rows = [ rows ];
		}
		for (var i = 0, length = rows.length; i < length; i++, index++) {
			var row = rows[i];
			row._status = "_add";
			this.data.push(row);
			this._addRow(row, index);
		}
		this._checkTotalCheckBox();
	},
	_hideHeadToView : function() {
		var lockHeadClone = this.lockHeadEl.children().clone();
		var freedomHeadClone = this.freedomHeadEl.children().clone();

		lockHeadClone.find("td").empty().height(0);
		freedomHeadClone.find("td").empty().height(0);

		lockHeadClone.find(":checkbox,:radio").remove();

		this.lockViewEl.prepend(lockHeadClone);
		this.freedomViewEl.prepend(freedomHeadClone);
	},
	// 为freedom表头补白
	_resize : function() {
		if (this.freedomViewEl.height() > this.freedomViewBorderEl.height()) {
			this.freedomHeadBorderEl.width(this.freedomViewBorderEl.width() - 17);
			this.freedomEl.addClass("fixed");
		} else {
			this.freedomHeadBorderEl.width(this.freedomViewBorderEl.width());
			this.freedomEl.removeClass("fixed");
		}
    	var browser = jQuery.browser;
    	if(browser.msie){
    		if(browser.version < '8.0'){
    			this.freedomEl.height(this.bodyEl.height());
    		}
    	}
	},
	_validate : function() {// TODO 表格验证
		var validate = true;
		for (var i = 0, length = this.columns.length; i < length; i++) {
			var column = this.columns[i];
			validate = validate && column._isValid;
		}
		return validate;
	},
	_bindAfterEvents : function() {
		this._on(this.bodyEl, ".grid-sort", 'click', this._onSortHeadClick, this);
		this._on(this.bodyEl, ".textbox-text", 'change', this._onEditorValueChanged, this);
		this._on(this.bodyEl, ".textarea-text", 'change', this._onEditorValueChanged, this);
		this._on(this.lockViewEl, "tr", 'click', this._onLockRowClick, this);
		this._on(this.freedomViewEl, "tr", 'click', this._onFreedomRowClick, this);
		this._on(this.lockViewEl, ":checkbox", 'click', this._onLockCheckboxClick, this);
		this._on(this.lockViewEl, ":radio", 'click', this._onLockRadioClick, this);
		this._on(this.lockHeadEl, ".boot-grid-button", 'click', this._onAddButtonClick, this);
		this._on(this.lockViewEl, ".boot-grid-button", 'click', this._onActionButtonClick, this);
		this._on(this.lockHeadEl, ":checkbox", 'click', this._checkAllCheckBox, this);
		this.freedomViewBorderEl.on("scroll", {
			sender : this
		}, this._onScrolling);

		// 分页事件
		this.pager.bind('pagerfirst', this._onFirstButtonClick, this);
		this.pager.bind('pagerprevious', this._onPrevButtonClick, this);
		this.pager.bind('pagernext', this._onNextButtonClick, this);
		this.pager.bind('pagerlast', this._onLastButtonClick, this);
		this.pager.bind('pagerreload', this._onReloadButtonClick, this);
		this.pager.bind('pagesizechange', this._onPageSizeChange, this);
		this.pager.bind("pageskipchange", this._onPageIndexChange, this);
	},
	_onPageSizeChange : function(e) {
		this.pageSize = e.sender.pageSize;
		this.pageIndex = e.sender.pageIndex;
		this._queryMethod();
	},
	_onPageIndexChange : function(e) {
		this.pageIndex = e.sender.pageIndex;
		this._queryMethod();
	},
	_onFirstButtonClick : function(e) {
		this.pageIndex = e.sender.pageIndex;
		this._queryMethod();
	},
	_onPrevButtonClick : function(e) {
		this.pageIndex = e.sender.pageIndex;
		this._queryMethod();
	},
	_onNextButtonClick : function(e) {
		this.pageIndex = e.sender.pageIndex;
		this._queryMethod();
	},
	_onLastButtonClick : function(e) {
		this.pageIndex = e.sender.pageIndex;
		this._queryMethod();
	},
	_onReloadButtonClick : function(e) {
		this.pageIndex = e.sender.pageIndex;
		this._queryMethod();
	},
	// 排序功能触发
	_onSortHeadClick : function(e) {
		var el = e.selector;
		var ids = el.attr("id").split("$");
		var index = ids[2];
		var column = this.columns[index];
		if (column.sort == "") {
			column.sort = "asc";
		} else if (column.sort == "asc") {
			column.sort = "desc";
		} else {
			column.sort = "asc";
		}
		var json = {
			sort : column.sort
		};

		this['sortOrder'] = column.sort, this['sortField'] = column.field;
		this._load({}, function(e) {
			this._updateHead(column, json);
		});

	},
	// 可编辑组件的value变更事件
	_onEditorValueChanged : function(e) {
		var el = e.selector;
		var id = el.attr('id');
		var editorId = id.replace('$text', '');
		var editor = boot.get(editorId);
		var options = editor.customOptions._parent;

		var row = this._getRowByUUID(options.rowUUID);
		row[options.field] = editor.getValue();
		row._status = row._status || '_update';

		var column = this.columns[options.columnIndex];
		// 修改数据标识
		column._dirty = column._dirty || [];
		column._dirty.push(row._index);

		// 验证
		column.error = column.error || [];
		if (!editor.validateValue) {
			column.error.push(row._index);
		}

		e.editor = editor;
		e.column = column;
		e.row = row;
		this._fire('oncellvaluechanged', e);
	},
	// 设置是否允许check
	_setAllowCheck : function(row, flag) {
		row._allowCheck = flag;
		row._checked = false;
		this._renderUpdateRow(row);
	},
	// 设置是否允许编辑行
	_setAllowEditRow : function(row, flag) {
		row._allowEdit = flag;
		row._editting = false;
		this.edittingRow = undefined;
		this._renderUpdateRow(row);
	},
	// 控制按钮点击事件
	_onActionButtonClick : function(e) {
		var el = e.selector;
		var uuid = el.attr("uuid");
		var row = this._getRowByUUID(uuid);
		var action = el.attr("action");

		if (action == 'edit') {
			this._submitBeforeEditNext();
			row._editting = true;
			this._renderUpdateRow(row);
		} else if (action == 'submit') {
			row._editting = false;
			this._renderUpdateRow(row);
		} else {
			if (row._status == '_add') {
				for (var i = 0, len = this.data.length; i < len; i++) {
					if (this.data[i]._uuid == row._uuid) {
						this.data.splice(i, 1);
						break;
					}
				}
				row._status = '_remove';
			} else {
				row._status = '_remove';
				this.__remove([ row ]);
			}
			this._renderUpdateRow(row);
		}
		e.row = row;
		this._fire("on" + action + "row", e);
	},

	// add按钮点击事件
	_onAddButtonClick : function(e) {
		var el = e.selector;
		var uuid = el.attr("uuid");
		var rowIndex = this.data.length;

		var row = {
			_uuid : boot.newId(),
			_index : rowIndex,
			_status : '_add',
			_editting : true,
			_num : (this.pageIndex - 1) * this.pageSize + rowIndex
		};
		this._addRow(row, rowIndex);
		this.data.push(row);

		this._submitBeforeEditNext();
		this._renderUpdateRow(row);

		this._fire("onaddrow", e);
	},
	// 编辑下一条前提交当前行
	_submitBeforeEditNext : function() {
		if (this.edittingRow) {
			var row = this.edittingRow;
			row._editting = false;
			this._renderUpdateRow(row);
			this.edittingRow = undefined;
		}
	},
	// 重绘head单元格TODO
	_updateHead : function(column, json) {
		var selector = '#' + column._uuid + '\\$head\\$' + column._index;
		var cell = jQuery(selector, this.bodyEl);
		var th = cell.parent();
		column.text = json.text || column.text;
		column.sort = json.sort || column.sort;
		th.html(column._renderHead());
	},
	// 渲染编辑器
	_renderUpdateRow : function(row) {
		var columns = this.columns;
		var lock = '', freedom = '';
		for (var i = 0, len = columns.length; i < len; i++) {
			var column = columns[i];
			var html = this._renderTD(row, column);
			if (column.locked) {
				lock += html;
			} else {
				freedom += html;
			}
			// 销毁组件
			boot.Destroy(column._uuid);
		}

		var selector = '#' + row._uuid + '\\$row';
		var freedomEl = jQuery(selector + '\\$freedom', this.freedomViewEl);
		var lockEl = jQuery(selector + '\\$lock', this.lockViewEl);

		if (row._status == '_remove') {
			lockEl.remove();
			freedomEl.remove();
		} else {
			lockEl.html(lock);
			freedomEl.html(freedom);
		}
		if (row._editting) {
			boot.parseByParent(lockEl);
			boot.parseByParent(freedomEl);
		}
		this.edittingRow = row;
	},
	// 锁定区域点击事件
	_onLockRowClick : function(e) {
		var el = e.selector;
		var id = el.attr("id").split("$")[0];
		var row = this._getRowByUUID(id);
		this._onRowclick(row);

		e.row = row;
		this._fire('onrowclick', e);
	},
	// 自由区域点击事件
	_onFreedomRowClick : function(e) {
		var el = e.selector;
		var id = el.attr("id").split("$")[0];
		var row = this._getRowByUUID(id);
		this._onRowclick(row);

		e.row = row;
		this._fire('onrowclick', e);
	},
	_getRowByUUID : function(uuid) {
		for (var i = 0, len = this.data.length; i < len; i++) {
			var row = this.data[i];
			if (row._uuid == uuid) {
				return row;
			}
		}
	},
	// 获取列
	_getColumn : function(field) {
		for (var i = 0, len = this.columns.length; i < len; i++) {
			var column = this.columns[i];
			if (column.field == field) {
				return column;
			}
		}
	},
	// 获取编辑器
	_getEditorByName : function(field) {
		var column = this._getColumn(field);
		return boot.get(column._uuid);
	},
	// 获取cacheRows缓存的数据，cacheRow属性为true生效
	_getCacheRows : function() {
		return this.cacheRows;
	},
	// 接受锁定或自由区域点击处理
	_onRowclick : function(row) {
		var selector = '';
		if (this.activedRow) {
			selector = '#' + this.activedRow._uuid + '\\$row';
			jQuery(selector + '\\$freedom', this.freedomViewEl).removeClass("selected");
			jQuery(selector + '\\$lock', this.lockViewEl).removeClass("selected");
		}

		selector = '#' + row._uuid + '\\$row';
		jQuery(selector + '\\$freedom', this.freedomViewEl).addClass("selected");
		jQuery(selector + '\\$lock', this.lockViewEl).addClass("selected");

		this.activedRow = row;
	},
	// 处理是否记录分页后的记录,选择行时，处理选择的数据
	_cacheRows : function(row) {
		if (this.cacheRow == true) {
			for (var index = 0, len = this.cacheRows.length; index < len; index++) {
				var record = this.cacheRows[index];
				if (record[this.idField] == row[this.idField]) {
					this.cacheRows.splice(index, 1);
					break;
				}
			}
			row["_checked"] && this.cacheRows.push(row);
		}
	},
	// 根据rows记录中的key选择checkbox
	_checkRows : function(rows, key) {
		key = key || this.idField || "_uuid";
		var array = [];
		for (var i = 0, len = this.data.length; i < len; i++) {
			var record = this.data[i];
			for (var j = 0, length = rows.length; j < length; j++) {
				var row = rows[j];
				if (row[key] === record[key] && row._allowCheck !== false) {
					var selector = '#' + record._uuid + '\\$selectbox';
					jQuery(selector, this.bodyEl).prop('checked', true);
					record["_checked"] = true;
					this._cacheRows(record);
				}
			}
		}
	},
	// radip点击事件
	_onLockRadioClick : function(e) {
		var el = e.selector;
		var id = el.attr("id").split("$")[0];
		var row = this._getRowByUUID(id);
		if (row._allowCheck !== false) {
			if (this.activedRow) {
				this.activedRow["_checked"] = false;
			}

			row["_checked"] = true;
			this._onRowclick(row);

			e.row = row;
			this._fire("onselect", e);
		}
	},
	// checkbox点击事件
	_onLockCheckboxClick : function(e) {
		var el = e.selector;
		var id = el.attr("id").split("$")[0];
		var row = this._getRowByUUID(id);
		if (row._allowCheck !== false) {
			row["_checked"] = !row["_checked"];

			this._cacheRows(row);

			this._checkTotalCheckBox();

			e.row = row;
			this._fire("onselect", e);
		}
	},
	// 选择所有的checkbox使其处于选择状态或非选择状态
	_checkAllCheckBox : function(e) {
		var selector = e.selector;
		var _status = selector.prop("checked");
		var list = jQuery(":checkbox", this.lockViewEl);
		var me = this;
		list.each(function(index) {
			var row = e.sender.data[index];
			if (row._allowCheck) {
				jQuery(this).prop('checked', _status);
				row["_checked"] = _status;
				me._cacheRows(row);
			}
		});

		e.rows = this._getSelectedRows();
		this._fire("oncheckall", e);
	},
	// head的checkbox使其处于选择状态或非选择状态
	_checkTotalCheckBox : function() {
		var flag = true;
		var len = this.data.length;
		var e = {
			sender : this,
			source : this
		};
		for (var index = 0; index < len; index++) {
			var row = this.data[index];
			if (row._allowCheck)
				flag = flag && row["_checked"];
		}
		if (len != 0) {
			jQuery(":checkbox", this.lockHeadEl).prop("checked", flag);
		}
	},
	// 获取checkbox选中行
	_getSelectedRows : function() {
		var array = [];
		for (var index = 0, len = this.data.length; index < len; index++) {
			var row = this.data[index];
			if (row['_checked']) {
				array.push(row);
			}
		}
		return array;
	},
	_onScrolling : function(e) {
		var sender = e.data.sender;
		var top = jQuery(this).scrollTop();
		var left = jQuery(this).scrollLeft();
		sender.lockViewBorderEl.scrollTop(top);
		sender.freedomHeadBorderEl.scrollLeft(left);
	},
	// 读取说有列，然后转换成列对象
	_readColumns : function() {
		var locked = [], freedom = [];
		locked.push(new boot.IndexColumn(this.showIndex));
		locked.push(new boot.SelectBoxColumn(this.showSelectBox, this.multiSelect));
		locked.push(new boot.ControlColumn(this.allowCellEdit, this.control));
		var columns = this.el.children().toArray();
		for (var i = 0, len = columns.length; i < len; i++) {
			var column = jQuery(columns[i]);
			var options = new boot.Column(column, this.allowCellEdit);
			// 为column添加序号
			options._index = i + 3;
			if (options.locked === true) {
				locked.push(options);
			} else {
				freedom.push(options);
			}
		}
		this.columns = locked.concat(freedom);
		this.el.empty();
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "id", "idField", "action", "viewPage", "editPage", "queryMethod", "removeMethod", "url", "delPrefix", "sizeList", "savePrefix" ],
			number : [ "width", "height", "rowHeight" ],
			bool : [ "showPager", "simplePager", "showTooltip", "multiSelect", "autoLoad", "showSelectBox", "showIndex", "cacheRow", "allowCellEdit", "autoAdapt" ],
			json : [ "control" ],
			fn : []
		}, attributes || {});
		var attr = boot.DataGrid.superClass._getAttrs.call(this, attrs);
		this._readColumns();
		return attr;
	},
	// 获取操作过的行数据
	_getClassifiedData : function(type) {
		var data = this._getMixData();
		var changed = {
			'_add' : [],
			'_update' : [],
			'_remove' : []
		};
		for (var i = 0, len = data.length; i < len; i++) {
			var row = data[i];
			changed[row._status].push(row);
		}
		if (type) {
			return changed['_' + type];
		} else {
			return changed;
		}
	},
	// 获取混合后的修改数据
	_getMixData : function() {
		var changed = [];
		for (var i = 0, len = this.data.length; i < len; i++) {
			var row = boot.clone(this.data[i]);
			var status = row._status;
			if (status)
				changed.push(row);
		}
		return changed;
	},

	// API
	getSelectedRow : function() {
		return this.activedRow;
	},
	getSelectedRows : function() {
		return this._getSelectedRows();
	},
	getActivedRow : function() {
		return this.activedRow;
	},
	reload : function() {
		this._reload();
	},
	loadData : function(data) {
		this._loadData(data);
	},
	getChangedData : function(type) {
		return this._getClassifiedData(type);
	},
	setParameters : function(param) {
		this._setParameters(param);
	},
	getRow : function(index) {
		var el = jQuery('tr:eq(' + index + ')', this.freedomViewBodyEl);
		var uuid = el.attr("id").split('$')[0];
		return this._getRowByUUID(uuid);
	},
	checkRows : function(rows, key) {
		this._checkRows(rows, key);
	},
	addRows : function(rows) {
		this._addRows(rows);
	},
	getData : function() {
		return this.data;
	},
	getColumn : function(field) {
		return this._getColumn(field);
	},
	updateHeadText : function(field, text) {
		var column = this.getColumn(field);
		this._updateHead(column, {
			"text" : text
		});
	},
	getEditorByName : function(field) {
		return this._getEditorByName(field);
	},
	getCacheRows : function() {
		return this._getCacheRows();
	},
	// 设置是否允许check
	setAllowCheck : function(row, flag) {
		this._setAllowCheck(row, flag);
	},
	// 设置是否允许编辑行
	setAllowEditRow : function(row, flag) {
		this._setAllowEditRow(row, flag);
	},
	updateRow : function(node, row) {
		node = boot.concat(node, row);
		this._renderUpdateRow(node);
	}
});

boot.Register(boot.DataGrid, "datagrid");

/*------------------表格普通列对象-----------------------*/

boot.Column = function(el, allowEdit) {
	this._uuid = boot.newId();
	this._isValid = true;
	this.allowEdit = allowEdit;
	this.sort = '';
	this._getAttrs(el);
	this.show = this.show === false ? false : true;
	this._init();
};

boot.Column.prototype = {
	_init : function() {
	},
	_validate : function(value) {// TODO 列验证
		var v = new boot.Validate();
		v.setRequired(this.required);
		v.setValue(value);
		v.setVType(this.vType);
		v.setErrorText(this.errorText);
		return v.execute();
	},
	_renderCell : function(row, grid) {
		var dirty = row._status != undefined && jQuery.inArray(row._index, this._dirty || []) != -1 ? "dirty " : " ";
		var value = row[this.field];
		var data;
		if (this.editor && this.editor.data) {
			data = this.editor.data;
		} else if (this.editor && this.editor.url) {
			boot.ajax({
				url : this.editor.url,
				dataType : 'json',
				async : false,
				success : function(result) {
					if (jQuery.type(result) === 'array')
						data = result || [];
					else
						data = result.resultData || [];
				}
			});
		} else {
			var editor = boot.get(this._uuid);
			if (editor && editor.getData) {
				data = editor.getData();
			}
		}
		if (data) {
			this.data = data;
			var json = this._arrayToJson(this.data);
			value = json[value];
		}
		if (this.editor && this.editor.type) {
			if (this.editor.type == 'date') {
				this.format = this.editor.format = this.editor.format || 'yyyy-mm-dd';
				value = boot.formatDate(this.editor.format, value);
			} else if (this.editor.type == 'number') {
				this.format = this.editor.format = this.editor.format || '2';
				value = boot.formatDecimal(value, this.editor.format);
			}
		}
		value = value == undefined ? "" : value;
		// 单元格渲染器，自定义渲染风格
		if (this.render) {
			var e = {
				row : row,
				column : this,
				cell : value
			};
			value = this.render(e);
		}
		var error = '', title = '';
		// TODO 改动验证
		var result = this._validate(value);
		if (result) {
			error = 'error';
			title = result;
			this._isValid = false;
		} else {
			this._isValid = true;
		}

		return '<div id="' + row._uuid + '$text" title="' + title + '" class="cell ' + dirty + error + '">' + value + '</div>';
	},
	_arrayToJson : function(array) {
		var json = {};
		for ( var index in array) {
			var key = array[index]['id'];
			json[key] = array[index]['name'];
		}
		return json;
	},
	_renderEditor : function(row, grid) {
		if (this.allowEdit && this.editor && this.editor.onlyView !== true) {
			var cls = this.editor.type;
			var url = this.editor.url;
			this.data = this.editor.data;
			this.maxLength = this.editor.maxLength;
			var editorHtml = '<div class="cell"><span ';
			editorHtml += 'id="' + this._uuid + '" ';
			editorHtml += 'class="boot-' + cls + '" ';

			if (grid.rowHeight) {
				editorHtml += 'height="' + (grid.rowHeight - 3) + '" ';
			}

			if (this.maxLength) {
				editorHtml += 'maxLength="' + this.maxLength + '" ';
			}
			editorHtml += 'customOptions="{_parent: {rowUUID: \'' + row._uuid + '\', columnIndex: ' + this._index + ', field: \'' + this.field + '\'}}" ';
			if (this.editor.required) {
				this.required = this.editor.required;
				editorHtml += 'required="' + this.editor.required + '" ';
			}
			if (this.editor.vType) {
				this.vType = this.editor.vType;
				editorHtml += 'vType="' + this.editor.vType + '" ';
			}
			editorHtml += 'value="' + (row[this.field] || "") + '" ';
			if ((cls == 'combobox' || cls == 'popupedit' || cls == 'popupwindow') && url) {
				editorHtml += 'url="' + url + '" textField="name" valueField="id" ';
			}
			if (cls == 'popupedit' || cls == 'popupwindow') {
				if (this.editor.onload)
					editorHtml += 'onload="' + this.editor.onload + '" ';
				if (this.editor.ondestroy)
					editorHtml += 'ondestroy="' + this.editor.ondestroy + '" ';
				if (this.editor.popupWidth)
					editorHtml += 'popupWidth="' + this.editor.popupWidth + '" ';
				if (this.editor.popupHeight)
					editorHtml += 'popupHeight="' + this.editor.popupHeight + '" ';
			}
			if (cls == 'combobox' && this.data) {
				editorHtml += 'data="' + JSON.stringify(this.data).replace(/\"/g, '\'') + '" ';
			}
			if (cls == 'date') {
				this.format = this.editor.format || 'yyyy-MM-dd';
				editorHtml += 'format="' + this.format + '" ';
			}
			if (cls == 'number') {
				this.format = this.editor.format || 'd2';
				editorHtml += 'format="' + this.format + '" ';
			}
			editorHtml += 'style="width: 100%;"></span></div>';
		} else {
			editorHtml = this._renderCell(row, grid);
		}
		return editorHtml;
	},
	_renderHead : function() {
		var id = this._uuid + '$head$' + this._index;
		var head = '<div id="' + id + '" class="cell" style="height: auto;">';
		if (this.allowSort) {
			head = '<div id="' + id + '" class="cell grid-sort" style="height: auto;">';
		}
		head += this.text;
		if (this.allowSort) {
			var sortId = this._uuid + '$sort$' + this.field;
			head += '<div id="' + sortId + '" class="sort ' + this.sort + '" style="height: auto;"></div>';
		}
		head += '</div>';
		return head;
	},
	_getAttrs : function(el) {
		if (!el) {
			return;
		}
		this.text = el.text();
		var attrs = {
			str : [ "field", "format", "vType", "errorText" ],
			number : [ "width" ],
			json : [ "editor" ],
			bool : [ "locked", "show", "merge", "allowSort", "required" ]
		};
		boot.concat(this, boot._parseEvent(el, [ "render" ]));
		boot.concat(this, boot._getBasicAttrs(el, attrs));
	},
	_destory : function() {
		boot.Destroy(this._uuid);
	}
};

/** ------------------自定义列类----------------------* */

boot.IndexColumn = function(show) {
	this._uuid = boot.newId();
	this._isValid = true;
	this.show = show;
	this.width = 40;
	this.locked = true;
	this._init();
	this._index = 0;
};
boot.extend(boot.IndexColumn, boot.Column, {
	_init : function() {
		this.text = '序号';
	},
	_renderCell : function(row) {
		return '<div id="' + row._uuid + '$text" class="cell" style="height: auto;">' + row._num + '</div>';
	},
	_renderEditor : undefined
});

boot.ControlColumn = function(show, type) {
	this._uuid = boot.newId();
	this._isValid = true;
	this._index = 2;
	this.show = show;
	this.width = 50;
	this.locked = true;
	this.text = "";
	this.type = type || [ 'add', 'edit', 'remove' ];
	this._init();
};
boot.extend(boot.ControlColumn, boot.Column, {
	_init : function() {
		var array = [];
		for ( var index in this.type) {
			var type = this.type[index];
			if (type === 'add') {
				this.text += '<a class="boot-grid-button button-add" action="add"></a>';
			} else if (this.type[index] === 'remove') {
				// TODO暂时去掉全部删除功能
				// this.text += '<a class="boot-grid-button button-remove"
				// action="remove"></a>';
				array.push(type);
			} else {
				array.push(type);
			}
		}
		this.type = array;
	},
	_renderCell : function(row) {
		var editting = row._allowEdit ? row._editting ? [ 'submit' ] : this.type : [];
		var cellHtml = '<div id="' + row._uuid + '$text" class="cell" style="height: auto;">';
		for ( var index in editting) {
			cellHtml += '<a class="boot-grid-button button-' + editting[index] + '" uuid="' + row._uuid + '" action="' + editting[index] + '"></a>';
		}
		cellHtml += '</div>';
		return cellHtml;
	},
	_renderHead : function() {
		var id = this._uuid + '$head$' + this._index;
		return '<div id="' + id + '">' + this.text + '</div>';
	},
	_renderEditor : undefined
});

boot.SelectBoxColumn = function(show, multi) {
	this._uuid = boot.newId();
	this._isValid = true;
	this._index = 1;
	this._disabled = false;
	this.width = 30;
	this.show = show;
	this.multi = multi;
	this.locked = true;
	this._init();
};
boot.extend(boot.SelectBoxColumn, boot.Column, {
	_init : function() {
		this.type = this.multi ? 'checkbox' : 'radio';
		this.text = '<input type="' + this.type + '"/>';
	},
	_renderCell : function(row) {
		var name = this.multi ? '' : 'name="' + this._uuid + '$radio"';
		var checked = row._checked ? 'checked="true"' : '';
		var disabled = row._allowCheck === false ? 'disabled="true"' : '';
		return '<div id="' + row._uuid + '$text" class="cell" style="height: auto;"><input ' + name + ' id="' + row._uuid + '$selectbox" type="' + this.type + '" ' + checked + ' '
				+ disabled + '/></div>';
	},
	_renderEditor : undefined
});

/*----------------------autocomplete--------------------------*/
/**
 * @author 田鑫龙
 */
// 下拉框
boot.AutoComplete = function(id) {
	boot.AutoComplete.superClass.constructor.call(this, id);
};

boot.extend(boot.AutoComplete, boot.ComboBox, {
	uiCls : 'boot-autocomplete',
	_initField : function() {
		boot.AutoComplete.superClass._initField.call(this);
		this.text = this.text || "";
		this.value = this.value || '';
	},
	_create : function() {
		boot.AutoComplete.superClass._create.call(this);
		this.borderEl.css("padding-right", "2px");
		this.textEl.attr("readonly", false);
		this.buttonEl.hide();
	},
	_createListBox : function() {
		var id = this._uuid + '$box';
		this.popupWidth = (this.popupWidth || this.el.width() - 2);
		var html = '<div id="' + id + '" value="' + this.value + '" textField="' + this.textField + '" valueField="' + this.valueField + '" ';
		html += 'idField="' + this.idField + '" parentidField="' + this.parentidField + '" childrenField="' + this.childrenField + '" ';
		if (this.asTree) {// 树形下拉框
			html += 'class="boot-treebox" ';
			if (this.showCheckBox) {
				html += 'showCheckBox="' + this.showCheckBox + '" ';
			}
			if (this.onlyLeaf) {
				html += 'onlyLeaf="' + this.onlyLeaf + '" ';
			}
			this.popupWidth = this.popupWidth < 220 ? 220 : this.popupWidth;
		}
		if (this.asGrid) {// 表格下拉框
			html += 'class="boot-gridbox" simplePager="true" ';
			if (this.showCheckBox) {
				html += 'showCheckBox="' + this.showCheckBox + '" ';
			}
			if (this.showPager) {
				html += 'showPager="' + this.showPager + '" ';
			}
			this.popupWidth = this.popupWidth < 500 ? 500 : this.popupWidth;
			this.popupHeight = this.popupHeight < 300 ? 300 : this.popupHeight;
		} else {// 普通下拉框
			html += 'class="boot-listbox" ';
		}
		html += 'width="' + this.popupWidth + '" height="' + this.popupHeight + '" ';
		if (this.url) {
			html += 'url="' + this.url + '" ';
		}
		html += 'autoLoad="false" style="position:absolute;display: none;">';
		if (this.asGrid) {
			html += this.columnEls;
		}
		html += '</div>';
		jQuery(document.body).append(html);
		boot.parse(id.replace('$', '\\$'));
		this.listBox = boot.get(id);
		this.listBox.showEmpty = this.showEmpty;
		this.listBox.el.addClass("combobox-listbox");
	},
	_setParameters : function(params) {
		this.params = params || {};
		this.listBox._setParameters(this.params);
	},
	_setText : function(text) {
		if (this.asTree || this.asGrid) {
			this.text = text;
			this.textEl.val(this.text);
		}
	},
	_bindEvents : function() {
		boot.AutoComplete.superClass._bindEvents.call(this);
		this._on(this.el, ":text", 'keyup', this.onIntervalQuery, this);
		this._on(this.el, ":text", 'click', this.onTextClick, this);
	},
	_onListBoxLoadSuccess : function(result) {
		this.listBox._show();
		this.data = result.data;
		this.borderEl.removeClass("autocomplete-load");
	},
	_onButtonEditClick : function(e) {
		this.textEl.trigger("focus");
	},
	onTextClick : function(e) {
		e.stopPropagation();
	},
	onIntervalQuery : function(e) {
		var text = e.selector.val();
		if (text != this.text) {
			jQuery(".combobox-listbox").hide(); // 隐藏其他下拉框
			var box = this._getBox();
			this._setPopupListPosition(box);
			this.text = text;
			this.borderEl.addClass("autocomplete-load");

			var parameter = {
				data : {
					"keyWords" : this.text
				}
			};
			this.listBox._setParameters(parameter.data);
			if (this.asGrid) {
				this.listBox.grid._load(parameter);
			} else {
				this.listBox._load(parameter);
			}
		}
	},
	setParameters : function(params) {
		this._setParameters(params);
	}
});

boot.Register(boot.AutoComplete, 'autocomplete');

/*----------------------date--------------------------*/
/**
 * @author 田鑫龙
 */
// 日期
boot.Date = function(id) {
	boot.Date.superClass.constructor.call(this, id);
	this._renderDatePicker();
	this._bindAfterEvent();
};

boot.extend(boot.Date, boot.PopupEdit, {
	uiCls : 'boot-date',
	_initField : function() {
		boot.Date.superClass._initField.call(this);
		this.format = this.format || 'YYYY-MM-DD';
		this.showTime = this.onlyTime == true ? true : this.showTime;
	},
	_create : function() {
		boot.Date.superClass._create.call(this);
		this.value = this._getTime(this.value);
		this.textEl.val(this.value);
	},
	_getTime : function(time) {
		time = time || "";
		if (time === '') {
			return '';
		}
		return boot.formatDate(this.format, time);
	},
	_setValue : function(value) {
		this.value = this._getTime(value);
		this.datePicker._setValue(this.value);
		this.textEl.val(this.value).trigger("change");
	},
	_getValue : function() {
		return this.value;
	},
	_renderDatePicker : function() {
		var box = this._updateDatePickerLayout();
		var html = '<div id="' + this._uuid + '$datepicker" class="boot-datepicker" ';
		html += 'format="' + this.format + '" ';
		html += 'value="' + this.value + '" ';
		html += 'showTime="' + this.showTime + '" ';
		html += 'onlyTime="' + this.onlyTime + '" ';
		html += 'style="top: ' + box.top + 'px;left: ' + box.left + 'px;display: none;z-index: 10;"';
		html += '></div>';
		jQuery(html).appendTo(document.body);
		this.datePicker = new boot.DatePicker(this._uuid + '\\$datepicker');
	},
	_updateDatePickerLayout : function() {
		var box = this._getBox();
		var winHeight = $(document.body).height();
		var height = this.onlyTime ? '34' : '242';

		if (winHeight - box.top > height) {
			box.top = box.top + box.height;
		} else {
			box.top -= height;
		}

		if (this.datePicker) {
			this.datePicker.el.css({
				top : box.top,
				left : box.left
			});
		}
		return box;
	},
	_bindAfterEvent : function() {
		this.datePicker._bind('sure', this._onTodayClick, this);
		this.datePicker._bind('today', this._onTodayClick, this);
		this.datePicker._bind('clear', this._onClearClick, this);
		this.datePicker._bind('dayclick', this._onDayClick, this);

		this.bind('bodyclick', this._onBodyClick, this);
	},
	_onBodyClick : function() {
		this.datePicker._hide();
	},
	_onTodayClick : function(e) {
		this.setValue(e.value);
		this.datePicker._hide();
		this._validate();
	},
	_onClearClick : function(e) {
		this.setValue('');
		this._validate();
	},
	_onDayClick : function(e) {
		if (!this.showTime) {
			this.setValue(e.value);
			this.datePicker._hide();
		}
		this._validate();
	},
	_onButtonEditClick : function(e) {
		e.stopPropagation();
		this.datePicker._setValue(this.value);
		this._updateDatePickerLayout();
		this.datePicker._show();
		this._fire("onbuttonclick", e);
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "format" ]
		}, attributes || {});
		return boot.Date.superClass._getAttrs.call(this, attrs);
	},

	// API
	getValue : function() {
		return this._getValue();
	},
	setValue : function(value) {
		this._setValue(value);
	}
});

boot.Register(boot.Date, 'date');

/*----------------------contextmenu--------------------------*/
/**
 * @author dragon
 */
boot.ContextMenu = function(parentEl) {
	this.textField = 'text';
	boot.ContextMenu.superClass.constructor.call(this, parentEl);
};

boot.extend(boot.ContextMenu, boot.Rooter, {
	_initField : function() {
		this.childrenField = this.childrenField || 'children';
	},
	_init : function(el) {
		this.parentEl = el || jQuery(document.body);
		this.el = jQuery('<div id="' + this._uuid + '" style="position: absolute;display: none;z-index: 99;"></div>');
		this.el.appendTo(this.parentEl);
	},
	_create : function() {

	},
	// 通过uuid获取node
	_getNodeByUUID : function(uuid) {
		var me = this;
		function recursion(array) {
			array = array || [];
			var find = undefined;
			for (var i = 0, len = array.length; i < len; i++) {
				var node = array[i];
				if (uuid === node["_uuid"]) {
					find = node;
				} else if (node[me.childrenField] && node[me.childrenField].length > 0) {
					find = recursion(node[me.childrenField]);
				}
				if (find) {
					break;
				}
			}
			return find;
		}

		return recursion(this.data);
	},
	_show : function(e) {
		this._hide();
		this.contextEl = jQuery('<div class="contextmenu" style="position: relative;"></div>');
		this.contextEl.appendTo(this.el);

		if (e) {
			var event = e.event;
			if (e instanceof jQuery.Event) {
				event = e;
			}
			var top = event.pageY, left = event.pageX;
			this._setPosition({
				top : top,
				left : left
			});
		}

		this.contextEl.html(this._renderContextMenu());
		this.el.show();
	},
	_hide : function() {
		this.el.empty().hide();
		this.data = boot.clone(this.clone);
	},
	_setData : function(data) {
		this.data = data;
		this.clone = data;
	},
	_setPosition : function(position) {
		this.el.css(position);
	},
	// 渲染右击菜单
	_renderContextMenu : function(data) {
		var menu = data || this.data;
		var html = '<ul class="main">';
		for (var i = 0, len = menu.length; i < len; i++) {
			var item = menu[i];
			item['_uuid'] = boot.newId();
			var text = item[this.textField], id = item._uuid, action = item.action;
			html += '<li id="' + id + '$border" class="item-border">';
			html += '<div id="' + id + '" class="item">';
			if (item.children && item.children.length > 0) {
				html += '<span class="arrow"></span>';
			} else {
				html += '<span class=""></span>';
			}
			html += '<a class="text icon-' + action + '" href="javascript:void(0);">' + text + '</a>';
			html += '</div>';
			html += '</li>';
		}
		html += '</ul>';
		return html;
	},
	_renderNextLevel : function(el) {
		var id = el.attr("id");
		var node = this._getNodeByUUID(id);
		var offset = el.position();
		var top = offset.top, left = offset.left + el.width();
		var parentEl = el.parent();

		if (node.children && !node._show) {
			var html = '<div id="' + node._uuid + '$context" class="contextmenu nextlevel" style="position: absolute;top: ' + top + 'px;left: ' + left + 'px;">';
			html += this._renderContextMenu(node.children);
			html += '</div>';
			node._show = true;
			parentEl.append(html);
		} else if (node._show) {
			parentEl.children(".nextlevel").html(this._renderContextMenu(node.children)).show();
		}
	},
	_bindEvents : function(sender) {
		this._on(this.el, '.item', 'mouseenter', this._onItemMouseEnter, this);
		this._on(this.el, '.item-border', 'mouseleave', this._onItemMouseLeave, this);
		this._on(this.el, '.item', 'click', this._onItemClick, this);
		this._on(this.el, '.contextmenu', 'click', this._onContextMenuClick, this);
	},
	// 右击菜单阻止冒泡事件
	_onContextMenuClick : function(e) {
		e.stopPropagation();
	},
	_onItemMouseEnter : function(e) {
		e.stopPropagation();
		var el = e.selector;
		this._renderNextLevel(el);
	},
	_onItemMouseLeave : function(e) {
		e.stopPropagation();
		var el = e.selector;
		el.children(".nextlevel").hide();
		this._fire('onitemleave', e);
	},
	_onItemClick : function(e) {
		e.stopPropagation();
		var el = e.selector;
		var id = el.attr("id");
		var node = this._getNodeByUUID(id);
		e.item = node;
		if (!node.children || node.children && node.children.length == 0) {
			this._fire('itemclick', e);
			this._hide();
		}
	},

	// API
	// e参数接受jQuery.Event和boot.Event
	show : function(e) {
		this._show(e);
	},
	hide : function() {
		this._hide();
	},
	setData : function(data) {
		this._setData(data);
	},
	setPosition : function(position) {
		this._setPosition(position);
	}
});

/*----------------------navigator--------------------------*/
/**
 * @author dragon
 */
boot.Navigator = function(id) {
	boot.Navigator.superClass.constructor.call(this, id);
	this._load();
};

boot.extend(boot.Navigator, boot.Rooter, {
	uiCls : 'boot-navigator',
	_initField : function() {
		this.textField = this.textField || 'text';
		this.childrenField = this.childrenField || 'children';
	},
	_create : function() {
		this.el.css("height", "auto");
		var borderEl = jQuery('<div class="navigator-border" style="height: auto;"></div>');
		var innerEl = jQuery('<div class="navigator-inner"></div>');
		var bodyEl = jQuery('<div class="navigator-menu-float" style="height: auto;"></div>');
		bodyEl.appendTo(innerEl);
		innerEl.appendTo(borderEl);
		borderEl.appendTo(this.el);
		this.borderEl = borderEl;
		this.bodyEl = bodyEl;
		this.contextMenu = new boot.ContextMenu(this.borderEl);
		this.contextMenu['textField'] = this.textField;
		this.contextMenu['childrenField'] = this.childrenField;
	},
	_load : function(options) {
		options = options || {};
		options.data = options.parameters || options.data || {};
		options.url = options.url || this.url;
		options.context = this;
		options.success = this._loadSuccess;

		if (options.url)
			boot.ajax(options);
	},
	// 加载成功
	_loadSuccess : function(result) {
		if (jQuery.type(result) == 'array') {
			this._loadData(result);
		} else if (result.success) {
			this._loadData(result.resultData);
		}
	},
	_loadData : function(array) {
		this.resource = array;
		this.data = array;
		this._renderMenuGroup(this.data);
		if (this.fireFirst) {
			this._fireFirst();
		}
		this._fire("onloadsuccess", {
			sender : this,
			result : array,
			asTreeResult : this.data
		});
	},
	_renderMenu : function(menu) {
		var html = '<div id="' + menu._uuid + '" class="navigator-menuitem">';
		html += '<div class="navigator-menuitem-inner">';
		if (menu.icon && menu.icon != '') {
			html += '<div class="navigator-menuitem-icon navigator-icon-' + menu.icon + '"></div>';
		}
		html += '<div class="navigator-menuitem-text">' + menu[this.textField] + '</div>';
		if (!this.simple && menu.children && menu.children.length > 0) {
			html += '<div class="navigator-menuitem-allow"></div>';
		}
		html += '</div>';
		html += '</div>';
		return html;
	},
	_addHomeMenu : function() {
		var home = {
			_uuid : boot.newId(),
			_actived : false,
			action : 'home',
			icon : "home"
		};
		home[this.textField] = "主页";
		this.data.splice(0, 0, home);
		this.bodyEl.prepend('<span class="navigator-separator"></span>');
		this.bodyEl.prepend(this._renderMenu(home));
	},
	_renderMenuGroup : function(menus) {
		menus = menus || this.data;
		var html = new boot.HTML();
		var split = '<span class="navigator-separator"></span>';
		for (var i = 0, length = menus.length; i < length; i++) {
			var menu = menus[i];
			menu._uuid = boot.newId();
			menu._actived = false;
			html.push(this._renderMenu(menu));
		}
		this.bodyEl.html(html.concat(split));
	},
	// 通过uuid获取node
	_getNodeByUUID : function(uuid, field) {
		field = field || "_uuid";
		var me = this;
		function recursion(array) {
			var find = undefined;
			for (var i = 0, len = array.length; i < len; i++) {
				var node = array[i];
				if (uuid === node[field]) {
					find = node;
				} else if (node[me.childrenField] && node[me.childrenField].length > 0) {
					find = recursion(node[me.childrenField]);
				}
				if (find) {
					break;
				}
			}
			return find;
		}

		return recursion(this.data);
	},
	_fireFirst : function() {
		var me = this;
		function recursion(array) {
			for (var i = 0, len = array.length; i < len; i++) {
				var node = array[i];
				if (node[me.childrenField] && node[me.childrenField].length > 0) {
					return recursion(node[me.childrenField]);
				} else {
					return node;
				}
			}
		}

		var first = recursion(this.data);
		this._fire('onitemclick', {
			sender : this,
			item : first
		});
	},
	_changeActived : function(el, item) {
		if (el)
			el.addClass("hover");
		if (this.activedEl) {
			this.activedEl.removeClass("hover");
		}
		this.activedEl = el;
		this.activedItem = item;
	},
	_bindEvents : function() {
		this._on(this.bodyEl, '.navigator-menuitem', 'mouseenter', this._onMenuMouseEnter, this);
		this._on(this.el, '.navigator-border', 'mouseleave', this._onNavigatorMouseLeave, this);
		this._on(this.bodyEl, '.navigator-menuitem', 'click', this._onMenuItemClick, this);
		this._on(this.bodyEl, '.navigator-menuitem', 'contextmenu', this._onNavigatorItemClick, this);
		this._on(this.el, '.item', 'contextmenu', this._onContextMenu, this);
		this.bind('bodyclick', this._onBodyClick, this);
		this.contextMenu.bind('itemclick', this._onItemClick, this);
		this.contextMenu.bind('itemleave', this._onItemLeave, this);
	},
	_onMenuItemClick : function(e) {
		e.stopPropagation();
		var el = e.selector;
		var id = el.attr("id");
		var offset = el.offset();
		var node = this._getNodeByUUID(id);

		e.item = node;

		if (node.action && node.action == 'home') {
			this._fire("onhomeclick", e);
		} else {
			if (!(node[this.childrenField] && node[this.childrenField].length > 0)) {
				this._onItemClick(e);
			}
			this._fire("onitemclick", e);
		}
		this._onContextMenu(e);
	},
	_onNavigatorMouseLeave : function() {
		this._changeActived();
		this.contextMenu._hide();
	},
	_onItemLeave : function(e) {
		var el = e.selector;
		var sender = e.sender;
		var id = el.attr("id");
		el.children("#" + id.replace(/\$\w+/, "\\$quick")).remove();
	},
	_onItemClick : function(e) {
		var el = e.selector;
		var sender = e.sender;
		var id = el.attr("id");
		var node = e.item || sender._getNodeByUUID(id);
		e.item = node;
		this._changeActived();
		this._fire('onitemclick', e);
	},
	_onBodyClick : function() {
		if (this.contextMenu) {
			this.contextMenu._hide();
			this._changeActived();
		}
	},
	_onMenuMouseEnter : function(e) {
		e.stopPropagation();
		var el = e.selector;
		var id = el.attr("id");
		var offset = el.offset();
		var node = this._getNodeByUUID(id);
		if (this.activedItem) {
			if (this.activedItem._uuid === node._uuid) {
				return;
			}
		}
		this._changeActived(el, node);
		if (!this.simple) {
			if (node[this.childrenField] && node[this.childrenField].length > 0) {
				this.contextMenu._setData(node[this.childrenField]);
				this.contextMenu._setPosition({
					top : offset.top + el.height(),
					left : offset.left
				});
				this.contextMenu._show();
				el.css('border-bottom', 'none');
			} else {
				this.contextMenu._hide();
			}
		}
	},
	_onContextMenu : function(e) {
		e.preventDefault();
		return false;
	},
	_onNavigatorItemClick : function(e) {
		var el = e.selector;
		var id = el.attr("id");
		var node = this._getNodeByUUID(id);
		e.menu = node;
		this._onContextMenu(e);
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ 'textField', "childrenField", 'url', "binding", "quickUrl" ],
			bool : [ "fireFirst", "simple" ]
		}, attributes);
		return boot.Navigator.superClass._getAttrs.call(this, attrs);
	},
	setData : function(array) {
		this._loadData(array);
	}
});

boot.Register(boot.Navigator, 'navigator');

/*----------------------tab--------------------------*/
/**
 * @author 田鑫龙
 */
boot.Tabs = function(id) {
    this.tabs = [];
    this.activeTab = undefined;
    boot.Tabs.superClass.constructor.call(this, id);
    this.scrollFixed = 0;
};

boot.extend(boot.Tabs, boot.Rooter, {
    uiCls : 'boot-tabs',
    type: 'tabs',
    _initField : function() {
        this.textField = this.textField || 'text';
        this.menuList = [{
        	cmd: 'refresh',
            text : '刷新'
        }, {
        	cmd: 'closeOther',
            text : '关闭其他'
        }, {
        	cmd: 'closeAll',
            text : '全部关闭'
        }, {
        	cmd: 'closeLeft',
            text : '关闭左边'
        }, {
        	cmd: 'closeRight',
            text : '关闭右边'
        }];
        this.showClose = this.showClose === false ? false : true;
    },
    _create : function() {
        this._convertInnerTab();
        this.el.css("position", "relative");
        var tabs = jQuery('<div class="tabs-head" style="height: 26px;position: relative;border-width: 1px;border-style: solid;;border-bottom: none;"></div>');
        tabs.appendTo(this.el);
        var tabBorderEl = jQuery('<div class="tab-border" style="margin-right: 2px;overflow: hidden;position: relative;bottom: -3px;"></div>');
        tabBorderEl.appendTo(tabs);
        var tabBorderScrollEl = jQuery('<div class="tab-border-scroll"></div>');
        tabBorderScrollEl.appendTo(tabBorderEl);
        var tabMoreEl = jQuery('<div class="tab-more" style="height: 100%;position: absolute;top: 0;right: 2px;z-index: 10;width: 64px;"></div>');
        tabMoreEl.appendTo(tabs);
        var leftButtonEl = jQuery('<div class="tab-left-btn" style="border-style: solid;border-width: 1px;width: 18px;cursor: pointer;height: 16px;z-index: 10;margin-top: 5px;float: left;"><span></span></div>');
        leftButtonEl.appendTo(tabMoreEl);
        var rightButtonEl = jQuery('<div class="tab-right-btn" style="border-style: solid;border-width: 1px;width: 18px;cursor: pointer;height: 16px;z-index: 10;margin-top: 5px;margin-left: -1px;margin-right: 2px;float: left;"><span></span></div>');
        rightButtonEl.appendTo(tabMoreEl);
        var tabMoreButtonEl = jQuery('<div class="tab-more-btn" style="border-style: solid;border-width: 1px;width: 20px;cursor: pointer;height: 22px;z-index: 10;border-bottom: none;margin-top: 3px;float: left;"><span></span></div>');
        tabMoreButtonEl.appendTo(tabMoreEl);
        var tabMoreFoldEl = jQuery('<div class="tab-more-fold"></div>');
        tabMoreFoldEl.appendTo(tabMoreEl);
        var body = jQuery('<div class="tabs-body" style="top: 26px;position: absolute;bottom: 0px;left: 0;right: 0;border-width: 1px;border-style: solid;"></div>');
        body.appendTo(this.el);
        
        this.headEl = tabs;
        this.bodyEl = body;
        this.tabBorderEl = tabBorderEl;
        this.tabBorderScrollEl = tabBorderScrollEl;
        this.tabMoreEl = tabMoreEl;
        this.leftButtonEl = leftButtonEl;
        this.rightButtonEl = rightButtonEl;
        this.tabMoreButtonEl = tabMoreButtonEl;
        this.tabMoreFoldEl = tabMoreFoldEl;
        
        this.contextMenu = new boot.ContextMenu(this.headEl);
        this.contextMenu['textField'] = this.textField;
        
        this._renderTabs();
    },
    _convertInnerTab : function() {
        var array = this.el.children().toArray();
        for (var index in array) {
            var el = jQuery(array[index]);
            var tab = new boot.Tab(el);
            this.tabs.push(tab);
        }
        this.el.empty();
    },
    _renderTabs : function() {
    	this._orderBy();
        var tabs = '';
        for (var i = 0, len = this.tabs.length; i < len; i++) {
            var tab = this.tabs[i];
            if (tab.contentEl == undefined) {
                this._createContentBody(tab);
            }else if(tab.actived){
            	if(tab.refreshOnClick){
            		 this._refreshTab(tab);
            	}
                tab.contentEl.css("visibility", "visible");
            }
            tabs += this._createTab(tab);
        }
        this.tabBorderScrollEl.html(tabs);
        var width = this._calTabBorderScrollWidth();
        this.tabBorderScrollEl.width(width);
    },
    _refreshTab: function(tab){
    	var src = tab.url;
        if (tab.url.indexOf("?") != -1) {
            src += "&_random=" + new Date().getTime();
        } else {
            src += "?_random=" + new Date().getTime();
        }
		tab.iframe.prop("src", src);
    },
    _closeAllTab: function(){
		for (var i = 0; i < this.tabs.length; ) {
			var tab = this.tabs[i];
			if (tab.enabled && !tab.locked) {
				this.__destroyTab(tab, i);
			}else{
				i++;
			}
		}
    },
    _closeLeftTab : function(_tab) {
		for (var i = 0; i < this.tabs.length;) {
			var tab = this.tabs[i];
			if(tab._uuid == _tab._uuid)
				break;
			if (tab.enabled && !tab.locked) {
				this.__destroyTab(tab, i);
			}else{
				i++;
			}
		}
	},
	_closeRightTab : function(_tab) {
		for (var i = 0, fixed = 1; i <= this.tabs.length - fixed; ) {
			var tab = this.tabs[this.tabs.length - fixed];
			if(tab._uuid == _tab._uuid)
				break;
			if (tab.enabled && !tab.locked) {
				this.__destroyTab(tab, this.tabs.length - fixed);
			}else{
				fixed++;
			}
		}
	},
	_closeOtherTab : function(_tab) {
		for (var i = 0; i < this.tabs.length;) {
			var tab = this.tabs[i];
			if(tab._uuid == _tab._uuid){
				 i++;				
				continue;
			}
			if (tab.enabled && !tab.locked) {
				this.__destroyTab(tab, i);
			}else {
				i++;
			}
		}
	},
    _addTab : function(tab) {
    	var _tab = this._getTabByUUID(tab.id, 'id');
    	if(!_tab){
    		_tab = new boot.Tab(tab);
            this.tabs.push(_tab);
    	}
    	this._changeActivedTab(_tab);
        this._renderTabs();
        
        var width = this._calTabBorderScrollWidth();
        this._toTabBorderScroll(width);
        
    	var scrollWidth = this.tabBorderEl.width();
    	var _c = width - scrollWidth;
    	if(_c > 0){
			this.scrollFixed = _c;
    	}
    },
    _toTabBorderScroll: function(position){
    	this.tabBorderEl.scrollLeft(position);
    },
    _calTabBorderScrollWidth: function(){
    	var width = 0;
    	var tabs = this.tabBorderScrollEl.children().toArray();
    	for(var i=0,len=tabs.length;i<len;i++){
    		var tab = tabs[i];
    		width += jQuery(tab).outerWidth(true);
    	}
    	return width + 66;
    },
    _changeActivedTab : function(tab) {
        if (this.activeTab) {
            if (this.activeTab._uuid === tab._uuid) {
                return false;
            }
            this.activeTab.actived = false;
            this.activeTab.contentEl.css("visibility", "hidden");
        }
        tab.actived = true;
        this.activeTab = tab;
        return true;
    },
    // 创建页签
    _createTab : function(tab) {
        var html = "";
        var id = tab._uuid + '$tab';
        var zIndex = '', activeCls = '';
        if (tab.actived) {
            activeCls = ' tabs-tab-actived';
            zIndex = 'z-index: 10;';
            this._changeActivedTab(tab);
        }
        html += '<div id="' + id + '" class="tabs-tab' + activeCls + '" style="position: relative;display: inline-block;border-style: solid;border-width: 1px;padding: 3px 8px 3px 8px;text-align: center;cursor: pointer;white-space: nowrap;border-bottom: none;margin-left: 2px;height: 16px;' + zIndex + '">';
        if (tab.icon) {
            html += '<img alt="" src="' + tab.icon + '" class="tab-icon" style="width: 14px;height: 14px;"/>';
        }
        html += '<span class="tab-text '+ (tab.enabled ? '' : 'disabled') +'" style="height: 16px;line-height: 15px;vertical-align: middle;">' + tab[this.textField] + '</span>';
        if (this.showClose && tab.allowClose && tab.enabled && !tab.locked) {
            var closeId = tab._uuid + "$close";
            html += '<span id="' + closeId + '" class="tab-close" style="width: 14px;height: 14px;display: inline-block;vertical-align: middle;margin-left: 6px;"></span>';
        }
        html += '</div>';
        return html;
    },
    // 创建body
    _createContentBody : function(tab) {
        var id = tab._uuid + '$body';
        var html = '<div id="' + id + '" class="tabs-body-content" ';
        if(tab.actived){
            html += 'style="position: absolute;width: 100%;height: 100%;">';
        }else{
            html += 'style="position: absolute;width: 100%;height: 100%;visibility:hidden;">';
        }
        if(tab.html && tab.html != ''){
        	html += tab.html;
        }else if (tab.url) {
            var src = tab.url;
            if (tab.url.indexOf("?") != -1) {
                src += "&_random=" + new Date().getTime();
            } else {
                src += "?_random=" + new Date().getTime();
            }
            html += '<iframe src="' + src + '" style="border: none;width: 100%;height: 100%;"></iframe>';
        }
        html += '</div>';
        this.bodyEl.append(html);
        id = id.replace(/\$/, '\\$');
        tab.contentEl = tab.contentEl || jQuery("#" + id, this.bodyEl);
        tab.iframe = tab.contentEl.children("iframe");
        this._bindIframeOnload(tab, this);
    },
    _bindIframeOnload: function(tab, sender){
        var frame = tab.iframe;
        if(frame && frame[0]){
            var iframe = frame[0];
            if (iframe.attachEvent) {
                iframe.attachEvent("onload", function(e) {
                    e.sender = sender;
                    tab.onload && tab.onload.call(sender, e);
                    tab.loaded = true;
                });
            } else {
                iframe.onload = function(e) {
                    e.sender = sender;
                    tab.onload && tab.onload.call(sender, e);
                    tab.loaded = true;
                };
            }  
        }

    },
    _orderBy: function(){
    	var lockedIndex = 0;
    	for(var i=0,len=this.tabs.length;i<len;i++){
    		var tab = this.tabs[i];
    		if(tab.locked){
    			this.tabs.splice(i, 1);
    			this.tabs.splice(lockedIndex, 0, tab);
    			lockedIndex++;
    		}
    	}
    },
    // 根据UUID查找tab对象
    _getTabByUUID : function(uuid, field) {
    	field = field || '_uuid'
        for (var i = 0, len = this.tabs.length; i < len; i++) {
            var tab = this.tabs[i];
            if (tab[field] === uuid) {
                return tab;
            }
        }
    },
    // 销毁tab方法
    _destroyTab : function(uuid) {
        for (var i = 0, len = this.tabs.length; i < len; i++) {
            var tab = this.tabs[i];
            if (tab._uuid === uuid) {
            	this.__destroyTab(tab, i);
                break;
            }
        }
    },
    __destroyTab: function(tab, i){
        if (tab.actived) {
            var closet = this.tabs[i - 1] || this.tabs[i + 1];
            if (closet) {
                closet.actived = true;
                this._changeActivedTab(closet);
            } else {
                this.activeTab = null;
            }
        }
        tab.contentEl.remove();
        tab.contentEl = null;
        this.tabs.splice(i, 1);
        delete boot.components[tab._uuid];
        this._renderTabs();
    },
    _activedByName: function(name){
    	var tab = this._getTabByUUID(name, "name");
    	this._activedTab(tab);
    },
    _activedTab: function(tab){
    	if(tab && tab.enabled && !tab.actived){
    		var action = this._changeActivedTab(tab);
            if (action)
                this._renderTabs();
    	}
    },
    _destroy: function(){
    	boot.Tabs.superClass._destroy.call(this);
    	this.contextMenu._destroy();
    	for(var i=0,len=this.tabs.length;i<len;i++){
    		this.tabs[i]._destroy();
    	}
    	this.el.remove();
    },
    _bindEvents : function() {
        this._on(this.headEl, '.tabs-tab', 'click', this._onTabClick, this);
        this._on(this.headEl, '.tab-more-btn', 'click', this._onMoreButtonClick, this);
        this._on(this.headEl, '.tab-left-btn', 'click', this._onLeftButtonClick, this);
        this._on(this.headEl, '.tab-right-btn', 'click', this._onRightButtonClick, this);
        this._on(this.headEl, '.fold-tab', 'click', this._onFoldTabClick, this);
        this._on(this.headEl, '.tabs-tab', 'contextmenu', this._onContextMenu, this);
        this._on(this.headEl, '.tab-close', 'click', this._onTabCloseClick, this);
        this.contextMenu.bind('itemclick', this._onItemClick, this);
        this.bind('bodyclick', this._onBodyClick, this);
    },
    _onItemClick : function(e) {
        var el = e.selector;
        var sender = e.sender;
        var id = el.attr("id");
        var node = sender._getNodeByUUID(id);
        var tab = this.contextMenu.trigger;
        var cmd = '_' + node.cmd + 'Tab';
        this[cmd](tab);
    },
    _onBodyClick : function() {
        if (this.contextMenu) {
            this.contextMenu._hide();
        }
        if(this._showMore){
        	this.tabMoreFoldEl.hide();
        	this._showMore = false;
        }
    },
    _onContextMenu : function(e) {
        e.preventDefault();
        var el = e.selector;
        var id = el.attr("id").split("$")[0];
        var tab = this._getTabByUUID(id);
        if(!tab.enabled){
        	return;
        }
        this.contextMenu._setData(this.menuList);
        this.contextMenu._setPosition({
            top : e.jQueryEvent.pageY,
            left : e.jQueryEvent.pageX,
            position: 'fixed'
        });
        this.contextMenu.trigger = tab;
        this.contextMenu._show();
    },
    _onTabClick : function(e) {
        var el = e.selector;
        var id = el.attr("id").split("$")[0];
        var tab = this._getTabByUUID(id);
        if(tab.enabled){
        	var action = this._changeActivedTab(tab);
        	if (action)
        		this._renderTabs();
        }
        e.tab = tab;
        this._fire("tabclick", e);
    },
    _onMoreButtonClick : function(e) {
        e.stopPropagation();
    	var el = e.selector;
    	this.tabMoreFoldEl.show();
    	if(!this._showMore){
    		this._showMore = true;
    		var html = '';
    		for(var i=0,len=this.tabs.length;i<len;i++){
    			var tab = this.tabs[i];
    			if(!tab.locked && !tab.actived && tab.enabled){
    		        var id = tab._uuid + '$fold$tab';
    				html += '<a id="'+ id +'" href="javascript:void(0);" title="'+ tab[this.textField] +'" class="fold-tab">'+ tab[this.textField] +'</a>';
    			}
    		}
    		this.tabMoreFoldEl.html(html);
    	}
    },
    _onRightButtonClick : function(e) {
    	e.stopPropagation();
    	var scrollWidth = this.tabBorderScrollEl.width();
    	var tabWidth = this.tabBorderEl.width();
    	var scrollLeft = this.tabBorderEl.scrollLeft();
		var _c = scrollWidth - tabWidth - scrollLeft;
		if(_c > 150){
			this.scrollFixed += 150;
		}else{
			this.scrollFixed += _c;
		}
		this._toTabBorderScroll(this.scrollFixed);
    },
    _onLeftButtonClick : function(e) {
    	e.stopPropagation();
		if(this.scrollFixed > 150){
			this.scrollFixed -= 150;
		}else{
			this.scrollFixed = 0;
		}
		this._toTabBorderScroll(this.scrollFixed);
    },
    _onFoldTabClick : function(e) {
    	var el = e.selector;
        var id = el.attr("id").split("$")[0];
        for(var i=0,len=this.tabs.length;i<len;i++){
        	var tab = this.tabs[i];
        	if(tab._uuid == id){
        		this.tabs.splice(i, 1);
        		this.tabs.splice(0, 0, tab);
        		this._changeActivedTab(tab);
        		e.tab = tab;
        		break;
        	}
        }
        this._renderTabs();
        this._toTabBorderScroll(0);
        this._fire("tabclick", e);
    },
    _onTabCloseClick : function(e) {
        e.stopPropagation();
        var el = e.selector;
        var id = el.attr("id").split("$")[0];
        this._destroyTab(id);

    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ["textField"],
            bool : ["showClose"],
            json : [],
            fn : []
        }, attributes || {});
        return boot.Tabs.superClass._getAttrs.call(this, attrs);
    },

    // API
    addTab : function(tab) {
        this._addTab(tab);
    },
    getIframeByIndex: function(index){
    	return this.tabs[index].iframe;
    },
    activedByName: function(name){
    	this._activedByName(name);
    },
    activedTab: function(tab){
    	this._activedTab(tab);
    }
});

boot.Register(boot.Tabs, 'tabs');

// Tab对象
boot.Tab = function(tab) {
    this._uuid = boot.newId(), 
    this.visible = true, 
    this.enabled = true, 
    this.actived = false, 
    this.loaded = false, 
    this.locked = false,
    this.refreshOnClick = false;

    this._init(tab);
};

boot.Tab.prototype = {
    _init : function(tab) {
        if ( tab instanceof jQuery) {
            this._getAttrs(tab);
            this.el = tab;
        } else if (jQuery.type(tab) === 'object') {
            boot.concat(this, tab);
        }
        this.name = this.name || boot.newId();
        this.allowClose = this.allowClose === false ? false : true;
        this.html = this.html || (this.el ? this.el.html().replace(/(^\s*)|(\s*$)/g, "") : undefined); 
    },
    _destroy: function(){
    	boot.Destroy(this._uuid);
    },
    _getAttrs : function(el) {
        if (!el) {
            return;
        }
        this.text = el.text();
        var attrs = {
            str : ["name", "text", "url"],
            bool : ["refreshOnClick", "actived", "enabled", "locked", "allowClose"]
        };
        boot.concat(this, boot._getBasicAttrs(el, attrs));
    }
};
/*----------------------datepicker--------------------------*/
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
	this.months = [ 31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
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
boot
		.extend(
				boot.DatePicker,
				boot.Rooter,
				{
					_initField : function() {
						this.format = this.format || 'yyyy-mm-dd';
						this.value = this.value || '';
						this.language = this.language || 'chinese';
						this.showTime = this.onlyTime == true ? true : this.showTime;
					},
					_create : function() {
						this.el.css({
							position : 'absolute'
						});
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

						if (!/dd/i.test(this.format)) {
							view.hide();
						}
						if (!/yyyy-mm/i.test(this.format)) {
							head.hide();
						}

						this._createHead();
						this._createView();
						this._createBottom();
					},
					_updateDatePicker : function() {
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
						yearsHTML += '<span id="' + this._uuid + '$year" class="date-text date-year" style="' + this.styleCls.dateText + 'width: 76px;">' + this.year
								+ this.lang[this.language]['year'] + '</span>';
						yearsHTML += '<a class="date-arrow year-next" style="' + this.styleCls.dateArrow + '">';
						yearsHTML += '<cite class="buttonArrow right" style="' + this.styleCls.arrow + this.styleCls.arrowRight + '"></cite>';
						yearsHTML += '</a>';
						yearsHTML += '<cite class="buttonArrow arrow bottom" style="' + this.styleCls.arrow + this.styleCls.arrowBottom + '"></cite>';
						years.html(yearsHTML);
						monthHTML += '<a class="date-arrow month-prev" style="' + this.styleCls.dateArrow + '">';
						monthHTML += '<cite class="buttonArrow left" style="' + this.styleCls.arrow + this.styleCls.arrowLeft + '"></cite>';
						monthHTML += '</a>';
						monthHTML += '<span id="' + this._uuid + '$month" class="date-text date-month" style="' + this.styleCls.dateText + 'width: 56px;">' + this.month
								+ this.lang[this.language]['month'] + '</span>';
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
						html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">日</td>');
						html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">一</td>');
						html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">二</td>');
						html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">三</td>');
						html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">四</td>');
						html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">五</td>');
						html.push('<td class="datepicker-week" style="border-bottom-style: solid;border-bottom-width: 1px;cursor: default;">六</td>');
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
						html += '<li class="up" style="' + this.styleCls.yearItem
								+ ';width: 118px;height: 22px;position: relative;border-bottom-style: solid;border-bottom-width: 1px;"><cite class="buttonArrow bottom" style="'
								+ this.styleCls.arrow + this.styleCls.arrowTop + 'margin-left: -5px;"></cite></li>';
						for (var i = 0; i < 14; i++, start++) {
							if (target == start) {
								html += '<li class="year selected" style="' + this.styleCls.yearItem + ';width: 59px;">' + start + '</li>';
							} else {
								html += '<li class="year" style="' + this.styleCls.yearItem + ';width: 59px;">' + start + '</li>';
							}
						}
						html += '<li class="down" style="' + this.styleCls.yearItem
								+ ';width: 118px;height: 22px;position: relative;border-top-style: solid;border-top-width: 1px;"><cite class="buttonArrow bottom" style="'
								+ this.styleCls.arrow + this.styleCls.arrowBottom + 'margin-left: -5px;top: 9px;right: auto;"></cite></li>';
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
						var html = '<div class="head" style="position: relative;height: 24px;height: 20px;line-height: 20px;text-align: center;border-bottom-style: solid;border-bottom-width: 1px;">'
								+ this.lang[this.language][type];
						html += '<div class="close" style="position: absolute;right: 2px;top: 2px;bottom: 2px;width: 17px;cursor: pointer;line-height: 18px;">×</div>';
						html += '</div>';
						html += '<ul style="margin: 4px;">';
						for (var index = 0; index < size; index++) {
							if (target == index) {
								html += '<li class="' + type + ' selected" style="width: 22px;height: 23px;float: left;text-align: center;line-height: 22px;">' + index + '</li>';
							} else {
								html += '<li class="' + type + '" style="width: 22px;height: 23px;float: left;text-align: center;line-height: 22px;">' + index + '</li>';
							}
						}
						html += '</ul>';
						this.timeBoxEl.html(html);
						this.timeBoxEl.show();
					},
					_getFebruaryDays : function() {
						return (this.year % 4 == 0 && this.year % 100 != 0) || (this.year % 400 == 0) ? 29 : 28;
					},
					_setPosition : function(position) {
						this.el.offset(position);
					},
					_initDate : function() {
						var date = boot.formatDate(this.format, this.value, true);
						if (date == '') {
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
						var prevMonthDays = this.months[this.month - 2] || this._getFebruaryDays();
						var currentMonthDays = this.months[this.month - 1] || this._getFebruaryDays();

						this._startDateTime = this.year + '-' + (this.month - 1) + '-' + (prevMonthDays - fixed + 1);

						var html = new boot.HTML('<tr>'), _day = prevMonthDays - fixed + 1;
						var cls = 'day prev-month-day';
						for (var i = fixed; i > 0;) {
							_day = prevMonthDays - --i;
							html.push('<td id="datepicker$' + (this.month - 1) + '$' + _day + '" class="' + cls + '">');
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
							html.push('<td id="datepicker$' + this.month + '$' + i + '" class="' + cls + this._markToday(i) + '">');
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
								html.push('<td id="datepicker$' + (this.month + 1) + '$' + i + '" class="' + cls + '">');
								html.push('<div class="datepicker-day">' + i + '</div>');
								html.push('</td>');
							}
						} else {
							fixed -= 7;
							for (var i = 1; i <= fixed; i++) {
								_day = i;
								html.push('<td id="datepicker$' + (this.month + 1) + '$' + i + '" class="' + cls + '">');
								html.push('<div class="datepicker-day">' + i + '</div>');
								html.push('</td>');
							}
							html.push("</tr><tr>");
							for (var i = 1; i <= 7; i++) {
								_day = i + fixed;
								html.push('<td id="datepicker$' + (this.month + 1) + '$' + _day + '" class="' + cls + '">');
								html.push('<div class="datepicker-day">' + _day + '</div>');
								html.push('</td>');
							}
						}
						html.push("</tr>");
						this._endDateTime = this.year + '-' + (this.month + 1) + '-' + _day;
						this.boxEl.html(html.concat());
					},
					_markToday : function(day) {
						if (day == this.day) {
							return " selected";
						}
						return "";
					},
					_createBottom : function() {
						var timesHTML = '<div class="date-times" style="border-style: solid;border-width: 1px;display: inline-block;width: 108px;text-align: left;overflow: hidden;float: left;';
						if (!/hh|mi|ss/i.test(this.format)) // 通过正则表达式匹配时间是否显示
							timesHTML += 'visibility: hidden;';
						timesHTML += '"></div>';
						var times = jQuery(timesHTML);
						var buttons = jQuery('<div class="date-buttons" style="display: inline-block;width: 115px;text-align: right;margin-left: 5px;float: left;"></div>');
						this.bottomEl.append(times);
						this.bottomEl.append(buttons);
						var timeHTML = '<span class="time-text" style="' + this.styleCls.timeText + ';cursor: default;float: left;">时间</span>';
						timeHTML += '<span style="font-family: \'微软雅黑\';cursor: default;float: left;height: 20px;line-height: 20px;">';
						timeHTML += '<input class="time-hour" id="' + this._uuid + '$hour" readonly="true" style="' + this.styleCls.time + '" value="'
								+ (this.hour < 10 ? ('0' + this.hour) : this.hour) + '">';
						timeHTML += ':</span>';
						timeHTML += '<span style="font-family: \'微软雅黑\';cursor: default;float: left;height: 20px;line-height: 20px;">';
						timeHTML += '<input class="time-minute" id="' + this._uuid + '$minute" readonly="true" style="' + this.styleCls.time + '" value="'
								+ (this.minute < 10 ? ('0' + this.minute) : this.minute) + '">';
						timeHTML += ':</span>';
						timeHTML += '<span style="cursor: default;float: left;height: 20px;line-height: 20px;">';
						timeHTML += '<input class="time-second" id="' + this._uuid + '$second" readonly="true" style="' + this.styleCls.time + '" value="'
								+ (this.second < 10 ? ('0' + this.second) : this.second) + '">';
						timeHTML += '</span>';
						times.html(timeHTML);
						var bottomHTML = '<a class="date-button date-clear" style="' + this.styleCls.dateButton + '">清空</a>';
						bottomHTML += '<a class="date-button date-today" style="' + this.styleCls.dateButton + ';margin-left: -1px;">当前</a>';
						bottomHTML += '<a class="date-button date-sure" style="' + this.styleCls.dateButton + ';margin-left: -1px;">确定</a>';
						// bottomHTML += '<a class="date-button date-close"
						// style="' + this.styleCls.dateButton + ';margin-left:
						// -1px;">关闭</a>';
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
					_onHourClick : function(e) {
						var el = e.selector;
						var value = el.text();
						if (value < 10) {
							value = '0' + value;
						}
						this.hour = value;
						this.hourEl.val(value);
						this.timeBoxEl.hide();
					},
					_onMinuteClick : function(e) {
						var el = e.selector;
						var value = el.text();
						if (value < 10) {
							value = '0' + value;
						}
						this.minute = value;
						this.minuteEl.val(value);
						this.timeBoxEl.hide();
					},
					_onSecondClick : function(e) {
						var el = e.selector;
						var value = el.text();
						if (value < 10) {
							value = '0' + value;
						}
						this.second = value;
						this.secondEl.val(value);
						this.timeBoxEl.hide();
					},
					_onHourBoxClick : function(e) {
						this._onBodyClick();
						e.stopPropagation();
						this._renderTimeBox('hour', 24);
					},
					_onMinuteBoxClick : function(e) {
						this._onBodyClick();
						e.stopPropagation();
						this._renderTimeBox('minute', 60);
					},
					_onSecondBoxClick : function(e) {
						this._onBodyClick();
						e.stopPropagation();
						this._renderTimeBox('second', 60);
					},
					_onBodyClick : function(e) {
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
						if (max >= 2099) {
							return;
						}
						this._renderYearBox(max + 8);
					},
					_onYearBoxUpClick : function(e) {
						e.stopPropagation();
						var el = e.selector;
						var min = Number(el.next().text());
						if (min <= 1900) {
							return;
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
						if (this.showTime) {
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
						if (this.showTime) {
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
						if (this.showTime) {
							this._renderBox();
						}
					},
					_getAttrs : function(attributes) {
						var attrs = boot.concat({
							str : [ 'format', 'value' ]
						}, attributes);
						return boot.DatePicker.superClass._getAttrs.call(this, attrs);
					}
				});

boot.Register(boot.DatePicker, 'datepicker');
/*----------------------calendar--------------------------*/
/**
 * 田鑫龙
 */
boot.Calendar = function(id) {
	boot.Calendar.superClass.constructor.call(this, id);
	this.format = "yyyy-mm-dd hh:mi";
};

boot
		.extend(
				boot.Calendar,
				boot.DatePicker,
				{
					uiCls : "boot-calendar",
					_initField : function() {
						boot.Calendar.superClass._initField.call(this);
						this.workTime = this.workTime || [ 9, 6 ];
						this.dateField = this.dateField || "date";
						this.todayDateTime = boot.formatDate("yyyy-mm-dd", new Date());
					},
					_create : function() {
						boot.Calendar.superClass._create.call(this);
						this.el.css({
							"width" : 960,
							"left" : "50%",
							"margin-left" : -480
						});
						this.viewEl.css("width", "auto");
						this.bottomEl.hide();
						this._createPrompt();
					},
					_load : function() {
						boot.ajax({
							url : this.loadUrl,
							type : 'post',
							dataType : 'json',
							data : {
								"entityBean.startTime" : this._startDateTime,
								"entityBean.endTime" : this._endDateTime
							},
							context : this,
							success : this._loadSuccess
						})
					},
					_loadSuccess : function(result) {
						if (result.success) {
							var data = result.resultData;
							this._setHolidayAndRest(data.holiday, data.rest);
							var list = data.task;
							for (var i = 0, len = list.length; i < len; i++) {
								var task = list[i];
								this._renderTask(task.startTime, task.endTime, task.content);
							}
						}
					},
					_createPrompt : function() {
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
						html += '<td><input id="' + this.startEl + '" class="boot-date" height="20" width="135" format="yyyy-mm-dd hh:mi" showTime="true" onlyTime="'
								+ this.onlyToday + '"/></td>';
						html += '<td style="font-size: 12px;">至</td>';
						html += '<td><input id="' + this.endEl + '" class="boot-date" height="20" width="135" format="yyyy-mm-dd hh:mi" showTime="true" onlyTime="'
								+ this.onlyToday + '"/></td>';
						html += '</tr>';
						html += '<tr>';
						html += '<td style="font-size: 12px;text-align: right;width: 40px;">备注：</td>';
						html += '<td colspan="3"><div id="' + this.textEl + '" class="boot-textarea" width="290" height="60"></div></td>';
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
					_renderTask : function(startTime, endTime, text) {
						var start = boot.formatDate(this.format, startTime, true);
						var end = boot.formatDate(this.format, endTime, true);

						var selector = "#datepicker\\$" + (start.getMonth() + 1) + '\\$' + start.getDate();
						var startDay = jQuery(selector, this.viewEl);
						var count = end.getDate() - start.getDate();

						if (count === 0) {
							var range = start.getHours() + ':' + start.getMinutes() + '-' + end.getHours() + ':' + end.getMinutes();
							startDay.append(this._createTask(range + '  ' + text));
						} else {
							var range = start.getHours() + ':' + start.getMinutes() + '-' + this.workTime[1] + ':00';
							startDay.append(this._createTask(range + '  ' + text));
							if (count > 1) {
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
					_createTask : function(text) {
						var html = '<div class="task" style="font-size: 12px;text-align: left;margin: 1px;border-radius: 4px;color: #FFF;">';
						html += '<div class="text" style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;width: 100%;cursor: pointer;" title="' + text + '">' + text
								+ '</div>';
						html += '<div class="remove"></div>';
						html += '</div>';
						return html;
					},
					_renderBox : function() {
						var first = new Date(this.year, this.month - 1, 1);
						var fixed = first.getDay() || 7;
						var prevMonthDays = this.months[this.month - 2] || this._getFebruaryDays();
						var currentMonthDays = this.months[this.month - 1] || this._getFebruaryDays();

						this._startDateTime = this.year + '-' + (this.month - 1) + '-' + (prevMonthDays - fixed + 1);

						var html = new boot.HTML('<tr>'), _day = prevMonthDays - fixed + 1;
						var cls = 'day prev-month-day';
						for (var i = fixed; i > 0;) {
							_day = prevMonthDays - --i;
							html.push('<td id="datepicker$' + (this.month - 1) + '$' + _day + '" class="' + cls + this._setDayEnabled(_day, -1) + '">');
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
							html.push('<td id="datepicker$' + this.month + '$' + i + '" class="' + cls + this._markToday(i) + this._setDayEnabled(_day, 0) + '">');
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
						cls = "day next-month-day calendarEvent", fixed = 42 - fixed - currentMonthDays;
						if (fixed <= 7) {
							for (var i = 1; i <= fixed; i++) {
								_day = i;
								html.push('<td id="datepicker$' + (this.month + 1) + '$' + i + '" class="' + cls + this._setDayEnabled(_day, 1) + '">');
								html.push('<div class="datepicker-day">' + i + '</div>');
								html.push('</td>');
							}
						} else {
							fixed -= 7;
							for (var i = 1; i <= fixed; i++) {
								_day = i;
								html.push('<td id="datepicker$' + (this.month + 1) + '$' + i + '" class="' + cls + this._setDayEnabled(_day, 1) + '">');
								html.push('<div class="datepicker-day">' + i + '</div>');
								html.push('</td>');
							}
							html.push("</tr><tr>");
							for (var i = 1; i <= 7; i++) {
								_day = i + fixed;
								html.push('<td id="datepicker$' + (this.month + 1) + '$' + _day + '" class="' + cls + this._setDayEnabled(_day, 1) + '">');
								html.push('<div class="datepicker-day">' + _day + '</div>');
								html.push('</td>');
							}
						}
						html.push("</tr>");
						this._endDateTime = this.year + '-' + (this.month + 1) + '-' + _day;
						this.boxEl.html(html.concat());

						this._load();
					},
					_setDayEnabled : function(day, fixed) {
						var year = this.yearEl.text().replace("年", '');
						var month = this.monthEl.text().replace("月", '');
						var cur = year + '-' + (Number(month) + fixed) + '-' + day;
						if (boot.formatDate("yyyy-mm-dd", cur) >= this.todayDateTime) {
							return " calendarEvent";
						}
						return " disabled";
					},
					_setHolidayAndRest : function(holiday, rest) {
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
						this._on(this.viewEl, '.calendarEvent', 'dblclick', this._onDayDBLClick, this);
						this._on(this.el, '.close', 'click', this._onCloseButtonClick, this);
						this._on(this.el, '.sure', 'click', this._onSureButtonClick, this);
					},
					_onDayDBLClick : function(e) {
						// var today = new Date().getTime();
						// var date = boot.formatDate(this.format, this.value,
						// true);
						// if(today > date.getTime()){
						// return;
						// }
						//    	
						this.startEl.setValue(this.value);
						this.endEl.setValue(this.value);
						this.promptEl.animate({
							top : -1
						});
					},
					_onCloseButtonClick : function(e) {
						this._close();
					},
					_onSureButtonClick : function(e) {
						var startTime = this.startEl.getValue();
						var endTime = this.endEl.getValue();
						var text = this.textEl.getValue();
						boot.ajax({
							url : this.addUrl,
							context : this,
							dataType : 'json',
							type : 'post',
							data : {
								"entityBean.startTime" : startTime,
								"entityBean.endTime" : endTime,
								"entityBean.content" : text
							},
							success : function(result) {
								if (result.success) {
									this._renderTask(startTime, endTime, text);
									this._close();
								}
							}
						});
					},
					_close : function() {
						this.startEl.setValue("");
						this.endEl.setValue("");
						this.textEl.setValue("");
						this.promptEl.animate({
							top : -200
						});
					},
					_getAttrs : function(attributes) {
						var attrs = boot.concat({
							str : [ "loadUrl", "addUrl", "removeUrl", "dateField" ],
							bool : [ "onlyToday" ],
							json : [ "workTime" ]
						}, attributes || {});
						return boot.Calendar.superClass._getAttrs.call(this, attrs);
					}
				});

boot.Register(boot.Calendar, "calendar");
/*----------------------prompt--------------------------*/
/**
 * 田鑫龙
 */
boot.Prompt = function(type) {
	this.type = type;
	this._uuid = boot.newId();
	this.init();
	this.render();
	this.bindEvents();
};

boot.Prompt.prototype = {
	init : function() {
		var style = "position: fixed;border-width: 1px;border-style: solid;z-index: 100000;top: -300px;left: 50%;";
		var footHeight = "30px", topHeight = "45px";
		if (this.type === 'tip') {
			style += "margin-left: -60px;width: 120px;height: 60px;color: #468847;background-color: #DFF0D8;border-color: #D6E9C6;";
			footHeight = "0px", topHeight = "0px";
		} else {
			style += "margin-left: -160px;width: 320px;height: 150px;";
		}
		var el = jQuery('<div id="' + this._uuid + '" class="prompt" style="' + style + '"></div>');
		var top = jQuery('<div class="prompt-head" style="height: ' + topHeight
				+ ';line-height: 40px;padding-left: 15px;font-size: 12px;color: #222;overflow: hidden;">温馨提示：</div>');
		var body = jQuery('<div class="prompt-view" style="position: absolute;top: ' + topHeight + ';left: 0;bottom: ' + footHeight + ';right: 0;"></div>');
		var foot = jQuery('<div class="prompt-foot" style="position: absolute;left: 0;bottom: 0;height: ' + footHeight + ';right: 0;overflow: hidden;"></div>');
		el.append(top).append(body).append(foot);

		this.el = el;
		this.viewEl = body;
		this.footEl = foot;
		this.headEl = top;

		// 遮蔽层
		this.modalEl = new boot.Modal(document.body);
		this.modalEl._hideLoadingText();
		this.modalEl._setCss({
			"position" : "fixed"
		});
		this.modalEl._show();
	},
	render : function() {
		this.renderButton();
		this.el.appendTo(document.body);

		this.el.animate({
			top : this.type === 'tip' ? -3 : 5
		}, 300);
	},
	renderTip : function(msg) {
		var html = '<div class="prompt-' + this.type + '" style="width: 100%;position: relative;overflow: hidden;">';
		html += '<div style="width: 120px;height: 60px;overflow: hidden;font-size: 12px;text-align: center;line-height: 60px;">' + msg + '</div>'
		html += '</div>';
		this.viewEl.html(html);
	},
	renderContent : function(msg) {
		var html = '<div class="prompt-' + this.type + '" style="width: 100%;position: relative;overflow: hidden;">';
		html += '<div style="width: 200px;height: 55px;overflow: hidden;float: right;font-size: 12px;margin-right: 20px;">' + msg + '</div>'
		html += '</div>';
		this.viewEl.html(html);
	},
	renderButton : function() {
		var style = 'padding: 0px 12px;display: inline-block;margin: 0 10px;font-size: 12px;text-decoration: none;border: solid 1px;color: #333;height: 20px;line-height: 20px;';
		var html = '<div style="float: right;">';
		if (this.type === 'alert') {
			html += '<a href="javascript:void(0);" class="ensure" style="' + style + '">确&nbsp;定</a>';
		}
		if (this.type === 'confirm') {
			html += '<a href="javascript:void(0);" class="yes" style="' + style + '">是</a>';
			html += '<a href="javascript:void(0);" class="no" style="' + style + '">否</a>';
		}
		html += '</div>';
		this.footEl.html(html);
	},
	bindEvents : function() {
		var me = this;
		this.el.on("click", '.ensure', {
			data : this
		}, function(event) {
			me._ensureButtonClick(event);
		});
		this.el.on("click", '.yes', {
			data : this
		}, function(event) {
			me._yesButtonClick(event);
		});
		this.el.on("click", '.no', {
			data : this
		}, function(event) {
			me._noButtonClick(event);
		});
	},
	setCallback : function(callback, scope) {
		this.scope = scope || this;
		this.callback = callback;
	},
	executeCallback : function(exec) {
		var result = undefined;
		if (this.callback) {
			result = this.callback.call(this.scope, exec)
		}
		return result;
	},
	setMessage : function(msg) {
		if (this.type === 'tip') {
			this.renderTip(msg);
		} else {
			this.renderContent(msg);
		}
	},
	_ensureButtonClick : function(e) {
		this.close(true);
	},
	_yesButtonClick : function(e) {
		this.close(true);
	},
	_noButtonClick : function(e) {
		this.close(false);
	},
	hideModal : function() {
		this.modalEl._hide();
	},
	close : function(flag) {
		var me = this;
		this.el.animate({
			top : -300
		}, 500, function(e) {
			jQuery(this).remove();
			me.modalEl.el.remove();
			me.executeCallback(flag);
		})
	}
};

boot.confirm = function(msg, callback) {
	var pmt = new boot.Prompt('confirm');
	pmt.setCallback(callback);
	pmt.setMessage(msg);
	return pmt;
};

boot.alert = function(msg, callback, scope) {
	var pmt = new boot.Prompt('alert');
	pmt.setCallback(callback, scope);
	pmt.setMessage(msg);
	return pmt;
};

boot.showTip = function(msg, callback, scope) {
	var pmt = new boot.Prompt('tip');
	pmt.setCallback(callback, scope);
	pmt.setMessage(msg);
	pmt.hideModal();
	window.setTimeout(function() {
		pmt.close();
	}, 3000);
	return pmt;
};
/*----------------------fileupload--------------------------*/
/**
 * @author dragon
 */
boot.FileUpload = function(id) {
	this.finished = true;
	boot.FileUpload.superClass.constructor.call(this, id);
	this._setWidth();
	this._setHeight();
	this._createDefalutPath();
	if (this.imagePath && this.showPicture) {
		this._setPath(this.imagePath);
	}
};

boot.extend(boot.FileUpload, boot.Rooter, {
	uiCls : "boot-fileupload",
	_initField : function() {
		boot.FileUpload.superClass._initField.call(this);
		this.multi = Boolean(this.multi);
		this.showBorder = this.showBorder = this.showBorder === false ? false : true;
		this.validateValue = true;
		this.width = this.pictureWidth || this.width || 150;
		this.height = this.height || 22;
		this.pictureWidth = this.pictureWidth || this.width;
		this.pictureHeight = this.pictureHeight || this.height;
		this.allowCancel = this.allowStart = false;
		this.params = this.params || {};
		this.value = this.value || '';
		this.path = this.path || '';
		this.fileUUID = '';
		this.fileType = this.fileType || "default";
		this.url = this.action + "_" + (this.saveMethod ? this.saveMethod : "upload.action");
		this.createUrl = this.action + "_" + (this.createMethod ? this.createMethod : "create.action");
	},
	_create : function() {
		this.el.css({
			"display" : "inline-block",
			"overflow" : "hidden",
			"position" : "relative",
			"vertical-align" : "middle;"
		});
		var borderHTML = '<div class="textbox-border" style="display: block;position: relative;padding: 0 2px;border-style: solid;border-width: 1px;';
		if (this.showBorder === false) {
			borderHTML += 'border: none;';
		}
		borderHTML += '"></div>';
		this.borderEl = jQuery(borderHTML);
		this.borderEl.appendTo(this.el);

		var buttons = '<div class="upload-buttons" style="position: absolute;right: 1px;top: 1px;bottom: 1px;width: 53px;' + (this.onlyView ? 'display: none;' : "") + '">';
		buttons += '<a href="javascript: void(0);" class="button upload-select" style="position: absolute;left: 0;top: 0;right: 0;bottom: 0;z-index: 1;">选择</a>';
		buttons += '</div>';
		var buttons = jQuery(buttons);
		buttons.appendTo(this.borderEl);

		var right = this.onlyView ? 1 : (buttons.width() + 1);
		this.textEl = jQuery('<span class="textbox-text" style="right: ' + right
				+ 'px;position: absolute;left: 2px;top: 1px;bottom: 1px;font-size: 12px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis; "></span>');
		this.textEl.appendTo(this.borderEl);

		this.percentEl = jQuery('<div class="upload-percentage" style="position: absolute;right: 0;height: 2px;bottom: 0;left: 0;background: #FFF;"></div>');
		this.percentEl.appendTo(this.borderEl);

		this.selectEl = buttons.children(":eq(0)");
		this.startEl = buttons.children(":eq(1)");
		this.cancelEl = buttons.children(":eq(2)");

		this.imageEl = jQuery('<img alt="" src="" style="width: ' + this.pictureWidth + 'px;height: ' + this.pictureHeight + 'px;'
				+ (this.fileType == 'picture' ? 'display: inline-block;' : "display: none;") + '"/>');
		this.imageEl.prependTo(this.el);

		this.errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '"></span>');
		this.errorEl.appendTo(this.el);

		if (this.onlyView) {
			if (this.fileType == 'picture') {
				this.borderEl.css("display", "none");
			} else {
				this.borderEl.css("border-color", "transparent");
			}
		}
		this._initPlUpload();

	},
	_initPlUpload : function() {
		this.uploader = new plupload.Uploader({ // 实例化一个plupload上传对象
			runtimes : 'html5,flash,silverlight,html4',
			browse_button : this.selectEl[0],
			url : this.url,
			max_file_size : this.fileSize || '10mb',
			multi_selection : this.multi,
			multipart_params : boot.concat(this.params, {
				"fileType" : this.fileType
			}) || {},
			flash_swf_url : 'bootui/js/plugin/upload/Moxie.swf',
			silverlight_xap_url : 'bootui/js/plugin/upload/Moxie.xap',
			filters : {
				mime_types : [ {
					title : "allow files",
					extensions : this.filter || "jpg,png,bmp,gif"
				} ],
				prevent_duplicates : true
			// 不允许队列中存在重复文件
			}
		});
		this.uploader.init(); // 初始化
	},
	_addParameter : function(parameter) {
		boot.concat(this.uploader.multipart_params, parameter);
	},
	_createDefalutPath : function() {
		boot.ajax({
			url : this.createUrl,
			type : 'post',
			context : this,
			data : {
				"fileType" : this.fileType
			},
			dataType : 'json',
			success : function(result) {
				this.beforePath = result;
			}
		});
	},
	_setWidth : function(width) {
		if (!/\;*\s*width\s*:\s*/.test(this.style)) {
			this.el.css({
				width : width || this.width
			});
		}
	},
	_setHeight : function(height) {
		this.borderEl.css({
			"line-height" : (height || this.height) + "px",
			height : height || this.height
		});
		this.selectEl.css({
			"line-height" : (height || this.height) - 4 + "px",
			height : height || this.height - 4
		})
	},
	_resetSelectButton : function() {
		this.selectEl.text("选择");
	},
	_stop : function() {
		if (this.allowCancel) {
			this.allowCancel = false;
			this.uploader.stop();
			this._resetSelectButton();
			this.percentEl.empty();
		}
	},
	_start : function() {
		if (this.allowStart) {
			this.allowStart = false;
			this.uploader.start();
		}
	},
	_getPath : function() {
		return this.path;
	},
	_setPath : function(path) {
		this.path = path;
		if (this.fileType == "picture") {
			this.imageEl.attr("src", this.path + "?_r=" + new Date().getTime());
		}
		this.fileUUID = path.replace(/.+\\/g, '').replace(/.+\//g, '').replace(/\.\w+/ig, '');
		if (this.onlyView) {
			if (this.fileType !== "picture") {
				var a = this.textEl.children(":eq(0)");
				if (a && a[0]) {
					a.attr("href", path);
				}
			}
		}
	},
	_validate : function() {
		var v = new boot.Validate();
		v.setRequired(this.required);
		v.setValue(this._getPath());
		v.setVType(this.vType);
		v.setErrorText(this.errorText);
		var result = v.execute();
		if (!result) {
			this.el.removeClass("error");
		} else {
			this.el.addClass('error');
		}
		
		this.errorEl.css('color', "red");
		this.errorEl.css('font-size', "12px");
		this.errorEl.css('width', "auto");
		this.errorEl.prop('title', result);
		this.errorEl.html(result);
		this.errorEl.css('position', "relative");
		this.errorEl.css('background', "none");
		
		this.validateValue = !result;
		return this.validateValue;
	},
	_setValue : function(value) {
		if (this.onlyView) {
			this.textEl.html('<a target="_blank" href="' + this.path + '">' + value + '</a>');
		} else
			this.textEl.html(value);
		this.value = value;
	},
	_previewImage : function(file, callback) {// file为plupload事件监听函数参数中的file对象,callback为预览图片准备完成的回调函数
		if (!file || !/image\//.test(file.type))
			return; // 确保文件是图片
		if (file.type == 'image/gif') {// gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
			var fr = new mOxie.FileReader();
			fr.onload = function() {
				callback && callback(fr.result);
				fr.destroy();
				fr = null;
			}
			fr.readAsDataURL(file.getSource());
		} else {
			var preloader = new mOxie.Image();
			preloader.onload = function() {
				preloader.downsize(this.pictureWidth || this.width, this.pictureHeight || this.width);// 先压缩一下要预览的图片,宽300，高300
				var imgsrc = preloader.type == 'image/jpeg' ? preloader.getAsDataURL('image/jpeg', 80) : preloader.getAsDataURL(); // 得到图片src,实质为一个base64编码的数据
				callback && callback(imgsrc); // callback传入的参数为预览图片的url
				preloader.destroy();
				preloader = null;
			};
			preloader.load(file.getSource());
		}
	},
	_bindEvents : function() {
		this._on(this.el, '.upload-start', 'click', this._onStartButtonClick, this);
		this._on(this.el, '.upload-cancel', 'click', this._onCancelButtonClick, this);
		// this.imageEl.on('error', function() {
		// if (this.src != '')
		// this.src = '';
		// else
		// $(this).off('error');
		// });

		// 绑定文件添加进队列事件
		this.uploader.bind('FilesAdded', this._onFileAdded, this);
		// 绑定文件上传进度事件
		this.uploader.bind('UploadProgress', this._onUploadProgress, this);
		// 绑定文件上传完成事件
		this.uploader.bind('UploadComplete', this._onUploadComplete, this);
		// 绑定文件上传完成事件
		this.uploader.bind('FileUploaded', this._onFileUploaded, this);
	},
	_onStartButtonClick : function(e) {
		this._start();
	},
	_onCancelButtonClick : function(e) {
		this._stop();
	},
	_onFileAdded : function(uploader, files) {
		if(!this.multi){
			$.each(uploader.files, function (i, file) {
		        if (uploader.files.length <= 1) {
		            return;
		        }
		        uploader.removeFile(file);
		    });
		}
		for (var i = 0, len = files.length; i < len; i++) {
			var file = files[0];
			var name = file.name;
			this.textEl.html(name);
			this.textEl.attr("title", name);
			this.value = name;
			if (this.path == "") {
				this.path = this.beforePath + "." + name.replace(/.+\./, '');
				this.fileUUID = this.beforePath.replace(/.+\\/g, '').replace(/.+\//g, '').replace(/\.\w+/ig, '');
			} else {
				this.path = this.path.replace(/\.\w+/ig, '') + "." + name.replace(/.+\./, '');
			}
			this.uploader.settings.multipart_params['fakeName'] = this.fileUUID + "." + name.replace(/.+\./, '');
			// uploader.disableBrowse();
			this.allowCancel = this.allowStart = true;
			this.finished = false;

			if (this.fileType == 'picture') {
				var me = this;
				this._previewImage(files[i], function(imgsrc) {
					me.imageEl.attr("src", imgsrc);
				});
			}
		}

		this._validate();
	},
	_onUploadComplete : function(uploader, files) {
		var nameArray = [];
		for (var i = 0, len = files.length; i < len; i++) {
			nameArray.push(files[i].name);
		}
		this.value = nameArray.join(",");
		uploader.disableBrowse(false);
		this._resetSelectButton();
		this.allowCancel = this.allowStart = false;
		this.finished = true;
	},
	_onUploadProgress : function(uploader, file) {
		this.selectEl.text(file.percent + "%");
		this.percentEl.html('<div style="height: 100%;width: ' + (file.percent * 0.01 * this.width) + 'px;background-color: #A5DF16;"></div>');
	},
	_onFileUploaded : function(uploader, file, response) {
		var res = eval("(" + response.response + ")");
		if (this.fileType === 'picture') {
			this.imageEl.attr("src", res.filePath);
			// this.imageEl.replaceWith('<img alt="" src="'+
			// res.filePath.replace(/\\/g, '\/') +'" style="width: '+
			// this.pictureWidth +'px;height: '+ this.pictureHeight
			// +'px;display: inline-block;"/>');
		}
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "filter", "action", "name", "fileType", "pathField", "imagePath" ],
			bool : [ "multi", "onlyView", "showPicture", "required" ],
			number : [ "width", "pictureWidth", "pictureHeight", "height", "fileSize" ],
			json : [ "params" ]
		}, attributes || {});
		return boot.FileUpload.superClass._getAttrs.call(this, attrs);
	},
	upload : function() {
		this._start();
		return this.uploader;
	},
	getPath : function() {
		return this._getPath();
	},
	getValue : function() {
		return this.value;
	},
	setValue : function(value) {
		this._setValue(value);
	}
});

boot.Register(boot.FileUpload, "fileupload");

/** *****************desktop*********************** */
/**
 * @author 田鑫龙
 */
boot.DeskTop = function(id) {
    boot.DeskTop.superClass.constructor.call(this, id);
    this._load();
    var me = this;
    jQuery(window).resize(function() {
        me._renderShortcuts();
    });
};

boot.extend(boot.DeskTop, boot.Rooter, {
    cls : "boot-desktop",
    type: "desktop",
    _initField : function() {
        this.windows = [];
        this.basePath = this.basePath || ctx;
        this.headHeight = this.headHeight || 0;
        this.textField = this.textField || "text";
        this.showTitleField = this.showTitleField || "showTitle";
        this.idField = this.idField || 'id';
        this.rightField = this.rightField || "_mark";
        this.footHeight = this.footHeight || 0;
    },
    _create : function() {
        var head = jQuery('<div class="desktop-head" style="height: ' + this.headHeight + 'px"></div>');
        var foot = jQuery('<div class="desktop-foot" style="height: ' + this.footHeight + 'px"></div>');
        var style = 'top: ' + this.headHeight + 'px; bottom: ' + this.footHeight + 'px;';
        var view = jQuery('<div class="desktop-view" style="' + style + '"></div>');
        var box = jQuery('<div class="desktop-box"></div>');
        var plugins = jQuery('<div class="desktop-plugin-box"></div>');
        var background = jQuery('<img src="' + this.basePath + '/css/images/desktop/background.jpg" alt="" style="position: fixed;top: 0;left: 0;width: 100%;height: 100%;"/>');
        this.el.append(background);
        this.el.append(head).append(view).append(foot);
        view.append(box).append(plugins);

        this.headEl = head;
        this.footEl = foot;
        this.viewEl = view;
        this.boxEl = box;
        this.pluginBoxEl = plugins;
        this.backgroundEl = background;
        document.oncontextmenu = function(e) {
            return false;
        };
        this.contextMenu = new boot.ContextMenu(this.el);
        this.contextMenu.textField = "text";
        
        this._creatToolsButton();
    },
    _creatToolsButton: function(){
    	var html = '<div class="head-tools">';
    	html += '<a class="logout" href="javascript: void(0);"></a>';
    	html += '</div>';
    	this.headEl.append(html);
    },
    _load : function(loadUrl) {
        var options = {
            url : loadUrl || this.loadUrl,
            context : this,
            success : this._loadSuccess
        };
        if (options.url) {
            boot.ajax(options);
        }
    },
    _updateRight : function() {
    	console.log(this.data.user)
        if (this.updateUrl) {
            window._modal = window._modal || new boot.Modal(document.body);
            window._modal._setText("保存中...");
            window._modal._show();
            var user = boot.concat({}, this.data.user || {});
            var options = {
                url : this.updateUrl,
                context : this,
                data : boot.addPrefix(user, 'user'),
                success : function(result) {
                    this.data.user[this.rightField] = result.resultData[this.rightField];
                    this._renderShortcuts();
                    this._updateHideShortcuts();
                    if (!result.success) {
                        alert(result.message);
                    }
                    window._modal._hide();
                }
            };
            if (options.url) {
                boot.ajax(options);
            }
        }
    },
    _loadSuccess : function(result) {
        if (result.success) {
            this.data = result.resultData;
            var user = this.data.user;
            if (!user) {
                this.data.user = {
                    right : 0
                };
            } else if (!user[this.rightField] && (user[this.rightField] == "" || isNaN(user[this.rightField]))) {
                user[this.rightField] = "0";
            }
            this._createHeadEls();
            this._createFootEls();
            this._renderShortcuts();
            this._renderPlugins();
            this._renderHideBox();
            jQuery(window).resize(function(e){
            	
            });
        }
    },
    _createHeadEls : function() {
        var company = this.data.company = this.data.company || {};
        company.logo = company.logo || '../desktop/logo.png';
        var logo = jQuery('<img src="' + company.logo + '" alt="LOGO" style="" class="desktop-logo"/>');
// this.headEl.append(logo);
        company.background = company.background || '../desktop/top_background.png';
        this.headEl.css("background-image", "url('" + company.background + "')");
    },
    _createFootEls : function() {
        var company = this.data.company = this.data.company || {};
        company.copyRight = company.copyRight || "";
        this.footEl.html('<div style="color: #fff;font-size: 12px;line-height: '+ this.footHeight +'px;text-align: center;padding-left: 20px;" class="desktop-copyRight">'+ company.copyRight +'</div>');
        company.background = company.background || '../desktop/top_background.png';
        this.footEl.css("background-image", "url('" + company.background + "')");
    },
    // 渲染插件栏
    _renderPlugins : function(plugins) {
        plugins = boot.clone(plugins || this.data.plugins);

        var html = new boot.HTML();
        for (var index = 0, len = plugins.length; index < len; index++) {
            var plugin = this._addIdentify(plugins[index]);
            html.push(this._createPlugin(plugin));
        }
        this.pluginBoxEl.append(html.concat());
    },
    // 获取shortcut权限
    _getRight : function(shortcut) {
        var right = parseInt(this.data.user[this.rightField], 2);
        var mark = Math.pow(2, shortcut[this.rightField]);
        if ((mark & right) === mark) {
            return true;
        } else {
            return false;
        }
    },
    // 加入快捷方式权限
    _addRight : function(shortcut) {
        var right = parseInt(this.data.user[this.rightField], 2);
        right += Math.pow(2, shortcut[this.rightField]);
        this.data.user[this.rightField] = right.toString(2);
    },
    // 移除快捷方式权限
    _removeRight : function(shortcut) {
        var mark = shortcut[this.rightField];
        var right = parseInt(this.data.user[this.rightField], 2);
        right = right - Math.pow(2, mark);
        this.data.user[this.rightField] = right.toString(2);
    },
    // 获取shortcut数量，通过show是否显示标识来区分
    _getShortcutsByRight : function(show) {
        var length = this.data.shortcuts.length;
        var showArray = [], hideArray = [];
        var right = parseInt(this.data.user[this.rightField], 2);
        for (var i = 0; i < length; i++) {
            var shortcut = this.data.shortcuts[i];
            shortcut = this._addIdentify(shortcut);
            var mark = Math.pow(2, shortcut[this.rightField]);
            if ((mark & right) === mark) {
                showArray.push(shortcut);
            } else {
                hideArray.push(shortcut);
            }
        }
        if (show) {
            return showArray;
        } else {
            return hideArray;
        }
    },
    // 渲染桌面
    _renderShortcuts : function() {
        var shorts = boot.clone(this._getShortcutsByRight());
// shorts = this._addActionShortcut(shorts);
        this._resizeBox(shorts);

        var html = new boot.HTML();
        var column = new boot.HTML();
        for (var index = 0, len = shorts.length; index < len; index++) {
            var shortcut = shorts[index];
            column.push(this._createShortcut(shortcut));
            if ((index + 1) % this.row == 0) {
                html.push('<div class="desktop-box-column">');
                html.push(column);
                html.push('</div>');
                column.empty();
            }
        }
        if (!column.isEmpty()) {
            html.push('<div class="desktop-box-column">');
            html.push(column);
            html.push('</div>');
            column.empty();
        }
        this.boxEl.html(html.concat());
    },
    // 添加按钮
    _addActionShortcut : function(shorts) {
        var add = {
            _uuid : boot.newId(),
            _actived : false,
            _systemIcon : 'desktop-shortcut-add',
            icon : '/css/images/desktop/add.png'
        };
        add[this.rightField] = 0;
        add[this.textField] = '添加';
        shorts.push(add);

        return shorts;
    },
    // TODO 更新单个快捷方式
    _updateShortcut : function(shortcut) {
        if (shortcut._isShortcut) {
            var id = shortcut._uuid;
            var selector = '#' + id;
            var el = jQuery(selector, this.viewBoxEl);
            el.html(this._createShortcutInner(shortcut));
        }
    },
    // 重新绘制box的宽度，计算出列数和行数
    _resizeBox : function(shorts) {
        var total = shorts.length, sWidth = 80 + 20, sHeight = 84 + 20, boxWidth = sWidth, boxHeight = this.boxEl.height();
        this.row = Math.floor(boxHeight / sHeight);
        this.column = Math.ceil(total / this.row);
        this.boxEl.width(this.column * boxWidth);
    },
    // 添加标识
    _addIdentify : function(shortcut) {
        shortcut._isShortcut = true;
        shortcut._uuid = shortcut._uuid || boot.newId();
        shortcut._actived = shortcut._actived === undefined ? false : shortcut._actived;
        shortcut._open = shortcut._open === undefined ? false : shortcut._open;
        return shortcut;
    },
    // 创建单个插件
    _createPlugin : function(plugin) {
        var headHeight = 26;
        if (plugin[this.showTitleField] === false) {
            headHeight = 0;
        }
        var height = (plugin.height || 150) + headHeight;
        var html = '<div id="' + plugin._uuid + '" class="desktop-plugin" style="height: ' + height + 'px">';
        html += '<img src="' + this.basePath + '/css/images/desktop/plugin_bg.png" alt="" style="position: absolute;top: 0;width: 100%;height: 100%;"/>';
        html += '<div class="plugin-head" style="height: ' + headHeight + 'px;padding-left: 18px;position: relative;overflow: hidden;">' + plugin.title + '</div>';
        html += '<div id="' + plugin._uuid + '$body" class="plugin-body" style="position: absolute;top: ' + headHeight + 'px;bottom: 0;">';
        if (plugin.noFrame !== true) {
            var href = 'src="' + plugin.url + '"' || "";
            var size = '';
            if(plugin.height) {
            	size += 'height: ' + plugin.height + 'px;';
            }else {
            	size += 'height: 100%;';
            }
            if(plugin.width) {
            	size += 'width: ' + plugin.width + 'px;';
            }else {
            	size += 'width: 100%;';
            }
            html += '<iframe id="' + plugin._uuid + '$frame" ' + href + ' style="border: none;'+ size +'padding: 0;margin: 0;"></iframe>';
        }
        html += '</div>';
        html += '</div>';
        return html;
    },
    // 载入自定义插件//TODO
    _loadPlugins : function(plugins) {
        if (jQuery.type(plugins) != 'array') {
            plugins = [plugins];
        }
        for (var index in plugins) {
            var plugin = plugins[index];
            this.pluginBoxEl.append(this._createPlugin(plugin));
            plugin.execute(this.id);
        }
    },
    // 注册插件中能够打开弹窗的数据
    _registerPluginDatas : function(id, array) {
        this.plugins = this.plugins || {};
        for (var i = 0, len = array.length; i < len; i++) {
            var plugin = array[i];
            plugin._isShortcut = false;
            plugin._uuid = boot.newId();
            plugin._open = false;
        }
        this.plugins[id] = array;
    },
    // 创建单个快捷方式
    _createShortcut : function(shortcut) {
        var cls = shortcut._systemIcon || 'desktop-shortcut';
        var html = '<div id="' + shortcut._uuid + '" title="' + shortcut[this.textField] + '" class="' + cls + '" style="position: relative;display: inline-block;cursor: pointer;">';
        html += this._createShortcutInner(shortcut);
        html += '</div>';
        return html;
    },
    // 创建快捷方式的内部元素
    _createShortcutInner : function(shortcut) {
        var icon = this.basePath + (shortcut.icon || '/css/images/desktop/icon.png');
        var html = '<span class="desktop-shortcut-icon">';
        html += '<img src="' + icon + '" alt="" style="width: 100%;height: 100%;"/>';
        html += '</span>';
        html += '<span class="desktop-shortcut-text">';
        html += '<div class="left">';
        html += shortcut[this.textField];
        html += '</div><div class="right"></div>';
        html += '</span>';
        if (shortcut._open) {
            var open = this.basePath + '/css/images/desktop/open.png';
            html += '<img src="' + open + '" alt="" style="width: 14px;height: 13px;position: absolute;top: 0px; right: 5px;"/>';
        }
        return html;
    },
    _createWindow : function(shortcut) {
        var url = '';
        if (shortcut.url) {
        	if(shortcut.url.indexOf("http") != -1 || shortcut.url.indexOf("ftp") != -1){
        		url = shortcut.url;
        	}else{
        		url = this.basePath + shortcut.url;
        	}
            
        } else {
            url = this.moduleUrl;
        }
        url = url + (url.indexOf('?') == -1 ? '?' : '&') + 'id=' + shortcut[this.idField] + '&__random=' + new Date().getTime();
        var options = {
            id : shortcut._uuid,
            showModal : false,
            showHead : false,
            showMin : true,
            fullScreen : true,
            desktop : this.id,
            title : shortcut[this.textField],
            url : url,
            onload : function(e) {
                if (this.execute) {
                    this.execute(e, shortcut);
                }
            },
            ondestroy : function(e) {
                var win = e.sender;
                var desk = boot.get(win.desktop);
                desk._destroyWindow(win);
            }
        };
        if (shortcut.url) {
			options.showHead = true;
			options.showMin = false;
			options.showMax = true;
			options.fullScreen = false;
			options.width = 980;
			options.height = 550;
        }
        var win = boot.dialog(options);
        var _win = {
            _uuid : shortcut._uuid,
            window : win
        };
        this.windows.push(_win);
        return win;
    },
    // 获取window，获取不到就调用创建方法
    _getWindow : function(shortcut) {
        var win = undefined;
        for (var i = 0, len = this.windows.length; i < len; i++) {
            var _win = this.windows[i];
            if (_win._uuid == shortcut._uuid) {
                win = _win.window;
            }
        }
        if (!win) {
            win = this._createWindow(shortcut);
        }
        return win;
    },
    // 显示窗口
    _showWindow : function(shortcut) {
        shortcut._open = true;
        var win = this._getWindow(shortcut);
        win.show();
        if (shortcut._isShortcut) {
            // 显示窗口时，更新快捷方式
            this._updateShortcut(shortcut);
        }
        return win;
    },
    _destroyWindow : function(win) {
        for (var i = 0, len = this.windows.length; i < len; i++) {
            var _win = this.windows[i];
            if (win.id === _win._uuid) {
                this.windows.splice(i, 1);
                var shortcut = this._getShortcutByUUID(_win._uuid);
                if (shortcut) {
                    shortcut._open = false;
                    // 销毁窗口时，更新快捷方式
                    this._updateShortcut(shortcut);
                    break;
                } else {
                    shortcut = this._getPluginByUUID(_win._uuid);
                    shortcut._open = false;
                    break;
                }
            }
        }
    },
    _renderHideBox : function() {
        this._showHideShortcuts();
    },
    _showHideShortcuts : function() {
    	var width = this.el.width(), height = this.el.height();
    	var left = (width - 600) / 2, top = (height - 400) / 2;
        if (this.popupEl) {
            this.popupEl.show();
            this.popupEl.css({
            	left: left,
            	top: top
            });
            this._updateHideShortcuts();
        } else {
            var html = '<div class="desktop-hide-box" style="display: none;position: absolute;top: ' + top + 'px;left: ' + left + 'px;width: 600px;height: 400px;">';
            html += '<img src="' + this.basePath + '/css/images/desktop/hide-bg.png" alt="" style="position: absolute;top: 0;width: 100%;height: 100%;"/>';
            html += '<div class="hide-box" style="height: 26px;padding-left: 18px;position: relative;font: 12px \'宋体\';">';
            html += '<div class="hide-box-text" style="height: 26px;line-height: 26px;display: inline-block;">待选快捷方式</div>';
            html += '<div class="hide-box-close" style="height: 18px;width: 18px;position: absolute;top: 4px;right: 10px;cursor: pointer;"></div>';
            html += '</div>';
            html += '<div class="hide-box-body" style="position: absolute;top: 26px;bottom: 0;">';
            html += this._renderHideShortcuts();
            html += '</div>';
            var popupEl = jQuery(html);
            popupEl.appendTo(this.el);
            this.popupEl = popupEl;
            this.popupBodyEl = this.popupEl.find('.hide-box-body');
        }
    },
    // 更新隐藏BOX的无展示权限的快捷方式
    _updateHideShortcuts : function() {
        this.popupBodyEl.html(this._renderHideShortcuts());
    },
    // 渲染无展示权限的快捷方式
    _renderHideShortcuts : function() {
        var shorts = boot.clone(this._getShortcutsByRight(false));
        var html = new boot.HTML(), len = shorts.length;
        if (len == 0) {
            html.push('<div style="width: 100%;height: 20px;font-size: 13px;position: absolute;top: 50%;margin-top: -10px;text-align: center;">没有可添加的应用</div>');
        } else {
            for (var index = 0; index < len; index++) {
                var shortcut = shorts[index];
                html.push(this._createShortcut(shortcut));
            }
        }
        return html.concat();
    },
    // 获取数据源中的shortcut
    _getShortcutByUUID : function(uuid) {
        var shorts = this.data.shortcuts;
        for (var i = 0, len = shorts.length; i < len; i++) {
            var shortcut = shorts[i];
            if (shortcut._uuid == uuid) {
                return shortcut;
            }
        }
    },
    // 获取插件中的data
    _getPluginByUUID : function(uuid) {
        var plugins = this.plugins;
        for (var key in plugins) {
            var array = plugins[key];
            for (var i = 0, length = array.length; i < length; i++) {
                var plugin = array[i];
                if (plugin._uuid == uuid) {
                    return plugin;
                }
            }
        }
    },
    _bindEvents : function() {
        this._on(this.boxEl, '.desktop-shortcut', 'click', this._onShortcutClick, this);
        this._on(this.el, '.desktop-shortcut', 'dblclick', this._onShortcutDBLClick, this);
        this._on(this.el, '.desktop-shortcut', 'contextmenu', this._onShortcutContextMenu, this);
        this._on(this.boxEl, '.desktop-shortcut-add', 'click', this._showHideShortcuts, this);
        this._on(this.el, '.hide-box-close', 'click', this._onHideBoxCloseClick, this);
        this._on(this.headEl, '.logout', 'click', this._onLogout, this);
        this.bind('bodyclick', this._onBodyClick, this);
        this.contextMenu.bind('itemclick', this._onItemClick, this);
    },
    _onLogout: function(e){
    	this._fire('onlogout', e);
    },
    _onBodyClick : function() {
        if (this.contextMenu) {
            this.contextMenu._hide();
        }
    },
    // 右击菜单事件
    _onShortcutContextMenu : function(e) {
        var el = e.selector;
        var uuid = el.attr("id");
        var shortcut = this._getShortcutByUUID(uuid);
        var right = this._getRight(shortcut);
        var menu = [];
        if (right) {
            menu.push({
                "id" : uuid,
                "text" : "打开应用",
                "action" : "open"
            });
            menu.push({
                "id" : uuid,
                "text" : "删除应用",
                "action" : "remove"
            });
        } else {
            menu.push({
                "id" : uuid,
                "text" : "添加到桌面",
                "action" : "add"
            });
        }
        var offset = {
            left : e.event.pageX,
            top : e.event.pageY
        };

        this.contextMenu.trigger = shortcut;
        this.contextMenu._setData(menu);
        this.contextMenu._setPosition(offset);
        this.contextMenu._show();
    },
    // 双击隐藏的快捷方式添加到桌面事件
    _onShortcutDBLClick : function(e) {
        var el = e.selector;
        var id = el.attr('id');
        var shortcut = this._getShortcutByUUID(id);
        var right = this._getRight(shortcut);
        if (!right) {
            this._addRight(shortcut);
            this._updateRight();
            this._renderShortcuts();
            this._updateHideShortcuts();
        }
        if (this.contextEl) {
            this.contextEl.remove();
            this.contextEl = undefined;
        }
    },
    // 右键菜单点击事件
    _onItemClick : function(e) {
        var el = e.selector;
        var ids = el.attr('id').split("$");
        var id = ids[0];
        var item = this.contextMenu._getNodeByUUID(id);
        var shortcut = this.contextMenu.trigger;
        if (item.action === 'open') {
            this._showWindow(shortcut);
        } else if (item.action === 'remove') {
            this._removeRight(shortcut);
            shortcut._open = false;
            this._updateRight();
        } else if (item.action === 'add') {
            this._addRight(shortcut);
            this._updateRight();
        }
    },
    // 快捷方式点击
    _onShortcutClick : function(e) {
        var el = e.selector;
        var uuid = el.attr("id");
        var shortcut = this._getShortcutByUUID(uuid);
        this._showWindow(shortcut);
    },
    // 待选快捷方式容器的关闭事件
    _onHideBoxCloseClick : function(e) {
        this.popupEl.hide();
    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ["loadUrl", "updateUrl", "basePath", "moduleUrl", "showTitleField", "textField", "rightField", "idField"],
            number : ["footHeight", "headHeight"],
            bool : [],
            json : [],
            fn : []
        }, attributes || {});
        return boot.DeskTop.superClass._getAttrs.call(this, attrs);
    },

    loadPlugins : function(plugins) {
        this._loadPlugins(plugins);
    },
    showWindow : function(win) {
        this._showWindow(win);
    }
});

boot.Register(boot.DeskTop, 'desktop');


/** *******************poptip*********************** */
/**
 * 田鑫龙
 */
boot.PopupTip = function(id) {
	boot.PopupTip.superClass.constructor.call(this, id);
	this._loadMessage();
};

boot.extend(boot.PopupTip, boot.Panel, {
	uiCls : "boot-popuptip",
	_initField : function() {
		boot.PopupTip.superClass._initField.call(this);
		this.showFoot = false;
		this.showHead = true;
		this.width = 200;
		this.height = 160;
		this.autoHide = this.autoHide = this.autoHide === false ? false : true;
		this.delay = this.delay || 30000;
		this.title = '提醒：';
	},
	_create : function() {
		boot.PopupTip.superClass._create.call(this);
		this.el.css({
			"position" : "fixed",
			"bottom" : -200,
			"right" : 5,
			"background-color" : "#fff",
			"z-index" : 1000
		});
	},
	_loadMessage : function() {
		if (this.url)
			boot.ajax({
				url : this.url,
				type : 'post',
				dataType : 'json',
				success : this._loadSuccess,
				context : this
			});
	},
	_loadSuccess : function(result) {
		if (result && result.length > 0) {
			this._renderMessage(result);
		}
		var me = this;
		window.setTimeout(function() {
			me._loadMessage();
		}, 1000 * 60 * 1);
	},
	_renderMessage : function(list) {
		var html = "";
		html += '<ul >';
		for (var i = 0, len = list.length; i < len; i++) {
			var row = list[i];
			if (row.count === 0) {
				continue;
			}
			html += '<li class="tip" style="font-size: 12px;height: 24px;line-height: 24px;padding-left: 28px;">' + row.title + '<a target="_blank" href="' + row.url + '"> '
					+ row.count + ' </a>条</li>';
		}
		html += '</ul>';
		this.bodyEl.html(html);
		this._show();
	},
	_show : function() {
		var me = this;
		this.el.animate({
			bottom : 2
		}, 800, function() {
			if (me.autoHide) {
				window.setTimeout(function() {
					me._hide();
				}, me.delay);
			}
		});
	},
	_hide : function() {
		this.el.animate({
			bottom : -200
		}, 800);
	},
	_bindEvents : function() {
		boot.PopupTip.superClass._bindEvents.call(this);
	},
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "url", "delay" ],
			json : [ "autoHide" ]
		}, attributes || {});
		return boot.PopupTip.superClass._getAttrs.call(this, attrs);
	},
	reload : function() {
		this._loadMessage();
	}
});
boot.Register(boot.PopupTip, "popuptip");

/** ------------------聊天---------------------* */
boot.Chatting = function(id) {
	boot.Chatting.superClass.constructor.call(this, id);
	this._testConnection();
	this._syncMessage();
	if (this.asService)
		this._syncCustomeSize();
}

boot.extend(boot.Chatting, boot.Rooter, {
	uiCls : "boot-chatting",
	_initField : function() {
		this.allowSync = false;
	},
	_create : function() {
		this.borderEl = jQuery('<div class="chatting-border"></div>');
		this.borderEl.appendTo(this.el);
		this.headEl = jQuery('<div class="head"></div>').appendTo(this.borderEl);
		var buttons = jQuery('<div class="buttons"></div>').appendTo(this.headEl);
		this.customeButtonEl = jQuery('<input type="button" class="button getCustome" value="连接客户" style="' + (this.asService ? '' : 'display: none;') + '"/>').appendTo(buttons);
		this.disconnectButtonEl = jQuery('<input type="button" class="button disconnect" value="断开连接" />').appendTo(buttons);
		this.asService && (this.queueEl = jQuery('<div class="queue"><div>').prependTo(buttons));
		this.viewEl = jQuery('<div class="view" style="top: 41px;border-top: solid 1px #999;"></div>').appendTo(this.borderEl);
		this.controlEl = jQuery('<div class="control"></div>').appendTo(this.borderEl);
		this.panelEl = jQuery('<div class="text-panel"></div>').appendTo(this.borderEl);
		this.textEl = jQuery('<textarea rows="" cols="" class="cell"></textarea>').appendTo(this.panelEl);

		this.buttonEl = jQuery('<input type="button" class="button send" value="发送" />').appendTo(jQuery('<div class="buttons"></div>').appendTo(this.borderEl));
	},
	_appendServiceMessage : function(array) {
		array = array || [];
		for ( var index in array) {
			var time = array[index].time;
			var html = '<div class="service" id="' + time + '">' + '<div class="user">' + (this.asService ? '客户' : '客服') + ' 说(' + time + ')：</div>' + '<div class="message">'
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
						!this.asService && this._sendSystemMessage(result.message);
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
						this.allowSyncCustomeSize = false;// 允许自动获取客户数量
						this._sendSystemMessage(result.message);
					}
				}
			});
		}, 5000);
	},
	_syncCustomeSize : function() {
		var me = this;
		window.setInterval(function() {
			me.allowSyncCustomeSize && boot.ajax({
				url : me.ctmSizeUrl,
				context : me,
				success : function(result) {
					this.queueEl.html("当前排队客户：<font>" + result + "</font>人");
					this.queueEl.show();
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
					this.allowSyncCustomeSize = false;
				} else {
					this.allowSyncCustomeSize = true;
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
					this.allowSyncCustomeSize = false;// 禁止自动获取客户数量
					this.queueEl.hide();// 隐藏客户数量
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
		this._on(this.el, '.disconnect', 'click', this._disconnectButtonClick);
	},
	_disconnectButtonClick : function() {
		boot.ajax({
			url : this.disconnectUrl,
			context : this,
			data : {
				"entityBean.type" : this.asService ? 1 : 0
			},
			success : function(result) {
				this.viewEl.empty();// 清屏
				if (result.success) {
					this.allowSync = false;// 允许自动同步客户聊天记录
					this.allowSyncCustomeSize = false;// 允许自动获取客户数量
					this.queueEl.show();
					this.asService && this.customeButtonEl.show();
				} else {
					this.asService && this.customeButtonEl.hide();
				}
				this._sendSystemMessage(result.message, boot.formatDate('yyyy-mm-dd hh:mi:ss', new Date()));
			}
		});
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
			str : [ "syncUrl", "sendUrl", "autoCustomeUrl", "testUrl", "disconnectUrl", "ctmSizeUrl" ],
			number : [],
			bool : [ "asService" ],
			css : [],
			fn : []
		}, attributes);
		return boot.Chatting.superClass._getAttrs.call(this, attrs);
	}
});

boot.Register(boot.Chatting, 'chatting');

/** ---------------kindEditor----------------* */
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
	},
	uiCls : 'boot-richtext',
	_create : function() {
		var container = jQuery("<div id=\"" + this.id + "\" class=\"boot-textbox boot-richtext\"></div>");
		var borderHTML = '<span class="textbox-border richtext-border" style="display: block;position: relative;padding: 0';
		if (this.showBorder === false) {
			borderHTML += 'border: none;';
		}
		borderHTML += '"></span>';
		var border = jQuery(borderHTML);
		var emptyEl = jQuery(
				'<label style="' + (this.value && this.value != '' ? 'display: none;' : '') + 'position: absolute;top: 0;left :2px;color: gray;cursor: text;">' + this.emptyText
						+ '</label>').appendTo(border);
		var richtext = jQuery(
				'<textArea name="' + this.name + '" id="' + this.id + '$text" class="richtext-text textbox-text" style="width: 100%;height: ' + (this.height - 2) + 'px;">'
						+ this.value + '</textArea>').appendTo(border.appendTo(container));
		var errorEl = jQuery('<span class="error" title="' + (this.errorText || '') + '" style="color: red;"></span>');
		errorEl.appendTo(container);
		this.errorEl = errorEl;

		this.el.after(container);// 插入新创建的元素
		this.el.remove();// 移除旧的元素
		this.el = container;
		this.borderEl = border;
		this.emptyEl = emptyEl;

		var self = this;
		KindEditor.ready(function(K) {
			self.editor = K.create('#' + self.id + '\\$text', {
				resizeType : self.allowResize ? 1 : 0,
				minWidth : (self.width - 2),
				readonlyMode : self.onlyView || self.readonly,
				items : self.items
						|| [ 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline', 'removeformat', '|', 'justifyleft', 'justifycenter',
								'justifyright', 'insertorderedlist', 'insertunorderedlist', '|', 'fullscreen' ],
				onValueChange : function(e) {
					self._onTextChange(e);
				}
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
	_onTextChange : function(e) {
		this.value = this.editor.html();
		this._validate();
		e.value = this.value;
		this._fire('onchange', e);
	},
	_setAllowEdit : function(flag) {
		this.allowEdit = flag;
		if (flag)
			this.editor.readonly(true);
		else
			this.editor.readonly(false);
	},
	_setEnabled : function(flag) {
		this.enabled = flag;
		if (flag)
			this.editor.readonly(false);
		else
			this.editor.readonly(true);
	},
	_setOnlyView : function(onlyView) {
		this.onlyView = onlyView;
		if (onlyView) {
			jQuery(".ke-toolbar,.ke-statusbar", this.el).hide();
			this.editor.readonly(onlyView);
			this.el.addClass("_onlyView");
		} else {
			jQuery(".ke-toolbar,.ke-statusbar", this.el).show();
			this.editor.readonly(onlyView);
			this.el.removeClass("_onlyView");
		}
	},
// _validate : function() {
// var v = new boot.Validate();
// v.setRequired(this.required);
// v.setValue(this._getText());
// v.setVType(this.vType);
// v.setErrorText(this.errorText);
// var result = v.execute();
// if (!result) {
// this.el.removeClass("error");
// } else {
// this.el.addClass('error');
// }
//
// this.errorEl.css('width', "auto");
// this.errorEl.prop('title', result);
// this.errorEl.html(result);
// this.errorEl.css('position', "relative");
// this.errorEl.css('background', "none");
//
// this.validateValue = !result;
// return this.validateValue;
// },
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
	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [],
			bool : [ 'allowResize', 'readonly' ],
			json : [ 'items' ],
			fn : []
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
	getValue : function() {
		return this.getHtml();
	},
	setValue : function(value) {
		this.setHtml(value);
	}
});

boot.Register(boot.RichText, 'richtext');

/** ---------------------------------------* */
jQuery(function() {
	boot.parse();
});