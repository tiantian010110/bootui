/**
 * @author 田鑫龙
 */
//下拉框
boot.AutoComplete = function(id){
    boot.AutoComplete.superClass.constructor.call(this, id);
};

boot.extend(boot.AutoComplete, boot.ComboBox, {
    uiCls: 'boot-autocomplete',
    type: "autocomplete",
    _initField: function(){
    	boot.AutoComplete.superClass._initField.call(this);
    	this.text = this.text || "";
    	this.value = this.value || '';
    },
    _create: function(){
        boot.AutoComplete.superClass._create.call(this);
        this.borderEl.css("padding-right", "2px");
        this.textEl.attr("readonly", false);
        this.buttonEl.hide();
    },
    _createListBox: function(){
        var id = this._uuid +'$box';
        this.popupWidth = (this.popupWidth || this.el.width() - 2);
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
        }
        html += 'autoLoad="false" style="position:absolute;display: none;">';
        if(this.asGrid){
        	html += this.columnEls;
        }
        html += '</div>';
        jQuery(document.body).append(html);
        boot.parse(id.replace('$', '\\$'));
        this.listBox = boot.get(id);
        this.listBox.showEmpty = this.showEmpty;
        this.listBox.el.addClass("combobox-listbox");
    },
    _destroy: function(){
    	this.listBox._destroy();
    	boot.Date.superClass._destroy.call(this);
    },
    _bindEvents: function(){
        boot.AutoComplete.superClass._bindEvents.call(this);
        this._on(this.el, ":text", 'keyup', this.onIntervalQuery, this);
        this._on(this.el, ":text", 'click', this.onTextClick, this);
    },
    _onListBoxLoadSuccess: function(result){
        this.listBox._show();
        this.data = result.data;
        this.borderEl.removeClass("autocomplete-load");
    },
    _onButtonEditClick: function(e){
        this.textEl.trigger("focus");
    },
    onTextClick: function(e){
        e.stopPropagation();
    },
    _setParameters: function(params){
    	this.params = params || {};
    	this.listBox._setParameters(this.params);
    },
    _setText: function(text){
    	if(this.asTree || this.asGrid){
    		this.text = text;
    		this.textEl.val(this.text);
    	}
    },
    onIntervalQuery: function(e){
        var text = e.selector.val();
        if(text != this.text){
        	jQuery(".combobox-listbox").hide(); //隐藏其他下拉框 
        	var box = this._getBox();
        	this._setPopupListPosition(box);
        	this.text = text; 
        	this.borderEl.addClass("autocomplete-load");
        	
        	var parameter = {
        			data: {"keyWords": this.text}
        	};

        	this.listBox._setParameters(parameter.data);
        	if(this.asGrid){
        		this.listBox.grid._load(parameter);
        	}else{
        		this.listBox._load(parameter);
        	}
        }
    },
    setParameters: function(params){
    	this._setParameters(params);
    }
});

boot.Register(boot.AutoComplete, 'autocomplete');
