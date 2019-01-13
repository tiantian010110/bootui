/**
 * @author 田鑫龙
 */
//文本输入框
boot.Hidden = function(id){
    boot.Hidden.superClass.constructor.call(this, id);
};

boot.extend(boot.Hidden, boot.TextBox, {
    uiCls: 'boot-hidden',
    _create: function(){
        boot.Hidden.superClass._create.call(this);
        this.el.css("display", 'none');
    }
});

boot.Register(boot.Hidden, 'hidden');
