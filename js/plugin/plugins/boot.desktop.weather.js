/**
 * @author dragon
 */
boot.deskPlugins = boot.deskPlugins || {};

boot.deskPlugins.Weather = function(url) {
    this._uuid = boot.newId();
    this.showTitle = false, this.title = '天气预报', this.height = 95, this.selector = '#' + this._uuid + '\\$body';
    this.url = url || "http://i.tianqi.com/index.php?c=code&id=55http://i.tianqi.com/index.php?c=code&id=55";
    this.width = 255;
    this.height = 295;
};

boot.deskPlugins.Weather.prototype = {
    execute : function(desk) {
    },
    registerData : function() {
        
    },
};
