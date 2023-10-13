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
		"scale": "1",
		"name": name
	})

	$("#huabu_container").append(huabu);

	//使得huabu的中心位于container的中心
	$(huabu).offset({
		left:$("#huabu_container").offset().left + $("#huabu_container").width()/2 - $(huabu).width()/2,
		top:$("#huabu_container").offset().top + $("#huabu_container").height()/2 - $(huabu).height()/2
	})

	//为画布赋予功能
	abilityHuabu(huabu)

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

//画布的功能
function abilityHuabu(huabu) {
	//大小调整
	$(huabu).resizable({
		stop: function(event, ui) {
			var oldleft = ui.originalPosition.left;
			var newleft = ui.position.left
			var tile_container = $(huabu).children(".tile_container")
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
}

//加载画布，会将画布对象内的tile依次生成，这个过程会为所有tile附加新的tile_id
//！！！待修改：预计使用随机ID
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

//画布右键拖动实现原理是在container内的鼠标移动会改变huabu的left和top
var huabu_dragging = false
var lastX, lastY
$("#huabu_container").on("mousedown", function(event) {
	if (event.button === 2) {
		huabu_dragging = true;
		//令所有画布内菜单隐藏
		hideHuabuMenu("all")
		startX = lastX = event.clientX;
		startY = lastY = event.clientY;
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

//放大当前聚焦的画布
function enlargePage() {
	if ($(focusing_huabu).attr("scale") < 3) {
		//变成浮点数,提高精确性
		var huabu_scale = parseFloat($(focusing_huabu).attr("scale"))
		huabu_scale = Math.round((huabu_scale + 0.05)*100)/100
		//把修改后的值同步
		$(focusing_huabu).attr("scale", huabu_scale) 
		//修改scale
		$(focusing_huabu).css('transform',"scale("+huabu_scale+")");
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
		//修改scale
		$(focusing_huabu).css('transform',"scale("+huabu_scale+")");
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

//右键画布子菜单相关功能

//右键点击显示huabu_menu
var startX, startY
$("#huabu_container").on("mousedown",".huabu",function(event){
	//判断是否为右键
	if(event.button == 2){
		startX = event.clientX;
		startY = event.clientY;
	}
})
$("#huabu_container").on("mouseup",".huabu",function(event){
	if(startX == event.clientX && startY == event.clientY){
		//显示子菜单
		showHuabuMenu(event,"huabu_menu")
		//修改这个子菜单上的内容
		changeHuabuMenu()
	}
})

/*修改子菜单的显示 ：
	若剪贴板没有内容，则令“粘贴”键停用，
	若撤销指针没有内容，则令“撤回”键停用
	若重做指针没有内容，则令“重做”键停用
	若没有上一层画布，则令“返回上一层画布”键停用
*/
function changeHuabuMenu(){
	var menu = $("#huabu_menu")
	//判断剪贴板中的是否存在内容，如果不存在则将其disabled
	if(true){
		menu.children('#huabu_paste_here').addClass('disabled')
	}
}

//粘贴功能，将当前剪贴板上的内容复制一份到鼠标所在的位置
$("#huabu_menu #huabu_paste_here").on("click",function(){
	console.log("粘贴了")
})

//撤回功能，将画布恢复为撤回队列的上一个状态
$("#huabu_menu #huabu_undo").on("click",function(){
	console.log("撤回了")
})

//重做功能，将画布恢复为撤回队列的下一个状态
$("#huabu_menu #huabu_redo").on("click",function(){
	console.log("重做了")
})

//插入功能，当移动到“插入”选项时在右侧弹出子菜单
$("#huabu_menu #huabu_insert").on("mouseenter click",function(){
	showChildMenu(this,"right","dblclick","mouseleave")
})
//插入表格功能
$("#huabu_menu #huabu_insert_table").on("click",function(){
	console.log("插入了画布")
})
//插入图片功能
$("#huabu_menu #huabu_insert_picture").on("click",function(){
	console.log("插入了图片")
})
//插入链接功能
$("#huabu_menu #huabu_insert_link").on("click",function(){
	console.log("插入了链接")
})

//全选功能，将当前画布内的所有元素选中生成一个选中体
$("#huabu_menu #huabu_select_all").on("click",function(){
	var huabu = focusing_huabu
	$(huabu).children(".tile_container").children().addClass('ui-selected')
	createComposite($(huabu).find('.ui-selected'),"select")
})

//清空功能，将当前画布内的所有元素删除，但是会有一个提示框
$("#huabu_menu #huabu_delete_all").on("click",function(){
	var huabu = focusing_huabu
	//弹出选项框
	swal.fire({
		width: 400,
		backdrop: 'rgba(0,0,0,0.3)',
		html: '<div id="delete_alert">确认清空画布上的所有内容？',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: '确认',
		cancelButtonText: '取消'
	}).then((result) => {
		if (result.isConfirmed) {
			//清空huabu内的tile_container就行了
			$(huabu).children(".tile_container").empty()
		}
	})
})