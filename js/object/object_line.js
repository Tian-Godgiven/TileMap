//点击在当前画布内生成一条线
function createLineStyle(){

	var width = "300px"
	var height = "3px"
	var color = "black"
	var style = "solid"//或者"dashed"
	var style_width = "0px"//dashed的间隔距离

	var line = createLine(width,height,color,style,style_width)

		// creatArrow(line,"right","arrow_1")
		// creatArrow(line,"left","arrow_1")
}
//线条的生成
var focusing_line
var line_id = 0
var connect_id = 0
var focusing_dot

//创建新链接的函数，只允许该通过该函数调用connect_id
function createConnect(dot_left,dot_right,dot_inner,line_inner){
	var connect = {
			"dot_left":dot_left,
			"dot_right":dot_right,
			"dot_inner":dot_inner,
			"line_inner":line_inner}
	var the_id = "connect_" + connect_id 
	connect_id += 1

	return [the_id,connect]
}

//创建一条定制的线条
function createLine(width,height,color,style,style_width){
	//这个半径是line_dot的半径
	var radius = 8
	var width = parseInt(width)
	var width_inner = width - 2*radius
	var top = (radius - parseInt(height)/2)+ "px"
	var left = radius + "px"

	var line = $("<div>",{"id":"line_" + line_id, "class":"line"})
	line_id +=1

	var line_dotLeft = $("<div>",{ "class":"line_dot line_dotLeft"})
	var line_dotInner = $("<div>",{ "class":"line_dot line_dotInner"})
	var line_dotRight = $("<div>",{ "class":"line_dot line_dotRight"})
	var line_inner = $("<div>",{ "class" :"line_inner"})



	var connect_list = {}
	var connect = createConnect(line_dotLeft,line_dotRight,line_dotInner,line_inner)
	connect_list[connect[0]] = connect[1]

	//对line_dotLeft的修饰，将对应的信息存储进dot中
	$(line_dotLeft).data('connected',connect_list) 

	//对line_dotInner的修饰，将对应的信息存储进dot中
	$(line_dotInner).data('connected',connect_list) 
	$(line_dotInner).css({
		"left":parseInt(width_inner)/2 + "px",//将其放置在中点处
	})

	//对line_dotRight的修饰，将对应的信息存储进dot中
	$(line_dotRight).data('connected',connect_list) 
	$(line_dotRight).css('left',width_inner) 

	//对line_inner的修饰
	$(line_inner).css({
		"background":color,
		"width":width_inner,
		"height":height,
		"left":left,
		"top":top
	})
	$(line_inner).attr("angle","0")

	if(style == "dash"){
		$(line_inner).css({
			"background": "linear-gradient(to left,transparent 0%,transparent 50%," + color + " 50%," + color +" 100%)",
			"background-size": style_width + " " + height,
			"background-repeat": "repeat-x"
		})
	}

	$(line).append(line_dotLeft,line_dotInner,line_inner,line_dotRight)
	//放进画布里
	$($(return_focusing_huabu()).children(".tile_container")).append(line)
	//启用Draggable功能
	$(line).draggable()
	abilityLineDot(line_dotLeft)
	abilityLineDot(line_dotInner)
	abilityLineDot(line_dotRight)
} 

//为选中的线条增添一个不同方向的Arrow
function createArrowRight(){
	var line = focusing_line
	//如果没有选中则跳过
	if(line == undefined){
		return 0
	}
	creatArrow(line,"right","arrow_1")
}
function createArrowLeft(){
	var line = focusing_line
	//如果没有选中则跳过
	if(line == undefined){
		return 0
	}
	creatArrow(line,"left","arrow_1")
}


