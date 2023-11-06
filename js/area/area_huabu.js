//新画布的创建窗口
function addHuabu() {
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
	filter:".tile .center , .line , .line_dot",
	tolerance:"touch",
	selecting:function(event,ui){
		$dom = $(ui.selecting)
		//参与组合的不是这些子对象而是其父对象
		if($dom.is(".line_dot , .center")){
			$dom.removeClass('ui-selecting')
			$dom = $dom.parent()
			$dom.addClass('ui-selected')
		}
		focusingDom($dom)
	},
	unselecting:function(event,ui){
		$dom = $(ui.unselecting)
		//参与组合的不是这些子对象而是其父对象
		if($dom.is(".line_dot , .center")){
			$dom = $dom.parent()
			$dom.removeClass('ui-selected')
		}
		unfocusingDom($dom)
	},
	start:function(){
		//消除之前的选中体和selected类
		$(".ui-selected").removeClass('ui-selected')
		destroyComposite($(this).find(".select_composite"))
	},
	stop:function(){
		//将选中的对象变成一个选中体=临时组合体
		createComposite($(this).find('.ui-selected'),"select")

	}
})




// 画布区域的changeBar功能
//1.创建画布对应的切换按钮,将画布的id作为属性置入button中
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

//2.画布切换按钮的点击事件，点击即可切换到另一张画布
function changeHuabuButton(event,button){
	var huabu = $("#" + $(button).attr("huabu"))
	//切换到当前画布
	changeHuabu(huabu); 
	//右键事件，打开对应的子菜单
	if (event.button === 2) {
		showHuabuMenu(event,"huabu_button_menu");
	}
}

//3.画布切换按钮的拖动事件，可以在这条changeBar内拖动按钮以改变其顺序
$("#huabu_changeBar").sortable({ containment: "parent",tolerance: "pointer" });
$("#huabu_changeBar").disableSelection()

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
			var huabu_width = $("#area_huabu").width();
			var huabu_left 	= $("#area_huabu").position().left;
			var huabu_right = $("#area_huabu").position().right;
			//根据点击判定框获取将要移动的区域
			var resize_width = $("#"+resizeside+"_area").prop("offsetWidth");

			//拖动的距离，将判定框向→拖动时，这是一个正数
			var distantX = event.clientX - resize_lastX;

			if(resizeside == "left"){
				//当修改左侧大小时，画布向左侧移动时令left减少，此时distantX为负数所以+distantX
				$("#area_huabu").css({
					"width":huabu_width - distantX,
				})
				$("#"+resizeside+"_area").css({
					"width":resize_width + distantX
				})
			}
			else if(resizeside == "right"){
				//当修改右侧大小时，画布向左侧移动时令right增加,此时distantX为负数所以-distantX
				$("#area_huabu").css({
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
