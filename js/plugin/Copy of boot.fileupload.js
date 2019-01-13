boot.FileUpload = function(id){
	this.finished = true;
    boot.FileUpload.superClass.constructor.call(this, id);
    this._setWidth();
    this._setHeight();
    this._createDefalutPath();
    if(this.imagePath && this.showPicture){
    	this._setPath(this.imagePath);
    }
};

boot.extend(boot.FileUpload, boot.Rooter, {
	uiCls: "boot-fileupload",
	_initField: function(){
		boot.FileUpload.superClass._initField.call(this);
		this.multi = Boolean(this.multi);
		this.showBorder = this.showBorder = this.showBorder === false ? false : true;
		this.validateValue = true;
        this.width = pictureWidth || this.width || 150;
        this.height = pictureHeight || this.height || 22;
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
	_create: function(){
		this.el.css({
			"display" : "inline-block",
			"overflow" : "hidden",
			"position" : "relative",
			"vertical-align" : "middle;"
		});
        var borderHTML = '<div class="textbox-border" style="display: block;position: relative;padding: 0 2px;border-style: solid;border-width: 1px;';
        if(this.showBorder === false){
            borderHTML += 'border: none;';
        }
        borderHTML += '"></div>';
        this.borderEl = jQuery(borderHTML);
        this.borderEl.appendTo(this.el);
        
        var buttons = '<div class="upload-buttons" style="position: absolute;right: 1px;top: 1px;bottom: 1px;width: 53px;'+ (this.onlyView ? 'display: none;': "") +'">';
        buttons += '<a href="javascript: void(0);" class="button upload-select" style="position: absolute;left: 0;top: 0;right: 0;bottom: 0;z-index: 1;">选择</a>';
        buttons += '</div>';
        var buttons = jQuery(buttons);
        buttons.appendTo(this.borderEl);
        
        var right = this.onlyView ? 1 : (buttons.width() + 1);
        this.textEl = jQuery('<span class="textbox-text" style="right: '+ right +'px;position: absolute;left: 2px;top: 1px;bottom: 1px;font-size: 12px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis; "></span>');
        this.textEl.appendTo(this.borderEl);
        
        this.percentEl = jQuery('<div class="upload-percentage" style="position: absolute;right: 0;height: 2px;bottom: 0;left: 0;background: #FFF;"></div>');
        this.percentEl.appendTo(this.borderEl);
        
        this.selectEl = buttons.children(":eq(0)");
        this.startEl = buttons.children(":eq(1)");
        this.cancelEl = buttons.children(":eq(2)");
        
        this.imageEl = jQuery('<img alt="" src="" style="width: '+ this.pictureWidth +'px;height: '+ this.pictureHeight +'px;'+ (this.fileType == 'picture' ? 'display: inline-block;' : "display: none;") +'"/>');
        this.imageEl.prependTo(this.el);
        
        this.errorEl = jQuery('<span class="error" title="'+ (this.errorText || '') +'"></span>');
        this.errorEl.appendTo(this.el);
        
        if(this.onlyView){
        	if(this.fileType == 'picture'){
        		this.borderEl.css("display", "none");
        	}else{
        		this.borderEl.css("border-color", "transparent");
        	}
        }
    	this._initPlUpload();
        
	},
	_initPlUpload: function(){
		this.uploader = new plupload.Uploader({ //实例化一个plupload上传对象
			runtimes : 'html5,flash,silverlight,html4',
			browse_button : this.selectEl[0],
			url : this.url,
			multi_selection: this.multi,
			multipart_params: boot.concat(this.params, {"fileType": this.fileType}) ||{},
			flash_swf_url : 'bootui/js/plugin/upload/Moxie.swf',
			silverlight_xap_url : 'bootui/js/plugin/upload/Moxie.xap',
			filters: {
			  mime_types : [
	                { title : "allow files", extensions : this.filter || "jpg, png, bmp, gif" }
              ],
			  prevent_duplicates : true //不允许队列中存在重复文件
			}
		});
		this.uploader.init(); //初始化
	},
	_addParameter: function(parameter){
		boot.concat(this.uploader.multipart_params, parameter);
	},
	_createDefalutPath: function(){
		boot.ajax({
			url: this.createUrl,
			type: 'post',
			context: this,
			data: {"fileType": this.fileType},
			dataType: 'json',
			success: function(result){
				this.beforePath = result;
			}
		});
	},
    _setWidth: function(width) {
        if (!/\;*\s*width\s*:\s*/.test(this.style)) {
            this.el.css({
                width : width || this.width
            });
        }
    },
    _setHeight: function(height) {
        this.borderEl.css({
        	"line-height":  (height || this.height) + "px",
            height : height || this.height
        });
        this.selectEl.css({
        	"line-height":  (height || this.height) - 4 + "px",
            height : height || this.height - 4
        })
    },
    _resetSelectButton: function(){
    	this.selectEl.text("选择");
    },
    _stop: function(){
    	if(this.allowCancel){
    		this.allowCancel = false;
        	this.uploader.stop();
        	this._resetSelectButton();
        	this.percentEl.empty();
    	}
    },
    _start: function(){
    	if(this.allowStart){
    		this.allowStart = false;
    		this.uploader.start();
    	}
    },
    _getPath: function(){
    	return this.path;
    },
    _setPath: function(path){
    	this.path = path;
    	if(this.fileType == "picture"){
    		this.imageEl.attr("src", this.path);
    	}
    	this.fileUUID = path.replace(/.+\\/g, '').replace(/.+\//g, '').replace(/\.\w+/ig, '');
    	if(this.onlyView){
    		if(this.fileType !== "picture"){
    			var a = this.textEl.children(":eq(0)");
    			if(a && a[0]){
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
        if(!result){
            this.el.removeClass("error");
        }else{
            this.el.addClass('error');
        }
        this.errorEl.prop('title', result);
        this.validateValue = !result;
        return this.validateValue;
    },
    _setValue: function(value){
    	if(this.onlyView){
    		this.textEl.html('<a target="_blank" href="'+ this.path +'">'+ value +'</a>');
    	}else
    		this.textEl.html(value);
    	this.value = value;
    },
    _previewImage: function(file, callback){//file为plupload事件监听函数参数中的file对象,callback为预览图片准备完成的回调函数
		if(!file || !/image\//.test(file.type)) return; //确保文件是图片
		if(file.type=='image/gif'){//gif使用FileReader进行预览,因为mOxie.Image只支持jpg和png
			var fr = new mOxie.FileReader();
			fr.onload = function(){
				callback && callback(fr.result);
				fr.destroy();
				fr = null;
			}
			fr.readAsDataURL(file.getSource());
		}else{
			var preloader = new mOxie.Image();
			preloader.onload = function() {
				preloader.downsize( this.pictureWidth || this.width, this.pictureHeight || this.width );//先压缩一下要预览的图片,宽300，高300
				var imgsrc = preloader.type=='image/jpeg' ? preloader.getAsDataURL('image/jpeg',80) : preloader.getAsDataURL(); //得到图片src,实质为一个base64编码的数据
				callback && callback(imgsrc); //callback传入的参数为预览图片的url
				preloader.destroy();
				preloader = null;
			};
			preloader.load( file.getSource() );
		}	
	},
    _bindEvents: function(){
    	this._on(this.el, '.upload-start', 'click', this._onStartButtonClick, this);
    	this._on(this.el, '.upload-cancel', 'click', this._onCancelButtonClick, this);
//		this.imageEl.on('error', function() {
//			if (this.src != '')
//				this.src = '';
//			else
//				$(this).off('error');
//		});
    	
    	//绑定文件添加进队列事件
		this.uploader.bind('FilesAdded',this._onFileAdded, this);
		//绑定文件上传进度事件
		this.uploader.bind('UploadProgress', this._onUploadProgress, this);
		//绑定文件上传完成事件
		this.uploader.bind('UploadComplete', this._onUploadComplete, this);
		//绑定文件上传完成事件
		this.uploader.bind('FileUploaded', this._onFileUploaded, this);
    },
    _onStartButtonClick: function(e){
    	this._start();
    },
    _onCancelButtonClick: function(e){
    	this._stop();
    },
    _onFileAdded: function(uploader, files){
    	for(var i = 0, len = files.length; i<len; i++){
    		var file = files[0];
    		var name = file.name;
    		this.textEl.html(name);
    		this.textEl.attr("title", name);
    		this.value = name;
    		if(this.path == ""){
	    		this.path = this.beforePath + "." + name.replace(/.+\./, '');
	    		this.fileUUID = this.beforePath.replace(/.+\\/g, '').replace(/.+\//g, '').replace(/\.\w+/ig, '');
    		}else{
    			this.path = this.path.replace(/\.\w+/ig, '') + "." + name.replace(/.+\./, '');
    		}
    		this.uploader.settings.multipart_params['fakeName'] = this.fileUUID + "." + name.replace(/.+\./, '');
//    		uploader.disableBrowse();
    		this.allowCancel = this.allowStart = true;
    		this.finished = false;
    		
    		if(this.fileType == 'picture'){
    			var me = this;
				this._previewImage(files[i], function(imgsrc){
					me.imageEl.attr("src", imgsrc);
				});
    		}
		}
    	
    	this._validate();
    },
    _onUploadComplete: function(uploader, files){
    	var nameArray = [];
    	for(var i = 0, len = files.length; i<len; i++){
    		nameArray.push(files[i].name);
    	}
    	this.value = nameArray.join(",");
    	uploader.disableBrowse(false);
    	this._resetSelectButton();
    	this.allowCancel = this.allowStart = false;
    	this.finished = true;
    },
    _onUploadProgress:  function(uploader, file){
    	this.selectEl.text(file.percent + "%");
    	this.percentEl.html('<div style="height: 100%;width: '+ (file.percent * 0.01 * this.width) +'px;background-color: #A5DF16;"></div>');
    },
    _onFileUploaded:  function(uploader, file, response){
    	var res = eval("(" + response.response + ")");
    	if(this.fileType === 'picture'){
    		this.imageEl.attr("src", res.filePath);
    	}
    },
	_getAttrs: function(attributes){
        var attrs = boot.concat({
            str: ["filter", "action", "name", "fileType", "pathField", "imagePath"],
            bool: ["multi", "onlyView", "showPicture", "required"], 
            number: ["width", "pictureWidth", "pictureHeight", "height"],
            json: ["params"]
        }, attributes || {});
        return boot.FileUpload.superClass._getAttrs.call(this, attrs);
    },
    upload: function(){
    	this._start();
    	return this.uploader;
    },
    getPath: function(){
    	return this._getPath();
    },
    getValue: function(){
    	return this.value;
    },
    setValue: function(value){
    	this._setValue(value);
    }
});

boot.Register(boot.FileUpload, "fileupload");