//鼠标点击在画布中的line上时显示其中的dot，将其聚焦
$("#huabu_container").on("click",".line",function(event){
	event.stopPropagation()
	focusingLine(this,"click")
});
//聚焦line
function focusingLine(line,type){
	focusing_line = line
	if($(line).is(".line_selected")){
		return false
	}

	$(line).find(".line_dot").each(function(){
		var $dot = $(this)
		if($dot.is(".line_dotMidway")){
			$dot = $dot.children(".line_dotMidway_inner")
		}
		$dot.stop()
		$dot.animate({
			opacity:"1"
		},100)
	})
	//line的connecting_dot也能享受这种待遇
	var list = $(line).data("connecting_dot")
	if(list != undefined && list.length > 0 ){
		for(var i=0;i<list.length;i++){
			var $dot = $(list[i])
			if($dot.is(".line_dotMidway")){
				$dot = $dot.children(".line_dotMidway_inner")
			}
			$dot.stop()
			$dot.animate({
				opacity:"1"
			},100)
		}
	}

	if(type == "click"){
		//点击其他地方时失去聚焦
		$("#huabu_container").on("mousedown",function(event){
			event.stopPropagation()
			if($(line).has(event.target).length == 0){//如果点击到的对象不是line的子元素则失去聚焦
				unfocusingLine(line)
				$(this).off(event)
			}
		})	
	}
}
//取消line的聚焦
function unfocusingLine(line){
	focusing_line = undefined
	$(line).find(".line_dot").each(function(){
		var $dot = $(this)
		if($dot.is(".line_dotMidway")){
			$dot = $dot.children(".line_dotMidway_inner")
		}
		$dot.stop()
		$dot.animate({
			opacity:"0"
		},500)
	})
	//line的connecting_dot也能享受这种待遇
	var list = $(line).data("connecting_dot")
	if(list == undefined || list.length == 0 ){
		return 0
	}
	for(var i=0;i<list.length;i++){
		var $dot = $(list[i])
		if($dot.is(".line_dotMidway")){
			$dot = $dot.children(".line_dotMidway_inner")
		}
		$dot.stop()
		$dot.animate({
			opacity:"0"
		},500)
	}
}



//dot的拖拽，右键功能
function abilityLineDot(dot){
	//拖拽
	if($(dot).is(".line_dotMidway")){
		$(dot).draggable({handle: $(dot).children(".line_dotMidway_inner")})
	}
	else{
		$(dot).draggable({handle: false,})
	}
	$(dot).draggable({
		refreshPositions:true,
		start:function(event){
			event.stopPropagation()
			focusingLine($(dot).parent(".line"),"click")
			//如果dot此时在tile内部，则令其移出tile
			if($(dot).parent().is(".tile")){
				DotOutTile(dot)
			}
		},
		drag: function(event,ui) {
			if(return_snap_tile() != false){
				dragLineDot(dot)
			}
			else{
				return 0;
			}
	    },
	    stop: function(event,ui){
	    	dragLineDot(dot,"stop")
	    }
	})


	//右键dot_inner和dot_midway事件，显示子菜单
	if($(dot).is(".line_dot:not(.line_dotRight , line_dotLeft)")){
		var statrX,startY
		$(dot).on("mousedown",function(event){
			event.stopPropagation()
			//判断是否为右键
			if(event.button == 2){
				startX = event.clientX;
				startY = event.clientY;
			}
			else if(event.button == 0){
				hideHuabuMenu("line_dotInner_menu")
			}
		})

		$(dot).on("mouseup",function(event){
			if(startX == event.clientX && startY == event.clientY && event.button == 2){
				//显示该菜单，并将这个dot作为focusing_dot
				if($(this).is(".line_dotMidway_inner")){
					focusing_dot = $(this).parent(".line_dotMidway")
				}
				else{
					focusing_dot = this
				}
				event.stopPropagation()
				showHuabuMenu(event,"line_dotInner_menu")
			}
		})
	}
}

