//点击在当前画布内生成一条线
function createStyleLine(){
	var width = "300px";
	var height = "30px";
	var style = {color : "black",
				 lineStyle : "solid",
				 lineStyle_width : "0px"}

	var line = createLine(width,height,style)

		// creatArrow(line,"right","arrow_1")
		// creatArrow(line,"left","arrow_1")
}

var focusing_line
//生成一个线条对象,其本质是一个div元素包裹的条形div
function createLine(width,height,style){
	var line_id = "line_" + createRandomId()
	var line = $("<div>",{
		"class": "line object",
		"id": line_id,
	})
	//创建lineInner
	var lineInner = createLineInner(width,height,style)
	//放进画布的object_container里面
	$(line).append(lineInner)
	$(return_focusing_huabu().find('.object_container')).append(line); 

	//为线条附加功能
	abilityLine(line)
	//创建后聚焦该线条
	focusingObject(line,"click")
}
//创建一条线段，这是组成线条对象的元素
function createLineInner(width,height,style){
	//创建一条普通的line_inner
	var lineInner = $("<div>",{
		"class": "lineInner",
		"angle":"0"
	})
	$(lineInner).data("style",style)
	//为这个元素创建绑定点数据
	$(lineInner).data("LineDot",[])
	//css修饰
	var color = style.color
	var lineStyle = style.lineStyle
	var lineStyle_width = style.lineStyle_width

	$(lineInner).css({
		width:width,
		height:height,
		backgroundColor:color,
	})

	return lineInner
}

//线条的功能
function abilityLine(line){
	//拖拽
	$(line).draggable({
		drag:function(){
			hideLineDot(line)
		},
		stop:function(){
			showLineDot(line)
		}
	})
	$(line).on("mousedown",function(event){
		hideHuabuMenu("all")
		focusingObject(line,"click")
	})
}

//聚焦line,在两端和中间分别显示dot
function focusingLine(line){
	//修改focusing_line
	focusing_line = line
		//暂时不知道这个的作用是什么
		// if($(line).is(".line_selected")){return false}
	//显示LineDot
	showLineDot(line)
}

function unfocusingLine(line){
	focusing_line = undefined;
	hideLineDot(line)
}

//改变线段起始点
function positionLine(lineInner,positionLeft,positionRight){
	var line = $(lineInner).parent('.line')
	var line_left = parseInt($(line).css("left"))
	var line_top = parseInt($(line).css("top"))
	//左端点位置
	if(positionLeft == null){
		left_x = parseInt($(lineInner).css("left"))
		left_y = parseInt($(lineInner).css("top"))
		x1 = left_x + line_left;
		y1 = left_y + line_top
	}
	else{
		x1 = positionLeft[0]
		y1 = positionLeft[1]
		left_x = x1 - line_left
		left_y = y1 - line_top
	}
	
	//右端点位置
	if(positionRight == null){
		alert("必须提供右端点位置")
	}
	else{
		x2 = positionRight[0]
		y2 = positionRight[1] 
		right_x = x2 - parseInt($(line).css("left"))
		right_y = y2 - parseInt($(line).css("top"))
	}

	//计算得到旋转角度
	var angle;
	if(left_x === right_x){
	    if(left_y < right_y){
	        angle = 90;  //垂直向下
	    } 
	    else{
	        angle = -90;  //垂直向上
	    }
	} 
	else if(left_y === right_y){
	    if(left_x < right_x){
	        angle = 0;  // 从左到右
	    } 
	    else{
	        angle = 180;  // 从右到左
	    }
	} 
	else{
	    angle = Math.atan2(right_y - left_y, right_x - left_x) * (180 / Math.PI)
	}
	//计算得到线条长度
	var distance = Math.sqrt(Math.pow(right_x - left_x, 2) + Math.pow(right_y - left_y, 2));
	
	//修改线段的属性
	$(lineInner).css({
		left:left_x,
		top:left_y,
		width:distance,
	})
	//令其旋转对应的角度
	rotateDom(lineInner,angle,"change")

	//如果这个线段之前有一个lineInnerDot,则将其移动到线段的前方
	var lineInnerDot = $(lineInner).prevAll(".lineInnerDot").first()
	if($(lineInnerDot).length > 0){
		var height = $(lineInnerDot).height()
		$(lineInnerDot).css({
			top: left_y,
			left: left_x - height/2
		});
	}

	//将中点放在line中心位置
	var CenterDot = $(lineInner).data("CenterDot")
	var DotWidth = $(CenterDot).width()
	positionDot(CenterDot,[(x1+x2)/2,(y1+y2)/2 + DotWidth])
}

