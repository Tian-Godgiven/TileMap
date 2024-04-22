//剪贴板对象，在用户进行了复制操作后，将对应的内容存入
var clipboard
var tile_style

//将复制对象的属性以json格式存入剪贴板中
function pushClipboard(json,type){
	if(type == "tile_style"){
		tile_style = json
	}
	else{
		clipboard = json
	}
}

function ifClipboard(){
	if(clipboard == null){
		return false
	}
	else{
		return true
	}
}

//读取剪贴板中的内容
function popClipboard(type){
	if(type == "tile_style"){
		return tile_style
	}
	else{
		return clipboard
	}
}

//复制指定的对象
function copyObject(object){
	//获得其json
	objectToJson(object,"file").then(json=>{
		//存入clipboard
		clipboard = json
	})
}
//在当前画布中粘贴剪切板中的对象
var paster = null
var left_plus = 20
var top_plus = 20
function pasteObject(){

	if(clipboard == null){
		return 0
	}

	if(paster == clipboard){
		left_plus += 20
		top_plus += 20
	}
	else{
		paster = clipboard
		left_plus = 20
		top_plus = 20
	}

	var object = jsonToObject(clipboard,"new")
	//放进画布中
	var huabu = return_focusing_huabu()
	objectIntoHuabu(object,huabu)
	//把他旁边移动一下
	var left = parseInt($(object).css("left"))
	var top = parseInt($(object).css("top"))
	$(object).css({
		left:left + left_plus,
		top:top + top_plus
	})
	//聚焦它
	focusingObject(object)

	return object
}