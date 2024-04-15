//在“样式”与“内容”模式间进行切换
$(".rightArea_top_block").on("mousedown",function(){
	var model_name = $(this).attr("model")
	changeModel(model_name)
})

//切换到指定模式
function changeModel(model_name){
	//首先将所有顶部block修改为未选中状态
	$(".rightArea_top_block").removeClass("rightArea_model_focusing")
	$(".rightArea_inner").hide()

	//切换到指定的模式
	if(model_name == "design"){
		//随后将顶部block修改为选中状态
		$("#rightArea_design_model").addClass("rightArea_model_focusing")
		//修改下方的内容使其对应模式
		$("#rightArea_design_inner").show()
	}
	else if(model_name == "edit"){
		//随后将顶部block修改为选中状态
		$("#rightArea_edit_model").addClass("rightArea_model_focusing")
		//修改下方的内容使其对应模式
		$("#rightArea_edit_inner").show()
	}
}

//开局默认为样式模式
changeModel("design")
