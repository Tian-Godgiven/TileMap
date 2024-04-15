//本文件是画布区域顶部功能栏的功能实现，与画布对象有关的功能函数请参见"area_huabu.js"

//点击增加当前画布的scale，也就是令画布放大
$("#huabu_ability_ScaleUp").on("click",function(){
	enlargeHuabu()
})

//在顶部功能栏显示当前画布的缩放大小，在画布切换，放大缩小时调用
function showHuabuScale(huabu){
	var scale = Math.round($(huabu).attr("scale") * 100) +"%"
	$("#huabu_ability_ScaleShow").children().text(scale)
}

//点击减少当前画布的scale，也就是令画布变小
$("#huabu_ability_ScaleDown").on("click",function(){
	narrowHuabu()
})

//撤销
$("#huabu_ability_Undo").on("click",function(){
	undo()
})

//重做
$("#huabu_ability_Redo").on("click",function(){
	redo()
})

//点击删除聚焦对象
$("#huabu_ability_Delete").on("click",function(){
	deleteFocusingObject()
})


//点击修改当前画布内所有聚焦元素的zindx上升
$("#huabu_ability_ZIndexUp").on("click",function(){
	upZIndexFocusingObject()
})
//点击修改当前画布内所有聚焦元素的zindx下降
$("#huabu_ability_ZIndexDown").on("click",function(){
	downZIndexFocusingObject()
})



//点击改变当前聚焦的线条样式，并且令线条总样式改变
$("#huabu_ability_lineStyle_option > div").on("click",function(){
	var style = $(this).attr("value")
	//获取当前的聚焦对象
	var object = return_focusing_object(".line")
	if(object){
		//改变聚焦的线条的样式
		styleLine(object,style)
	}
	//修改线条总样式
	var the_style = {line_style : style}
	changeLineStyle(the_style)
})
//点击改变当前聚焦的线条箭头，并且令线条总样式改变
$("#huabu_ability_startArrow").on("click",function(){
	//获取当前的聚焦对象
	var object = return_focusing_object(".line")
	//附加前箭头
	if(!$(this).is(".checked")){
		if(object){
			arrowLine(object,"start")
		}
		//修改线条总样式
		var the_style = {start_arrow : "arrow"}
		changeLineStyle(the_style)
		//切换当前元素的聚焦
		$(this).addClass('checked')
	}
	//取消前箭头
	else{
		if($(object).is(".line")){
			unarrowLine(object,"start")
		}
		//修改线条总样式
		var the_style = {start_arrow : "none"}
		changeLineStyle(the_style)
		//切换当前元素的聚焦
		$(this).removeClass('checked')
	}
	
})
//点击改变当前聚焦的线条箭头，并且令线条总样式改变
$("#huabu_ability_endArrow").on("click",function(){
	//获取当前的聚焦对象
	var object = return_focusing_object(".line")
	//附加后箭头
	if(!$(this).is(".checked")){
		if(object){
			arrowLine(object,"end")
		}
		//修改线条总样式
		var the_style = {end_arrow : "arrow"}
		changeLineStyle(the_style)
		//切换当前元素的聚焦
		$(this).addClass('checked')
	}
	//取消后箭头
	else{
		if($(object).is(".line")){
			unarrowLine(object,"end")
		}
		//修改线条总样式
		var the_style = {end_arrow : "none"}
		changeLineStyle(the_style)
		//切换当前元素的聚焦
		$(this).removeClass('checked')
	}
})


//点击改变当前聚焦的线条的连接类型，并且令总线条样式改变
$("#huabu_ability_lineType_option > div").on('click',function(){
	var type = $(this).attr("value")
	//获取当前的聚焦对象
	var object = return_focusing_object(".line")
	if(object){
		//改变聚焦的线条的样式
		typeLine(object,type)
	}
	//修改线条总样式
	var the_style = {type : type}
	changeLineStyle(the_style)
})

//备忘
//插入元素


//点击从嵌套画布返回上一层画布
$("#huabu_ability_returnNestFrom").on("click",function(){
	//验证当前画布是否能够返回
	var huabu = return_focusing_huabu()
	//如果这个画布能够返回到某一个画布中(也就是其源头栈不为空)
	var stack = $(huabu).data("sourceHuabu_stack")
	//如果源头栈为空
	if(stack != undefined && stack.length != 0){
		//返回上一层画布
		returnNestFrom(huabu)
	}
})

//点击关闭当前嵌套画布
$("#huabu_ability_closeNestHuabu").on("click",function(){
	//验证当前画布是否为嵌套画布
	var huabu = return_focusing_huabu()
	//如果这个画布能够返回到某一个画布中(也就是其源头栈不为空)
	var stack = $(huabu).data("sourceHuabu_stack")
	//如果源头栈为空
	if(stack != undefined && stack.length != 0){
		//关闭嵌套画布，返回上一层画布
		closeNestedHuabu(huabu)
	}
})