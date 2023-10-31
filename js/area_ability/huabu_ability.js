//本文件是画布区域顶部功能栏的功能实现，与画布对象有关的功能函数请参见"area_huabu.js"

//令对应菜单显示在鼠标右键位置，在画布区域内专用的函数
function showHuabuMenu(event,menu_name){
	//参数即为选中的菜单的id
	var menu = $("#" + menu_name)
	//获取鼠标位置
	var x = event.clientX
	var y = event.clientY
	//如果这个位置太低了，会让菜单的下方被覆盖，就让菜单显示在上方
	if(y + menu.height() >= $(window).height()){
		y = y - menu.height()
	}
	//隐藏同级别的其他菜单，将对应菜单显示出来
	hideMenu(menu,"other")
	$(menu).css({
		"display":"block",
	})
	//移到对应位置旁
	$(menu).offset({
		left:x+10,
		top:y+10
	})
	//监听事件,在左键点击非该菜单位置时令其隐藏
	$("#huabu_container").on("mousedown",function(event){
		event.stopPropagation()
		if(!$(menu).is(event.target) && event.button == 0){
			event.stopPropagation()
			hideHuabuMenu(menu_name)
			$(this).off(event)
		}
	})
}
//令对应菜单隐藏
function hideHuabuMenu(menu_name){
	//令所有画布内的菜单都隐藏
	if(menu_name == "all"){
		$("#area_huabu .menu").hide()
	}
	$("#" + menu_name).hide()
}

//点击增加当前画布的scale，也就是令画布放大
$("#huabu_ability_ScaleUp").on("click",function(){
	enlargeHuabu()
})

//显示画布当前的缩放大小，在画布切换，放大缩小时调用
function showScale(huabu){
	var scale = Math.round($(huabu).attr("scale") * 100) +"%"
	$("#huabu_ability_ScaleShow").children().text(scale)
}

//点击减少当前画布的scale，也就是令画布变小
$("#huabu_ability_ScaleDown").on("click",function(){
	narrowHuabu()
})