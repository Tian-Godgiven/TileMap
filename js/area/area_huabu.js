//新画布的创建窗口
function createNewHuabuMenu(type) {
    return new Promise((resolve, reject) => {
        swal.fire({
            title: "创建画布",
            html: '<div id="addHuabu_alerttext">                                         \
                画布名：<input class="addHuabu_input" id="huabu_name"> <br>    \
                画布长：<input class="addHuabu_input" id="huabu_width"> <br>   \
                画布宽：<input class="addHuabu_input" id="huabu_height">\
                </div>'
        }).then((result) => {
            if (result.isConfirmed) {
                var name = $("#huabu_name").val();
                var width = $("#huabu_width").val();
                var height = $("#huabu_height").val();

                // 创建画布
                var huabu = createHuabu(name, width, height)
				//返回画布对象
                resolve(huabu);
            } else {
                reject("用户取消了创建画布操作");
            }
        });
    });
}

// 画布区域的选择功能，创建画布区域的套索并对选择的目标进行判定
$("#huabu_container").selectable({
	distance:1,
	filter:".huabu_object:not(.textblock,.component)",
	tolerance:"touch",
	//将目标选中，并赋予.ui-selected类，同时将其聚焦
	selecting:function(event,ui){
		//参与组合的是huabu_object
		focusingObject($(ui.selecting),"select")
	},
	unselecting:function(event,ui){
		$dom = $(ui.unselecting)
		unfocusingObject($dom)
	},
	start:function(){
		//消除之前的selected类
		$(".ui-selected").removeClass('ui-selected')
		//删除掉之前聚焦的临时组合体
		destroyComposite($(this).find(".temp_composite.focusing"))
	},
	stop:function(){
		var all_select = $(this).find('.ui-selected')
		var huabu = return_focusing_huabu()
		//将选中的对象变成一个临时组合体
		createTempComposite(all_select,huabu)
	}
})

//拖动对象块进入画布区域时，令其scale同步当前画布
$(document).ready(function(){
	$("#area_huabu").droppable({
		tolerance:"fit",
		accept:".objectBlock",
		//在进入画布区域时
		over:function(event,ui){
			var huabu = return_focusing_huabu()
			if(huabu){
				//设置其scale与画布同步
				var scale = $(huabu).css("transform")
	  			ui.helper.css({
	  				'transform':scale,
	  				"transform-origin": "0% 0%",
	  			});
	  			//添加一个临时class
	  			ui.helper.addClass('in_huabu_area')
			}
		},
		out:function(event,ui){
			ui.helper.removeClass('in_huabu_area')
		}
	})
})


//清空画布
function clearHuabuContainer(){
	$("#huabu_container").empty()
	$("#huabu_buttonBar").empty()
	//隐藏所有样式和内容
	$(".rightArea_design_inner_block").hide()
	$(".rightArea_edit_inner_block").hide()
}


