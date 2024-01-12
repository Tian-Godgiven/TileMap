var lineInnerDot

//修改MidwayDot_menu的内容
function changeMidwayDotMenu(MidwayDot){
	//聚焦这个dot
	lineInnerDot = $(MidwayDot).data("lineInnerDot")
	//清空"删除分支"的子menu
	var menu = $("#MidwayDot_deleteBranch").children(".menu")
	$(menu).empty()
	
	//获取这个MidwayDot的所有链接线段并填入菜单中
	var list = $(MidwayDot).data("lineInner")
	for(i in list){
		//创建选项
		var lineInner = list[i][0]
		var div = $("<div>",{
			"class":"deleteBranch_option"
		})
		$(div).text("分支" + i)
		$(menu).append(div)

		//将对应的lineInner的内容与其绑定
		$(div).data("lineInner",lineInner)

		//如果这条线段链接着其他线段，则不允许其被删除，将对应的选项启用
		if(lineInner.data("lineInnerDot_left")  != undefined &&
		   lineInner.data("lineInnerDot_right") != undefined ){
			$(div).addClass("disabled")
		}
	}
	//如果选项数量不超过2，则将所有选项禁用
	if(list.length<=2){
		$(".deleteBranch_option").addClass("disabled")
	}
}

//右键Dot菜单选项事件1：增加分支，在这个位置增加一条额外的lineInner
$("#MidwayDot_createBranch").on("click",function(){
	createBranch()//增加分支
})
//创建分支函数
function createBranch(){
	//获取需要用到的对象
	var line = $(lineInnerDot).parent(".line")
	var lineInner = $(line).children(".lineInner").first()
	//随机获得一个角度
	var angle = Math.floor(Math.random() * 361)
	//以最右侧的lineInner为原本创建一个lineInner作为分支Branch
	var height = lineInner.height()
	var style = lineInner.data("style")
	var Branch = createLineInner("100px",height,style)
	
	//将这个分支添加到line对象当中,放在lineInnerDot对象后
	$(lineInnerDot).after(Branch)
	//将这个分支与lineInnerDot绑定
	$(Branch).data("lineInnerDot_left",$(lineInnerDot))

	//移动分支的位置并旋转
	var left = parseInt($(lineInnerDot).css("left")) + $(lineInnerDot).width()/2
	var top = parseInt($(lineInnerDot).css("top"))
	$(Branch).css({
		left:left,
		top:top
	})
	rotateDom(Branch,angle,"change")

	hideLineDot(line)
	showLineDot(line)

	hideHuabuMenu("MidwayDot_menu")
}

//右键Dot菜单选项事件2：删除选定的分支，通过点击端点或line或中点选中对应的分支线段，然后删除
$("#MidwayDot_deleteBranch").on("mouseenter click",function(event){
	event.stopPropagation()
	showChildMenu(this,"right","dblclick","mouseleave")
})
//点击选项删除对应的分支，但是最少会保留两个链接
$("#MidwayDot_deleteBranch > .menu").on("click",".deleteBranch_option",function(event){
	//如果该选项可以被选用，并且当前可删除的分支数大于2
	if(!$(this).is(".disabled") && $("#MidwayDot_deleteBranch > .menu").children().length > 2){
		var lineInner = $(this).data("lineInner")
		var line = $(lineInner).parent(".line")
		//删除对应的分支
		hideLineDot(line)
		lineInner.remove()
		//重新生成lineDot
		showLineDot(line)
		//删除这个选项本身
		$(this).remove()
		hideHuabuMenu("MidwayDot_menu")
	}
})
//鼠标移动到分支选项时，令对应的分支颜色变红
$("#MidwayDot_deleteBranch > .menu").on("mouseenter",".deleteBranch_option",function(event){
	event.stopPropagation()
	var lineInner= $(this).data("lineInner")
	var old_color = $(lineInner).css("background-color")
	//将这个链接下的line_inner变成红色
	$(lineInner).css({
		"background-color":"red"
	})
	//如果移出去了就变回来
	$(this).on("mouseleave",function(event){
		$(lineInner).css({
			"background-color":old_color
		})
		$(this).off(event)
	})
})


