/**
 * @author 田鑫龙
 */
boot.Pager = function(id){
    boot.Pager.superClass.constructor.call(this, id);
};

boot.extend(boot.Pager, boot.Rooter, {
    uiCls: "boot-pager",
    type: "pager",
    _initField: function(){
        this.pageSizeEl = boot.newId();
        this.pageIndexEl = boot.newId();
        this.totalPageEl = boot.newId();
        this.infoEl = boot.newId();
        this.pageIndex = this.pageIndex || 1;
        this.historyIndex = this.pageIndex;
        this.sizeList = this.sizeList || [10, 15, 20, 50, 100, 1000];
        this.pageSize = this.pageSize || this.sizeList[0];
        this.total = this.total || 0;
        this.totalPageSize = Math.ceil(this.total / this.pageSize);
    },
    _create: function(parent){
            var html = [];
            html.push('<div class="pager-border" style="height: 100%;">');
            html.push('<table cellspacing="0" cellpadding="0" border="0" style="width: 100%;height: 100%;font-size: 12px;text-align: center;">');
            html.push('<tr>');
			html.push('<td style="width: 60px;"><span id="'+ this.pageSizeEl +'" value="'+ this.pageSize +'" class="boot-combobox" width="60" height="18" showClear="false" showEmpty="false"></span></td>');
			html.push('<td style="padding: 1px;width: 1px;"><span class="separator"></span></td>');
			html.push('<td style="width: 24px;"><a class="pager-button" href="javascript: void(0);"><span class="icon pager-first"></span></a></td>');
			html.push('<td style="width: 24px;"><a class="pager-button" href="javascript: void(0);"><span class="icon pager-prev"></span></a></td>');
			html.push('<td style="width: 40px;"><div id="'+ this.pageIndexEl +'" type="text" class="boot-textbox" width="40" height="18" value="1"></div></td>');
			html.push('<td style="width: 50px;text-align: left;"><span id="'+ this.totalPageEl +'" class="total">/ 1</span></td>');
			html.push('<td style="width: 24px;"><a class="pager-button" href="javascript: void(0);"><span class="icon pager-next"></span></a></td>');
			html.push('<td style="width: 24px;"><a class="pager-button" href="javascript: void(0);"><span class="icon pager-last"></span></a></td>');
			html.push('<td style="padding: 1px;width: 1px;"><span class="separator"></span></td>');
			html.push('<td style="width: 24px;"><a class="pager-button" href="javascript: void(0);"><span class="icon pager-reload"></span></a></td>');
			html.push('<td id="'+ this.infoEl +'" style="padding-right: 10px;text-align: right;"></td>');
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
    },
    _setSizeList: function(list){
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
    _setPageSize: function(size){
        if(this.pageSizeEl){
            this.pageSizeEl.setValue(size || this.pageSize);
            this.pageSizeEl.setText(size || this.pageSize);
        }
    },
    _setPageIndex: function(pageIndex){
    	this.pageIndex = pageIndex || 1;
    	this.pageIndexEl.setValue(pageIndex);
    },
    _updatePager: function(total){
    	this.total = total;
    	this.totalPageSize = Math.ceil(total / this.pageSize);
    	this.totalPageEl.html('/ ' + this.totalPageSize);
    	if(this.simplePager){
    		this.infoEl.html('共 ' + total + ' 条');
    	} else{
    		this.infoEl.html('每页 ' + this.pageSize + ' 条,共 ' + total + ' 条');
//    		this.infoEl.html('当前第 ' + this.pageIndex + ' 页,共 ' + this.totalPageSize + ' 页; 每页 ' + this.pageSize + ' 条,共 ' + total + ' 条');
    	}
    },
    _destroy: function(){
    	boot.Pager.superClass._destroy.call(this);
    	this.pageSizeEl._destroy();
        this.pageIndexEl._destroy();
        this.el.remove();
    },
    _bindEvents: function(){
    	this._on(this.el, ".pager-first", 'click', this._onFirstButtonClick, this);
        this._on(this.el, ".pager-prev", 'click', this._onPrevButtonClick, this);
        this._on(this.el, ".pager-next", 'click', this._onNextButtonClick, this);
        this._on(this.el, ".pager-last", 'click', this._onLastButtonClick, this);
        this._on(this.el, ".pager-reload", 'click', this._onReloadButtonClick, this);
        this.pageSizeEl.bind('change', this._onPageSizeChange, this);
        this.pageIndexEl.bind("enterpress", this._onPageIndexChange, this);
    },
    _onPageSizeChange: function(e){
    	this.pageSize = Number(e.value);
    	this.pageIndex = 1;
    	this.pageIndexEl.setValue(1);
    	e.sender = this;
    	this._fire('pagesizechange', e);
    },
    _onPageIndexChange: function(e){
    	this.pageIndex = Number(e.value);
		if(this.pageIndex >= 1 && this.pageIndex <= this.totalPageSize && this.historyIndex != this.pageIndex){
			this.historyIndex = this.pageIndex;
			e.sender = this;
			this._fire('pageskipchange', e);
		}else{
			this.pageIndex = this.historyIndex;
			e.sender.value = this.historyIndex;
			e.sender.textEl.val(this.historyIndex);
		}
	},
    _onFirstButtonClick: function(e){
		if(this.pageIndex > 1){
	    	this.pageIndex = 1;
	    	this.pageIndexEl.setValue(this.pageIndex);
	    	this.historyIndex = this.pageIndex;
	    	this._fire('pagerfirst', e);
		}
    },
	_onPrevButtonClick: function(e){
		if(this.pageIndex > 1){
			this.pageIndex -= 1;
			this.pageIndexEl.setValue(this.pageIndex);
			this.historyIndex = this.pageIndex;
	    	this._fire('pagerprevious', e);
		}
	},
	_onNextButtonClick: function(e){
		if(this.pageIndex < this.totalPageSize){
			this.pageIndex += 1;
			this.pageIndexEl.setValue(this.pageIndex);
			this.historyIndex = this.pageIndex;
	    	this._fire('pagernext', e);
		}
	},
	_onLastButtonClick: function(e){
		if(this.pageIndex < this.totalPageSize){
			this.pageIndex = this.totalPageSize;
	    	this.pageIndexEl.setValue(this.pageIndex);
	    	this.historyIndex = this.pageIndex;
	    	this._fire('pagerlast', e);
		}
	},
	_onReloadButtonClick: function(e){
		this.pageIndex = 1;
    	this.pageIndexEl.setValue(this.pageIndex);
    	this.historyIndex = this.pageIndex;
    	this._fire('pagerreload', e);
	},
    _getAttrs: function(attributes){
        var attrs = boot.concat({
            str: ["id", "style"],
            bool: ["simplePager"],
            number: ["pageIndex", "pageSize"],
            json: ["sizeList"]
        }, attributes || {});
        return boot.Pager.superClass._getAttrs.call(this, attrs);
    }
});

boot.Register(boot.Pager, "pager");
