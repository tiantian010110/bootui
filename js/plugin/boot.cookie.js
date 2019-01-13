/**
 * 田鑫龙
 */
var boot = boot || {};
boot.Cookie = function(expires, url, nameField, psdField) {
	expires && this.setExpires(expires);
	url && this.setUrl(url);
	nameField && psdField && this.setUser(nameField, psdField);
};

boot.Cookie.prototype = {
	setExpires : function(expires) {
		this.expires = expires;
	},
	setUrl : function(url) {
		this.url = url;
	},
	setUser : function(nameField, psdField, rememberField) {
		this.nameField = nameField;
		this.psdField = psdField;
		this.rememberField = rememberField;
		this.username = document.getElementsByName(nameField)[0];
		this.password = document.getElementsByName(psdField)[0];
		this.checkbox = document.getElementById(rememberField);
	},
	setCookie : function() {
		var name = escape(this.username.value);
		var password = escape(this.password.value);
		var expires = new Date();
		expires.setTime(expires.getTime() + this.expires * 1000 * 60 * 60 * 24);
		url = this.url == "" ? "" : ";path=" + this.url;
		_expires = (typeof expires) == "string" ? "" : ";expires="
				+ expires.toUTCString();
		document.cookie = this.nameField + "=" + name + ',' + this.psdField + '=' + password + _expires + url;
	},
	getCookie : function() {
		var username = escape(this.nameField);
		// 读cookie属性，这将返回文档的所有cookie
		var allcookies = document.cookie;
		// 查找名为name的cookie的开始位置
		name += "=";
		var start = allcookies.indexOf(username);
		// 如果找到了具有该名字的cookie，那么提取并使用它的值
		if (start != -1) { // 如果pos值为-1则说明搜索"version="失败
			var end = allcookies.indexOf(";", start); // 从cookie值开始的位置起搜索第一个";"的位置,即cookie值结尾的位置
			if (end == -1)
				end = allcookies.length; // 如果end值为-1说明cookie列表里只有一个cookie
			var cookie = allcookies.substring(start, end); // 提取cookie的值
			return unescape(cookie); // 对它解码
		} else
			return ""; // 搜索失败，返回空字符串
	},
	removeCookie : function() {
		var username = escape(this.nameField);
		var expires = new Date(0);
		url = this.url == "" ? "" : ";path=" + this.url;
		document.cookie = username + "=" + ";expires=" + expires.toUTCString()
				+ url;
	},
	autoSetUser: function(){
		var cookie = this.getCookie();
		if(cookie != ''){
			var cs = cookie.split(",");
			for(var i = 0;i<cs.length;i++){
				var kv = cs[i];
				var item = kv.split("=");
				document.getElementsByName(item[0])[0].value = item[1];
			}
			this.checkbox.checked = true;
		}
	},
	execute: function(){
		this.autoSetUser();
	}
};