//令线段一分为二,在其中间加入线条中心点
function separateLineInner(lineInner){
	$lineInner = $(lineInner)
	var line = $lineInner.parent(".line")
	var height = $lineInner.height()
	var width = $lineInner.width()
	var style = $lineInner.data("style")
	var old_left = parseInt($lineInner.css("left"))
	var old_top = parseInt($lineInner.css("top"))
	var angle = $lineInner.attr("angle")
	var radians = angle*Math.PI/180
	//计算得到原线段中点的位置
	var new_left = old_left + width/2 * Math.cos(radians)
	var new_top = old_top + width/2 * Math.sin(radians)

	//创建一个新的线段，这个线段的样式是原线段的拷贝，会放在原线段的右侧
	var $new_lineInner = $(createLineInner(width/2,height,style))
	//将原线段绑定的LineInnerDot_right绑定给新的线段
	var old_right = $lineInner.data("lineInnerDot_right")
	$new_lineInner.data("lineInnerDot_right",old_right)

	//创建一个新的lineInnerDot，并与其左右两个线段绑定
	var lineInnerDot = createLineInnerDot($lineInner,$new_lineInner,[new_left - height/2,new_top])
	//将新的线段放进线条中
	$(lineInnerDot).after($new_lineInner)

	//修改两条线段的样式
	//旧线段长度减半
	$lineInner.css({
		width:width/2
	})
	//新线段移动到原本的线段的中间位置
	$new_lineInner.css({
		left:new_left,
		top:new_top,
	})
	rotateDom($new_lineInner,angle,"change")

	//最后重新生成线条的dot
	hideLineDot(line)
	showLineDot(line)
}

//令两条线段合二为一
function combineLineInner(lineInner_1,lineInner_2,lineInnerDot){
	var $lineInner_1 = $(lineInner_1)
	var $lineInner_2 = $(lineInner_2)
	//获取相关数据
	var width_1 = $lineInner_1.width()
	var width_2 = $lineInner_2.width()
	//暂时隐藏LineDot
	var line = $lineInner_1.parent(".line")
	hideLineDot(line)

	//并将靠后的lineInner所绑定的lineInnerDot_right绑定给他
	var right_dot = $lineInner_2.data("lineInnerDot_right")
	if(right_dot == undefined){
		//不能将值直接定义为undefined，但是在js中null == undefined
		$lineInner_1.data("lineInnerDot_right",null)
	}
	else{
		$lineInner_1.data("lineInnerDot_right",right_dot)
	}

	//删除较为靠后的lineInner和lineInnerDot
	$(lineInnerDot).remove()
	$lineInner_2.remove()
	//修改较为靠前的线段的css
	$lineInner_1.css({
		width:width_1 + width_2
	})

	//重新生成线条的dot
	showLineDot(line)
}


function createLineInnerDot(lineInner_Left,lineInner_right,[x,y]){
	var style = lineInner_Left.data("style")
	var color = style.color
	var height = lineInner_Left.height()
	//创建一个润滑点，这个点会与这两条线段绑定
	var lineInnerDot = $("<div>",{
		class:"lineInnerDot"
	})
	//放进线条中
	lineInner_Left.after(lineInnerDot)
	//修改样式
	$(lineInnerDot).css({
		position:"absolute",
		left:x,
		top:y,
		height:height,
		width:height,
		backgroundColor:color,
		borderRadius:"50%"
	})
	//绑定数据
	lineInner_Left.data("lineInnerDot_right",lineInnerDot)
	lineInner_right.data("lineInnerDot_left",lineInnerDot)

	return lineInnerDot
}


// //为选中的线条增添一个不同方向的Arrow
// function createArrowRight(){
// 	var line = focusing_line
// 	//如果没有选中则跳过
// 	if(line == undefined){
// 		return 0
// 	}
// 	creatArrow(line,"right","arrow_1")
// }
// function createArrowLeft(){
// 	var line = focusing_line
// 	//如果没有选中则跳过
// 	if(line == undefined){
// 		return 0
// 	}
// 	creatArrow(line,"left","arrow_1")
// }