//底部按键changeBar
	//1.创建画布对应的切换按钮,将画布的id作为属性置入button中
	function createHuabuButton(huabu) {
		//判断是否已经存在对应画布的button
		var id = $(huabu).attr("id") + "_button"
		if($("#huabu_buttonBar").find("#"+id).length > 0 ){
			//如果已经存在了，那就先删掉旧的按钮，再创建新的按钮
			deleteHuabuButton(huabu)
		}

		//如果这个画布有一个来源，也就是说其是一个嵌套画布
		//则text改为其来源名称 > 画布名
		var source = $(huabu).data("nest_from")
		if(source != undefined || source != null){
			if($(source).is(".tile")){
				var from = $(source).children(".tile_title").text()
				//若来源tile不存在标题，则显示来源tile所在的画布的名称
				if(from == null || from == ""){
					from = $(source).parents(".huabu").attr("name")
				}
			}
			else if($(source).is(".huabu")){
				from = $(source).attr("name")
			}
			
			var text = from + " > "+$(huabu).attr("name")
		}		
		//如果不是则直接显示画布的名称
		else{
			var text = $(huabu).attr("name")
		}

		//创建button对象
		let button = $("<div></div>", {
			"class": "huabu_button",
			"id": id,
			"huabu": $(huabu).attr("id")
		});
		$(button).text(text)
		//画布名字过短时
		if(text.length<2){
			$(button).css("width","35px")
		}
		$("#huabu_buttonBar").append(button)
		//当创建后按钮栏的宽度大于显示宽度时，令换页按键显示
		if($("#huabu_buttonBar").width() > $("#huabu_changeBar_button").width()){
			if($("#huabu_changeBar_page").css("display") == "none"){
				$("#huabu_changeBar_page").css("display","flex")
				setChangeBarPage()
			}
		}
	};

	//删除画布切换按钮
	function deleteHuabuButton(huabu){
		var button = $("#"+$(huabu).attr("id") + "_button")
		$(button).remove()
		//当删除后按钮栏宽度小于显示宽度时，令换页按键隐藏
		if($("#huabu_buttonBar").width() <= $("#huabu_changeBar_button").width()){
			$("#huabu_changeBar_page").hide()
		}
	}
	//切换到对应的画布按钮
	function changeHuabuButton(huabu){
		//令其他画布按钮取消聚焦
		$(".huabu_button").removeClass('focusing_button')
		//令该画布对应的画布按钮聚焦
		$("#" + $(huabu).attr("id") + "_button").addClass('focusing_button')
	}
	//2.画布切换按钮的点击事件，点击即可切换到另一张画布
	$("#huabu_buttonBar").on("mousedown",".huabu_button",function(event){
		var huabu = $("#" + $(this).attr("huabu"))
		//切换到当前画布
		changeHuabu(huabu); 
		//右键事件，打开对应的子菜单
		if(event.button === 2) {
			showObjectMenu(event,"huabu_button_menu");
		}
	});
	//3.画布切换按钮的拖动事件，可以在这条changeBar内拖动按钮以改变其顺序
	$("#huabu_buttonBar").sortable({ containment: "parent",tolerance: "pointer" });
	$("#huabu_buttonBar").disableSelection()
	//4.底部翻页按钮，点击可以对应地将画布按钮进行移动
	$("#huabu_changeBar_page_left:not('disabled')").on("click",function(){
		//将按钮栏向←移动80%，也就是将按钮的left + 80%*显示区域的width
		var width = $("#huabu_changeBar_button").width()
		var old_value = parseInt($("#huabu_buttonBar").css("left"))
		if(isNaN(old_value)){
			old_value = 0
		}
		var new_value = old_value +  Math.floor(width* 0.8)

		//left不会大于0
		if(new_value > 0){
			new_value = 0
		}

		$("#huabu_buttonBar").animate({"left":new_value},500,function(){
			setChangeBarPage()
		})
	})
	$("#huabu_changeBar_page_right:not('.disabled')").on("click",function(){
		//将按钮栏显示的部分向→移动80%,也就是按钮栏本身向左移动
		var width = $("#huabu_changeBar_button").width()
		var distance = Math.floor($("#huabu_buttonBar").width() - width)
		var old_value = parseInt($("#huabu_buttonBar").css("left"))
		if(isNaN(old_value)){
			old_value = 0
		}
		var new_value = old_value - Math.floor(width*0.8)

		//但是移动值不会使得按键栏为空
		//也就是Left不会比buttonBar本身还要长
		if(new_value < -distance){
			new_value = -distance
		}
		//移动buttonBar
		$("#huabu_buttonBar").animate({"left":new_value},500,function(){
			setChangeBarPage()
		})
	})
	//5.控制底部翻页按钮的操作状态
		function setChangeBarPage(){
			var page_left = $("#huabu_changeBar_page_left")
			var page_right = $("#huabu_changeBar_page_right")
			//判断属性
			var buttonBar_left = parseInt($("#huabu_buttonBar").css("left"))
			var width = $("#huabu_changeBar_button").width()
			var distance = Math.floor($("#huabu_buttonBar").width() - width)
			//如果此时按钮栏移到了最左端，令向左按键失效
			if(buttonBar_left == 0){
				$(page_left).addClass('disabled')
			}
			//如果此时left<0，则令向左按键生效
			else if(buttonBar_left < 0){
				$(page_left).removeClass('disabled')
			}

			//当left == -distance时，移动到了最右端，令向右按键失效
			if(buttonBar_left == -distance){
				$(page_right).addClass('disabled')
			}
			//当left > -distance时，令向右按键生效
			else if(buttonBar_left > -distance){
				$(page_right).removeClass('disabled')
			}
		}

//两侧resize功能
	//移动到上面时，会显示透明的拖动条
	$(".resize_block").hover(
		function() {
			$(this).css("opacity", "0.3");
		},
		function() {
			$(this).css("opacity", "0");
		}
	);

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
		//使用document的方法防止拖动速度过快导致移出判定框
		document.onmousemove = function(event){
			if(resize_dragging){
				var huabu_width = $("#area_huabu").outerWidth();
				//根据点击判定框获取将要移动的区域
				var resize_width = $("#area_"+resizeside).outerWidth()
				//拖动的距离，将判定框向→拖动时，这是一个正数
				var distantX = event.clientX - resize_lastX;
				if(resizeside == "left"){
					//当修改左侧大小时，画布向左侧移动时令left减少，此时distantX为负数所以+distantX
					distantX = - distantX
				}
				//计算改变后的宽度，除以当前body的宽度，并用百分比表示
				var width = $("#area_bottom").outerWidth()
				var new_huabu_width = (huabu_width + distantX)/width * 100 + "%"
				var new_resize_width = (resize_width - distantX)/width * 100 + "%"

				//改变画布和对应区域的宽度
				$("#area_huabu").css({
					"width": new_huabu_width
				})
				$("#area_"+resizeside).css({
					"width": new_resize_width
				})
				resize_lastX = event.clientX;
			}
		}

		document.onmouseup=function(event){
			resize_dragging = false
		}
	})
