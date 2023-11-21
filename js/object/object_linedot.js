//创建LineDot对象并加入画布
function createLineDot(lineInner_Object,position,[x,y]){
	//创建LineDot对象并加入画布
	var LineDot = $("<div>",{class:"LineDot dot"})
	$(return_focusing_huabu()).find('.dot_container').append(LineDot)
	
	//为其赋予功能
	abilityLineDot(LineDot)

	//放置在指定位置
	positionDot(LineDot,[x,y])

	//如果是midway，则
	if(position == "Midway"){
		//为midwayDot赋予功能
		abilityMidwayDot(LineDot)
		//将其与lineInnerDot绑定
		$(LineDot).data("lineInnerDot",lineInner_Object)
		$(lineInner_Object).data("MidwayDot",LineDot)
	}
	//否则就与lineInner双向绑定
	else{
		$(lineInner_Object).data("LineDot").push(LineDot)
		$(LineDot).data("lineInner").push([lineInner_Object,position])
	}
	
	return LineDot
}

//在线条的两端和中间显示LineDot,LineDot放置在huabu的dot_container中
function showLineDot(line){

	var radius = returnDotRadius()
	//获取line对象的位置信息
	var line_left = parseInt($(line).css("left"))
	var line_top = parseInt($(line).css("top"))

	//遍历line中的LineInnerDot,为其绑定MidwayDot
	$(line).children(".lineInnerDot").each(function(){
		var width = $(this).width()/2
		var the_left = parseInt($(this).css("left")) + line_left
		var the_top  = parseInt($(this).css("top"))  + line_top
		var MidwayDot = createLineDot(this,"Midway",[the_left+width,the_top+width])
	})

	//遍历line中的LineInner,为其绑定LineDot
	$(line).children(".lineInner").each(function(){
		var lineInner = $(this)
		//获取子元素的位置信息
		var the_left = parseInt(lineInner.css("left")) + line_left
		var the_top  = parseInt(lineInner.css("top"))  + line_top
	
		var width = lineInner.width();
		var height = lineInner.height();
		var angle = lineInner.attr("angle");
		var radians = angle * Math.PI/180;

		//获取这个线段绑定的lineInnerDot
		var LeftDot = lineInner.data("lineInnerDot_left")
		var RightDot = lineInner.data("lineInnerDot_right")

		//如果LeftDot为空，为这条线段绑定一个LeftDot
		if(LeftDot == undefined){
			//在左侧创建一个LineDot
			LeftDot = createLineDot(lineInner,"Left",[the_left,the_top + height/2])
		}
		//否则将LeftDot绑定给线段
		else{
			LeftDot = $(LeftDot).data("MidwayDot")
			lineInner.data("LineDot").push(LeftDot)
			$(LeftDot).data("lineInner").push([lineInner,"Left"])
		}
		
		//如果RightDot为空，为这条线段绑定一个RightDot
		if(RightDot == undefined){
			//在右侧创建一个LineDot
			var right_x = the_left + width*Math.cos(radians)
			var right_y = the_top + width*Math.sin(radians) + height/2
			RightDot = createLineDot(lineInner,"Right",[right_x,right_y])
		}
		//否则将RightDot绑定给线段
		else{
			RightDot = $(RightDot).data("MidwayDot")
			lineInner.data("LineDot").push(RightDot)
			$(RightDot).data("lineInner").push([lineInner,"Right"])
		}
		//最后将RightDot与lineInner绑定
		lineInner.data("RightDot",RightDot)

		//为长度达标的线段创建CenterDot
		if(width >= radius*2){
			//放置在线段中心
			var center_left = the_left + width*Math.cos(radians)/2
			var center_top = the_top + width*Math.sin(radians)/2 + height/2
			var CenterDot = createLineDot(lineInner,"Center",[center_left,center_top])
			//额外绑定一个数据与class
			lineInner.data("CenterDot",CenterDot)
			$(CenterDot).addClass("CenterDot")
		}
	})
}

