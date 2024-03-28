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
	if($(focusing_huabu).is(".huabu")){
		return focusing_huabu
	}
	else{
		return false
	}
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

	//创建画布元素
	let huabu = $("<div></div>", {
		"class": "huabu",
		"id": "huabu_" + huabu_id,
		"scale": 1,
		"name": name,
		"z_index_max":1,
		"z_index_min":1,
	})

	$(huabu).css({
		"width": width,
		"height": height,
		"position": "absolute",
		"background-color": "white",
		"transform":"scale(1)",
		"transform-origin":"center"
	})

	$(huabu).attr({
		"size":"customization"
	})

	$("#huabu_container").append(huabu);

	//使得huabu的中心位于container的中心
	$(huabu).offset({
		left:$("#huabu_container").offset().left + $("#huabu_container").width()/2 - $(huabu).width()/2,
		top:$("#huabu_container").offset().top + $("#huabu_container").height()/2 - $(huabu).height()/2
	})

	//为画布赋予功能
	abilityHuabu(huabu)

	//画布包含：一个放置object或dot的container
	//　　　　　　　内部包含object_conatiner和dot_container
	//		   一个放置tile_text的textblock
	var container = $("<div>",{class:"container"})
		var object_container = $("<div>", {"class": "object_container container"});
		var textblock_container = $("<div>",{"class": "textblock_container container"})
	    var dot_container = $("<div>", {"class": "dot_container container"});
    	$(container).append(object_container,textblock_container,dot_container);
    $(huabu).append(container)

	createHuabuButton(huabu) //创建对应画布的button

	//画布id递增
	huabu_id++;

	//返回一个生成的画布id，可能会有用
	return huabu
}