// //创建箭头,在给定line的给定方向的最边缘端点处放置一个箭头，这个箭头的顶点是这个dot的圆心，箭头会随着line的角度变化而变化
// function creatArrow(line,direction,style){
// 	//得到dot对象
// 	if(direction == "left"){
// 		var dot = $(line).children(".line_dotLeft")
// 	}
// 	else if(direction == "right"){
// 		var dot = $(line).children(".line_dotRight")
// 	}
// 	//如果箭头对象已经存在则跳过
// 	if($(dot).next().is(".line_arrow")){
// 		return 0
// 	}

// 	//箭头对象是一个父元素div内的div包裹img，这个父元素用于定位，这个div用于旋转，这个img是箭头的图形
// 	var arrow = $("<div>",{"class":"line_arrow line_arrow_" + direction})
// 	var arrow_inner = $("<div>",{"class":"line_arrow_inner"})
// 	var arrow_img = new Image()
// 	arrow_img.src = "./img/" + style +".png"

// 	//把做好的箭头放进line对象里具体位置是对应dot的后面
// 	$(arrow_inner).append(arrow_img)
// 	$(arrow).append(arrow_inner)
// 	$(dot).after(arrow)

// 	changeArrow(arrow)
// 	dragLineDot(dot)
// }

// //修改某个arrow的位置使其能够对准所处的线段上
// function changeArrow(arrow){
// 	//取操作对象
// 	var line = $(arrow).parent('.line')
// 	var arrow_inner = $(arrow).children()
// 	var arrow_img = $(arrow_inner).children()
// 	var dot = $(arrow).prev(".line_dot")
// 	//箭头只与端点绑定，而端点只有一个链接
// 	var list = $(dot).data("connected")
// 	for(i in list){
// 		var line_inner = list[i]["line_inner"]
// 	}

// 	//根据箭头的方向选择箭头附着的dot
// 	if($(dot).is(".line_dotLeft")){
// 		//是左侧点，要+270度
// 		var basic_angle = 270
// 	}
// 	else if($(dot).is(".line_dotRight")){
// 		//是右侧侧点，要+90度
// 		var basic_angle = 90
// 	}

// 	//获取圆心的位置
// 	var radius = $(dot).width()/2 * return_huabu_scale()
// 	var x = $(dot).offset().left + radius
// 	var y = $(dot).offset().top + radius

// 	//获取对应线段的粗度颜色和角度
// 	var thick = $(line_inner).height()
// 	var angle = parseInt($(line_inner).attr("angle"))
// 	var color = $(line_inner).css("background-color")

// 	if(isNaN(angle)){
// 		angle = 0;
// 	}
// 	angle = basic_angle + angle

// 	//箭头的宽度和高度与线条正相关
// 	var width = (thick*1.5 + 15)
// 	var height = (thick*1.2 + 10)

// 	//修饰arrow_inner，其中arrow的颜色与线条相同，大小比线条的粗度稍大，角度根据其dot有所变化
// 	$(arrow_inner).css({
// 		"position":"absolute",
// 		"left":-width / 2,
// 		"text-indent":-width,
// 		"width":width,
// 		"height":height,
// 		"overflow":"hidden",
// 	})
// 	$(arrow_img).css({
// 		"position":"absolute",
// 		"width":width,
// 		"height":height,
// 		"filter":"drop-shadow("+width+ "px 0" +" " +color+")",
// 	})
// 	//位置则是其箭头顶端（上边缘的中点）与dot的圆心相同
// 	$(arrow).css({
// 		"transform":"rotate(" + angle +"deg)",
// 	})
// 	$(arrow).offset({
// 		left: x,
// 		top: y ,
// 	})
// }




