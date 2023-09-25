// var huabu_list = []; //画布数组，记录当前已创建或者已加载的画布们
// var button_list = []; //画布对应的按钮的数组，记录画布们对应的按钮们

var huabu_id = 1; //为画布分配id的初值，用以唯一标识画布对象
var default_huabu_num = 1; //为默认画布分配的画布名的编号，与id无关

var focusing_huabu; //当前正在聚焦的画布，即当前显示的画布
var button_alert //画布按钮功能框

//返回当前的缩放大小，预计在整合时删除！
function return_scale() {
	return $(focusing_huabu).attr("scale")
}
//返回当前的聚焦画布，预计整合时删除
function return_focusing_huabu() {
	return focusing_huabu
}

//新画布的创建窗口
let addHuabu = function() {
	swal.fire({
		title: "创建画布",
		html: '<div id="addHuabu_alerttext">                                         \
			  画布名：<input class="addHuabu_input" id="huabu_name"></input> <br>    \
			  画布长：<input class="addHuabu_input" id="huabu_width"></input> <br>   \
			  画布宽：<input class="addHuabu_input" id="huabu_height"></input>\
			  </div>'
	}).then((result) => {
		if (result.isConfirmed) {
			var name = $("#huabu_name").val()
			var width = $("#huabu_width").val()
			var height = $("#huabu_height").val()
			createHuabu(name,width,height)
		}
	})
}

