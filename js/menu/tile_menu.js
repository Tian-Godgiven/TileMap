//磁贴右键子菜单功能

//改变磁贴右键子菜单的样式和内容
function changeTileMenu(tile){
	//同步“背景颜色”与该磁贴的背景颜色相同
	var color = $(tile).css("background-color")
	$("#tile_menu #tile_color .colorpicker").css("background-color",color)
	//同步“形状”与该磁贴形状相同

	//显示“锁定”或“解锁”

	//显示“隐藏tiletext”或“显示tiletext”
}

//复制该磁贴
$("#tile_menu #tile_copy").on("click",function(){
	copyTile(focusing_tile)
})
function copyTile(tile){
	//生成一个对应tile的clone，赋予新的id，存储到剪贴板上
	var clone = $(tile).clone(false)
	var new_id = createRandomId()
	clone.attr("id",new_id) 
	pushClipboard(clone)
	hideHuabuMenu("tile_menu")
}
//剪切该磁贴
$("#tile_menu #tile_cut").on("click",function(){
	//先copy再delete
	copyTile(focusing_tile)
	deleteObject(focusing_tile)
	hideHuabuMenu("tile_menu")
})
//删除该磁贴
$("#tile_menu #tile_delete").on("click",function(){
	//直接delete
	deleteObject(focusing_tile)
	hideHuabuMenu("tile_menu")
})
//显示与修改背景颜色
$("#tile_menu #tile_color .colorpicker").on("click",function(){
	//在该对象旁调用选色器，传入当前聚焦的tile，修改对象是背景颜色
	showColorpicker(this,"side",focusing_tile,"background")
})
//顺时针旋转45度
$("#tile_menu #tile_angle_shun").on("click",function(){
	rotateDom(focusing_tile,45,"plus")
})
//逆时针旋转45度
$("#tile_menu #tile_angle_ni").on("click",function(){
	rotateDom(focusing_tile,-45,"plus")
})
//上浮该磁贴
$("#tile_menu #tile_up").on("click",function(){
	
	hideHuabuMenu("tile_menu")
})
//下沉该磁贴
$("#tile_menu #tile_down").on("click",function(){
	
	hideHuabuMenu("tile_menu")
})
//显示与改变磁贴形状
$("#tile_menu #tile_shape").on("click",function(){
	
	hideHuabuMenu("tile_menu")
})
//锁定/解锁该磁贴
$("#tile_menu #tile_lock_unlock").on("click",function(){
	
	hideHuabuMenu("tile_menu")
})
//显示/显示该磁贴的tiletext
$("#tile_menu #tile_tiletext").on("click",function(){
	
	hideHuabuMenu("tile_menu")
})