var num = 0
//拖拽line_dot的分辨函数
function dragLineDot(dot,time){
	//用于记录这个点所链接的所有线段的角度
	var line_list = []
	//用于标识这个点是否是某一个链接中的Inner或者是否是一个midway
	var thisIsInner = false
	var thisIsMidway = false
	var list = $(dot).data("connected")
	for(var i in list){
		var data = list[i]
		var left  = data["dot_left"]
		var right = data["dot_right"]
		var inner = data["dot_inner"]
		var line  = data["line_inner"]

		//如果是midway的话，就把line角度存储进去
		if($(dot).is(".line_dotMidway")){
			thisIsMidway = true
			line_list[line_list.length] = [i,$(line).attr("angle")]
		}

		//如果在这个链接中，dot是inner的话，就要把dot变成midway
		if($(dot).is(inner)){
			thisIsInner = true
			//但如果这个他就是一个midway的话，就不进行这个操作
			if(!$(dot).is(".line_dotMidway")){
				InnerTurnToMidway(dot,i)
				i += 1
				return 0
			}
		}
		connectLineDot(left,right,inner,line)

	}
	//遍历line_list，依次对比两两线段之间的角度，如果存在某两条线段持平，则令这个midway转化为inner
	//删去其前方的line_inner和前后两个dot_Inner再把后线条连接到前后两个点上
	//如果这个midway不是任何一个链接中的中继点并且也没有分支的话，才进行这个操作
	if(thisIsMidway  && !thisIsInner && time == "stop" && line_list.length == 2){
		for(var i=0; i < line_list.length-1; i++){
			for(var j = i+1; j <line_list.length; j++){
				var angle_1 = line_list[i][1] - line_list[j][1]
				var angle_2 = line_list[i][1] + line_list[j][1]
				//如果这两个线段的角度匹配，则令这个链接消失，同时将midway转化为inner
				if((angle_1 <= 1 && angle_1 >= -3) || (angle_2 > 359 && angle_2 <= 361) ){
					//获得line_list内存储的两个链接的名称
					var connect_1 = line_list[i][0]
					var connect_2 = line_list[j][0]
					//将这个Midway转化为inner
					MidwayTurnToInner(connect_1,connect_2,dot)
				}
			}
		}
	}	
}

//通过修改line_inner链接左右两个dot_left和dot_right
//同时还会把其中点dot_inner移到线段中心
function connectLineDot(dot_left,dot_right,dot_inner,line_inner){

	var huabu_scale = return_huabu_scale()
	//大量使用的dom元素储存为变量
	var $dot_left = $(dot_left);
	var $dot_right = $(dot_right);
	var $line = $(dot_inner).parent(".line")

	//分别求得其圆心的位置
	var radius_left = $dot_left.width() / 2;
	var dot_left_x = parseInt($dot_left.css("left")) + radius_left;
	var dot_left_y = parseInt($dot_left.css("top")) + radius_left;
	//如果已经和其他元素链接，则还要加上父元素的偏移量并减去line相对于画布的偏移量，以此得到dot相较于Line的偏移量
	if ($dot_left.is(".connected_dot")) {
		var parent_offset = offsetWithHuabu($dot_left.parent())
		var line_offset = offsetWithHuabu($line)
		
		dot_left_x += parent_offset.left - line_offset.left
		dot_left_y += parent_offset.top - line_offset.top
	}
	//同上
	var radius_right = $dot_right.width() / 2;
	var dot_right_x = parseInt($dot_right.css("left")) + radius_right;
	var dot_right_y = parseInt($dot_right.css("top")) + radius_right;
	if ($dot_right.is(".connected_dot")) {
	  	var parent_offset = offsetWithHuabu($dot_right.parent())
	 	var line_offset = offsetWithHuabu($line)

	  	dot_right_x += parent_offset.left - line_offset.left
	  	dot_right_y += parent_offset.top - line_offset.top
	}

	//获取两点距离和角度弧度
	var distant_x = dot_left_x - dot_right_x;
	var distant_y = dot_left_y - dot_right_y;
	var width = Math.hypot(distant_x, distant_y);
	var angle = getAngle(distant_x, distant_y);
	var radian = Math.round(Math.PI * angle / 180);

	var left = dot_left_x;
	var top = dot_left_y;


	//获取线条的粗度，也就是高度
	var height_line = $(line_inner).height() * huabu_scale

	//获取箭头的粗度，同样也是高度
	var line = $(line_inner).parent(".line")
	var height_arrow = 0
	if($(line).find(".line_arrow:first").length > 0){
		var arrow_inner = $(line).find(".line_arrow:first").children(".line_arrow_inner")
		height_arrow = parseInt($(arrow_inner).css("height"))
	}

	//如果dot_right就连着右箭头（也就是说dot_right是右端点）
	//那么只需要减去Line_inner的长度（宽度）= 线条的粗度
	var width_arrow = 0
	if($(dot_right).next().is(".line_arrow_right")){
		temp_right = true
		width_arrow += height_arrow
	}

	//如果dot_left就连着左箭头（也就是说dot_left是左端点）
	//就要移动线条与dot_left的位置,在基础的移动后还要再减少一次Line_inner的粗度
	var x_arrow = 0
	var y_arrow = 0
	if($(dot_left).next().is(".line_arrow_left")){
		x_arrow = height_arrow * Math.cos(radian)
		y_arrow = height_arrow * Math.sin(radian)
		width_arrow += height_arrow
	}

	//修改线条的位置，使其永远与dot_left相连
	//其左上角应位于与dot_left相距h/2处，且边缘切过圆心
	//因此只需使其沿着圆心的位置（left,top）使其向上移动粗度/2的位置就行了
	//另外，如果存在箭头的话，还需要修改其起始点位置和长度
	//最终改变角度和长度，使其连接上dot_right，从而实现了链接两个dot的线条
	$(line_inner).attr('angle',angle)
	$(line_inner).css({
		"left": left + x_arrow + "px",
		"top":top - height_line/2 + y_arrow + "px",
		"width":width - width_arrow + "px",
		"transform":"rotate(" + angle + "deg)",
	})
	//使dot_inner回到dot_left和dot_right中间
	backToCenter(dot_left,dot_right,dot_inner)
	//修改箭头的位置和旋转的角度
	$($(line_inner).parent()).find(".line_arrow").each(function(){
		changeArrow(this)
	})
}

