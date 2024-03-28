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

//点击删除聚焦对象
$("#huabu_ability_Delete").on("click",function(){
	deleteFocusingObject()
})

//点击从嵌套画布返回上一层画布
$("#huabu_ability_returnNestFrom").on("click",function(){
	//验证当前画布是否为嵌套画布
	var huabu = return_focusing_huabu()
	if($(huabu).is(".nested_huabu")){
		//返回上一层画布
		returnNestFrom(huabu)
	}
})

//点击关闭当前嵌套画布
$("#huabu_ability_closeNestHuabu").on("click",function(){
	//验证当前画布是否为嵌套画布
	var huabu = return_focusing_huabu()
	if($(huabu).is(".nested_huabu")){
		//关闭嵌套画布，返回上一层画布
		closeNestedHuabu(huabu)
	}
})