/**
 * @author 田鑫龙
 */
boot.Toolbar = function(id){
    boot.Toolbar.superClass.constructor.call(this, id);
    this._getFields();
};

boot.extend(boot.Toolbar, boot.Rooter, {
    uiCls: "boot-toolbar",
    type: "toolbar",
    _getFields: function(){
        boot.findChildComponents.call(this);
    },
    _getAttrs : function(attributes) {
        var attrs = boot.concat({
            str : [],
            number: ["width", "height"],
            bool : [],
            css : [],
            fn : []
        }, attributes);
        return boot.Toolbar.superClass._getAttrs.call(this, attrs);
    }
});

boot.Register(boot.Toolbar, "toolbar");