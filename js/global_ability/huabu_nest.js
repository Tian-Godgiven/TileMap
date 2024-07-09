//嵌套关系
	//将画布嵌套进tile，令这个画布变为嵌套画布
	function nestHuabuToTile(tile,huabu){
		if($(tile).prop("lock")){
			return false
		}
		//为磁贴添加属性
		$(tile).addClass("nested_tile")
		$(tile).data("nest_huabu",$(huabu).attr("id"))
		//为画布添加来源画布栈
		$(huabu).addClass("nest_huabu")
		$(huabu).data("sourceHuabu_stack",[])
	}

	//解除磁贴与画布的嵌套关系
	//画布不用管，所有判定画布是否为嵌套的画布的操作都基于进入嵌套画布的来源栈
	function unnestHuabuTile(tile){
		//删除磁贴属性
		$(tile).removeClass("nested_tile")
		$(tile).data("nest_huabu",null)
		//隐藏“进入画布按键”
		$(".openNestedHuabuButton").hide()
	}

//各种创建嵌套画布的方式
	//创建新画布并将其嵌套到tile上
	function createNewNestHuabu(tile){
		//创建新画布
		createNewHuabuMenu().then((huabu) => {
			//将画布绑定到tile上
			nestHuabuToTile(tile,huabu)
			//通过tile打开画布
			openNestedHuabu(tile,huabu)
		})	
	}

	//备忘录，没做完
	//导入画布文件并嵌套
	function insertFileNestHuabu(tile){
		//将选中的画布变成嵌套画布，并嵌套进tile中
	}


//打开一个嵌套画布
function openNestedHuabu(source,nested_huabu){
	//通过source的类型，获得来源画布
	if($(source).is(".tile")){
		//若tile设置了禁止打开画布，则停止
		if($(source).prop("nestSet_noOpen")){
			return false
		}
		//否则将这个磁贴所在的画布设定为来源画布
		else{
			var source_huabu = $(source).parents(".huabu")
		}

		if($(nested_huabu).data("sourceHuabu_stack") == null){
			nestHuabuToTile(source,nested_huabu)
		}

		//此外，如果没有设定打开目标，则默认为这个磁贴绑定的嵌套画布
		if(nested_huabu == null){
			nested_huabu = $("#"+$(source).data("nest_huabu"))
		}
	}
	//如果是画布，则直接设定该画布为来源画布
	else if($(source).is(".huabu")){
		var source_huabu = source
	}

	if($(nested_huabu).data("sourceHuabu_stack") == undefined){
		//为画布添加来源画布栈
		$(nested_huabu).addClass("nest_huabu")
		$(nested_huabu).data("sourceHuabu_stack",[])
	}
	
	//将源画布保存进"来源画布"栈
	$(nested_huabu).data("sourceHuabu_stack").push(source_huabu)
	//为嵌套画布保存“进入其的源头”
	$(nested_huabu).data("nest_from",source)

	//显示这个画布
	showNestedHuabu(nested_huabu)
}

//显示一个嵌套画布
function showNestedHuabu(nested_huabu){
	//移除其隐藏标识
	$(nested_huabu).removeClass("hide")
	//为嵌套画布生成一个底部button，该函数内置重复判定，不会重复生成
	createHuabuButton(nested_huabu)
	//切换到这个画布
	changeHuabu(nested_huabu)



	//动画：由tile为源点，嵌套画布逐渐扩大
}
//返回上一层画布并关闭当前嵌套画布
function returnNestFrom(nested_huabu){
	//获取画布来源栈栈顶
	var source_huabu = $(nested_huabu).data("sourceHuabu_stack").pop()
	if(source_huabu){
		//关闭嵌套画布
		closeNestedHuabu(nested_huabu)
		//如果这个画布是一个嵌套画布，并且正在被隐藏，则令其显示，但不进入堆栈
		if($(source_huabu).is(".hide")){
			showNestedHuabu(source_huabu)
		}
		//否则直接切换过去就行
		else{
			changeHuabu(source_huabu)
		}
	}
}

//关闭嵌套画布，返回其来源的上一层画布
function closeNestedHuabu(nested_huabu){
	//令其隐藏
	$(nested_huabu).addClass("hide")
	$(nested_huabu).hide()
	
	//删除这个画布的底部button
	deleteHuabuButton(nested_huabu)
	//返回上一层画布
	returnNestFrom(nested_huabu)
	//动画：嵌套画布逐渐缩小
}