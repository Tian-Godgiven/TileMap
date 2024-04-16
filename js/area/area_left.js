
//通过菜单创建新画布
function addNewHuabu(){
	createNewHuabuMenu().then((huabu) => {
		//移动到该画布
		changeHuabu(huabu)
	})	
}

//新建画布
$("#area_left #create_new_huabu").on("click",function(){
	addNewHuabu()
})

//切换连线模式
$("#area_left #toggle_lineConnect_mode").on("click",function(){
	toggleConnectMode()
})

function toggleConnectMode(){
	var dom = $("#toggle_lineConnect_mode")
	//如果处于连线模式，则关闭
	if($(dom).is(".connecting_mode")){
		endConnectingMode()
		$("#toggle_lineConnect_mode_title").text("连线模式")
	}
	//否则打开
	else{
		startConnectingMode()
		$("#toggle_lineConnect_mode_title").text("退出连线")
	}
	$(dom).toggleClass("connecting_mode")
}

//点击展开或收起连线设定
$("#area_left #line_connect_style").on("click",function(){
	var menu = $("#line_connect_style_menu")
	//收起连线设定
	if($(this).is(".open")){
		$(menu).stop().animate({
			width:0,
		},500,function(){
			$(menu).css("display","none")
		})
	}
	//展开
	else{
		$(menu).css("display","flex").stop().animate({
			width:250
		},500)
		$(menu).on("click",function(event){
			event.stopPropagation()
		})
		//同步连线设定
		var style = returnLineStyle()
		$("#line_style_color .colorpicker_color").css("background-color",style.color)
		$("#line_style_width input").val(intValue(style.line_width,"px"))
		$("#line_style_style").val(style.line_style)
		$("#line_style_type").val(style.type)
		if(style.start_arrow != "none"){
			$("#line_style_startArrow input").prop("checked",true)
		}
		else{
			$("#line_style_startArrow input").prop("checked",false)
		}
		if(style.end_arrow != "none"){
			$("#line_style_endArrow input").prop("checked",true)
		}
		else{
			$("#line_style_endArrow input").prop("checked",false)
		}
	}

	//切换状态
	$(this).toggleClass('open')
})

//修改连线样式
	//修改颜色
	$("#line_style_color .colorpicker").on('click',function(){
		//打开调色盘
		showColorpicker(this,"side",null,"line_style_color")
	})
	//改变粗度
	$("#line_style_width input").on("change",function(){
		var value = intValue($(this).val(),"px")
		$(this).val(value)
		var style = {line_width :value.slice(0, -2)}
		changeLineStyle(style)
	})
	//改变style
	$("#line_style_style").on('change',function(){
		var style = $(this).val()
		var the_style = {line_style : style}
		changeLineStyle(the_style)
	})
	//改变type
	$("#line_style_type").on("change",function(){
		var type = $(this).val()
		console.log(type)
		var the_style = {type : type}
		changeLineStyle(the_style)
	})
	//添加or去除源箭头
	$("#line_style_startArrow input").on("change",function(){
		var value = $(this).prop("checked")
		if(value){
			//修改线条总样式
			var the_style = {start_arrow : "arrow"}
			changeLineStyle(the_style)
		}
		else{
			var the_style = {start_arrow : "none"}
			changeLineStyle(the_style)
		}
	})
	//添加or去除尾箭头
	$("#line_style_endArrow input").on("click",function(){
		var value = $(this).prop("checked")
		if(value){
			//修改线条总样式
			var the_style = {end_arrow : "arrow"}
			changeLineStyle(the_style)
		}
		else{
			var the_style = {end_arrow : "none"}
			changeLineStyle(the_style)
		}
	})

//搜索磁贴类型:将符合输入的type所在的菜单展开，并令对应的block被聚焦
$("#leftArea_search_object_type input").on("change",function(){
	var block_type_name = $(this).val()
	//将其他focusing_block取消
	$(".objectCollection_container > .focusing_block").removeClass("focusing_block")
	//切换清空按键的样式
	$("#leftArea_search_object_type_input_clear").toggleClass("clear")
	//若为空则不搜索，并显示搜索
	if(block_type_name == ""){
		return false
	}

	//折叠所有collection
	$(".object_collection .slide_title").changeSlideFold("fold")
	
	//搜索获得其所在的collection的信息，这是一个元组，没有重复内容
	var collections = searchCollectionLib(block_type_name)
	for(i in collections){
		var type = collections[i].type
		var file_name = collections[i].file_name
		//获取这个collection
		var collection = $(".object_collection[type='" + type + "'][file_name='" + file_name + "']")
		//将其展开
		$(collection).children(".slide_title").changeSlideFold("unfold")
		//找到将包含type名称的block_name
		var block_name = $(collection).find(".objectBlock_name:contains('" + block_type_name + "')")
		//将其所在的block加上focusing_block
		var block = $(block_name).parents(".objectBlock").addClass("focusing_block")
	}
})

//点击清空键删除搜索内容
$("#leftArea_search_object_type_input_button.clear").on("click",function(){
	$("#leftArea_search_object_type input").val("")
	$("#leftArea_search_object_type input").change()
})

//点击折叠或展开所有collection
$("#leftArea_fold_all_collection").on("click",function(){
	if($(this).is('.fold_all')){
		$(".object_collection .slide_title").changeSlideFold("fold_slide")
	}
	else if($(this).is('.unfold_all')){
		$(".object_collection .slide_title").changeSlideFold("unfold_slide")
	}
	$(this).toggleClass("fold_all unfold_all")
})