//将对应线条的LineDot删除
function hideLineDot(line){
	$(line).find(".lineInner").each(function(){
		var $lineInner = $(this)
		var dots = $lineInner.data('LineDot')
		if($(dots).length != 0){
			for(i in dots){
				$(dots[i]).remove()
			}
			$lineInner.data("LineDot",[])
		}
	})
}

//dot的功能
function abilityLineDot(LineDot){
	//线条存储对象
	$(LineDot).data("lineInner",[])

	//拖拽，会带动对应的线段
	$(LineDot).draggable({
		drag:function(event){
			var lineInnerData = $(LineDot).data("lineInner")
			if($(LineDot).is(".MidwayDot")){
				//如果是MidwayDot,意味着这个点连接着数个线段，遍历其lineData移动对应的线段
				for( i in lineInnerData){
					dragLineDot(LineDot,lineInnerData[i])
				}
			}
			else{
				dragLineDot(LineDot,lineInnerData[0])
			}
		},
		stop:function(event){
			if($(LineDot).is(".MidwayDot")){
				var lineInnerData = $(LineDot).data("lineInner")
				//若MidwayDot只连接这两个线段时，若这两条线段持平，则令其合二为一
				if(lineInnerData!= undefined && lineInnerData.length == 2){
					var angle_1 = lineInnerData[0][0].attr("angle")
					var angle_2 = lineInnerData[1][0].attr("angle")
					var tmp1 = angle_1 + angle_2
					var tmp2 = angle_1 - angle_2
					var lineInnerDot = $(LineDot).data("lineInnerDot")
					if((tmp1 <=1 && tmp1 >=-1) || (tmp2 <=1 && tmp2 >=-1)){
						combineLineInner(lineInnerData[0][0],lineInnerData[1][0],lineInnerDot)
					}
					else if(lineInnerData[0][1] == lineInnerData[1][1]){
						if( 177 <= Math.abs(angle_1) + Math.abs(angle_2) <=180){
							combineLineInner(lineInnerData[0][0],lineInnerData[1][0],lineInnerDot)
						}
					}
				}
			}
		}
	})
}

//拖动LineDot的函数，令对应的LineInner移动
function dragLineDot(LineDot,lineInnerData){
	var lineInner = $(lineInnerData[0])
	var position = lineInnerData[1]
	var height = lineInner.height()
	var radius = $(LineDot).width()/2
	//左dot的移动
	if(position == "Left"){
		var x1 = parseInt($(LineDot).css("left")) + radius
		var y1 = parseInt($(LineDot).css("top"))  - (height/2 - radius)
		//获取这个dot对应的右dot的位置
		var RightDot = lineInner.data("RightDot")
		var x2 = parseInt($(RightDot).css("left")) + radius
		var y2 = parseInt($(RightDot).css("top"))  - (height/2 - radius)
		positionLine(lineInner,[x1,y1],[x2,y2])
	}
	//右dot的移动
	else if(position == "Right"){
		var x2 = parseInt($(LineDot).css("left")) + radius
		var y2 = parseInt($(LineDot).css("top")) - (height/2 - radius)
		positionLine(lineInner,null,[x2,y2])
	}
	//中点dot的移动，令这个线段一分为二
	else if(position == "Center"){
		if($(LineDot).is(".CenterDot")){
			//首先令线段一分为二
			separateLineInner(lineInner)
			//然后令这个dot变成MidwayDot
			$(LineDot).removeClass("CenterDot").addClass("MidwayDot")
		}
	}
}



//MidwayDot的功能
function abilityMidwayDot(MidwayDot){
	//添加类
	$(MidwayDot).addClass("MidwayDot")
	//右键显示子菜单
	var statrX,startY
	$(MidwayDot).on("mousedown",function(event){
		//判断是否为右键
		if(event.button == 2){
			startX = event.clientX;
			startY = event.clientY;
		}
		hideHuabuMenu("all")
	})

	$(MidwayDot).on("mouseup",function(event){
		if(startX == event.clientX && startY == event.clientY && event.button == 2){
			//显示该菜单，并将这个dot作为focusing_dot
			showHuabuMenu(event,"MidwayDot_menu",MidwayDot)
			changeMidwayDotMenu(MidwayDot)
		}
	})
}