//创建箭头,在给定line的给定方向的最边缘端点处放置一个箭头，这个箭头的顶点是这个dot的圆心，箭头会随着line的角度变化而变化
function creatArrow(line,direction,style){
	//得到dot对象
	if(direction == "left"){
		var dot = $(line).children(".line_dotLeft")
	}
	else if(direction == "right"){
		var dot = $(line).children(".line_dotRight")
	}
	//如果箭头对象已经存在则跳过
	if($(dot).next().is(".line_arrow")){
		return 0
	}

	//箭头对象是一个父元素div内的div包裹img，这个父元素用于定位，这个div用于旋转，这个img是箭头的图形
	var arrow = $("<div>",{"class":"line_arrow line_arrow_" + direction})
	var arrow_inner = $("<div>",{"class":"line_arrow_inner"})
	var arrow_img = new Image()
	arrow_img.src = "./img/" + style +".png"

	//把做好的箭头放进line对象里具体位置是对应dot的后面
	$(arrow_inner).append(arrow_img)
	$(arrow).append(arrow_inner)
	$(dot).after(arrow)

	changeArrow(arrow)
	dragLineDot(dot)
}

//修改某个arrow的位置使其能够对准所处的线段上
function changeArrow(arrow){
	//取操作对象
	var line = $(arrow).parent('.line')
	var arrow_inner = $(arrow).children()
	var arrow_img = $(arrow_inner).children()
	var dot = $(arrow).prev(".line_dot")
	//箭头只与端点绑定，而端点只有一个链接
	var list = $(dot).data("connected")
	for(i in list){
		var line_inner = list[i]["line_inner"]
	}

	//根据箭头的方向选择箭头附着的dot
	if($(dot).is(".line_dotLeft")){
		//是左侧点，要+270度
		var basic_angle = 270
	}
	else if($(dot).is(".line_dotRight")){
		//是右侧侧点，要+90度
		var basic_angle = 90
	}

	//获取圆心的位置
	var radius = $(dot).width()/2 * return_huabu_scale()
	var x = $(dot).offset().left + radius
	var y = $(dot).offset().top + radius

	//获取对应线段的粗度颜色和角度
	var thick = $(line_inner).height()
	var angle = parseInt($(line_inner).attr("angle"))
	var color = $(line_inner).css("background-color")

	if(isNaN(angle)){
		angle = 0;
	}
	angle = basic_angle + angle

	//箭头的宽度和高度与线条正相关
	var width = (thick*1.5 + 15)
	var height = (thick*1.2 + 10)

	//修饰arrow_inner，其中arrow的颜色与线条相同，大小比线条的粗度稍大，角度根据其dot有所变化
	$(arrow_inner).css({
		"position":"absolute",
		"left":-width / 2,
		"text-indent":-width,
		"width":width,
		"height":height,
		"overflow":"hidden",
	})
	$(arrow_img).css({
		"position":"absolute",
		"width":width,
		"height":height,
		"filter":"drop-shadow("+width+ "px 0" +" " +color+")",
	})
	//位置则是其箭头顶端（上边缘的中点）与dot的圆心相同
	$(arrow).css({
		"transform":"rotate(" + angle +"deg)",
	})
	$(arrow).offset({
		left: x,
		top: y ,
	})
}

