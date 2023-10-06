//返回某个画布内元素与当前聚焦画布左上角的距离
function distantWithHuabu(dom){
	var huabu = return_focusing_huabu()
	var scale = $(huabu).attr("scale")
	//因为元素在画布内部所以left和top都更大，所以要取负
	var left_distance = - ($(huabu).offset().left - $(dom).offset().left) / scale
	var top_distance = - ($(huabu).offset().top - $(dom).offset().top) / scale
    
    var distance = {left:left_distance,top:top_distance}
	return distance
}

//显示其子级菜单函数
function showChildMenu(dom,position,type){
	//dom：函数触发者,菜单会其周围弹出
	//position：菜单弹出位置，包含“down”和“right”两种
	//type:若为dblclick则在第二次点击时将其隐藏，否则不隐藏
	var menu = $(dom).children(".menu");
	if(type == "dblclick"){
		//如果这个菜单已经被弹出了，则将其关闭
		var display = $(menu).css("display")
		if(display == "block"){
			hideMenu(dom,"me")
			return 0
		}
	}
	
	//先将所有同级别菜单隐藏
	hideMenu(dom,"all")

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
function hideMenu(dom,type){
	//type的可选值
	//all：隐藏与dom同级别的下的一切菜单，包括自己的菜单
	//me：隐藏自己的菜单，包括这个菜单的子菜单
	//other：隐藏与Dom同级别的其他菜单，不包括自己的菜单
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


//生成随机的ID
function createRandomId() {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var id = '';
  for (var i = 0; i < 20; i++) {
    var randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  }
  return id;
}


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