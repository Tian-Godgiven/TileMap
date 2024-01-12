//令对应菜单显示在鼠标右键位置，在画布区域内专用的函数
function showHuabuMenu(event,menu_name){
	event.stopPropagation()
	//禁止画布移动
	changeHuabuDragging(false)

	//选中的菜单
	var menu = $("#" + menu_name)

	//隐藏同级别的其他菜单，将对应菜单显示出来
	hideMenu(menu,"other")
	$(menu).show()

	//获取鼠标位置
	var x = event.clientX
	var y = event.clientY
	//如果这个位置太低了，会让菜单的下方被覆盖，就让菜单显示在上方
	if(y + menu.height() >= $(window).height()){
		y = y - menu.height()
	}
	//将画布移到对应位置旁
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
//令指定菜单隐藏
function hideHuabuMenu(menu_name){
	//令所有画布内的菜单都隐藏
	if(menu_name == "all"){
		$(".huabu_menu").hide()
	}
	$("#" + menu_name).hide()
}