//将一个dot_inner转化为一个dot_midway
function InnerTurnToMidway(dot_inner,connect_id){

	var list = $(dot_inner).data("connected")
	var old_connect = list[connect_id]
	var dot_left = old_connect["dot_left"]
	var dot_right = old_connect["dot_right"]
	var line_right = old_connect["line_inner"]

	//复制一个line_inner并将其添加到dot的前面
	var line_left = $(line_right).clone()
	$(dot_inner).before(line_left)

	//将inner变为midway,修改Dot的class
	$(dot_inner).attr("class",'line_dot line_dotMidway')
	var dot_midway = dot_inner
	//生成midway_inner和midway_border
		var midway_inner = $("<div>",{
			"class":"line_dotMidway_inner line_dot",
		})
		var midway_border = $("<div>",{
			"class":"line_dotMidway_border"
		})
		//修改border的颜色，半径
		var color = $(line_right).css('background-color')
		var height = parseInt($(line_right).css('height'))
		$(midway_border).css({
			"width":height + "px",
			"height":height + "px",
			"background":color
		})
		//把inner和Border放进dot
		$(dot_midway).append(midway_border)
		$(dot_midway).append(midway_inner)

	//变大之后位置也发生了变化，所以这里使其回到原本的位置，也就是中点
	backToCenter(dot_left,dot_right,dot_midway)

	//随后在两边各创建一个dot_Inner，放在各自的line_inner前面
		var dot_inner_left = $("<div>",{"class":"line_dot line_dotInner"})
		var dot_inner_right = $("<div>",{"class":"line_dot line_dotInner"})
		//把这个dot_inner放在Line的前面
		$(line_left).before(dot_inner_left)
		$(line_right).before(dot_inner_right)
		abilityLineDot(dot_inner_left)
		abilityLineDot(dot_inner_right)

	//修改原本的connect_left
	var connected_left = {
		"dot_left":dot_left,
		"dot_right":$(dot_midway),
		"line_inner":line_left,
		"dot_inner":dot_inner_left}
	var left_id = connect_id
	//创建新的connect_right
	var connect_right = createConnect($(dot_midway),dot_right,dot_inner_right,line_right)
	var right_id = connect_right[0]

	//修改left一侧的点的list
	$(dot_midway).data("connected")[left_id] = connected_left//覆盖旧的链接
	$(dot_left).data("connected")[left_id] = connected_left
	//给新创建dot_inner_left放入list
	var list_left = {}
	list_left[left_id] = connected_left
	$(dot_inner_left).data("connected",list_left)

	//先复制一份midway的旧的list，然后将这个connect_right加入进去
	var dot_list = $.extend(true, {}, $(dot_midway).data("connected"));
	dot_list[right_id] = connect_right[1]
	$(dot_inner).data("connected",dot_list)

	//修改right的list,先复制一份旧的list，删去其中的旧链接，再装入新链接
	var new_list = $.extend(true, {}, $(dot_right).data("connected"));
	delete new_list[left_id]//删除旧的left的链接
	new_list[right_id] = connect_right[1]
	$(dot_right).data("connected",new_list)
	//同样给新的dot_inner放入list
	var list_right = {}
	list_right[right_id] = connect_right[1]
	$(dot_inner_right).data("connected",list_right)

	connectLineDot(dot_left,dot_midway,dot_inner_left,line_left)
	connectLineDot(dot_midway,dot_right,dot_inner_right,line_right)
}