//创建新画布
function createHuabu(name,width,height) {

//对画布名称，画布长宽的默认定义
	if (name == "") {
		name = "画布" + default_huabu_num
		default_huabu_num += 1
	}

	//是0或者非数字
	if (width == "" || isNaN(width)) {
		//如果这是一个没有px或者去掉px后非全数字的东西，就设为默认值1000px
		if(width.indexOf("px") === -1 || isNaN(width.replace("px",""))){
			width = "1000px";
		}
		//如果有%号的话
		if (width.indexOf("%") != -1){
			width = parseInt(width)/100
			width = width * $("#huabu_container").width() + "px"
		}
	}
	else{
		width += "px"
	}


	if (height == "" || isNaN(height)) {
		//如果这是一个没有px或者去掉px后非全数字的东西，就设为默认值1000px
		if(height.indexOf("px") === -1 || isNaN(height.replace("px",""))){
			height = "1000px";
		}
		//如果有%号的话
		if (height.indexOf("%") != -1){
			height = parseInt(height)/100
			height = height * $("#huabu_container").height() + "px"
		}
	}
	else{
		height += "px"
	}

//创建画布，内含一个放置tile的tile_container,一个防止tile_text的textblock
	let huabu = $("<div></div>", {
		"class": "huabu",
		"id": "huabu_" + huabu_id,
	})

	$(huabu).css({
		"width": width,
		"height": height,
		"position": "absolute",
		"background-color": "white"
	})

	$(huabu).attr({
		"scale": "1",
		"name": name
	})

	focusing_huabu = huabu;
	$("#huabu_container").append(huabu);

	createHuabuButton(huabu) //创建对应画布的button
	createTileContainer(huabu)//创建对应画布的磁贴container
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
			var oldleft = ui.originalPosition.left;
			var newleft = ui.position.left
			var tile_container = $(this).children()[0]
			//当向左扩大时，画布的left移动了这样一个距离
			var distantleft = parseInt(newleft - oldleft)
			var str = $(tile_container).css("left")
			var oldleft = parseInt(str.substring(0, str.length - 2))
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
			var str = $(tile_container).css("top")
			var oldtop = parseInt(str.substring(0, str.length - 2))
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

//切换至聚焦画布，也就是focusing_huabu，原理是把其他的画布隐藏起来,同时修改对应画布button按键的属性
function changeHuabu() {
	$(".huabu").css("display", "none")
	$(focusing_huabu).css("display", "block")
	//修改按键的属性
	$(".huabu_button").css("color", "black")
	$("#" + $(focusing_huabu).attr("id") + "_button").css("color", "red")
	//附加事件
	rightArea_clearContent()//清空右侧区域显示的内容并关闭编辑权限
	ScaleShow(focusing_huabu)//显示该画布的scale
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

			var huabu_left = getLeft(focusing_huabu)
			var huabu_top  = getTop(focusing_huabu)

			$(focusing_huabu).css({
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

//创建画布时，同时创建对应的画布切换按钮,将画布的id置入button中
function createHuabuButton(huabu) {

	let button = $("<div></div>", {
		"class": "huabu_button",
		"id": $(huabu).attr("id") + "_button",
		"huabu": $(huabu).attr("id")
	});
	$(button).text($(huabu).attr("name"))

	if($(huabu).attr("name").length<2){
		$(button).css("width","35px")
	}
	$("#huabu_changeBar").append(button)
	

	$(button).on("mousedown",function(){
		changeHuabuButton(event,this)
	})
	changeHuabu();
}

//画布切换按钮的点击事件
function changeHuabuButton(event,button){
	var huabu = $("#" + $(button).attr("huabu"))
	//切换到当前画布
	focusing_huabu = huabu
	changeHuabu(); 
	if (event.button === 2) {
		buttonAlert(event, button); //右键事件，调用功能栏
	}
}

//画布按钮的右键功能选项框
function buttonAlert(event, button) {

	let alert = $("#huabu_button_alert")
	var huabu_id = $(button).attr("huabu")

	alert.css({
		"left": event.clientX,
		"top": event.clientY - 120,
	})
	alert.show()

	$("*").click(function(event) {
		if(!alert.is(event.target)) {
			alert.hide()
		}
	})
}

//创建画布拷贝，本质上是加载/读取一个已经存在的画布，创建新的画布
$("#copy_huabu").mousedown(function() {
	//获取当前聚焦画布的名称
	var huabu_name = $(focusing_huabu).attr("name")
	var clone_name = huabu_name + "的副本"
	var clone_num = 1
	
	//为了防止创建同一个画布的多个副本重名，为拷贝产生的副本进行重命名，重命名规则如下：
	//对一个“画布A”的拷贝，明明为"画布A的副本"，对其令一个拷贝，命名为“画布A的副本(2)”
	$("#huabu_container").find(".huabu").each(function(){
		while($(this).attr("name") == clone_name){
			clone_name = huabu_name + "的副本(" + clone_num + ")"
			clone_num += 1 
		}
	})

	clone_huabu = $(focusing_huabu).clone(true)
	$(clone_huabu).attr("name",clone_name)

	loadHuabu(clone_huabu)
})

//画布重命名按键与弹窗
$("#rename_huabu").mousedown(function() {
	swal.fire({
		width: 600,
		backdrop: 'rgba(0,0,0,0.3)',
		html: '<div id="rename_alert">重命名：<input id="rename_input" value="' + $(focusing_huabu).attr("name") + '"></input></div>',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: '确认',
		cancelButtonText: '取消'
	}).then((result) => {
		if (result.isConfirmed) {
			renameHuabu()
		}
	})
})
//画布重命名函数
function renameHuabu() {
	//获取重命名画布和他的按钮
	let huabu = focusing_huabu
	let button = $("#" + $(focusing_huabu).attr("id") +"_button")
	//根据输入值修改画布和按钮的id，以及按钮显示的内容
	var newname = $("#rename_input").val()
	$(huabu).attr("name", newname)
	$(button).html(newname)
}

//画布删除按键与弹窗
$("#delete_huabu").mousedown(function() {
	swal.fire({
		width: 400,
		backdrop: 'rgba(0,0,0,0.3)',
		html: '<div id="delete_alert">确认删除画布：' + $(focusing_huabu).attr("name") + ' 吗？</div>',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: '确认',
		cancelButtonText: '取消'
	}).then((result) => {
		if (result.isConfirmed) {
			deleteHuabu()
		}
	})
})
//画布删除函数,将会删除当前聚焦的画布与对应的按钮
function deleteHuabu() {
	let huabu = focusing_huabu
	let button = $("#" + $(focusing_huabu).attr("id") +"_button")
 
	$(huabu).remove()
	$(button).remove()
}

//创建画布时，同时为其创建不同的磁贴container
function createTileContainer(huabu) {
    var tile_container = $("<div></div>", {
        "class": "tile_container"
    });
    $(huabu).append(tile_container);
}


//放大当前聚焦的画布
function enlargePage() {
	if ($(focusing_huabu).attr("scale") < 3) {
		var huabu_scale = parseFloat($(focusing_huabu).attr("scale")) //变成浮点数
		huabu_scale = Math.round((huabu_scale + 0.05)*100)/100
		$(focusing_huabu).attr("scale", huabu_scale) //把修改后的值放回来
		$(focusing_huabu).css({
			transform: 'scale(' + huabu_scale + ')',
		});
		ScaleShow(focusing_huabu)
	}
}

//缩小当前聚焦的画布
function narrowPage() {
	if ($(focusing_huabu).attr("scale") > 0.1) {
		var huabu_scale = parseFloat($(focusing_huabu).attr("scale"))
		huabu_scale = Math.round((huabu_scale - 0.05)*100)/100
		$(focusing_huabu).attr("scale", huabu_scale)
		$(focusing_huabu).css({
			transform: 'scale(' + huabu_scale + ')',
		});
		ScaleShow(focusing_huabu)
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

//画布界面的resize功能，原理是拖动一个长条div改变两边的width
//移动到上面时，会显示透明的拖动条
$(".resize_block").mouseenter(function(){
$(this).css({
	"opacity":"0.3"
	})
})	
$(".resize_block").mouseleave(function(){
$(this).css({
	"opacity":"0"
	})
})	

//拖动resize可以将两侧栏与画布的width相对改变
var resize_dragging = false;
var resize_lastX
var resizeside
$(".resize_block").on("mousedown",function(event){
	resize_dragging = true;
	resize_lastX = event.clientX;

	if(this.id=="left_resize"){
		resizeside = "left"
	}
	else{
		resizeside = "right"
	}
//使用document有效防止拖动速度过快导致移出判定框
	document.onmousemove = function(event){
		if(resize_dragging){
			var huabu_width = $("#huabu_area").width();
			var huabu_left 	= $("#huabu_area").position().left;
			var huabu_right = $("#huabu_area").position().right;
			//根据点击判定框获取将要移动的区域
			var resize_width = $("#"+resizeside+"_area").prop("offsetWidth");

			//拖动的距离，将判定框向→拖动时，这是一个正数
			var distantX = event.clientX - resize_lastX;

			if(resizeside == "left"){
				//当修改左侧大小时，画布向左侧移动时令left减少，此时distantX为负数所以+distantX
				$("#huabu_area").css({
					"width":huabu_width - distantX,
				})
				$("#"+resizeside+"_area").css({
					"width":resize_width + distantX
				})
			}
			else if(resizeside == "right"){
				//当修改右侧大小时，画布向左侧移动时令right增加,此时distantX为负数所以-distantX
				$("#huabu_area").css({
					"width":huabu_width+distantX,
				})
				$("#"+resizeside+"_area").css({
					"width":resize_width-distantX,
				})
			}
			resize_lastX = event.clientX;
		}
	}

	document.onmouseup=function(event){
		resize_dragging = false
	}
})
