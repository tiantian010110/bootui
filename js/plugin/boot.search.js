/**
 * @author 田鑫龙
 */
boot.SearchBuilder = function(id) {
    boot.SearchBuilder.superClass.constructor.call(this, id);
    this._getFields();
    this._bindAfterEvents();
    this.el.height(this.height);
    this.el.css("visibility", 'visible');
};

boot.extend(boot.SearchBuilder, boot.Rooter, {
    uiCls : "boot-search",
    type: 'search',
    _initField: function() {
        this.simpleSearch = true;
        this.showField = this.showField || ["key"];
        this.prefix = this.prefix || "entityBean";
        this.height = this.height || 'auto';
    },
    _create: function() {
//        this.el.css("overflow", 'hidden');
        var showEl = jQuery('<div class="search-show" style=""></div>');
        showEl.appendTo(this.el);
        var queryId = boot.newId();
        var clearId = boot.newId();
        var queryButtonEl = jQuery('<a id="' + queryId + '" class="boot-button" iconCls="search" style="margin: auto 10px;">查询</a>');
        var clearButtonEl = jQuery('<a id="' + clearId + '" class="boot-button" iconCls="clear" style="margin: auto 10px;">清除</a>');
        this.queryButtonEl = queryId;
        this.clearButtonEl = clearId;

        showEl.append(queryButtonEl).append(clearButtonEl);
        this.showEl = showEl;
    },
    _getFields: function() {
        boot.parseByParent(this.el);
        this.queryButtonEl = boot.get(this.queryButtonEl);
        this.clearButtonEl = boot.get(this.clearButtonEl);
        boot.findChildComponents.call(this);
        this._findSimpleSearch();
    },
    _findSimpleSearch: function() {
        if (jQuery.type(this.showField) == 'string') {
            this.showField = [this.showField];
        }
        var temp = jQuery("<div></div>");
        for (var i = 0, len = this.showField.length; i < len; i++) {
            var name = this.showField[i];
            var comp = boot.getByName(name, this);
            if(comp){
                comp.el.appendTo(temp);
            }
        }
        this.showEl.prepend(temp.children());
        temp = null;
    },
    _bindAfterEvents: function() {
        this.queryButtonEl.bind('click', this._onSearchClick, this);
        this.clearButtonEl.bind('click', this._onClearClick, this);
    },
    _onSearchClick: function(e) {
        var bind = boot.getBinding(this.id, this.binding);
        if (bind) {
            var data = this._getData();
            bind._triggerQuery(data);
//            this._clearSearchText(true);
        }
    },
    _onClearClick: function(e) {
    	this._clearSearchText(true);
        var bind = boot.getBinding(this.id, this.binding);
        if (bind) {
            var data = this._getData();
            bind._triggerQuery(data);
            bind._triggerAdapt && bind._triggerAdapt();
        }
    },
    //清空字段值
    _clearSearchText: function(full) {
        var rs = boot.relationship[this._uuid];
        for (var i = 0, len = rs.length; i < len; i++) {
            var ctl = rs[i];
            if (ctl.type != 'button' && (ctl.name != this.showField || full === true)) {
                ctl.setValue("");
                ctl.setText && ctl.setText("");
            }
        }
    },
    //获取数据，空值或undefined的组件跳过
    _getData: function(prefix) {
        var result = {};
        var rs = boot.relationship[this._uuid];
        for (var i = 0, len = rs.length; i < len; i++) {
            var ctl = rs[i];
            if (ctl.type == 'button') {
                continue;
            }
            var value = ctl.getValue();
            if(value && value != ''){
                result[ctl.name] = ctl.getValue();
            }
        }
        if (prefix) {
            return boot.addPrefix(result, this.prefix);
        }
        return result;
    },

    _getAttrs: function(attributes) {
        var attrs = boot.concat({
            str : ["binding", "showField"],
            bool : [],
            json : [],
            fn : []
        }, attributes || {});
        return boot.SearchBuilder.superClass._getAttrs.call(this, attrs);
    },

    //API
    getData: function(prefix) {
        this._getData(prefix);
    },
    search: function(){
    	this._onSearchClick();
    },
    clear: function(){
    	this._onClearClick();
    }
});

boot.Register(boot.SearchBuilder, 'search');