//将一个dot_midway转化为一个dot_inner
function MidwayTurnToInner(connect_1,connect_2,dot_midway){

	var list = $(dot_midway).data("connected")
	//修改Dot的class
	$(dot_midway).attr("class",'line_dot line_dotInner')
	//把inner和Border删掉
	$(dot_midway).children().remove()

	//通过dot_midway所处的位置获取两个链接的左右顺序
	if($(dot_midway).is(list[connect_1]["dot_right"])){
		connect_left = connect_1
		connect_right = connect_2
	}
	else if($(dot_midway).is(list[connect_1]["dot_left"])){
		connect_left = connect_2
		connect_right = connect_1
	}

	//删除两个链接中的dot_inner
	list[connect_left]["dot_inner"].remove()
	list[connect_right]["dot_inner"].remove()
	//删除前一个链接中的line_inner
	list[connect_left]["line_inner"].remove()

	//重构connect_left链接，使其链接两个两个链接中的dot_left和dot_right
	var dot_left = list[connect_left]["dot_left"]
	var dot_right = list[connect_right]["dot_right"]
	var line_inner = list[connect_right]["line_inner"]
	var new_connect = {
		"dot_left":dot_left,
		"dot_right":dot_right,
		"dot_inner":dot_midway,
		"line_inner":line_inner
	}

	//将dot_miday中的connect_1替换为new_connect
	list[connect_left] = new_connect
	delete list[connect_right]	//随后删除掉另一个链接
	//将dot_left中的connect_1替换为new_connect
	$(dot_left).data("connected")[connect_left] = new_connect
	//将dot_right中的connect_2删除，加入名称为connect_1的new_connect
	$(dot_right).data("connected")[connect_left] = new_connect
	delete $(dot_right).data("connected")[connect_right]

	//最后恢复这个链接
	connectLineDot(dot_left,dot_right,dot_midway,line_inner)
}

//将线条中点line_dotInner放到他的前后两个有效点的中间
//angle是line_inner的偏转角度，难以通过jq方式获取
function backToCenter(dot_left,dot_right,dot_inner){

	var $dot_left = $(dot_left);
	var $dot_right = $(dot_right);
	var $line = $(dot_inner).parent(".line")

	//分别求得其圆心的位置
	var radius_left = $dot_left.width() / 2;
	var x_1 = parseInt($dot_left.css("left")) + radius_left;
	var y_1 = parseInt($dot_left.css("top")) + radius_left;
	//如果已经和其他元素链接，则还要加上父元素的偏移量
	if ($dot_left.is(".connected_dot")) {
	  var parent_offset = offsetWithHuabu($dot_left.parent())
	  var line_offset = offsetWithHuabu($line)
	  x_1 += parent_offset.left - line_offset.left
	  y_1 += parent_offset.top - line_offset.top
	}
	//同上
	var radius_right = $dot_right.width() / 2;
	var x_2 = parseInt($dot_right.css("left")) + radius_right;
	var y_2 = parseInt($dot_right.css("top")) + radius_right;
	if ($dot_right.is(".connected_dot")) {
	  var parent_offset = offsetWithHuabu($dot_right.parent())
	  var line_offset = offsetWithHuabu($line)
	  x_2 += parent_offset.left - line_offset.left
	  y_2 += parent_offset.top - line_offset.top
	}

	//获取半径
	var radius = parseInt($(dot_inner).css("width"))/2

	//移动dotInner的圆心到两点间距的中心
	//圆心相较于offset有着left和top + radius的偏移量，所以这里要减去自身的radius
	$(dot_inner).css({
		"left": (x_1 + x_2)/2 - radius,
		"top": (y_1 + y_2)/2 - radius,
	})
}

//这个函数目前没有使用到，但为了维护，暂时将其保留
//将线段链接点line_dotMidway放到线段line_inner的边缘的中间
function backToMidway(line_inner,dot_midway){
	//获取角度，由于使用css()获取transform属性过于麻烦，这里直接把它放进了line属性里面
	var angle = $(line_inner).attr("angle")
	if(angle == undefined){
		angle = 0
	}
	//获取子元素的半径
	var radius = parseInt($(dot_midway).children(".line_dotMidway_inner").css("width"))/2
	//转化角度为弧度
	var radian = Math.PI * angle /180
	//获取线段的宽度
	var width = parseInt($(line_inner).css("width"))
	//得到由线起始点移动到该短边中点的偏移量，这里便是dot_midway圆心所在的位置
	var x = (width) * Math.cos(radian)
	var y = (width) * Math.sin(radian)
	//移动的起点，同时也要注意这个点的半径为基础半径
	var start_dot = $(dot_midway).prevAll(".line_dot:not(.line_dotInner):first")
	var basic_radius =parseInt($(start_dot).css("width"))/2

	var left = start_dot.offset().left
	var top = start_dot.offset().top

	var huabu_scale = return_huabu_scale()
	//移动dotInner的圆心到中点去，圆心相较于offset有着left和top + radius的偏移量，所以这里要减去radius
	$(dot_midway).offset({
		left: left + (x - radius + basic_radius) * huabu_scale,
		top: top + (y - radius + basic_radius) * huabu_scale,
	})
}



