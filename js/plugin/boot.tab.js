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
    //创建页签
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
    //创建body
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
    //根据UUID查找tab对象
    _getTabByUUID : function(uuid, field) {
    	field = field || '_uuid'
        for (var i = 0, len = this.tabs.length; i < len; i++) {
            var tab = this.tabs[i];
            if (tab[field] === uuid) {
                return tab;
            }
        }
    },
    //销毁tab方法
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

    //API
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

//Tab对象
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