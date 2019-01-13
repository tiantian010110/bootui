/**
 * @author 田鑫龙
 */
//弹窗窗口按钮
boot.PopupWindow = function(id) {
    boot.PopupWindow.superClass.constructor.call(this, id);
};

boot.extend(boot.PopupWindow, boot.PopupEdit, {
    uiCls : 'boot-popupwindow',
	type: 'popupwindow',
    _initField : function() {
        boot.PopupWindow.superClass._initField.call(this);
        this.popupWidth = this.popupWidth || 600;
        this.popupHeight = this.popupHeight || 500;
    },
    _onButtonEditClick : function(e) {
        this._showWindow();
    },
    _showWindow : function() {
        var me = this;
        if (this.url) {
            boot.dialog({
                url : this.url,
                title: "",
                showHead: true,
                showBorder: true,
                height : this.popupHeight,
                width : this.popupWidth,
                onload : function(e) {
                    e.cellEditor = me;
                    e.contentWindow = this;
                    me._fire('onload', e);
                },
                ondestroy : function(e) {
                    e.cellEditor = me;
                    e.window = this;
                    me._fire('ondestroy', e);
                }
            });
        }

    },
    _setUrl : function(url) {
        this.url = url;
    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : ["url", "popupTitle"],
            bool : [ "fullScreen"],
            number : ["popupWidth", "popupHeight"],
            fn : ["onload", "ondestroy"]
        }, attributes || {});
        return boot.PopupWindow.superClass._getAttrs.call(this, attrs);
    }
    //API
});

boot.Register(boot.PopupWindow, 'popupwindow');