//当line_dot移入tile中，使其与tile绑定，一个line_dot只能绑定一个tile
//总是更优先地绑定z-index更好的，或者说更新的（这个元素会比其他元素更上层）的tile
//为其增加一个类connected_dot
var old_priority = 0
var old_z_index = 0
var old_tile = undefined
function DotIntoTile(dot,tile){
	$tile = $(tile)
	//检测这个点是否已经链接上了一个tile，如果是，则判断优先级
	if($(dot).is(".connected_dot")){
		var new_priority = $tile.index()
		var new_z_index = $tile.css("z-index")
		//优先判断z-index,如果旧的优先级更大，则直接结束
		if(old_z_index > new_z_index){
			return 0 
		}
		//如果z-index相同，则判定index的优先级
		else if(old_z_index = new_z_index){
			//若旧的优先级更大，则直接结束
			if(old_priority > new_priority){
				return 0
			}
		}
		//否则将dot与旧的tile解绑
		DotOutTile(dot,old_tile)
	}
	//存储tile和他的优先级
	old_priority = $tile.index()
	old_z_index = $tile.css("z-index")
	old_tile = $tile
	//获得line的list
	var line = $(dot).parent(".line")
	var list = $(line).data("connecting_dot")
	if(list == undefined){
		list = []
	}
	//如果这个dot不存在于list中，则加入
	if($.inArray(dot,list) == -1){
		list.push(dot)
	}
	//随后改变Dot的类表示其已经连接上了,并将其原本所处的line存储在data里面
	$(dot).addClass('connected_dot')
	$(dot).data("line",line)
	//将修改后的list返还给line
	$(line).data("connecting_dot",list)
	//若line中有一个dot为连接状态，则无法直接移动line
	$(line).draggable("disable")
	//调整dot的css使其位置不变并与tile成比例，使其可以自然贴附到tile上随之变化
	var line_offset = offsetWithHuabu(line)
	var width = $tile.width()
	var height = $tile.height()
	var tile_left = parseInt($tile.css("left"))
	var tile_top = parseInt($tile.css("top"))
	//如果这个tile旋转了，则需要再加上旋转导致的left和top的改变
	var angle = $tile.attr("angle")
	if(angle != 0){
		var rotate_position = rotatePositionChange(width,height,angle)
		tile_left += rotate_position.left
		tile_top += rotate_position.left
	}
	//修改line_dot的css以改变其位置，当其未处于边缘时，令left或top为百分比，随着tile的大小变化而自然地移动
	var left = (parseInt($(dot).css("left")) + line_offset.left - tile_left)
	var top = (parseInt($(dot).css("top"))  + line_offset.top  - tile_top)
	
	if(left > 0){
		left = Math.floor(left / width * 100 )+"%"
	}
	if(top > 0){
		top = Math.floor(top / height * 100 )+"%"
	}
	$(dot).css({
		"left":left,
		"top":top
	})
	//将dot放进tile中作为子元素
	$tile.append(dot)
}

//dot离开tile后，将其与tile解绑，回到对应的line当中
function DotOutTile(dot,tile){
	//获取dot原本的line对象和line的链接list
	var line = $(dot).data("line")
	var list = $(line).data("connecting_dot")
	var index = $.inArray(dot,list)
	//查找dot是否存在在line当中
	var found = false;
	for (var i = 0; i < list.length; i++) {
	  if ($(list[i]).is($(dot))) {
	    found = true;
	    break;
	  }
	}
	//如果dot存在于list中，则将其移出tile
	if(found == true){
		//从connecting_dot列表中删除这个dot
		list.splice(index,1)
		//颜色变回来
		$(dot).css("background","#00D0FFFF")
		//线条的移动功能重新启用
		$(dot).parent(".line").draggable("enable")
		//修改dot的位置使其可以从始至终对上
		var line_offset = offsetWithHuabu(line)
		var new_left = line_offset.left - (parseInt($(dot).css("left")) + parseInt($(tile).css("left")))
		var new_top  = line_offset.top - (parseInt($(dot).css("top"))  +  parseInt($(tile).css("top")))
		$(dot).css({
			"left": - new_left,
			"top": - new_top
		})
		$(line).append(dot)
		$(dot).removeClass('connected_dot')
	}
}