/**
 * @author dragon
 */
boot.FileUpload = function(id) {
	this.finished = false;
	boot.FileUpload.superClass.constructor.call(this, id);
	this._setWidth();
	this._setHeight();
};

boot.extend(boot.FileUpload, boot.Rooter, {
	uiCls : "boot-fileupload",
	type : "fileupload",
	_initField : function() {
		boot.FileUpload.superClass._initField.call(this);
		this.emptyText = this.emptyText ? ('请输入' + this.emptyText) : '';
		this.width = this.width || 150;
		this.height = this.height || 22;
		this.value = this.value || "";
		this.btnName = this.btnName || '请选择...';
	},
	initUpload : function(settings) {
		this.uploader = WebUploader.create({
			pick : {
				id : this.id,
				label : this.btnName
			},
			dnd : '#uploader .queueList',
			paste : document.body,
			accept : {
				title : 'Images',
				extensions : 'gif,jpg,jpeg,bmp,png',
				mimeTypes : 'image/*'
			},
			// swf文件路径
			swf : BASE_URL + '/js/Uploader.swf',

			disableGlobalDnd : true,

			chunked : true,
			// server: 'http://webuploader.duapp.com/server/fileupload.php',
			server : 'http://2betop.net/fileupload.php',
			fileNumLimit : 300,
			fileSizeLimit : 5 * 1024 * 1024, // 200 M
			fileSingleSizeLimit : 1 * 1024 * 1024
		// 50 M
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
			"line-height" : (height || this.height) + 'px',
			height : height || this.height
		});
	},

	_getAttrs : function(attributes) {
		var attrs = boot.concat({
			str : [ "filter", "url", "name", "fileType", "pathField" ],
			bool : [ "multi", "onlyView" ],
			number : [ "width", "height" ],
			json : [ "params" ]
		}, attributes || {});
		return boot.FileUpload.superClass._getAttrs.call(this, attrs);
	},
	upload : function() {
		this._start();
		return this.uploader;
	}
});

boot.Register(boot.FileUpload, "fileupload");