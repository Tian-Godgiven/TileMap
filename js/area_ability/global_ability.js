//禁用右键网页功能
document.addEventListener("contextmenu", function(e) {
  	e.preventDefault();
});

//在页面中引用菜单
function import_menus(){
	$("#global_ability").append($("<div>").load("./components/menu/colorpicker.html"));
	$("#global_ability").append($("<div>").load("./components/menu/huabu_menu.html"));
	$("#global_ability").append($("<div>").load("./components/menu/huabu_button_menu.html"));
	$("#global_ability").append($("<div>").load("./components/menu/tile_menu.html"));
	$("#global_ability").append($("<div>").load("./components/menu/MidwayDot_menu.html"));
}

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

function offsetWithHuabu(dom){
	//循环遍历这个元素直到找到huabu对象，期间其所有父元素的left/top加上自身的left/top就是相较于huabu的left/top
	var parent = $(dom).parent()
	var left = parseInt($(dom).css("left"))
	var top  = parseInt($(dom).css("top"))
	while(! $(parent).is(".huabu")){
		left += parseInt($(parent).css("left"))
		top  += parseInt($(parent).css("top"))
		parent = $(parent).parent()
	}
	return {left:left,top:top}
}

//显示其子级菜单函数
function showChildMenu(dom,position,type1,type2){
	//dom：函数触发者,菜单会其周围弹出
	//position：菜单弹出位置，包含“down”和“right”两种
	//type1:若为dblclick则在第二次点击时将其子菜单隐藏，否则不隐藏
	//type2:若为mouseleave则在鼠标移出该元素时令其子菜单隐藏
	var menu = $(dom).children(".menu");
	if(type1 == "dblclick"){
		//如果这个菜单已经被弹出了，则将其关闭
		var display = $(menu).css("display")
		if(display == "block"){
			hideMenu(dom,"me")
			return 0
		}
	}

	if(type2 == "mouseleave"){
		$(dom).on("mouseleave",function(event){
			hideMenu(dom,"me")
			$(this).off(event)
		})
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
		if(!$(dom).is(event.target)){
			hideMenu(dom,"all")
	    	$(this).off(event)
		}
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
		$(dom).siblings(".menu").hide()
	}
}


//滑块函数,点击下滑标题下滑出子元素，再次点击收起
$(document).on("mousedown",".slide_title",function(event) {
	event.stopPropagation()
	 if ($(event.target).is(".slide_title")) {
	 	$(this).stop()
	    $(this).children(".slide_inner:first").slideToggle(500)
	  }
})


//生成随机的20位ID
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
function toHTML(myString){
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

// 计算div沿中心旋转a度后，左上角相对于原本位置的水平距离和垂直距离
function rotatePositionChange(X, Y, a) {
  var radians = (a * Math.PI) / 180;
  var centerX = X / 2;
  var centerY = Y / 2;

  var topLeftX =
    centerX - (X / 2) * Math.cos(radians) + (Y / 2) * Math.sin(radians);
  var topLeftY =
    centerY - (Y / 2) * Math.cos(radians) - (X / 2) * Math.sin(radians);

  var horizontalDistance = topLeftX - centerX;
  var verticalDistance = topLeftY - centerY;

  return {left:horizontalDistance, top:verticalDistance};
}


//剪贴板对象，在用户进行了复制操作后，将对应的内容存入
var clipboard
//将内容存入剪贴板中
function pushClipboard(target){
	clipboard = target
}
//读取剪贴板中的内容
function popClipboard(){
	// //如果剪贴板中没有内容，则读取用户剪贴板中的内容
	// if(clipboard == undefined){
	// 	navigator.clipboard.readText()
	// 	    .then(text => {
	// 	      return text
	// 	    })
	// }
	// else{
		return clipboard
	// }
}

