/**
 * @author 田鑫龙
 */
//表单类
boot.DataForm = function(id){
  boot.DataForm.superClass.constructor.call(this, id);  
  this.currentAction = null;
  this._getFields();
  if(this.results){
      this._setData(this.results);
  }
};

boot.extend(boot.DataForm, boot.Rooter, {
    uiCls: "boot-dataform",
    type: "form",
    _initField: function(){
        this.validateValue = true;
        this.idField = this.idField || "id";
        this.parameters = this.parameters || {};
        this.prefix = this.prefix || "entityBean";
        this.queryMethod  = this.queryMethod || "queryDetail.action";
        this.createMethod = this.createMethod || "create.action";
        this.saveMethod = this.saveMethod || "save.action";
        this.updateMethod = this.updateMethod || "update.action";
    },
    _create: function(){
        this.el.attr("id", this.id);
        this.modal = new boot.Modal(this.el);
        this.modal._setCss({'position': 'fixed', top: 0, left: 0, right: 0, bottom: 0});
        this.modal._hideLoadingText();
        this.el.css("visibility", 'visible');
    },
    _getFields: function(){
        boot.parseByParent(this.el);
        boot.findChildComponents.call(this);
    },
    _validate: function(){//TODO 验证
    	this.validateValue = true;
        var rs = boot.relationship[this._uuid];
        for(var i=0,len=rs.length;i<len;i++){
            var ctl = rs[i];
            if(ctl && ctl.type == 'button' || ctl.type == 'datagrid'){
                continue;
            }
            if(ctl && ctl._validate){
                this.validateValue = ctl._validate() && this.validateValue;
            }
        }
        return this.validateValue;
    },
    _getData: function(addPrefix){
        var result = {};
        var rs = boot.relationship[this._uuid];
        for(var i=0,len=rs.length;i<len;i++){
            var ctl = rs[i];
            if(ctl && ctl.type == 'button' || ctl.type == 'datagrid'){
                continue;
            }
            if(ctl && ctl.type == 'fileupload'){
            	this.files = this.files || [];
            	this.files.push(ctl);
            	result[ctl.pathField] = ctl.getPath();
            }
            if(ctl && ctl.getValue){
            	result[ctl.name] = ctl.getValue();
            }
            if(ctl && ctl._validate){
                var v = ctl._validate();
                this.validateValue = this.validateValue && v;
            }
        }
        if(addPrefix){
            result = boot.addPrefix(result, this.prefix);
        }
        //删除带下划线的字段
        for(var key in result){
        	if(/_/.test(key)){
        		if(key != '_status'){
        			delete key;
        		}
        	}
        	if(key == 'undefined'){
        		delete result[key];
        	}
        }
        return result;
    },
    _setData: function(data){
        var rs = boot.relationship[this._uuid];
        for(var i=0,len=rs.length;i<len;i++){
            var ctl = rs[i];
            if(ctl._setValue){
                var value = data[ctl.name];
				if(ctl.type == 'popupedit'){
					value = data[ctl.valueField];
				}
                if(value !== undefined){
                    ctl._setValue(value);
                }
            }
            if(ctl._setText){
                var text = data[ctl.textField];
                if(text !== undefined){
                    ctl._setText(text);
                }
            }
            if(ctl.type === 'fileupload'){
            	var path = data[ctl.pathField];
            	if(path !== undefined){
            		ctl._setPath(path);
            	}
            }
        }
    },
    _queryMethod: function(options){
        this.currentAction = "query";
        this._load(options);
    },
    _createMethod: function(options){
        this.currentAction = "create";
        this._load(options);
    },
    _saveMethod: function(options){
        this.currentAction = "save";
        this._load(options);
    },
    _submit: function(){
        this._load({
            data: this._getData()
        });
    },
    _load: function(url){
        var options = {
            url: (this.action ? (this.action + '_' + this[this.currentAction + 'Method']) : this.url),
            data: this.parameters,
            success: this._loadSuccess,
            context: this
        };
        //提交前获取数据
        if(this.currentAction == "save" || this.currentAction == "update"){
            var bind = boot.getBinding(this.id, this.binding);
            if(bind){
                options.data = bind._getSubmitData();
            }else{
                this._validate();
            }
        }
        //验证
        if(!this.validateValue){
            boot.showTip('数据验证不通过!');
            return false;
        }
        if(jQuery.type(url) === "string"){
            options.url = url;
        }else{
            url = url || {};
            url.data = boot.addPrefix(url.data || {}, this.prefix);
            boot.concat(options, url);
        }
        options.url = options.url || this.url;
        
        if(options.url){
        	this.modal._show();
        	boot.ajax(options);
        }
    },
    _loadSuccess: function(result){
    	var allowRefresh = false;
        if(result.success){
        	result.resultData && this._setData(result.resultData);
            if(this.currentAction == 'query'){
                if(this.binding){
                    var bind = boot.getBinding(this.id, this.binding);
                    if(bind){
                        bind._load({parentId: result.resultData[this.idField]});
                    }
                }
            }else{
            	allowRefresh = true;
            }
            this._fire('onloadsuccess', {result: result, sender: this, allowRefresh: true});
        }
        if(this.currentAction == "save" || this.currentAction == "update"){
        	var me  = this;
        	this._uploadFile(function(sender){
                boot.showTip(result.message, function(){
                	this.modal._hide();
                	window.closeWindow && window.closeWindow();
                }, sender);
        	});
        }
        if(this.currentAction == "save" || this.currentAction == "query"){
        	this.modal._hide();
            this.currentAction = "update";
        }
        if(this.currentAction == "create"){
        	this.modal._hide();
            this.currentAction = "save";
        }
    },
    _uploadFile: function(callback){
    	var me  = this;
    	//每次保存成功校验上传文件
    	if(this.files){
    		for(var i = 0,len = this.files.length;i < len;i ++){
    			var file = this.files[i];
    			file.upload();//开始上传
    		}
    		var checkFinished = window.setInterval(function(){
    			var finished = false;
    			for(var i = 0,len = me.files.length;i < len;i ++){
        			var file = me.files[i];
        			if(file.finished){
        				finished = file.finished;
        			}else{
        				finished = file.finished;
        				break;
        			}
        		}
    			if(finished){
    				window.clearInterval(checkFinished);
    				callback && callback(me);
    			}
    		}, 200);
    	}else{
    		callback && callback(this);
    	}
    },
    _setPrefix: function(prefix){
        this.prefix = prefix;
    },
    _setParameters: function(data, prefix){
        this.parameters = boot.addPrefix(data, prefix || this.prefix);
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
    _destroy: function(){
    	boot.DataForm.superClass._destroy.call(this);
    	var rs = boot.relationship[this._uuid];
        for(var i=0,len=rs.length;i<len;i++){
            rs[i]._destroy();
        }
    	this.el.remove();
    },
    _getAttrs: function(attributes){
        var attrs = boot.concat({
            str: ["id", "prefix", "action", "queryMethod", "updateMethod",
            "createMethod", "saveMethod", "viewPage", "editPage", "binding", "idField"],
            bool: [],
            json: ["parameters", "results"],
            fn: []
        }, attributes || {});
        return boot.DataForm.superClass._getAttrs.call(this, attrs);
    },
    
    
    //API
    setPrefix: function(prefix){
        this._setPrefix(prefix);
    },
    getData: function(){
        return this._getData();
    },
    setData: function(data){
        this._setData(data);
    },
    query: function(options){
        this._queryMethod(options);
    },
    create: function(options){
        this._createMethod(options);
    },
    save: function(options){
        this._saveMethod(options);
    },
    setParameters: function(data, prefix){
        this._setParameters(data, prefix);
    },
    submit: function(){
        this._submit();
    },
    setOnlyView: function(flag){
    	this._setOnlyView(flag);
    }
});

boot.Register(boot.DataForm, "dataform");