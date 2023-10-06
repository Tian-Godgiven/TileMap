var huabu_id = 1; //为画布分配id的初值，用以唯一标识画布对象
var default_huabu_num = 1; //为默认画布分配的画布名的编号，与id无关

var focusing_huabu; //当前正在聚焦的画布，即当前显示的画布



//返回当前画布的缩放大小，预计在整合时删除！
function return_huabu_scale(huabu) {
	if(huabu == undefined){
		huabu = focusing_huabu
	}
	return $(huabu).attr("scale")
}
//返回当前画布的角度
function return_huabu_angle(huabu){
	if(huabu == undefined){
		huabu = focusing_huabu
	}
	return $(huabu).attr("angle")
}
//返回当前画布的旋转后左上角的位置，提供给jq-ui函数
function return_huabu_centerOffset(){
	//center的坐标就是画布中心的位置：
	var huabu = focusing_huabu
	var center = $(huabu).find(".center").offset()

	//顶点相对于中心点的偏移量
	var delta_x = - $(huabu).width()/2 * return_huabu_scale()
	var delta_y = - $(huabu).height()/2 * return_huabu_scale()

	//旋转弧度
	var radian = - $(huabu).attr("angle") * Math.PI / 180

	//计算旋转后的相对坐标
	var new_delta_x = delta_x * Math.cos(radian) + delta_y * Math.sin(radian)
	var new_delta_y = - delta_x * Math.sin(radian) + delta_y * Math.cos(radian)

	//将相对坐标加上中心点的坐标，得到旋转后的左上角顶点的坐标
	var new_x = center.left + new_delta_x
	var new_y = center.top + new_delta_y
	
	return {left:new_x,top:new_y}
}
//返回当前的聚焦画布，预计整合时删除
function return_focusing_huabu() {
	return focusing_huabu
}




//创建新画布
function createHuabu(name,width,height) {
	//对画布名称，画布长宽的默认定义
		if (name == "") {
			name = "画布" + default_huabu_num
			default_huabu_num += 1
		}

		//如果是非纯数字或为空
		if (width == "" || isNaN(width)) {
			//如果这是一个带有px的纯数字，就去掉其px设为
			if(width == "" ){
				width = 1000
			}
			else if(! isNaN(width.replace("px",""))){
				width.replace("px","")
			}
			//如果是一个带有%号的纯数字转化为百分比
			else if (! isNaN(width.replace("%",""))){
				width = width.replace("%","") / 100
				width = width * $("#huabu_container").width()
			}
			else{
				width = 1000
			}

		}

		if (height == "" || isNaN(height)) {
			if(height == "" ){
				height = 1000
			}
			else if(! isNaN(height.replace("px",""))){
				width.replace("px","")
			}
			else if(! isNaN(height.replace("%",""))){
				height = height.replace("%","")/100
				height = height * $("#huabu_container").height()
			}
			else{
				height = 1000
			}
		}

	//创建画布，内含一个放置tile的tile_container,一个放置tile_text的textblock
	let huabu = $("<div></div>", {
		"class": "huabu",
		"id": "huabu_" + huabu_id,
	})

	$(huabu).css({
		"width": width,
		"height": height,
		"position": "absolute",
		"background-color": "white",
		"transform":"rotate(0deg) scale(1)",
		"transform-origin":"center"
	})

	$(huabu).attr({
		"angle": "0",
		"scale": "1",
		"name": name
	})

	var huabu_center = $("<div>",{"class":"center"})
	$(huabu_center).css({
		"left":width/2,
		"top":height/2
	})

	$(huabu).append(huabu_center)
	$("#huabu_container").append(huabu);

	//使得huabu的中心位于container的中心
	$(huabu).offset({
		left:$("#huabu_container").offset().left + $("#huabu_container").width()/2 - $(huabu).width()/2,
		top:$("#huabu_container").offset().top + $("#huabu_container").height()/2 - $(huabu).height()/2
	})

	//创建画布的tile_container，这里是放置一切画布内的对象的地方
	var tile_container = $("<div></div>", {
        "class": "tile_container"
    });
    $(huabu).append(tile_container);

	createHuabuButton(huabu) //创建对应画布的button
	createTextBlock(huabu)

	//画布id递增
	huabu_id++;

	//返回一个生成的画布id，可能会有用
	return "huabu_" + (huabu_id-1)
}

//画布的大小调整功能
$(document).on("mouseenter", ".huabu:not(.ui-resizable)", function() {
	$(this).resizable({
		stop: function(event, ui) {

			$(this).children('.center').css({
				"left": $(this).width()/2,
				"top": $(this).height()/2
			})



			var oldleft = ui.originalPosition.left;
			var newleft = ui.position.left
			var tile_container = $(this).children(".tile_container")
			//当向左扩大时，画布的left移动了这样一个距离
			var distantleft = parseInt(newleft - oldleft)
			var oldleft = parseInt($(tile_container).css("left"))
			//令画布内的Tile反向移动这样一个距离，这样当画布向左扩大时，tile的位置不会改变
			var moveleft = oldleft - distantleft
			if (distantleft < 0) {
				$(tile_container).css({
					"left": moveleft
				})
			}
			if (distantleft > 0) {
				$(tile_container).css({
					"left": moveleft
				})
			}

			var oldtop = ui.originalPosition.top;
			var newtop = ui.position.top
			//当向上扩大时，画布的top移动了这样一个距离
			var distanttop = parseInt(newtop - oldtop)
			var oldtop = parseInt($(tile_container).css("top"))
			var movetop = oldtop - distanttop
			if (distanttop < 0) {
				$(tile_container).css({
					"top": movetop
				})
			}
			if (distanttop > 0) {
				$(tile_container).css({
					"top": movetop
				})
			}
		},
		autoHide: true,
		animate: false,
		animateEasing: "swing",
		ghost: false,
		handles: "n,e,s,w,ne,nw,se,sw",
		autoHide: true
	});
})

