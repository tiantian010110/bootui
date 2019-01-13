/**
 * @author 田鑫龙
 */
//密码输入框
boot.Password = function(id){
    boot.Password.superClass.constructor.call(this, id);
};

boot.extend(boot.Password, boot.TextBox, {
    uiCls: 'boot-password',
    type: 'password'
});

boot.Register(boot.Password, 'password');
