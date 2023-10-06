//点击在当前画布内生成一条线
function createLineStyle(){

	var width = "300px"
	var height = "3px"
	var color = "black"
	var style = "solid"//或者"dashed"
	var style_width = "0px"//dashed的间隔距离

	var line = createLine(width,height,color,style,style_width)

	$($(return_focusing_huabu()).children(".tile_container")).append(line)
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

	var line = $("<div>",{"id":"line_" + line_id, "class":"line wrapper"})
	line_id +=1

	var line_dotLeft = $("<div>",{ "class":"line_dot line_dotLeft"})
	var line_dotInner = $("<div>",{ "class":"line_dot line_dotInner"})
	var line_dotRight = $("<div>",{ "class":"line_dot line_dotRight"})
	var line_inner = $("<div>",{ "class" :"line_inner"})



	var connect_list = {}
	var connect = createConnect(line_dotLeft,line_dotRight,line_dotInner,line_inner)
	connect_list[connect[0]] = connect[1]


	//对line的修饰
	$(line).css("width",width)

	//对line_dotLeft的修饰，将对应的信息存储进dot中
	$(line_dotLeft).data('connected',connect_list) 

	//对line_dotInner的修饰，将对应的信息存储进dot中
	$(line_dotInner).data('connected',connect_list) 
	$(line_dotInner).css({
		"left":parseInt(width_inner)/2 + "px",//将其放置在中点处
	})

	//对line_dotRight的修饰，将对应的信息存储进dot中
	$(line_dotRight).data('connected',connect_list) 

	//对line_inner的修饰
	$(line_inner).css({
		"background":color,
		"width":width_inner,
		"height":height,
		"left":left,
		"top":top
	})

	if(style == "dash"){
		$(line_inner).css({
			"background": "linear-gradient(to left,transparent 0%,transparent 50%," + color + " 50%," + color +" 100%)",
			"background-size": style_width + " " + height,
			"background-repeat": "repeat-x"
		})
	}

	$(line).append(line_dotLeft,line_dotInner,line_inner,line_dotRight)
	return line
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

//移动line：所有dot都为非连接状态下，左键按住并拖动鼠标可以移动line
$("#huabu_container").on("mouseenter", ".line:not(.ui-draggable-handle)", function() {
	$(this).draggable({
    })
})

//鼠标点击在画布中的line上时显示其中的dot，将其聚焦
$("#huabu_container").on("mousedown",".line",function(){
	focusing_line = this
	var line = this
	$(line).find(".line_dot").each(function(){
		var dot = this
		if($(dot).is(".line_dotMidway")){
			dot = $(dot).children(".line_dotMidway_inner")
		}
		$(dot).stop()
		$(dot).animate({
			opacity:"1"
		},100)
	})
	//点击其他地方时修改透明度隐藏dot，失去聚焦的line
	$("#huabu_container").on("mousedown",function(event){
		event.stopPropagation()
		if(!$(line).find("div").is(event.target) ){
			focusing_line = undefined
			$(line).find(".line_dot").each(function(){
				var dot = this
				if($(dot).is(".line_dotMidway")){
					dot = $(dot).children(".line_dotMidway_inner")
				}
				$(dot).stop()
				$(dot).animate({
					opacity:"0"
				},500)
			})
			$(this).off(event)
		}
	})	
});

//拖拽移动dot
$("#huabu_container").on("mouseenter",".line > .line_dot:not(.ui-draggable-handle)",function(){
	if($(this).is(".line_dotMidway")){
		$(this).draggable({handle: $(this).children(".line_dotMidway_inner")})
	}
	else{
		$(this).draggable({handle: false,})
	}

	$(this).draggable({
		refreshPositions:true,
		drag: function(event,ui) {
			if(return_snap_tile() != false){
				dragLineDot(this)
			}
			else{

				return 0;
			}
	    },
	    stop: function(event,ui){
	    	dragLineDot(this,"stop")
	    }
	})
})

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

	//如果是midway的话，需要先转换对象
	if($(dot_left).is(".line_dotMidway")){
		dot_left = $(dot_left).children(".line_dotMidway_inner")
	}
	if($(dot_right).is(".line_dotMidway")){
		dot_right = $(dot_right).children(".line_dotMidway_inner")
	}
	//获取dot的半径，这个数值等于dot的宽度的一半
	var radius_left = $(dot_left).width()/2
	var radius_right = $(dot_right).width()/2

	//找到两个dot的圆心的位置,是分别的offset+radius,并求出距离差
	var distant_x = ($(dot_left).offset().left + radius_left) - 
					($(dot_right).offset().left + radius_right)
	var distant_y = ($(dot_left).offset().top + radius_left) - 
					($(dot_right).offset().top + radius_right)

	//获取两点之间的间距和角度
	var huabu_scale = return_huabu_scale()
	var width = Math.sqrt(Math.pow(distant_x,2) + Math.pow(distant_y,2)) / huabu_scale
	var angle = getAngle(distant_x,distant_y)
	var radian = Math.PI * angle /180

	//如果画布发生了偏转，那么angle要减少相当于画布部分的angle
	var huabu_angle = return_huabu_angle()
	angle = angle - huabu_angle

	//获取dot_left圆心的位置，这里是line_inner的起点
	//如果这个dot是midway_inner，那么起点则要改成它的父元素的位置,由于其父元素本身就在圆心的位置，所以不用加上radius_left
	if($(dot_left).is(".line_dotMidway_inner")){
		dot_left = $(dot_left).parent(".line_dotMidway")
		var left = parseInt($(dot_left).css("left"))
		var top = parseInt($(dot_left).css("top"))
	}
	else{
		var left = parseInt($(dot_left).css("left")) + radius_left
		var top = parseInt($(dot_left).css("top")) + radius_left
	}

	//获取线条的粗度，也就是高度
	var height_line = $(line_inner).height() * huabu_scale

	var line = $(line_inner).parent(".line")
	//获取箭头的粗度，同样也是高度
	var height_arrow = 0
	if($(line).find(".line_arrow:first").length > 0){
		var arrow_inner = $(line).find(".line_arrow:first").children(".line_arrow_inner")
		height_arrow = parseInt($(arrow_inner).css("height"))
	}

	//如果dot_right就连着右箭头（也就是说dot_right是右端点）
	//那么只需要减去Line_inner的长度（宽度）= 线条的粗度
	var width_arrow = 0
	var temp_right = false
	if($(dot_right).next().is(".line_arrow_right")){
		temp_right = true
		width_arrow += height_arrow
	}

	//如果dot_left就连着左箭头（也就是说dot_left是左端点）
	//就要移动线条与dot_left的位置,在基础的移动后还要再减少一次Line_inner的粗度
	var x_arrow = 0
	var y_arrow = 0
	var temp_left = false
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
	//使dot_inner回到line中间
	backToCenter(dot_left,dot_right,dot_inner,line_inner)
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
	$(dot_inner).append(midway_border)
	$(dot_inner).append(midway_inner)

	//变大之后位置也发生了变化，所以这里使其回到原本的位置，也就是中点
	backToCenter(line_left,dot_inner)

	//随后在两边各创建一个dot_Inner，放在各自的line_inner前面
	var dot_inner_left = $("<div>",{"class":"line_dot line_dotInner"})
	var dot_inner_right = $("<div>",{"class":"line_dot line_dotInner"})
	//把这个dot_inner放在Line的前面
	$(line_left).before(dot_inner_left)
	$(line_right).before(dot_inner_right)

	//修改connect_left
	var connected_left = {
		"dot_left":dot_left,
		"dot_right":$(dot_inner),
		"line_inner":line_left,
		"dot_inner":dot_inner_left}
	//创建connect_right
	var connect_right = createConnect($(dot_inner),dot_right,dot_inner_right,line_right)

	//修改left一侧的点的list
	$(dot_inner).data("connected")[connect_id] = connected_left//覆盖旧的链接
	$(dot_left).data("connected")[connect_id] = connected_left
	//给新创建dot_inner放入list
	var list_left = {}
	list_left[connect_id] = connected_left
	$(dot_inner_left).data("connected",list_left)

	//修改Dot的list，先复制一份旧的list，然后将这个connect_right加入进去
	var dot_list = $.extend(true, {}, $(dot_inner).data("connected"));
	dot_list[connect_right[0]] = connect_right[1]
	$(dot_inner).data("connected",dot_list)
	//修改right的list，
	var new_list = $.extend(true, {}, $(dot_right).data("connected"));
	delete new_list[i]//删除旧的链接
	new_list[connect_right[0]] = connect_right[1]
	$(dot_right).data("connected",new_list)
	//同样给新的dot_inner放入list
	var list_right = {}
	list_right[connect_right[0]] = connect_right[1]
	$(dot_inner_right).data("connected",list_right)

	connectLineDot(dot_left,midway_inner,dot_inner_left,line_left)
	connectLineDot(midway_inner,dot_right,dot_inner_right,line_right)
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
function backToCenter(dot_left,dot_right,dot_inner,line_inner){
	var angle = $(line_inner).attr("angle")
	if(angle == undefined){
		angle = 0
	}

	//获取半径
	var huabu_scale = return_huabu_scale()
	var radius = parseInt($(dot_inner).css("width"))/2 * huabu_scale
	//转化角度为弧度
	var radian = Math.PI * angle /180
	//得到dotLeft的圆心所在的位置,圆心相较于div起始点各有一个半径的差距，所以要+radius
	var radius_1 = parseInt($(dot_left).css("width"))/2  * huabu_scale
	var x_1 = $(dot_left).offset().left + radius_1
	var y_1 = $(dot_left).offset().top + radius_1
	//得到dotRight的圆心所在的位置
	var radius_2 = parseInt($(dot_right).css("width"))/2  * huabu_scale
	var x_2 = $(dot_right).offset().left + radius_2
	var y_2 = $(dot_right).offset().top + radius_2

	//移动dotInner的圆心到两点间距的中心
	//圆心相较于offset有着left和top + radius的偏移量，所以这里要减去自身的radius
	$(dot_inner).offset({
		left: (x_1 + x_2)/2 - radius,
		top: (y_1 + y_2)/2 - radius,
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
	//检测这个点是否已经链接上了一个tile，如果是，则判断优先级
	if($(dot).is(".connected_dot")){
		var new_priority = $(tile).index()
		var new_z_index = $(tile).css("z-index")
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
	old_priority = $(tile).index()
	old_z_index = $(tile).css("z-index")
	old_tile = $(tile)
	//获得tile的list
	var list = $(tile).data("connected")
	if(list == undefined){
		list = []
	}
	//如果这个dot不存在list中，则加入
	if($.inArray(dot,list) == -1){
		list[list.length] = dot
	}
	//随后改变Dot的类表示其已经连接上了
	$(dot).addClass('connected_dot')
	//将修改后的list返还给tile
	$(tile).data("connected",list)
	//禁用该线条的移动功能
	//若line中有一个dot为连接状态，则无法直接移动line
	$(dot).parent(".line").draggable("disable")	
}

//dot离开tile后，将其与tile解绑
function DotOutTile(dot,tile){

	$(dot).removeClass('connected_dot')

	var list = $(tile).data("connected")
	var index = $.inArray(dot,list)
	//如果dot存在在list中，则将其删除
	if($.inArray(dot,list) != -1){
		list.splice(index,1)
		//颜色变回来
		$(dot).css("background","#00D0FFFF")
		//线条的移动功能启用
		$(dot).parent(".line").draggable("enable")
	}
}

//tile的拖拽函数的补充，使其带动绑定的line_dot一起移动
function dragTileConnect(event,ui,tile,click_dot){
	var list = ($(tile).data("connected"))
	//移动dot
	if(list != undefined){
		var original = ui.originalPosition;
		//获取移动量
		var x = event.clientX - click_dot.x
		var y = event.clientY - click_dot.y
		click_dot.x = event.clientX;
		click_dot.y = event.clientY;
		//在tile移动的同时也会移动connected中绑定的元素
		for(var i = 0 ; i < list.length ; i++){
			var dot = list[i]
			//获取dot的位置和移动量
			var old_position = $(dot).offset()
    		//修改dot的位置，使其【增加】tile的移动量
    		$(dot).offset({
    			left: old_position.left + x,
    			top: old_position.top + y
    		})
    		dragLineDot(dot)
		}
	}
}






//右键dot_inner和dot_midway事件，弹出一个选项框
var focusing_dot
$("#huabu_container").on("mousedown",".line_dot:not(.line_dotLeft , .line_dotRight)",function(event){
	event.stopPropagation()
	//判断是否为右键
	if(event.which == 3){
		//显示该菜单，并将这个dot作为focusing_dot
		var dot
		if($(this).is(".line_dotMidway_inner")){
			focusing_dot = $(this).parent(".line_dotMidway")
		}
		else{
			focusing_dot = this
		}
		showHuabuMenu("line_dotInner_menu")
	}
})

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

	//创建三个dot，分别以line_inner,dot_inner,dot_right,arrow的顺序放在dot_left之后
	$(dot_left).after(line_inner)
	$(line_inner).after(dot_inner)
	$(dot_inner).after(dot_right)
	$(dot_right).after(arrow)

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
$("#line_dotInner_delete_branch").on("mouseenter",function(event){
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
	showChildMenu(this,"right")
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