//画布的功能
function abilityHuabu(huabu) {
	//大小调整
	$(huabu).resizable({
		resize:function(event,ui) {
			showHuabuSize(huabu)
		},
		stop: function(event, ui) {
			var oldleft = ui.originalPosition.left;
			var newleft = ui.position.left
			var container = $(huabu).children(".container")
			//当向左扩大时，画布的left移动了这样一个距离
			var distantleft = parseInt(newleft - oldleft)
			var oldleft = parseInt($(container).css("left"))
			//令画布内的Tile反向移动这样一个距离，这样当画布向左扩大时，tile的位置不会改变
			var moveleft = oldleft - distantleft
			if (distantleft != 0) {
				$(container).css({
					"left": moveleft
				})
			}

			var oldtop = ui.originalPosition.top;
			var newtop = ui.position.top
			//当向上扩大时，画布的top移动了这样一个距离
			var distanttop = parseInt(newtop - oldtop)
			var oldtop = parseInt($(container).css("top"))
			var movetop = oldtop - distanttop
			if (distanttop != 0) {
				$(container).css({
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

	//右键点击显示huabu_menu
	var startX, startY
	$(huabu).on("mousedown",function(event){
		//判断是否点到了画布对象，而不是点到其子元素
		if(!$(event.target).is(".huabu")) {
			return 0;
		}
		//判断是否为右键
		if(event.button == 2){
			startX = event.clientX;
			startY = event.clientY;
		}
		hideHuabuMenu("all")
	})
	$(huabu).on("mouseup",function(event){
		if(startX == event.clientX && startY == event.clientY && event.button == 2){
			//显示子菜单
			showHuabuMenu(event,"huabu_menu")
			changeHuabuMenu()
		}
	})
}

//加载画布，会将画布对象内的tile依次生成，这个过程会为所有tile附加新的tile_id
//！！！待修改：预计使用随机ID
function loadHuabu(huabu){
	var name = $(huabu).attr("name");
	var width = $(huabu).css("width");
	var height = $(huabu).css("height");

	var new_huabu = createHuabu(name,width,height);
	changeHuabu(new_huabu)
}

//聚焦画布
function focusingHuabu(huabu){
	focusing_huabu = huabu
	//取消其他对象的聚焦
	unfocusingObject("all")
	//在右侧显示画布的数据
	changeHuabuDesign(huabu)
	changeHuabuEdit(huabu)
}

//切换至指定画布，令其聚焦
function changeHuabu(huabu) {
	//隐藏其他画布
	$("#huabu_container .huabu").hide()
	$(huabu).show()
	//切换到对应按钮
	changeHuabuButton(huabu)

	//如果这是一个嵌套画布
	if($(huabu).is(".nested_huabu")){
		//显示画布顶部操作栏的返回和关闭
		$("#huabu_ability_returnNestFrom").show()
		$("#huabu_ability_closeNestHuabu").show()
	}
	else{
		//否则不显示
		$("#huabu_ability_returnNestFrom").hide()
		$("#huabu_ability_closeNestHuabu").hide()
	}
	
	//附加事件
	rightArea_clearContent()//清空右侧功能区中的内容栏并关闭编辑权限
	//聚焦画布
	focusingHuabu(huabu)
}



//画布右键拖动,原理是在container内的鼠标移动会改变huabu的left和top
var huabu_dragging = false
var lastX, lastY
function changeHuabuDragging(temp){
	if(temp == true || temp == false){
		huabu_dragging = temp
	}
}
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
function enlargeHuabu() {
	if ($(focusing_huabu).attr("scale") < 3) {
		//变成浮点数,提高精确性
		var huabu_scale = parseFloat($(focusing_huabu).attr("scale"))
		huabu_scale = Math.round((huabu_scale + 0.05)*100)/100
		//把修改后的值同步
		$(focusing_huabu).attr("scale", huabu_scale) 
		//修改scale
		$(focusing_huabu).css('transform',"scale("+huabu_scale+")");
		//同步显示到屏幕上
		showHuabuScale(focusing_huabu)
	}
}
//缩小当前聚焦的画布
function narrowHuabu() {
	if ($(focusing_huabu).attr("scale") > 0.1) {
		var huabu_scale = parseFloat($(focusing_huabu).attr("scale"))
		huabu_scale = Math.round((huabu_scale - 0.05)*100)/100
		$(focusing_huabu).attr("scale", huabu_scale)
		//修改scale
		$(focusing_huabu).css('transform',"scale("+huabu_scale+")");
		showHuabuScale(focusing_huabu)
	}
}

//画布删除函数,将会删除指定画布与对应的按钮
function deleteHuabu(huabu) {
	//对话框
	swal.fire({
		width: 400,
		backdrop: 'rgba(0,0,0,0.3)',
		html: '<div id="delete_alert">确认删除画布：' + $(huabu).attr("name") + ' 吗？</div>\
			   <div>这同时也会删除其内部元素所嵌套的画布！<div>',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: '确认',
		cancelButtonText: '取消'
	}).then((result) => {
		if (result.isConfirmed) {
			//获取画布对应的按钮
			var button = $("#" + $(huabu).attr("id") +"_button")
			//按画布按钮对应顺序的顺延到下一个画布
			var next_button = $(button).next(".huabu_button:not('.nesting')")
			//如果没有下一张画布则顺延到上一个画布
			if(next_button.length <= 0){
				next_button = $(button).prev(".huabu_button:not('.nesting')")
			}

			//如果前后都没有画布了，则顺延画布为undefined
			if(next_button.length <= 0){
				var next_huabu = undefined
			}
			//否则获取对应的顺延画布
			else{
				var next_huabu = $("#" + $(next_button).attr("huabu"))
			}

			//获取画布的下一层嵌套画布
			var next_nested_huabu = $(huabu).data("next_nested_huabu")
			//将当前画布的下一层嵌套画布删除
			for(nested_huabu in next_nested_huabu){
				deleteHuabu(nested_huabu)
			}
			//将当前画布与其对应的按钮删除
			$(huabu).remove()
			deleteHuabuButton(huabu)

			//切换到顺延画布
			changeHuabu(next_huabu)
		}
	})
}

//画布拷贝函数
function copyHuabu(huabu,type){
	//获取该画布的名称
	var huabu_name = $(huabu).attr("name")
	var clone_name = huabu_name + "的副本"
	var clone_num = 1

	//如果存在与这个名称相同的画布，则按数字重命名
	//重命名规则如下：xx的副本→xx的副本(1)→xx的副本(2)
	while($("#huabu_container").children("[name='"+ clone_name +"']").length > 0){
		clone_name = huabu_name + "的副本(" + clone_num + ")"
		clone_num += 1
	}

	clone_huabu = $(huabu).clone(true)
	$(clone_huabu).attr("name",clone_name)

	//如果type为不拷贝拷贝画布内元素，则删除huabu>conatiner>div中的元素
	if(type == "no_copy_tile"){
		$(clone_huabu).children(".container > div").empty()
		//同时也会删除嵌套画布
	}
	//如果type为不拷贝嵌套，则删除画布对应的嵌套画布
	else if(type == "no_copy_nest"){

	}
	//否则，还要将画布对应的嵌套画布分别进行拷贝，并绑定到对应的元素上
	else{

	}

	//如果这个画布是嵌套在一个元素上，那么产生的clone画布不是一个嵌套画布
	//解除clone画布的嵌套性质
	if($(huabu).is(".nest_huabu")){
		$(clone_huabu).removeClass(".nest_huabu .nesting .nested")
		$(clone_huabu).removeAttr("nest_from")
	}

	//最后加载这个clone_huabu
	loadHuabu(clone_huabu)
}

//滑轮修改画布大小
$(document).ready(function scrollHuabu(){
	var wheelDelta;
	function test() {
		var e = e || window.event;
		if (e.wheelDelta) {
			wheelDelta = e.wheelDelta;
		} 
		else if (e.detail) {
			wheelDelta = e.detail;
		}
	};
	$("#huabu_container").on("mousewheel",function() {
		test();
		if (wheelDelta > 0) {
			enlargeHuabu()
		} 
		else {
			narrowHuabu()
		}
	})
})

//修改指定画布的名称
function renameHuabu(huabu){
	swal.fire({
		width: 600,
		backdrop: 'rgba(0,0,0,0.3)',
		html: '<div id="rename_alert">重命名：<input id="rename_input" value="' + $(huabu).attr("name") + '"></input></div>',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: '确认',
		cancelButtonText: '取消'
	}).then((result) => {
		if (result.isConfirmed) {
			//获取重命名画布和他的按钮
			let button = $("#" + $(huabu).attr("id") +"_button")
			//根据输入值修改画布和按钮的id，以及按钮显示的内容
			var newname = $("#rename_input").val()
			$(huabu).attr("name", newname)
			$(button).html(newname)
			showHuabuName(huabu)
		}
	})
}

//为画布增添网格背景
function gridHuabu(huabu){
	//获取网格背景子元素
	var grid = $(huabu).find(".huabu_grid")
	//如果画布没有网格背景子元素
	if($(huabu).find(".huabu_grid").length <= 0){
		//为这个画布增添一个网格背景子元素
		var grid = $("<div class='huabu_grid'></div>")
		//默认网格参数为100，浅灰色
		$(grid).attr({
			"grid_size" : 100,
			"grid_color" : "#808080"
		})
		$(huabu).append(grid);
	}
	//提取出grid元素中的网格参数
	var grid_size= $(grid).attr("grid_size") 
	var grid_color = $(grid).attr("grid_color")
	//通过网格参数获得对应图片的base64编码
	var base64 = getGridBase64(grid_size,grid_color)
	//为grid元素加入网格背景
	var url = 'url("data:image/svg+xml;base64,' + base64 +'")'
	$(grid).css("background-image",url)
	//修改画布的grid属性为true
	$(huabu).prop("grid",true)
}
//去除画布的网格背景
function UngridHuabu(huabu){
	//为grid元素去除网格背景
	$(huabu).children(".huabu_grid").css("background-image","none")
	//修改画布的grid属性为false
	$(huabu).prop("grid",false)
}

//通过tile打开嵌套画布
function openNestedHuabu(tile,nested_huabu){
	//若tile设置了禁止打开画布
	if($(tile).prop("nestSet_noOpen")){
		return false
	}
	if(nested_huabu == null){
		nested_huabu = $(tile).data("nest_huabu")
	}
	//令其显示
	$(nested_huabu).removeClass("hide")
	$(nested_huabu).show()
	//保存这个Tile，在返回上一层画布时使用
	$(nested_huabu).data("nest_from",tile)

	//为嵌套画布生成一个底部button，该函数内置重复判定，不会重复生成
	createHuabuButton(nested_huabu)
	//聚焦到这个画布上
	changeHuabu(nested_huabu)

	//动画：由tile为源点，嵌套画布逐渐扩大

}
//返回上一层画布
function returnNestFrom(nested_huabu){
	//获取画布来源
	var tile = $(nested_huabu).data("nest_from")
	if(tile){
		//获取来源所在的画布
		var nest_from_huabu = $(tile).parents(".huabu")
		//如果这个画布是一个嵌套画布，并且正在被隐藏
		if($(nest_from_huabu).is(".hide")){
			//则令来源画布去除hide
			console.log("去除了hide")
			$(nest_from_huabu).removeClass("hide")
			//并产生按键
			createHuabuButton(nest_from_huabu)
		}
		changeHuabu(nest_from_huabu)
	}
}
//关闭嵌套画布，返回其来源的上一层画布
function closeNestedHuabu(nested_huabu){
	//令其隐藏
	$(nested_huabu).addClass("hide")
	$(nested_huabu).hide()
	
	//删除这个画布的底部button
	deleteHuabuButton(nested_huabu)
	//返回上一层画布
	returnNestFrom(nested_huabu)
	//动画：嵌套画布逐渐缩

}


