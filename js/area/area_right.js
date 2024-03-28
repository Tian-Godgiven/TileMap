//在“样式”与“内容”模式间进行切换
$(".rightArea_top_block").on("mousedown",function(){
	changeModel(this)
})

function changeModel(model){
	changeBlockColor(model)
	changeAreaInner(model)
}


//修改模式对应的div块的状态
function changeBlockColor(model){
	//首先将所有block修改为未选中状态
	$(".rightArea_top_block").css({
		"background-color":"lightseagreen",
		"border-bottom":"2px solid black",
		"color":"#404040FF",
	})
	//随后将这个div修改为选中状态
	$(model).css({
		"background-color":"white",
		"border-bottom":"none",
		"color":"black",
	})
}

//修改下方的内容使其对应模式
function changeAreaInner(model){
	var inner_id = $(model).attr("id") +"_inner" 
	$(".rightArea_inner").hide()
	$("#" + inner_id).show()
}

//获取tile的title 和 text将其显示在内容区
function rightArea_getTile(tile){

	var title = $(tile).attr("title");
	var tiletext = $(tile).data("tiletext");
	//将内容放入
	$("#rightArea_tile_edit_title").html(title)
	$("#rightArea_tile_edit_text").html(tiletext)
	//只有当里面有内容时，才可以进行修改
	$("#rightArea_tile_edit_title").attr("contenteditable","true")
	$("#rightArea_tile_edit_text").attr("contenteditable","true")

}

//监听内容修改，修改会同步反馈给tile本身，标题的修改也会显示在tile上
$("#rightArea_tile_edit_title").on("input",function(){
	var tile = return_focusing_tile()
	var text = $(this).html()
	//转换为html
	$(tile).attr("title",toHTML(text))
	//修改title
	$(tile).find('.tile_title').html(tile.title)
})

//输入内容可以是h5代码
$("#rightArea_tile_edit_text").on("input",function(){
	var tile = return_focusing_tile()
	var text = $(this).html()
	$(tile).data("tiletext",toHTML(text))
	showTileTextblock(tile)
})

//更换画布时，会清空内容，防止出现跨画布操作，同时也会关闭修改权限
function rightArea_clearContent(){
	$("#rightArea_tile_edit_title").html("")
	$("#rightArea_tile_edit_text").html("")
	$("#rightArea_tile_edit_title").attr("contenteditable","false")
	$("#rightArea_tile_edit_text").attr("contenteditable","fasle")
}