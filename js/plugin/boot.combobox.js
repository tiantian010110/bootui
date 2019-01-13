/**
 * @author 田鑫龙
 */
//下拉框
boot.ComboBox = function(id){
    this.data = [];
    boot.ComboBox.superClass.constructor.call(this, id);
};

boot.extend(boot.ComboBox, boot.PopupEdit, {
    uiCls: 'boot-combobox',
    type: "combobox",
    _initField: function(){
		//跨过popupedit，直接继承textbox
		boot.ComboBox.superClass.constructor.superClass._initField.call(this);
		this.popupHeight = this.popupHeight || 240;
		this.popupWidth = this.popupWidth;
		this.showEmpty = this.showEmpty === false ? false : true;
		this.idField = this.idField || "id";
		this.parentidField = this.parentidField || 'parentid';
		this.childrenField = this.childrenField || 'children';
		this.textField = this.textField || 'name';
		this.valueField = this.valueField || 'id';
		this.autoLoad = this.autoLoad === false ? false : true;
    },
    _create: function(){
    	if(this.asGrid){
    		this.columnEls = this.el.html();
    		this.el.empty();
    	}
        boot.ComboBox.superClass._create.call(this);
        this.el.css('overflow', 'initial');
        if(this.allowFilter){
        	this.textEl.attr("readonly", false);
        }
        this._createListBox();
    },
    _createListBox: function(){
        var id = this._uuid +'$box';
        this.popupWidth = (this.popupWidth || this.el.width());
        var html = '<div id="'+ id +'" value="'+ this.value +'" textField="'+ this.textField +'" valueField="'+ this.valueField +'" ';
        html += 'idField="'+ this.idField +'" parentidField="'+ this.parentidField +'" childrenField="'+ this.childrenField +'" ';
        if(this.asTree){//树形下拉框
        	html += 'class="boot-treebox" ';
        	if(this.showCheckBox){
        		html += 'showCheckBox="'+ this.showCheckBox +'" ';
        	}
        	if(this.onlyLeaf){
        		html += 'onlyLeaf="'+ this.onlyLeaf +'" ';
        	}
        	this.popupWidth = this.popupWidth < 220 ? 220 : this.popupWidth;
        } if(this.asGrid){//表格下拉框
        	html += 'class="boot-gridbox" simplePager="true" ';
        	if(this.showCheckBox){
        		html += 'showCheckBox="'+ this.showCheckBox +'" ';
        	}
        	if(this.showPager){
        		html += 'showPager="'+ this.showPager +'" ';
        	}
        	this.popupWidth = this.popupWidth < 500 ? 500 : this.popupWidth;
        	this.popupHeight = this.popupHeight < 300 ? 300 : this.popupHeight;
        } else{//普通下拉框
        	html += 'class="boot-listbox" ';
        }
        html += 'width="'+ this.popupWidth +'" height="'+ this.popupHeight +'" ';
        if(this.url){
            html += 'url="'+ this.url +'" ';
        }else{
            html += 'autoLoad="false" ';
        }
        html += 'style="position:absolute;display: none;">';
        if(this.asGrid){
        	html += this.columnEls;
        }
        html += '</div>';
        this.el.append(html);
        boot.parse(id.replace('$', '\\$'));
        this.listBox = boot.get(id);
        this.listBox.showEmpty = this.showEmpty;
        this.listBox.el.addClass("combobox-listbox");
        
        var me = this;
        window.setTimeout(function(){
            if(me.data.length > 0)
            	me.listBox._loadData(me.data);
        }, 0);
    },
    _loadData: function(data){
        this.listBox._loadData(data);
    },
    _setUrl: function(url){
        this.url = url;
        this.listBox.url = url;
        if(this.asTree){
        	this.listBox.tree._load({data: this.params});
        }else if(this.asGrid){
        	this.listBox.grid._load({data: this.params});
        }else 
        	this.listBox._load({data: this.params});
    },
    _load: function(params){
    	params = params || this.params;
    	if(this.asTree){
        	this.listBox.tree._load({data: params});
        }else if(this.asGrid){
        	this.listBox.grid._load({data: params});
        }else 
        	this.listBox._load({data: params});
    },
    _setParameters: function(params){
    	this.params = params || {};
    	this.listBox._setParameters(this.params);
    },
    _setText: function(text){
    },
    _setValue: function(value){
        this.listBox._setValue(value);
        this.value = value;
        this.textEl.val(this.listBox.text);
    },
    _setPopupListPosition: function(box) {
        var winHeight = jQuery(document.body).height();
        var winWidth = jQuery(document.body).width();
        if (winHeight - box.top > this.listBox.height) {
            delete box.top;
        }else{
            box.top = -this.listBox.height;
        }
        
        if(box.left + this.listBox.width > winWidth){
    		box.left = winWidth - box.left - this.listBox.width;
        }else{
        	delete box.left;
        }
        
        delete box.height;
        delete box.width;
        this.listBox.el.css(box);
        this.listBox._show();
    },
    _destroy: function(){
    	boot.ComboBox.superClass._destroy.call(this);
    	this.listBox._destroy();
    	this.el.remove();
    },
    _bindEvents: function(){
        boot.ComboBox.superClass._bindEvents.call(this);
        this.listBox.bind('itemclick', this._onItemClick, this);
        this.listBox.bind('checkboxclick', this._onCheckBoxClick, this);
        this.listBox.bind('setvalue', this._onListBoxLoadSuccess, this);
        this.listBox.bind('loadsuccess', this._onListBoxLoadSuccess, this);
        this.bind('bodyclick', this._onBodyClick, this);
        if(this.listBox.grid){
        	this.listBox.grid.pager.pageSizeEl.bind("beforebuttonaction", this._stopHideGridBox, this);
        }
        if(this.allowFilter){
        	this._on(this.el, '.textbox-text', 'keyup', this._onTextFilter, this);
        }
    },
    _onTextFilter: function(e){
    	var data = boot.clone(this.listBox.data);
    	var filter = this.textEl.val();
    	for(var i = 0; i < data.length; i++){
    		var row = data[i];
    		var text = row[this.textField];
    		if(!new RegExp(filter).test(text)){
    			data.splice(i, 1);
    			i--;
    		}else{
    			row[this.textField] = text.replace(filter, '<font style=\'color: brown;font-weight: bolder;font-family: cursive;\'>' + filter + '</font>');
    		}
    	}
    	this.listBox._renderBox(data);
    	this.textEl.val(filter);
    	var box = this._getBox();
        this._setPopupListPosition(box);
    },
    _stopHideGridBox: function(e){
    	e.sender = this;
    	this.listBox._show();
    },
    _onListBoxLoadSuccess: function(e){
        this.value = e.value;
        this.text = e.text;
        this.textEl.val(this.text);
        this.textEl.trigger('change');
        
        e.sender = this;
        this._fire("loadsuccess", e);
    },
    _onBodyClick: function(){
        this.listBox._hide();
    },
    _onButtonEditClick: function(e){
        e.stopPropagation();
        e.sender = this;
        
        jQuery(".combobox-listbox").hide(); //隐藏其他下拉框 
        
        this._fire("beforebuttonaction", e);
        
        var box = this._getBox();
        this._setPopupListPosition(box);
        
        this._fire("buttonclick", e);
    },
    _onCheckBoxClick: function(e){
    	e.stopPropagation();
    	this.value = e.value;
    	this.text = e.text;
    	this.textEl.val(this.text);
    	this.textEl.trigger('change');
        this._validate();
    	
    	e.sender = this;
    	this._fire("checkboxclick", e);
    },
    _onItemClick: function(e){
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
    _getAttrs: function(attributes){
        var attrs = boot.concat({
            str: ["url", "popupHeight", "popupWidth", "idField", "parentidField", "childrenField"],
            bool: ["showEmpty", "asTree", "asGrid", "showCheckBox", "onlyLeaf", "showPager", "allowFilter"],
            json: ["data"],
            fn: []
        }, attributes || {});
        return boot.ComboBox.superClass._getAttrs.call(this, attrs);
    },
    
    //API
    getData: function(){
        return this.listBox._getData();
    },
    setData: function(data){
        this.listBox._loadData(data);
    },
    setUrl: function(url){
        this._setUrl(url);
    },
    clearAll: function(){
        this.listBox.clearAll();
    },
    load: function(params){
    	this._load(params);
    }
});

boot.Register(boot.ComboBox, 'combobox');
