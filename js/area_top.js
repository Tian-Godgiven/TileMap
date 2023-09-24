//功能栏按键

//点击在下方弹出子级菜单
$("#top_ability").on("click",".down_menu",function(event){
	event.stopPropagation();
	//如果这个菜单已经被弹出了，则将其关闭
	var display = $(this).children(".menu").css("display")
	if(display == "block"){
		hideMenu(this,"me")
	}
	else{
		//先将所有同级别菜单隐藏
		hideMenu(this,"all")
		//再弹出Dom对应的菜单
		showMenu(this,"down")
	}
})

//滑动在下方弹出子级菜单,但只有在已经点击弹出了菜单后才能启用
$("#top_ability").on("mouseenter",".down_menu",function(event){
	var slideable = false
	//判断是否已经有同级别的元素的菜单弹出
	$(this).siblings().children(".menu").each(function(){
		if($(this).css("display") == "block"){
			slideable = true;
			return 0;
		}
	})
	if(slideable){
		hideMenu(this,"all")
		showMenu(this,"down")
	}
})

//点击在右侧弹出子级菜单,但是不会使得其他菜单被屏蔽
$(".side_menu").on("click",function(event){
	event.stopPropagation();
	//如果这个菜单已经被弹出了，则将其关闭
	var display = $(this).children(".menu").css("display")
	if(display == "block"){
		hideMenu(this,"me")
	}
	else{
		hideMenu(this,"other")
		showMenu(this,"right")
	}
})

//文件按钮



//是否显示textblock功能
$("#textblock_able").on("click",function(){

	var textblock = $(".textblock")
	var able = $(textblock).attr("able")

	//如果此时已经将其永久隐藏（able = false)了那就切换成显示
	if(able == "false"){
        $(textblock).attr("able","true")
		$(this).css({
			"background-color":"white",
			"color":"black"
		})
		$(this).html('显示内容')

		showTileTextBlock(return_focusing_tile());
	}
	else{
        $(textblock).attr("able","false")
		$(this).css({
			"background-color":"black",
			"color":"white"
		})
		$(this).html('不显示内容')

		$(textblock).hide()
	}
})
	
//