//当line_dot移入tile中，使其与tile绑定，一个line_dot只能绑定一个tile
//总是更优先地绑定z-index更好的，或者说更新的（这个元素会比其他元素更上层）的tile
//为其增加一个类connected_dot
// var old_priority = 0
// var old_z_index = 0
// var old_tile = undefined
// function DotIntoTile(dot,tile){
// 	$tile = $(tile)
// 	//检测这个点是否已经链接上了一个tile，如果是，则判断优先级
// 	if($(dot).is(".connected_dot")){
// 		var new_priority = $tile.index()
// 		var new_z_index = $tile.css("z-index")
// 		//优先判断z-index,如果旧的优先级更大，则直接结束
// 		if(old_z_index > new_z_index){
// 			return 0 
// 		}
// 		//如果z-index相同，则判定index的优先级
// 		else if(old_z_index = new_z_index){
// 			//若旧的优先级更大，则直接结束
// 			if(old_priority > new_priority){
// 				return 0
// 			}
// 		}
// 		//否则将dot与旧的tile解绑
// 		DotOutTile(dot,old_tile)
// 	}
// 	//存储tile和他的优先级
// 	old_priority = $tile.index()
// 	old_z_index = $tile.css("z-index")
// 	old_tile = $tile
// 	//获得line的list
// 	var line = $(dot).parent(".line")
// 	var list = $(line).data("connecting_dot")
// 	if(list == undefined){
// 		list = []
// 	}
// 	//如果这个dot不存在于list中，则加入
// 	if($.inArray(dot,list) == -1){
// 		list.push(dot)
// 	}
// 	//随后改变Dot的类表示其已经连接上了,并将其原本所处的line存储在data里面
// 	$(dot).addClass('connected_dot')
// 	$(dot).data("line",line)
// 	//将修改后的list返还给line
// 	$(line).data("connecting_dot",list)
// 	//若line中有一个dot为连接状态，则无法直接移动line
// 	$(line).draggable("disable")
// 	//调整dot的css使其位置不变并与tile成比例，使其可以自然贴附到tile上随之变化
// 	var line_offset = offsetWithHuabu(line)
// 	var width = $tile.width()
// 	var height = $tile.height()
// 	var tile_left = parseInt($tile.css("left"))
// 	var tile_top = parseInt($tile.css("top"))
// 	//如果这个tile旋转了，则需要再加上旋转导致的left和top的改变
// 	var angle = $tile.attr("angle")
// 	if(angle != 0){
// 		var rotate_position = rotatePositionChange(width,height,angle)
// 		tile_left += rotate_position.left
// 		tile_top += rotate_position.left
// 	}
// 	//修改line_dot的css以改变其位置，当其未处于边缘时，令left或top为百分比，随着tile的大小变化而自然地移动
// 	var left = (parseInt($(dot).css("left")) + line_offset.left - tile_left)
// 	var top = (parseInt($(dot).css("top"))  + line_offset.top  - tile_top)
	
// 	if(left > 0){
// 		left = Math.floor(left / width * 100 )+"%"
// 	}
// 	if(top > 0){
// 		top = Math.floor(top / height * 100 )+"%"
// 	}
// 	$(dot).css({
// 		"left":left,
// 		"top":top
// 	})
// 	//将dot放进tile中作为子元素
// 	$tile.append(dot)
// }

// //dot离开tile后，将其与tile解绑，回到对应的line当中
// function DotOutTile(dot,tile){
// 	//获取dot原本的line对象和line的链接list
// 	var line = $(dot).data("line")
// 	var list = $(line).data("connecting_dot")
// 	var index = $.inArray(dot,list)
// 	//查找dot是否存在在line当中
// 	var found = false;
// 	for (var i = 0; i < list.length; i++) {
// 	  if ($(list[i]).is($(dot))) {
// 	    found = true;
// 	    break;
// 	  }
// 	}
// 	//如果dot存在于list中，则将其移出tile
// 	if(found == true){
// 		//从connecting_dot列表中删除这个dot
// 		list.splice(index,1)
// 		//颜色变回来
// 		$(dot).css("background","#00D0FFFF")
// 		//线条的移动功能重新启用
// 		$(dot).parent(".line").draggable("enable")
// 		//修改dot的位置使其可以从始至终对上
// 		var line_offset = offsetWithHuabu(line)
// 		var new_left = line_offset.left - (parseInt($(dot).css("left")) + parseInt($(tile).css("left")))
// 		var new_top  = line_offset.top - (parseInt($(dot).css("top"))  +  parseInt($(tile).css("top")))
// 		$(dot).css({
// 			"left": - new_left,
// 			"top": - new_top
// 		})
// 		$(line).append(dot)
// 		$(dot).removeClass('connected_dot')
// 	}
// }