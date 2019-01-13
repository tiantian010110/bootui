/**
 * @author 田鑫龙
 */
boot.DeskTop = function(id) {
    boot.DeskTop.superClass.constructor.call(this, id);
    this._load();
    var me = this;
    jQuery(window).resize(function() {
        me._renderShortcuts();
    });
};

boot.extend(boot.DeskTop, boot.Rooter, {
    cls : "boot-desktop",
    type: "desktop",
    _initField : function() {
        this.windows = [];
        this.basePath = this.basePath || ctx;
        this.headHeight = this.headHeight || 0;
        this.textField = this.textField || "text";
        this.showTitleField = this.showTitleField || "showTitle";
        this.idField = this.idField || 'id';
        this.rightField = this.rightField || "_mark";
        this.footHeight = this.footHeight || 0;
    },
    _create : function() {
        var head = jQuery('<div class="desktop-head" style="height: ' + this.headHeight + 'px"></div>');
        var foot = jQuery('<div class="desktop-foot" style="height: ' + this.footHeight + 'px"></div>');
        var style = 'top: ' + this.headHeight + 'px; bottom: ' + this.footHeight + 'px;';
        var view = jQuery('<div class="desktop-view" style="' + style + '"></div>');
        var box = jQuery('<div class="desktop-box"></div>');
        var plugins = jQuery('<div class="desktop-plugin-box"></div>');
        var background = jQuery('<img src="' + this.basePath + '/css/images/desktop/background.jpg" alt="" style="position: fixed;top: 0;left: 0;width: 100%;height: 100%;"/>');
        this.el.append(background);
        this.el.append(head).append(view).append(foot);
        view.append(box).append(plugins);

        this.headEl = head;
        this.footEl = foot;
        this.viewEl = view;
        this.boxEl = box;
        this.pluginBoxEl = plugins;
        this.backgroundEl = background;
        document.oncontextmenu = function(e) {
            return false;
        };
        this.contextMenu = new boot.ContextMenu(this.el);
        this.contextMenu.textField = "text";
        
        this._creatToolsButton();
    },
    _creatToolsButton: function(){
    	var html = '<div class="head-tools">';
    	html += '<a class="logout" href="javascript: void(0);"></a>';
    	html += '</div>';
    	this.headEl.append(html);
    },
    _load : function(loadUrl) {
        var options = {
            url : loadUrl || this.loadUrl,
            context : this,
            success : this._loadSuccess
        };
        if (options.url) {
            boot.ajax(options);
        }
    },
    _updateRight : function() {
        if (this.updateUrl) {
            window._modal = window._modal || new boot.Modal(document.body);
            window._modal._setText("保存中...");
            window._modal._show();
            var user = boot.concat({}, this.data.user || {});
            var options = {
                url : this.updateUrl,
                context : this,
                data : boot.addPrefix(user, 'user'),
                success : function(result) {
                    this.data.user[this.rightField] = result.resultData[this.rightField];
                    this._renderShortcuts();
                    this._updateHideShortcuts();
                    if (!result.success) {
                        alert(result.message);
                    }
                    window._modal._hide();
                }
            };
            if (options.url) {
                boot.ajax(options);
            }
        }
    },
    _loadSuccess : function(result) {
        if (result.success) {
            this.data = result.resultData;
            var user = this.data.user;
            if (!user) {
                this.data.user = {
                    right : 0
                };
            } else if (!user[this.rightField] && (user[this.rightField] == "" || isNaN(user[this.rightField]))) {
                user[this.rightField] = "0";
            }
            this._createHeadEls();
            this._createFootEls();
            this._renderShortcuts();
            this._renderPlugins();
            this._renderHideBox();
            jQuery(window).resize(function(e){
            	
            });
        }
    },
    _createHeadEls : function() {
        var company = this.data.company = this.data.company || {};
        company.logo = company.logo || '../desktop/logo.png';
        var logo = jQuery('<img src="' + company.logo + '" alt="LOGO" style="" class="desktop-logo"/>');
//        this.headEl.append(logo);
        company.background = company.background || '../desktop/top_background.png';
        this.headEl.css("background-image", "url('" + company.background + "')");
    },
    _createFootEls : function() {
        var company = this.data.company = this.data.company || {};
        company.copyRight = company.copyRight || "";
        this.footEl.html('<div style="color: #fff;font-size: 12px;line-height: '+ this.footHeight +'px;text-align: center;padding-left: 20px;" class="desktop-copyRight">'+ company.copyRight +'</div>');
        company.background = company.background || '../desktop/top_background.png';
        this.footEl.css("background-image", "url('" + company.background + "')");
    },
    //渲染插件栏
    _renderPlugins : function(plugins) {
        plugins = boot.clone(plugins || this.data.plugins);

        var html = new boot.HTML();
        for (var index = 0, len = plugins.length; index < len; index++) {
            var plugin = this._addIdentify(plugins[index]);
            html.push(this._createPlugin(plugin));
        }
        this.pluginBoxEl.append(html.concat());
    },
    //获取shortcut权限
    _getRight : function(shortcut) {
        var right = parseInt(this.data.user[this.rightField], 2);
        var mark = Math.pow(2, shortcut[this.rightField]);
        if ((mark & right) === mark) {
            return true;
        } else {
            return false;
        }
    },
    //加入快捷方式权限
    _addRight : function(shortcut) {
        var right = parseInt(this.data.user[this.rightField], 2);
        right += Math.pow(2, shortcut[this.rightField]);
        this.data.user[this.rightField] = right.toString(2);
    },
    //移除快捷方式权限
    _removeRight : function(shortcut) {
        var mark = shortcut[this.rightField];
        var right = parseInt(this.data.user[this.rightField], 2);
        right = right - Math.pow(2, mark);
        this.data.user[this.rightField] = right.toString(2);
    },
    //获取shortcut数量，通过show是否显示标识来区分
    _getShortcutsByRight : function(show) {
        var length = this.data.shortcuts.length;
        var showArray = [], hideArray = [];
        var right = parseInt(this.data.user[this.rightField], 2);
        for (var i = 0; i < length; i++) {
            var shortcut = this.data.shortcuts[i];
            shortcut = this._addIdentify(shortcut);
            var mark = Math.pow(2, shortcut[this.rightField]);
            if ((mark & right) === mark) {
                showArray.push(shortcut);
            } else {
                hideArray.push(shortcut);
            }
        }
        if (show) {
            return showArray;
        } else {
            return hideArray;
        }
    },
    //渲染桌面
    _renderShortcuts : function() {
        var shorts = boot.clone(this._getShortcutsByRight(true));
        shorts = this._addActionShortcut(shorts);
        this._resizeBox(shorts);

        var html = new boot.HTML();
        var column = new boot.HTML();
        for (var index = 0, len = shorts.length; index < len; index++) {
            var shortcut = shorts[index];
            column.push(this._createShortcut(shortcut));
            if ((index + 1) % this.row == 0) {
                html.push('<div class="desktop-box-column">');
                html.push(column);
                html.push('</div>');
                column.empty();
            }
        }
        if (!column.isEmpty()) {
            html.push('<div class="desktop-box-column">');
            html.push(column);
            html.push('</div>');
            column.empty();
        }
        this.boxEl.html(html.concat());
    },
    //添加按钮
    _addActionShortcut : function(shorts) {
        var add = {
            _uuid : boot.newId(),
            _actived : false,
            _systemIcon : 'desktop-shortcut-add',
            icon : '/css/images/desktop/add.png'
        };
        add[this.rightField] = 0;
        add[this.textField] = '添加';
        shorts.push(add);

        return shorts;
    },
    //TODO 更新单个快捷方式
    _updateShortcut : function(shortcut) {
        if (shortcut._isShortcut) {
            var id = shortcut._uuid;
            var selector = '#' + id;
            var el = jQuery(selector, this.viewBoxEl);
            el.html(this._createShortcutInner(shortcut));
        }
    },
    //重新绘制box的宽度，计算出列数和行数
    _resizeBox : function(shorts) {
        var total = shorts.length, sWidth = 80 + 20, sHeight = 84 + 20, boxWidth = sWidth, boxHeight = this.boxEl.height();
        this.row = Math.floor(boxHeight / sHeight);
        this.column = Math.ceil(total / this.row);
        this.boxEl.width(this.column * boxWidth);
    },
    //添加标识
    _addIdentify : function(shortcut) {
        shortcut._isShortcut = true;
        shortcut._uuid = shortcut._uuid || boot.newId();
        shortcut._actived = shortcut._actived === undefined ? false : shortcut._actived;
        shortcut._open = shortcut._open === undefined ? false : shortcut._open;
        return shortcut;
    },
    //创建单个插件
    _createPlugin : function(plugin) {
        var headHeight = 26;
        if (plugin[this.showTitleField] === false) {
            headHeight = 0;
        }
        var height = (plugin.height || 150) + headHeight;
        var html = '<div id="' + plugin._uuid + '" class="desktop-plugin" style="height: ' + height + 'px">';
        html += '<img src="' + this.basePath + '/css/images/desktop/plugin_bg.png" alt="" style="position: absolute;top: 0;width: 100%;height: 100%;"/>';
        html += '<div class="plugin-head" style="height: ' + headHeight + 'px;padding-left: 18px;position: relative;overflow: hidden;">' + plugin.title + '</div>';
        html += '<div id="' + plugin._uuid + '$body" class="plugin-body" style="position: absolute;top: ' + headHeight + 'px;bottom: 0;">';
        if (plugin.noFrame !== true) {
            var href = 'src="' + plugin.url + '"' || "";
            var size = '';
            if(plugin.height) {
            	size += 'height: ' + plugin.height + 'px;';
            }else {
            	size += 'height: 100%;';
            }
            if(plugin.width) {
            	size += 'width: ' + plugin.width + 'px;';
            }else {
            	size += 'width: 100%;';
            }
            html += '<iframe id="' + plugin._uuid + '$frame" ' + href + ' style="border: none;'+ size +'padding: 0;margin: 0;"></iframe>';
        }
        html += '</div>';
        html += '</div>';
        return html;
    },
    //载入自定义插件//TODO
    _loadPlugins : function(plugins) {
        if (jQuery.type(plugins) != 'array') {
            plugins = [plugins];
        }
        for (var index in plugins) {
            var plugin = plugins[index];
            this.pluginBoxEl.append(this._createPlugin(plugin));
            plugin.execute(this.id);
        }
    },
    //注册插件中能够打开弹窗的数据
    _registerPluginDatas : function(id, array) {
        this.plugins = this.plugins || {};
        for (var i = 0, len = array.length; i < len; i++) {
            var plugin = array[i];
            plugin._isShortcut = false;
            plugin._uuid = boot.newId();
            plugin._open = false;
        }
        this.plugins[id] = array;
    },
    //创建单个快捷方式
    _createShortcut : function(shortcut) {
        var cls = shortcut._systemIcon || 'desktop-shortcut';
        var html = '<div id="' + shortcut._uuid + '" title="' + shortcut[this.textField] + '" class="' + cls + '" style="position: relative;display: inline-block;cursor: pointer;">';
        html += this._createShortcutInner(shortcut);
        html += '</div>';
        return html;
    },
    //创建快捷方式的内部元素
    _createShortcutInner : function(shortcut) {
        var icon = this.basePath + (shortcut.icon || '/css/images/desktop/icon.png');
        var html = '<span class="desktop-shortcut-icon">';
        html += '<img src="' + icon + '" alt="" style="width: 100%;height: 100%;"/>';
        html += '</span>';
        html += '<span class="desktop-shortcut-text">';
        html += '<div class="left">';
        html += shortcut[this.textField];
        html += '</div><div class="right"></div>';
        html += '</span>';
        if (shortcut._open) {
            var open = this.basePath + '/css/images/desktop/open.png';
            html += '<img src="' + open + '" alt="" style="width: 14px;height: 13px;position: absolute;top: 0px; right: 5px;"/>';
        }
        return html;
    },
    _createWindow : function(shortcut) {
        var url = '';
        if (shortcut.url) {
        	if(shortcut.url.indexOf("http") != -1 || shortcut.url.indexOf("ftp") != -1){
        		url = shortcut.url;
        	}else{
        		url = this.basePath + shortcut.url;
        	}
            
        } else {
            url = this.moduleUrl;
        }
        url = url + (url.indexOf('?') == -1 ? '?' : '&') + 'id=' + shortcut[this.idField] + '&__random=' + new Date().getTime();
        var options = {
            id : shortcut._uuid,
            showModal : false,
            showHead : false,
            showMin : true,
            fullScreen : true,
            desktop : this.id,
            title : shortcut[this.textField],
            url : url,
            onload : function(e) {
                if (this.execute) {
                    this.execute(e, shortcut);
                }
            },
            ondestroy : function(e) {
                var win = e.sender;
                var desk = boot.get(win.desktop);
                desk._destroyWindow(win);
            }
        };
        if (shortcut.url) {
            options.showHead = true;
            options.showMin = false;
//            options.showMax = true;
//            options.fullScreen = false;
//            options.width = 980;
//            options.height = 550;
        }
        var win = boot.dialog(options);
        var _win = {
            _uuid : shortcut._uuid,
            window : win
        };
        this.windows.push(_win);
        return win;
    },
    //获取window，获取不到就调用创建方法
    _getWindow : function(shortcut) {
        var win = undefined;
        for (var i = 0, len = this.windows.length; i < len; i++) {
            var _win = this.windows[i];
            if (_win._uuid == shortcut._uuid) {
                win = _win.window;
            }
        }
        if (!win) {
            win = this._createWindow(shortcut);
        }
        return win;
    },
    //显示窗口
    _showWindow : function(shortcut) {
        shortcut._open = true;
        var win = this._getWindow(shortcut);
        win.show();
        if (shortcut._isShortcut) {
            //显示窗口时，更新快捷方式
            this._updateShortcut(shortcut);
        }
        return win;
    },
    _destroyWindow : function(win) {
        for (var i = 0, len = this.windows.length; i < len; i++) {
            var _win = this.windows[i];
            if (win.id === _win._uuid) {
                this.windows.splice(i, 1);
                var shortcut = this._getShortcutByUUID(_win._uuid);
                if (shortcut) {
                    shortcut._open = false;
                    //销毁窗口时，更新快捷方式
                    this._updateShortcut(shortcut);
                    break;
                } else {
                    shortcut = this._getPluginByUUID(_win._uuid);
                    shortcut._open = false;
                    break;
                }
            }
        }
    },
    _renderHideBox : function() {
        this._showHideShortcuts();
    },
    _showHideShortcuts : function() {
    	var width = this.el.width(), height = this.el.height();
    	var left = (width - 600) / 2, top = (height - 400) / 2;
        if (this.popupEl) {
            this.popupEl.show();
            this.popupEl.css({
            	left: left,
            	top: top
            });
            this._updateHideShortcuts();
        } else {
            var html = '<div class="desktop-hide-box" style="display: none;position: absolute;top: ' + top + 'px;left: ' + left + 'px;width: 600px;height: 400px;">';
            html += '<img src="' + this.basePath + '/css/images/desktop/hide-bg.png" alt="" style="position: absolute;top: 0;width: 100%;height: 100%;"/>';
            html += '<div class="hide-box" style="height: 26px;padding-left: 18px;position: relative;font: 12px \'宋体\';">';
            html += '<div class="hide-box-text" style="height: 26px;line-height: 26px;display: inline-block;">待选快捷方式</div>';
            html += '<div class="hide-box-close" style="height: 18px;width: 18px;position: absolute;top: 4px;right: 10px;cursor: pointer;"></div>';
            html += '</div>';
            html += '<div class="hide-box-body" style="position: absolute;top: 26px;bottom: 0;">';
            html += this._renderHideShortcuts();
            html += '</div>';
            var popupEl = jQuery(html);
            popupEl.appendTo(this.el);
            this.popupEl = popupEl;
            this.popupBodyEl = this.popupEl.find('.hide-box-body');
        }
    },
    //更新隐藏BOX的无展示权限的快捷方式
    _updateHideShortcuts : function() {
        this.popupBodyEl.html(this._renderHideShortcuts());
    },
    //渲染无展示权限的快捷方式
    _renderHideShortcuts : function() {
        var shorts = boot.clone(this._getShortcutsByRight(false));
        var html = new boot.HTML(), len = shorts.length;
        if (len == 0) {
            html.push('<div style="width: 100%;height: 20px;font-size: 13px;position: absolute;top: 50%;margin-top: -10px;text-align: center;">没有可添加的应用</div>');
        } else {
            for (var index = 0; index < len; index++) {
                var shortcut = shorts[index];
                html.push(this._createShortcut(shortcut));
            }
        }
        return html.concat();
    },
    //获取数据源中的shortcut
    _getShortcutByUUID : function(uuid) {
        var shorts = this.data.shortcuts;
        for (var i = 0, len = shorts.length; i < len; i++) {
            var shortcut = shorts[i];
            if (shortcut._uuid == uuid) {
                return shortcut;
            }
        }
    },
    //获取插件中的data
    _getPluginByUUID : function(uuid) {
        var plugins = this.plugins;
        for (var key in plugins) {
            var array = plugins[key];
            for (var i = 0, length = array.length; i < length; i++) {
                var plugin = array[i];
                if (plugin._uuid == uuid) {
                    return plugin;
                }
            }
        }
    },
    _bindEvents : function() {
        this._on(this.boxEl, '.desktop-shortcut', 'click', this._onShortcutClick, this);
        this._on(this.el, '.desktop-shortcut', 'dblclick', this._onShortcutDBLClick, this);
        this._on(this.el, '.desktop-shortcut', 'contextmenu', this._onShortcutContextMenu, this);
        this._on(this.boxEl, '.desktop-shortcut-add', 'click', this._showHideShortcuts, this);
        this._on(this.el, '.hide-box-close', 'click', this._onHideBoxCloseClick, this);
        this._on(this.headEl, '.logout', 'click', this._onLogout, this);
        this.bind('bodyclick', this._onBodyClick, this);
        this.contextMenu.bind('itemclick', this._onItemClick, this);
    },
    _onLogout: function(e){
    	this._fire('onlogout', e);
    },
    _onBodyClick : function() {
        if (this.contextMenu) {
            this.contextMenu._hide();
        }
    },
    //右击菜单事件
    _onShortcutContextMenu : function(e) {
        var el = e.selector;
        var uuid = el.attr("id");
        var shortcut = this._getShortcutByUUID(uuid);
        var right = this._getRight(shortcut);
        var menu = [];
        if (right) {
            menu.push({
                "id" : uuid,
                "text" : "打开应用",
                "action" : "open"
            });
            menu.push({
                "id" : uuid,
                "text" : "删除应用",
                "action" : "remove"
            });
        } else {
            menu.push({
                "id" : uuid,
                "text" : "添加到桌面",
                "action" : "add"
            });
        }
        var offset = {
            left : e.event.pageX,
            top : e.event.pageY
        };

        this.contextMenu.trigger = shortcut;
        this.contextMenu._setData(menu);
        this.contextMenu._setPosition(offset);
        this.contextMenu._show();
    },
    //双击隐藏的快捷方式添加到桌面事件
    _onShortcutDBLClick : function(e) {
        var el = e.selector;
        var id = el.attr('id');
        var shortcut = this._getShortcutByUUID(id);
        var right = this._getRight(shortcut);
        if (!right) {
            this._addRight(shortcut);
            this._updateRight();
            this._renderShortcuts();
            this._updateHideShortcuts();
        }
        if (this.contextEl) {
            this.contextEl.remove();
            this.contextEl = undefined;
        }
    },
    //右键菜单点击事件
    _onItemClick : function(e) {
        var el = e.selector;
        var ids = el.attr('id').split("$");
        var id = ids[0];
        var item = this.contextMenu._getNodeByUUID(id);
        var shortcut = this.contextMenu.trigger;
        if (item.action === 'open') {
            this._showWindow(shortcut);
        } else if (item.action === 'remove') {
            this._removeRight(shortcut);
            shortcut._open = false;
            this._updateRight();
        } else if (item.action === 'add') {
            this._addRight(shortcut);
            this._updateRight();
        }
    },
    //快捷方式点击
    _onShortcutClick : function(e) {
        var el = e.selector;
        var uuid = el.attr("id");
        var shortcut = this._getShortcutByUUID(uuid);
        this._showWindow(shortcut);
    },
    //待选快捷方式容器的关闭事件
    _onHideBoxCloseClick : function(e) {
        this.popupEl.hide();
    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ["loadUrl", "updateUrl", "basePath", "moduleUrl", "showTitleField", "textField", "rightField", "idField"],
            number : ["footHeight", "headHeight"],
            bool : [],
            json : [],
            fn : []
        }, attributes || {});
        return boot.DeskTop.superClass._getAttrs.call(this, attrs);
    },

    loadPlugins : function(plugins) {
        this._loadPlugins(plugins);
    },
    showWindow : function(win) {
        this._showWindow(win);
    }
});

boot.Register(boot.DeskTop, 'desktop');
