//点击在下方弹出子级菜单
$(document).on("click",".down_menu",function(event){
	event.stopPropagation();
	//再弹出Dom对应的菜单
	showChildMenu(this,"down","dblclick")
})

//滑动在下方弹出子级菜单,但只有在已经点击弹出了菜单后才能启用
$(document).on("mouseenter",".down_menu",function(event){
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
		showChildMenu(this,"down")
	}
})

//点击在右侧弹出子级菜单,但是不会使得其他菜单被屏蔽
$(".menu").on("click",".side_menu",function(event){
	event.stopPropagation();
	showChildMenu(this,"right","dblclick")
})

//是否显示textblock功能
$("#textblock_able").on("click",function(){

	var able = $(this).prop("showable")
	if(able == undefined){
		able = true
	}

	//如果此时已经将其显示了那就切换成隐藏
	if(able){
		//令所有的textBlock都无法显示
        changeAllTextBlockShowable(false)
        //切换自身属性
        $(this).prop("showable",false)
		$(this).css({
			"background-color":"black",
			"color":"white"
		})
		$(this).html('隐藏磁贴内容')
	}
	//否则切换为显示
	else{
		//令所有的textBlock都可以显示
        changeAllTextBlockShowable(true)
        //修改自身属性
		$(this).prop("showable",true)
		$(this).css({
			"background-color":"white",
			"color":"black"
		})
		$(this).html('显示磁贴内容')

		$(".textblock").hide()
	}
})
	