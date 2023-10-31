//右键Dot菜单选项事件1：增加分支，以该dot为dot_left，创建一个新的链接
$("#line_dotInner_create_branch").on("click",function(){
	createBranch(focusing_dot)//增加分支
})
//创建分支函数
function createBranch(dot){
	//如果点击的是midway_inner的话，要转换会line_dotMidway
	if($(dot).is(".line_dotMidway_inner")){
		dot = $(dot).parent(".line_dotMidway")
	}
	var list = $(dot).data("connected")

	//新链接中的left_dot,dot_inner,line_inner
	var line = $(dot).parent('.line')
	var dot_left = $(dot)
	var dot_right = $("<div>",{"class":"line_dot line_dotRight line_branch"})
	var dot_inner = $("<div>",{"class":"line_dot line_dotInner line_branch"})
	var line_inner = $(line).find(".line_inner:first").clone()

	//修改line_inner的角度使其不与该dot已经链接的线段重合
	var angle_list = []
	for(i in list){
		var connect_id = i //供下方的变化为midway使用
		angle_list[angle_list.length] = parseInt(list[i]["line_inner"].attr("angle"))
	}
	var biggest_angle = Math.max(...angle_list)
	var smallest_angle = 180 - Math.min(...angle_list)
	//获取最大和最小的两个角的中间值
	var the_angle = (biggest_angle + smallest_angle)/2
	//如果这一个dot_inner的话，那么两个角的大小一样，给角度+90使其出现在线段中央
	if($(dot).is(".line_dotInner")){
		the_angle += 360
	}
	var radian = Math.PI * the_angle /180

	//如果有原本的线条存在角的话，也要给dot_left加上
	if($(line).find(".line_arrow:first").length > 0){
		var arrow = $(line).find(".line_arrow:first").clone(false)
		$(arrow).attr("class","line_arrow line_arrow_right")
	}
	//创建新链接，加入三个dot中
	var new_connect = createConnect(dot_left,dot_right,dot_inner,line_inner)
	var right_list = {}
	right_list[new_connect[0]] = new_connect[1]

	//修改dot_left的list，加入新链接
	var left_list = $.extend(true, {}, list);
	left_list[new_connect[0]] = new_connect[1]
	$(dot_left).data("connected",left_list)
	//另外两个是新创建的dot，直接加入list便可
	$(dot_right).data("connected",right_list)
	$(dot_inner).data("connected",right_list)

	//创建线条，分别以line_inner,dot_inner,dot_right,arrow的顺序放在dot_left之后
	$(dot_left).after(line_inner)
	$(line_inner).after(dot_inner)
	$(dot_inner).after(dot_right)
	$(dot_right).after(arrow)
		abilityLineDot(dot_inner)
		abilityLineDot(dot_right)


	//如果这个dot是一个dot_inner则将该dot变为Midway使其成为一个分支点
	if($(dot).is(".line_dotInner")){
		//其list中只有一个connect，在上面遍历的时候获取了其id
		InnerTurnToMidway(dot,connect_id)
	}

	//使得dot_right出现在夹角位置，距离dot_left 100px
	var left = $(dot_left).offset().left
	var top = $(dot_left).offset().top
	var x = 100 * Math.cos(radian)
	var y = 100 * Math.sin(radian)

	$(dot_right).offset({
		left: left + x,
		top: top + y
	})
	//然后链接这个链接
	connectLineDot(dot_left,dot_right,dot_inner,line_inner)
}

//右键Dot菜单选项事件2：删除选定的分支，通过点击端点或line或中点选中对应的分支线段，然后删除
$("#line_dotInner_delete_branch").on("mouseenter click",function(event){
	event.stopPropagation()
	//清空原本的menu
	var menu = $(this).children(".menu")
	$(menu).empty()
	//获取focusing_dot的所有链接并填入菜单中
	var dot = focusing_dot
	var list = $(dot).data("connected")

	for(i in list){
		var div = $("<div>",{
			"id":i,
			"class":"delete_branch_option"
		})
		$(div).text(i)
		$(menu).append(div)
	}
	showChildMenu(this,"right","dblclick","mouseleave")
})
//点击选项删除对应的分支，但是最少会保留两个链接
$("#line_dotInner_delete_branch > .menu").on("click",".delete_branch_option",function(event){
	var dot = focusing_dot
	var list = $(dot).data("connected")
	var connect_id = $(this).text()
	//若连接数超过2
	if(Object.keys(list).length > 2){
		deleteBranch(dot,connect_id)
		list = $(dot).data("connected")
		$(this).remove()
	}
})
//css样式
$("#line_dotInner_delete_branch > .menu").on("mouseenter",".delete_branch_option",function(event){
	event.stopPropagation()
	var dot = focusing_dot
	var list = $(dot).data("connected")
	var connect_id = $(this).text()
	var connect = list[connect_id]
	var old_color = $(connect["line_inner"]).css("background-color")
	//将这个链接下的line_inner变成红色
	$(connect["line_inner"]).css({
		"background-color":"red"
	})
	//如果移出去了就变回来
	$(this).on("mouseleave",function(event){
		$(connect["line_inner"]).css({
			"background-color":old_color
		})
		$(this).off(event)
	})
})
//删除分支，删除指定dot的指定连接构成的分支以及该分支的所有链接
//要求这个Dot必须是分支的一个端点而非inner
function deleteBranch(dot,connect_id){
	var connect = $(dot).data("connected")[connect_id]
	if($(dot).is(connect["dot_inner"])){
		return false
	}

	var dot_left = connect["dot_left"]
	var dot_right = connect["dot_right"]
	var dot_inner = connect["dot_inner"]
	var line_inner = connect["line_inner"]

	//如果是左端点则删除右端点及其后面的箭头,反之同理
	if($(dot).is(dot_left)){
		var another_dot = dot_right
	}
	else{
		var another_dot = dot_left
	}

	//如果另一个Dot还有其他的链接，则遍历这些连接，递归执行本函数，直到全部删除
	var another_list = $(another_dot).data("connected")
	for(i in another_list){
		if( i != connect_id){
			deleteBranch(another_dot,i)
		}
	}

	$(another_dot).next(".line_arrow").remove()
	$(another_dot).remove()

	$(dot_inner).remove()
	$(line_inner).remove("")

	//最后从dot的list中删除这个connect
	delete $(dot).data("connected")[connect_id]
}

