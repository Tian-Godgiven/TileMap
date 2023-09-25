//本文件是画布区域顶部功能栏的功能实现，与画布对象有关的功能函数请参见"area_huabu.js"

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