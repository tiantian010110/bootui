/**
 * @author dragon
 */
boot.SingleUpload = function(id){
	this.finished = false;
    boot.SingleUpload.superClass.constructor.call(this, id);
    this._instanceUpload();
};

boot.extend(boot.SingleUpload, boot.FileUpload, {
	uiCls: "boot-singleupload",
	_initField: function(){
		boot.SingleUpload.superClass._initField.call(this);
		this.emptyText = this.emptyText ? ('请输入' + this.emptyText) : '';
        this.width = this.width || 150;
        this.height = this.height || 22;
        this.value = this.value || "";
	},
	_create: function(){
        var borderHTML = '<span class="textbox-border" style="display: block;position: relative;padding: 0 22px 0 2px;';
        if(this.showBorder === false){
            borderHTML += 'border: none;';
        }
        borderHTML += '"></span>';
        var border = jQuery(borderHTML);
        var emptyEl = jQuery('<label style="' + (this.value && this.value != '' ? 'display: none;' : '') + 'position: absolute;top: 0;left :2px;color: gray;cursor: text;">' + this.emptyText + '</label>').appendTo(border);
        var input = jQuery("<input>", {
            name : this.name,
            id : this.id + '$text',
            type : "text",
            readonly : this.allowEdit === false ? true : false,
            disabled : this.enabled === false ? true : false,
            "class" : "textbox-text",
            value : this.value
        }).appendTo(border.appendTo(this.el));
        
        var errorEl = jQuery('<span class="error" title="'+ (this.errorText || '') +'"></span>');
        errorEl.appendTo(this.el);
        this.errorEl = errorEl;

        this.textEl = input;
        this.borderEl = border;
        this.emptyEl = emptyEl;
        
        this.buttonEl = jQuery('<span class="popupedit-button-border"><span class="popupedit-button-icon popupedit-button-icon-hover"><span id="'+ boot.newId() +'"></span></span></span>');
        this.borderEl.append(this.buttonEl);
        this.textEl.attr("readonly", true);
        this.el.addClass('boot-textbox boot-textbox boot-popupedit')
        
        if(this.onlyView){
        	this.textEl.prop("disabled", true);
        	this.borderEl.css("border-color", "transparent");
        }
	},
	_instanceUpload: function(){
		var settings = {
				upload_url : "http://www.swfupload.org/upload.php",
	            flash_url : "http://localhost:8080/myui/bootui/js/plugin/upload/upload.swf",
	            file_post_name : "Filedata",
	            post_params : {
		           "post_param_name_1" : "post_param_value_1",
		           "post_param_name_2" : "post_param_value_2",
		           "post_param_name_n" : "post_param_value_n"
	            },
	            use_query_string : false,
	            requeue_on_error : false,
	            http_success : [201, 202],
	            assume_success_timeout : 0,
	            file_types : "*.jpg;*.gif",
	            file_types_description: "Web Image Files",
	            file_size_limit : "1024",
	            file_upload_limit : 10,
	            file_queue_limit : 2,
	 
	            debug : false,
	     
	            prevent_swf_caching : false,
	            preserve_relative_urls : false,
	     
	            button_placeholder_id : this.buttonEl.children().children().attr("id"),
	            button_image_url : "",
	            button_width : 20,
	            button_height : 20,
	            button_text : '',
	            button_text_style : "",
	            button_text_left_padding : 0,
	            button_text_top_padding : 0,
	            button_disabled : false,
	     
	            swfupload_loaded_handler : this._swfLoaded,
	            file_dialog_start_handler : this._onBeforeOpenDialog,
	            file_queued_handler : this._onAddQueued,
	            file_queue_error_handler : this._onAddQueueError,
	            file_dialog_complete_handler : this._onFileAdded,
	            upload_start_handler : this._onUpload,
	            upload_progress_handler : this._onUploadProgress,
	            upload_error_handler : this._onUploadError,
	            upload_success_handler : this._onUploadSuccess,
	            upload_complete_handler : this._onUploadComplete
		};
		this.initUpload(settings);
	},
    _bindEvents: function(){
    	this._on(this.el, '.upload-start', 'click', this._onStartButtonClick, this);
    	this._on(this.el, '.upload-cancel', 'click', this._onCancelButtonClick, this);
    	
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
    _swfLoaded: function(){
    	console.log("_swfLoaded")
    },
    
    _onUpload: function(file){
    	console.log("_onUpload")
    },
    _onUploadError: function(uploader, files){
    	console.log("_onUploadError")
    },
    
    _onBeforeOpenDialog: function(){
    	console.log("_onBeforeOpenDialog")
    },
    _onFileAdded: function(fileCount, queueCount, totalCount){
    	console.log("_onFileAdded")
    },
    
    _onAddQueued: function(file){
    	console.log("_onAddQueued", this)
    	this.sender.textEl.val(file.name);
    },
    _onAddQueueError: function(file, code, message){
    	console.log("_onAddQueueError")
    },
    
    _onUploadSuccess: function(file, result, response){
    	console.log("_onUploadSuccess")
    },
    _onUploadComplete: function(file){
    	console.log("_onUploadComplete")
    },
    _onUploadProgress:  function(file, bytes, total){
    	console.log("_onUploadProgress")
    },
	_getAttrs: function(attributes){
        var attrs = boot.concat({
        	str : ["name", "value", "style", "emptyText", "vType", "errorText"],
            number : ["width", "height", "maxLength", "minLength"],
            bool : ["allowEdit", "enabled", "required", "showBorder", "onlyView"],
            json : [],
            fn : ["onchange", "onblur"]
        }, attributes || {});
        return boot.SingleUpload.superClass._getAttrs.call(this, attrs);
    },
    upload: function(){
    	this._start();
    	return this.uploader;
    }
});

boot.Register(boot.SingleUpload, "singleupload");