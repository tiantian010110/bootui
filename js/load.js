/**
 * @author admin
 */
var script = document.getElementsByTagName("script")[0];
var src = script.src;
src = src.replace(/js\/.+\.js/, "");
window.ctx = src;

document.write('<link href="'+ src +'css/boot.css" rel="stylesheet" type="text/css">');
document.write('<script type="text/javascript" src="' + src + 'js/root/jquery.min.js"></script>');
document.write('<script type="text/javascript" src="' + src + 'js/root/json2.js"></script>');
document.write('<script type="text/javascript" src="' + src + 'js/root/boot.js"></script>');