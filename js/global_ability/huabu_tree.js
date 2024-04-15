
//生成工程文件的内容树
function createFileTree(file){
	//内容框
	var container = $("<div class='tree_container'></div>")
	//打开file
	//还没做，备忘录26
	//获取其中的画布container，依次遍历
	$("#huabu_container").children('.huabu').each(function(){
		//生成画布行，放入内容框
		var huabu_row = createTreeOfHuabuRow(this)
		$(container).append(huabu_row)
	})
	//返回内容树
	return container
}

//生成一个画布的内容树，默认将其展开
function createHuabuTree(huabu){
	//内容框
	var container = $("<div class='tree_container'></div>")
	//生成画布行，放入内容框
	var first_row = createTreeOfHuabuRow(huabu)
	//默认将其展开
	unfoldTreeRow(first_row)
	//加入画布行
	$(container).append(first_row)
	//返回内容树
	return container
}

//可折叠行
	//生成一个可折叠行
	function createTreeOfFoldRow(row){
		//可折叠行
		var fold_row = $("<div class='tree_fold_row'>\
								<div class='tree_row_container'></div>\
						   </div>")
		//目标row放在前面
		$(fold_row).prepend(row)
		//为目标row添加折叠状态
		$(fold_row).addClass("folding")
		//返回这个可折叠行
		return fold_row
	}

	//点击一个可折叠行的对象行，收起或折叠这个可折叠行
	$(document).on("click",".tree_fold_row > .tree_row",function(){
		changeFoldTreeRow(this)
	})

	//折叠或收起一个可折叠行
	function changeFoldTreeRow(tree_row){
		var fold_row = $(tree_row).closest(".tree_fold_row")
		//若已展开则收起
		if($(fold_row).is(".unfolding")){
			foldTreeRow(fold_row)
		}
		//若已收起则展开
		else if($(fold_row).is(".folding")){
			unfoldTreeRow(fold_row)
		}
	}

		//展开可折叠的行
		function unfoldTreeRow(fold_row){	
			//修改其折叠状态
			$(fold_row).removeClass("folding").addClass("unfolding")
			//获取这个折叠行的对象行
			var row = $(fold_row).children(".tree_row")
			//根据对象行的种类调用不同的展开函数
			if($(row).is(".tree_huabu_row")){
				unfoldTreeHuabuRow(fold_row,row)
			}
			else if($(row).is(".tree_tile_row")){
				unfoldTreeTileRow(fold_row,row)
			}
		}

		//展开可折叠的画布行
		function unfoldTreeHuabuRow(fold_row,huabu_row){
			//获取其中绑定的画布元素
			var huabu = getMiniBlockTarget($(huabu_row).children(".miniHuabu"))
			//遍历画布中的tile生成对应的磁贴子行
			$(huabu).find(".tile").each(function(){
				//分别制成磁贴行
				var tile_row = createTreeOfTileRow(this)
				//加入折叠行的子行容器
				$(fold_row).children(".tree_row_container").append(tile_row)
			})	
		}
		//展开可折叠的磁贴行
		function unfoldTreeTileRow(fold_row,tile_row){
			//获取其中绑定的磁贴元素
			var tile = getMiniBlockTarget($(tile_row).children(".miniTile"))
			//若嵌套了画布，则生成嵌套画布子行
			if($(tile).data("nest_huabu")!=null){
				//获得这个嵌套画布
				var nest_huabu = $("#"+$(tile).data("nest_huabu"))
				//做成一个画布行,不展开
				var nest_huabu_row = createTreeOfHuabuRow(nest_huabu)
				//塞进折叠容器中
				$(fold_row).children(".tree_row_container").append(nest_huabu_row)
			}
			//若内容块独立，则生成内容块子行
			if(!$(tile).prop("textblock_bindState")){
				//获得这个独立的内容块
				var textblock = $("#"+$(tile).data("textblock"))
				//做成一个内容块行，不展开
				var textblock_row = createTreeOfTextBlockRow(tile,textblock)
				//塞进折叠容器中
				$(fold_row).children(".tree_row_container").append(textblock_row)
			}
		}

	//收起折叠行，清空子行容器
	function foldTreeRow(fold_row){
		//若已收起则结束
		if($(fold_row).is("folding")){
			return false
		}
		//修改折叠状态
		$(fold_row).removeClass("unfolding").addClass("folding")
		//将其子行容器清空
		$(fold_row).children(".tree_row_container").empty()
	}



//生成内容树中的画布行
function createTreeOfHuabuRow(huabu){
	var huabu_row = $("<div class='tree_row tree_huabu_row'></div>")
	//生成迷你画布
	var mini_huabu = createMiniHuabu(huabu)
	//加入画布行中
	$(huabu_row).append(mini_huabu)
	//为其绑定画布
	$(huabu_row).data("huabu",huabu)

	//如果画布中存在磁贴，则返回可折叠行
	if($(huabu).find(".tile").length > 0){
		return createTreeOfFoldRow(huabu_row)
	}
	else{
		//返回可折叠的画布行
		return huabu_row
	}
}
//生成内容树中的磁贴行
function createTreeOfTileRow(tile){
	//生成磁贴行
	var tile_row = $("<div class='tree_row tree_tile_row'></div>")

	//生成迷你磁贴
	var mini_tile = createMiniTile(tile)
	//加入行中
	$(tile_row).append(mini_tile)
	
	//如果这个磁贴内嵌套了画布，或者和他绑定的内容块独立,则返回可折叠行
	if($(tile).data("nest_huabu")!=null || !$(tile).prop("textblock_bindState")){
		return createTreeOfFoldRow(tile_row)
	}
	else{
		//返回磁贴行
		return tile_row
	}
}
//生成内容树中的独立内容块行
function createTreeOfTextBlockRow(tile,textblock){
	//生成独立内容行
	var textblock_row = $("<div class='tree_row tree_textblock_row'></div>")

	//生成迷你内容块
	var mini_textblock = createMiniTextBlock(tile,textblock)
	//加入行中
	$(textblock_row).append(mini_textblock)
		
	//返回
	return textblock_row
	
}