//加载画布，会将画布对象内的tile依次生成，这个过程会为所有tile附加新的tile_id
function loadHuabu(huabu){
	var name = $(huabu).attr("name");
	var width = $(huabu).css("width");
	var height = $(huabu).css("height");

	new_huabu_id = createHuabu(name,width,height);

	$(huabu).find(".tile").each(function(){
		tile = loadTile(this)
		$("#" + new_huabu_id + " .tile_container").append(tile)
	})
}

//切换至指定画布，令其聚焦，原理是把其他的画布隐藏起来,同时修改对应画布button按键的属性
function changeHuabu(huabu) {
	focusing_huabu = huabu

	$(".huabu").hide()
	$(focusing_huabu).show()
	//修改按键的属性
	$(".huabu_button").css("color", "black")
	$("#" + $(focusing_huabu).attr("id") + "_button").css("color", "red")
	//附加事件
	rightArea_clearContent()//清空右侧区域显示的内容并关闭编辑权限
	showScale(focusing_huabu)//显示该画布的scale
}

//画布右键拖动实现
var huabu_dragging = false
var lastX, lastY
$("#huabu_container").on("mousedown", function(event) {
	if (event.button === 2) {
		huabu_dragging = true;
		lastX = event.clientX;
		lastY = event.clientY;
	}
})

$("#huabu_container").on("mousemove", function(event) {
	if (huabu_dragging) {

		var huabu = focusing_huabu
		var huabu_left = parseInt($(huabu).css("left"));
		var huabu_top  = parseInt($(huabu).css("top"));

		$(huabu).css({
			"left": huabu_left + (event.clientX - lastX),
			"top" : huabu_top  + (event.clientY - lastY)
		})
		
		lastX = event.clientX;
		lastY = event.clientY;
	}
})

$("#huabu_container").on("mouseup", function(event) {
	huabu_dragging = false
})

//顺时针旋转当前聚焦的画布
function rotateHuabu(angle){
	var old_angle = parseInt($(focusing_huabu).attr("angle"))
	var new_angle = old_angle + angle

	//将其角度转化为大于0小于360的整数
	while(new_angle >= 360){
		new_angle -= 360
	}
	while(new_angle < 0){
		new_angle += 360
	}

	//如果这个角度不为0，则禁用huabu的resizable功能，否则启用
	if(new_angle != 0){
		$(focusing_huabu).resizable("disable")
	}
	else{
		$(focusing_huabu).resizable("enable")
	}

	//同步修改画布的属性
	$(focusing_huabu).attr("angle",new_angle)
	//获取放大/缩小倍数
	var scale = return_huabu_scale()
	var transform = "rotate("+new_angle+"deg) scale("+scale+")"
	//修改angle进行旋转
	$(focusing_huabu).css('transform',transform);
}

//放大当前聚焦的画布
function enlargePage() {
	if ($(focusing_huabu).attr("scale") < 3) {
		//变成浮点数,提高精确性
		var huabu_scale = parseFloat($(focusing_huabu).attr("scale"))
		huabu_scale = Math.round((huabu_scale + 0.05)*100)/100

		console.log
		//把修改后的值同步
		$(focusing_huabu).attr("scale", huabu_scale) 
		//获取角度
		var angle = return_huabu_angle()
		var transform = "rotate("+angle+"deg) scale("+huabu_scale+")"
		//修改scale
		$(focusing_huabu).css('transform',transform);
		//同步显示到屏幕上
		showScale(focusing_huabu)
	}
}
//缩小当前聚焦的画布
function narrowPage() {
	if ($(focusing_huabu).attr("scale") > 0.1) {
		var huabu_scale = parseFloat($(focusing_huabu).attr("scale"))
		huabu_scale = Math.round((huabu_scale - 0.05)*100)/100
		$(focusing_huabu).attr("scale", huabu_scale)
		var angle = return_huabu_angle()
		var transform = "rotate("+angle+"deg) scale("+huabu_scale+")"
		//修改scale
		$(focusing_huabu).css('transform',transform);
		showScale(focusing_huabu)
	}
}

//滑轮修改画布大小
window.onload = function() {
	var wheelDelta;

	function test() {
		var e = e || window.event;
		if (e.wheelDelta) {
			wheelDelta = e.wheelDelta;
		} else if (e.detail) {
			wheelDelta = e.detail;
		}
	};
	document.DOMMouseScroll = function() {
		test();
		if (wheelDelta > 0) {
			enlargePage()
		} else {
			narrowPage()
		}
	}
	$("#huabu_container").on("mousewheel",function() {
		test();
		if (wheelDelta > 0) {
			enlargePage()
		} else {
			narrowPage()
		}
	})
}

