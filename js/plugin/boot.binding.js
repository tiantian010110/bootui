/**
 * @author 田鑫龙
 */
/*---------------关系绑定-----------------*/
//TODO Binding
boot.Binding = function(arg1, arg2) {
    this.id = boot.newId();
    this._execute(arg1, arg2);
};

boot.Binding.prototype = {
    _execute : function(arg1, arg2) {
        var master = arg1;
        var slave = [];
        if (jQuery.type(arg1) == 'string') {
            master = boot.get(arg1);
        }
        if (jQuery.type(arg2) != 'array') {
            slave = arg2 == undefined ? [] : [arg2];
        } else {
            slave = arg2;
        }

        master._binding = this.id;
        for (var i = 0, len = slave.length; i < len; i++) {
            slave[i]._binding = this.id;
        }

        this.master = master;
        this.slave = slave;
    },
    _validate: function(){
        this.master._validate();
        for (var i = 0, len = this.slave.length; i < len; i++) {
            var comp = boot.get(this.slave[i]);
            if(comp && comp._validate){
                this.master.validateValue = this.master.validateValue && comp._validate();
            }
        }
    },
    _getSubmitData: function() {//TODO 验证功能
        this.master._validate();
        var data = this.master._getData(true);
        for (var i = 0, len = this.slave.length; i < len; i++) {
            var comp = boot.get(this.slave[i]);
            if(comp){
            	this.master.validateValue = comp._validate() && this.master.validateValue;
            	if(!this.master.validateValue){
            		return {};
            	}
                var changeds = comp._getMixData();
                boot.concat(data, boot.addPrefix(changeds, comp.savePrefix));
            }
        }
        return data;
    },
    _triggerQuery : function(parameters) {
        for (var i = 0, len = this.slave.length; i < len; i++) {
            var comp = boot.get(this.slave[i]);
            if(comp){
                comp._setParameters(parameters);
            	comp._setPageIndex();
                comp._load();
            }
        }
    },
    _triggerAdapt : function() {
        for (var i = 0, len = this.slave.length; i < len; i++) {
            var comp = boot.get(this.slave[i]);
            if(comp){
                comp._adaptive && comp._adaptive();
            }
        }
    },
    _load : function(parameters) {
        this._triggerQuery(parameters);
    }
};

boot.getBinding = function(id, binding) {
    var instance = boot.get(id);
    if ( instance instanceof boot.Binding) {
        return instance;
    } else {
        var bind = new boot.Binding(id, binding);
        boot.Deposit(bind.id, bind);
        return bind;
    }
};
