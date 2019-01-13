/**
 * @author 田鑫龙
 */
boot.Validate = function() {
    this.numberErrorText = "不是正确的数字!";
    this.emailErrorText = "不是正确的邮件地址!";
    this.urlErrorText = "不是正确的网址!";
    this.mobileErrorText = "不是正确的手机号!";
    this.phoneErrorText = "不是正确的座机号!";
};

boot.Validate.prototype = {
    _isEmail: function() {
        if (this._isNull() || this._isEmpty())
            return true;
        return !/^([a-zA-Z0-9_])+([a-zA-Z0-9_\.\-])*\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(this.value);
    },
    _isUrl: function(v, args) {
        if (this._isNull() || this._isEmpty())
            return true;
        var value = this.value.toLowerCase().split("?")[0];
        var strRegex = "^((https|http|ftp|rtsp|mms)?:\/\/)" + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + "(([0-9]{1,3}\.){3}[0-9]{1,3}" + "|" + "([0-9a-z_!~*'()-]+\.)*" + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." + "[a-z]{2,6})" + "(:[0-9]{1,5})?" + "((/?)|" + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
        var re = new RegExp(strRegex);
        return !re.test(value);
    },
    _isNull: function() {
        return this.value === null || this.value === undefined;
    },
    _isEmpty: function(){
        return String(this.value).replace(/(^\s*)|(\s*$)/g, "") === '';
    },
    _isNumber: function() {
        return !isNaN(this.value) && typeof this.value == 'number';
    },
    _isMobile: function() {
        return !/^1\d{10}$/.test(this.value);
    },
    _isPhone: function() {
        return !/^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/.test(this.value);
    },
    _isLess: function(value){
    	var result = Number(this.value) < Number(value);
    	if(!result){
    		this.lessErrorText = "当前数值不应大于" + Number(value) + ", 请重新输入!";
    	}
    	return !result;
    },
    _isGreat: function(value){
    	var result = Number(this.value) > Number(value);
    	if(!result){
    		this.lessErrorText = "当前数值不应小于" + Number(value) + ", 请重新输入!";
    	}
    	return !result;
    },
    _isMobile: function() {
        return !/^1\d{10}$/.test(this.value);
    },
    _isPhone: function() {
        return !/^(([0\+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/.test(this.value);
    },
    _isLength: function(info) {//TODO
    	var infos = info.split("-");
    	var max = Number(infos[1] || infos[0]);
    	var min = Number(infos[0] == max ? 0 : infos[0]);
    	if(this.value.length <= max && this.value.length >= min){
    		return false;
    	}else{
    		this.lengthErrorText = "文本长度必须在" + min + "到" + max + "之间!";
    		return true;
    	}
    },
    _isRange: function(info) {//TODO
    	var infos = info.split("-");
    	var max = Number(infos[1] || infos[0]);
    	var min = Number(infos[0] == max ? 0 : infos[0]);
    	if(Number(this.value) <= max && Number(this.value) >= min){
    		return false;
    	}else{
    		this.rangeErrorText = "数值大小必须在" + min + "到" + max + "之间!";
    		return true;
    	}
    },
    _isIdentify: function(){
    	/*
    	根据〖中华人民共和国国家标准 GB 11643-1999〗中有关公民身份号码的规定，公民身份号码是特征组合码，由十七位数字本体码和一位数字校验码组成。排列顺序从左至右依次为：六位数字地址码，八位数字出生日期码，三位数字顺序码和一位数字校验码。
    	    地址码表示编码对象常住户口所在县(市、旗、区)的行政区划代码。
    	    出生日期码表示编码对象出生的年、月、日，其中年份用四位数字表示，年、月、日之间不用分隔符。
    	    顺序码表示同一地址码所标识的区域范围内，对同年、月、日出生的人员编定的顺序号。顺序码的奇数分给男性，偶数分给女性。
    	    校验码是根据前面十七位数字码，按照ISO 7064:1983.MOD 11-2校验码计算出来的检验码。

    	出生日期计算方法。
    	    15位的身份证编码首先把出生年扩展为4位，简单的就是增加一个19或18,这样就包含了所有1800-1999年出生的人;
    	    2000年后出生的肯定都是18位的了没有这个烦恼，至于1800年前出生的,那啥那时应该还没身份证号这个东东，⊙﹏⊙b汗...
    	下面是正则表达式:
    	 出生日期1800-2099  (18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])
    	 身份证正则表达式 /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i            
    	 15位校验规则 6位地址编码+6位出生日期+3位顺序号
    	 18位校验规则 6位地址编码+8位出生日期+3位顺序号+1位校验位
    	 
    	 校验位规则     公式:∑(ai×Wi)(mod 11)……………………………………(1)
    	                公式(1)中： 
    	                i----表示号码字符从由至左包括校验码在内的位置序号； 
    	                ai----表示第i位置上的号码字符值； 
    	                Wi----示第i位置上的加权因子，其数值依据公式Wi=2^(n-1）(mod 11)计算得出。
    	                i 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1
    	                Wi 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2 1

    	*/
    	//身份证号合法性验证 
    	//支持15位和18位身份证号
    	//支持地址编码、出生日期、校验位验证
    	
    	var code = this.value;
    	var city={11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外 "};
        var tip = "";
        
        if (!code || !/^[1-9][0-9]{5}(19[0-9]{2}|20[0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[0-9]{3}[0-9xX]$/i.test(code)) {
        	this.identifyErrorText = "身份证号格式错误";
            return true;
        }
        
       else if(!city[code.substr(0,2)]){
    	   this.identifyErrorText = "地址编码错误";
    	   return true;
        }
        else{
            //18位身份证需要验证最后一位校验位
            if(code.length == 18){
                code = code.split('');
                //∑(ai×Wi)(mod 11)
                //加权因子
                var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
                //校验位
                var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for (var i = 0; i < 17; i++)
                {
                    ai = code[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if(last.toLowerCase() != code[17].toLowerCase()){
                	this.identifyErrorText = "校验位错误";
                	return true;
                }
            }
        }
    },
    getVFunction: function(vType){//TODO
        if(vType != undefined || vType != ''){
            var _char = vType.charAt(0);
            _char = _char.toUpperCase();
            vType = vType.replace(/^\w/i, _char);
        }
        return '_is' + vType;
    },
    setVType: function(vType) {
    	if(vType != undefined){
    		var vTypes = vType.split(",");
    		for(var i=0,len=vTypes.length;i<len;i++){
    			var vType = vTypes[i];
    			var vTypeArray = vType.split(":");
    			if(vTypeArray.length > 1){
    				vTypes[i] = {
    						type: vTypeArray[0],
    						value: vTypeArray[1]
    				};
    			}else{
    				vTypes[i] = {type: vTypeArray[0]};
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
        if(this.vType != undefined && this.vType != '')
        	for(var i=0,len=this.vType.length;i<len;i++){
        		var item = this.vType[i];
	            if (this.value != undefined) {
	                if (this[this.getVFunction(item.type)](item.value))
	                    return this.errorText || this[item.type + 'ErrorText'];
	            }
        	}
        return "";
    }
};