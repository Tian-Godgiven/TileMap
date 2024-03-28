//剪贴板对象类
	//磁贴样式
		$.fn.clipboard_tileStyle = function(styleValue, attrsValue, propsValue) {
		  	var tileStyle = {
		    	style: styleValue || {},
		    	attrs: attrsValue || {},
		    	props: propsValue || {}
		  	};
		  	return tileStyle;
		};



//剪贴板对象，在用户进行了复制操作后，将对应的内容存入
var clipboard = []

//剪贴板中可能出现的类
//将内容存入剪贴板中
function pushClipboard(target){
	console.log("进入剪贴板了！")
}
//读取剪贴板中的内容
function popClipboard(type){
	// //如果剪贴板中没有内容，则读取用户剪贴板中的内容
	// if(clipboard == undefined){
	// 	navigator.clipboard.readText()
	// 	    .then(text => {
	// 	      return text
	// 	    })
	// }
	// else{
		console.log("读取剪贴板了！")
	// }
}