//显示一张位于画面中心，且覆盖了背景蒙版的菜单
function showModalMenu(menu){
	//在body上显示一层蒙版
	$("body").append($("<div class='mask_overlay_background'></div>"))
	//显示画布
	$(menu).show()
	//在这之后若点击到了蒙版，则令该菜单隐藏
	$("body .mask_overlay_background").on("click",function(){
		hideModalMenu(menu)
	})
}
function hideModalMenu(menu){
	//隐藏该菜单
	$(menu).hide()
	//删除蒙版
	$("body").children('.mask_overlay_background').remove()
}


//令对应对象菜单显示在鼠标右键位置
function showObjectMenu(event,menu_name){
	event.stopPropagation()
	//禁止画布移动
	changeHuabuDragging(false)

	//选中的菜单
	var menu = $("#" + menu_name)

	//隐藏其他对象菜单，将对应菜单显示出来
	$(".object_menu").hide()
	$(menu).show()

	//获取鼠标位置
	var x = event.clientX
	var y = event.clientY
	//如果这个位置太低了，会让菜单的下方被覆盖，就让菜单显示在上方
	if(y + menu.height() >= $(window).height()){
		y = y - menu.height()
	}
	//将画布移到对应位置旁
	$(menu).offset({
		left:x+10,
		top:y+10
	})

	//监听事件,在左键点击非该菜单位置时令其隐藏
	$("#huabu_container").on("mousedown",function(event){
		event.stopPropagation()
		if(!$(menu).is(event.target) && event.button == 0){
			event.stopPropagation()
			hideObjectMenu(menu_name)
			$(this).off(event)
		}
	})
}
//令指定菜单隐藏
function hideObjectMenu(menu_name){
	//令所有画布内的菜单都隐藏
	if(menu_name == "all"){
		$(".object_menu").hide()
	}
	$("#" + menu_name).hide()
}

//令dom的子级菜单显示，这个子级菜单必须是dom的子元素
	//dom：函数触发者,菜单会其周围弹出
	//position：菜单弹出位置，包含“down”和“right”两种
	//type1:若为dblclick则在第二次点击时将其子菜单隐藏，否则不隐藏
	//type2:若为mouseleave则在鼠标移出该元素时令其子菜单隐藏
function showChildMenu(dom,position,type1,type2){
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
		var top  = $(dom).position().top + $(dom).outerHeight()
	}
	else if(position == "right"){
		var left = $(dom).position().left + $(dom).outerWidth()
		var top  = $(dom).position().top
	}

	$(menu).css({
		"position":"absolute",
		"display":"block",
		"left":left,
		"top":top
	})


	//阻止事件冒泡
	$(menu).on("click",function(event){
    	event.stopPropagation();
	})

	//点击到屏幕外则隐藏所有菜单
	$("body").on("click",function(event) {
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
	//parent：隐藏这个dom所在的菜单
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
	else if(type == "parent"){
		$(dom).closest(".menu").hide()
	}
}
