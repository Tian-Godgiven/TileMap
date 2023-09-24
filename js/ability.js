//获取元素相较于父元素的left与top的值
function getLeft(the_dom){
	var the_Left=parseInt($(the_dom).css("left").substring(0, $(the_dom).css("left").length - 2));
	return the_Left
}
function getTop(the_dom){
	var the_Top=parseInt($(the_dom).css("top").substring(0, $(the_dom).css("top").length - 2));
	return the_Top
}

//显示其子级菜单函数
function showMenu(dom,position,type){
	//dom：函数触发者,菜单会其周围弹出
	//position：菜单弹出位置，包含“down”和“right”两种
	//type:若为dblclick则在第二次点击时将其隐藏，否则不隐藏
	var menu = $(dom).children(".menu");

	if(position == "down"){
		var left = $(dom).position().left
		var top  = $(dom).position().top + $(dom).height()
	}
	else if(position == "right"){
		var left = $(dom).position().left + $(dom).width()
		var top  = $(dom).position().top
	}

	$(menu).css({
		"display":"block",
		"left":left,
		"top":top
	})


	//阻止事件冒泡
	$(menu).on("click",function(event){
    	event.stopPropagation();
	})

	//点击到屏幕外则隐藏所有菜单
	$(document).on("click",function(event) {
	    hideMenu(dom,"all")
	    $(this).off(event)
	});
}

//隐藏菜单，选择type以隐藏同级别dom下的其他or一切菜单(包括dom自身的菜单和菜单的菜单)
//all：隐藏与dom同级别的下的一切菜单，包括自己的菜单
//me：隐藏自己的菜单，包括这个菜单的子菜单
//other：隐藏与Dom同级别的其他菜单，不包括自己的菜单
function hideMenu(dom,type){
	if(type == "all"){
		$(dom).siblings().find(".menu").hide()
		$(dom).find(".menu").hide()
	}
	else if(type == "me"){
		$(dom).find(".menu").hide()
	}
	else if(type == "other"){
		$(dom).siblings().find(".menu").hide()
	}
}


//滑块函数
$(".slide_title").on("mousedown",function() {
	 if ($(event.target).closest(".slide_inner").length > 0) {
	    return; // 如果点击到了子元素，不执行后续操作
	  }
	$(this).find(".slide_inner").slideToggle(500)
})


//html转义函数
function toHTML(myString)
{
    htmlString = myString.split("&lt;").join("<");
    htmlString = htmlString.split("&gt;").join(">");
    htmlString = htmlString.split("&quot;").join("\"");
    htmlString = htmlString.split("&apos;").join("\'");
    return htmlString;
}

//已知两直角边求角度
function getAngle(x,y){
	var angle = 360*Math.atan(y/x)/(2*Math.PI)
	//atan的局限性使得在x小于0时将角度偏转180度
	if(x >= 0){
		angle = 180 + angle
	}
	return angle;
}