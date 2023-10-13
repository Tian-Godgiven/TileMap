var button_alert //画布按钮功能框

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

//画布区域的选择功能，创建画布区域的套索并对选择的目标进行判定
$("#huabu_container").selectable({
	distance:1,
	filter:".tile , .line , .line_dot",
	selecting:function(event,ui){
		dom = ui.selecting
		if($(dom).is(".line_dot")){
			$(dom).removeClass('ui-selecting')//参与组合的不是dot对象而是Line对象
			dom = $(dom).parent(".line")
			$(dom).addClass('ui-selected')
		}
		focusingDom(dom)
	},
	unselecting:function(event,ui){
		dom = ui.unselecting
		unfocusingDom(dom)
	},
	start:function(){
		//消除之前的选中体
		destroyComposite($(this).find(".select_composite"))
	},
	stop:function(){
		//将选中的对象变成一个临时组合体
		createComposite($(this).find('.ui-selected'),"select")
	}
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
	changeHuabu(huabu);
}

//画布切换按钮的点击事件
function changeHuabuButton(event,button){
	var huabu = $("#" + $(button).attr("huabu"))
	//切换到当前画布
	changeHuabu(huabu); 
	//右键事件，打开对应的子菜单
	if (event.button === 2) {
		showHuabuMenu(event,"huabu_button_menu");
	}
}

//画布切换按钮的拖动事件，可以在这条栏位内拖动按钮以改变其顺序
$("#huabu_changeBar").sortable({ containment: "parent",tolerance: "pointer" });
    
$("#huabu_changeBar").disableSelection()

//创建画布拷贝，本质上是加载/读取一个已经存在的画布，创建新的画布
$("#copy_huabu").mousedown(function() {
	//获取当前聚焦画布的名称
	var huabu = return_focusing_huabu()
	var huabu_name = $(huabu).attr("name")
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

	clone_huabu = $(huabu).clone(true)
	$(clone_huabu).attr("name",clone_name)

	loadHuabu(clone_huabu)
})

//画布重命名按键与弹窗
$("#rename_huabu").mousedown(function() {
	var huabu = return_focusing_huabu()
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
			renameHuabu(huabu)
		}
	})
})
//画布重命名函数
function renameHuabu(huabu) {
	//获取重命名画布和他的按钮
	let button = $("#" + $(huabu).attr("id") +"_button")
	//根据输入值修改画布和按钮的id，以及按钮显示的内容
	var newname = $("#rename_input").val()
	$(huabu).attr("name", newname)
	$(button).html(newname)
}

//画布删除按键与子菜单
$("#delete_huabu").mousedown(function() {
	var huabu = return_focusing_huabu()
	swal.fire({
		width: 400,
		backdrop: 'rgba(0,0,0,0.3)',
		html: '<div id="delete_alert">确认删除画布：' + $(huabu).attr("name") + ' 吗？</div>',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: '确认',
		cancelButtonText: '取消'
	}).then((result) => {
		if (result.isConfirmed) {
			deleteHuabu(huabu)
		}
	})
})
//画布删除函数,将会删除指定画布与对应的按钮
function deleteHuabu(huabu) {
	var button = $("#" + $(huabu).attr("id") +"_button")
 
	$(huabu).remove()
	$(button).remove()
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
