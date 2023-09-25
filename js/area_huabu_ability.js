//本文件是画布区域顶部功能栏的功能实现，与画布对象有关的功能函数请参见"area_huabu.js"

//令对应菜单显示在鼠标右键位置
function showMenu(menu_name){
	//参数即为选中的菜单的id
	var menu = $("#" + menu_name)
	//获取鼠标位置
	var x = event.clientX
	var y = event.clientY
	console.log(x,y)
	//将对应菜单显示出来
	$(menu).css({
		"display":"block",
	})
	//移到鼠标位置旁边
	$(menu).offset({
		left:x+10,
		top:y+10
	})

	//监听事件,在点击非该菜单时令其隐藏
	$("#huabu_container").on("click",function(event){
		if(!$(menu).is(event.target)){
			$(menu).css({
				"display":"none",
			})
			$(this).off(event)
		}
	})
}



//Scale区域
//点击增加当前画布的scale，也就是令画布放大
$("#draw_ability_ScaleUp").on("click",function(){
	enlargePage()
})

//显示画布当前的缩放大小，在画布切换，放大缩小时调用
function ScaleShow(huabu){
	var scale = Math.round($(huabu).attr("scale") * 100) +"%"
	$("#draw_ability_ScaleShow").children().text(scale)
}

//点击减少当前画布的scale，也就是令画布变小
$("#draw_ability_ScaleDown").on("click",function(){
	narrowPage()
})