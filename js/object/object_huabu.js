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
		"id": "huabu_" + createRandomId(15),
		"scale": 1,
		"name": name,
		"z_index_max":1,
		"z_index_min":1,
	})

	$(huabu).css({
		"width": width,
		"height": height,
		"background-color": "white",
		"transform":"scale(1)",
	})

	$(huabu).attr({
		"size":"customization"
	})

	$("#huabu_container").append(huabu);

	backCenterHuabu(huabu)
	
	useHuabu(huabu)

	pushToUndo(huabu,"create")

	//返回一个生成的画布id，可能会有用
	return huabu
}

//启用一个画布
function useHuabu(huabu){
	//为画布赋予功能
	abilityHuabu(huabu)

	//画布包含：一个放置object的object_container
	//		   一个放置tile_text的textblock_container
	var container = $("<div>",{class:"container"})
		var object_container = $("<div>", {"class": "object_container container"});
		var textblock_container = $("<div>",{"class": "textblock_container container"})
    	$(container).append(object_container,textblock_container);

    $(huabu).append(container)

    //创建对应画布的button
	createHuabuButton(huabu) 
}

//画布的功能
function abilityHuabu(huabu) {
	//大小调整
	$(huabu).resizable({
		start:function(){
			pushToUndo(huabu)
		},
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

	//对象块放置在画布上时，令其加入画布
	$(huabu).droppable({
		accept:".objectBlock:not('.collection_edit_menu_block')",
		drop:function(event,ui){
			//如果它还没有进入画布area，则不能放进来
			if(!ui.helper.hasClass("in_huabu_area")){
				ui.draggable.draggable('option', 'revert', true);
			}
			//否则把他放进来
			else{
				ui.draggable.draggable('option', 'revert', false);
				var huabu = return_focusing_huabu()
				var scale = return_huabu_scale(huabu)
				//放置位置为：（元素当前所在的offset - container偏移量） / 缩放
			    var top = (ui.helper.offset().top - $(huabu).children('.container').offset().top)/scale 
			    var left = (ui.helper.offset().left- $(huabu).children('.container').offset().left)/scale
				
				//获取对象的json
				var object_json = ui.helper.data("object_json")
				//通过这个type生成一个新的对象
				createObject(object_json,"json","new")
				.then(object=>{
			        // 调整放置位置，放进了画布以后就不需要scale了
			        $(object).css({
			      	  	transform:"none",
			      	  	"transform-origin": "none",
			      	  	opacity:"1",
			      	  	//放置的位置受到画布的scale影响
			          	top: top,
			        	left: left
			        });
			        //放进画布中
			        objectIntoHuabu(object,huabu,"new")
				})
			}
		}
	})

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
		hideObjectMenu("all")
	})
	$(huabu).on("mouseup",function(event){
		if(startX == event.clientX && startY == event.clientY && event.button == 2){
			//显示画布菜单
			showHuabuMenu(event,huabu)
		}
	})
}

//将一个对象加入到画布中
//mode: new:创建一个新对象
//		load:从文件中读取得到的这个新对象
function objectIntoHuabu(object,huabu,mode){

	if($(object).is(".huabu")){
		return false
	}

	//删除其临时类
	$(object).removeClass('in_huabu_area')
	//为其添加huabu_object类
	$(object).addClass('huabu_object')
	//放入指定的画布中
	$(huabu).find('.object_container').append(object)

	//如果是组合体
	if($(object).is(".composite")){
		//为其子元素添加huabu_object类
		$(object).children(".object").addClass('huabu_object')
		//刷新其中的线条子元素
		$(object).children(".line").each(function(){
			refreshLinePosition(this,"new")
		})
	}

	//在非读取的情况下，进入撤销重做栈
	if(mode != "file"){
		pushToUndo(object,"create")
	}
	
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
	//如果当前画布就是目标画布，则退出
	if(focusing_huabu == huabu){
		return 0
	}
	else if(huabu == null){
		focusing_huabu = null
	}

	//隐藏其他画布
	$("#huabu_container .huabu").hide()
	$(huabu).show()
	//切换到对应按钮
	changeHuabuButton(huabu)

	//如果这个画布能够返回到某一个画布中(也就是其源头栈不为空)
	var stack = $(huabu).data("sourceHuabu_stack")
	//如果源头栈为空
	if(stack == undefined || stack.length == 0){
		//不显示画布顶部操作栏的返回和关闭
		$("#huabu_ability_returnNestFrom").hide()
		$("#huabu_ability_closeNestHuabu").hide()
	}
	else{
		//否则显示
		$("#huabu_ability_returnNestFrom").show()
		$("#huabu_ability_closeNestHuabu").show()
	}
	
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
		hideObjectMenu("all")
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
			pushToUndo(huabu)
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
}

//清除该画布内的所有元素
function clearHuabu(huabu){
	//保存下这个画布
	pushToUndo(huabu,"clear")
	$(huabu).find(".object_container").empty()
	$(huabu).find(".textblock_container").empty()
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

//使得huabu的中心位于container的中心
function backCenterHuabu(huabu){
	var left = $("#huabu_container").width()/2 - $(huabu).width()/2
	var top = $("#huabu_container").height()/2 - $(huabu).height()/2
	$(huabu).css({
		left:left,
		top:top
	})
}

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
			pushToUndo(huabu)
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




