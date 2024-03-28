//新画布的创建窗口
function addNewHuabu(type) {
    return new Promise((resolve, reject) => {
        swal.fire({
            title: "创建画布",
            html: '<div id="addHuabu_alerttext">                                         \
                画布名：<input class="addHuabu_input" id="huabu_name"></input> <br>    \
                画布长：<input class="addHuabu_input" id="huabu_width"></input> <br>   \
                画布宽：<input class="addHuabu_input" id="huabu_height"></input>\
                </div>'
        }).then((result) => {
            if (result.isConfirmed) {
                var name = $("#huabu_name").val();
                var width = $("#huabu_width").val();
                var height = $("#huabu_height").val();

                // 创建画布
                var huabu = createHuabu(name, width, height)
                //移动到该画布
				changeHuabu(huabu)
				//返回画布对象
                resolve(huabu);
            } else {
                reject("用户取消了创建画布操作");
            }
        });
    });
}

//画布区域的选择功能，创建画布区域的套索并对选择的目标进行判定
// $("#huabu_container").selectable({
// 	distance:1,
// 	filter:".tile .center , .line , .line_dot",
// 	tolerance:"touch",
// 	selecting:function(event,ui){
// 		$dom = $(ui.selecting)
// 		//参与组合的不是这些子对象而是其父对象
// 		if($dom.is(".line_dot , .center")){
// 			$dom.removeClass('ui-selecting')
// 			$dom = $dom.parent()
// 			$dom.addClass('ui-selected')
// 		}
// 		focusingObject($dom,"select")
// 	},
// 	unselecting:function(event,ui){
// 		$dom = $(ui.unselecting)
// 		//参与组合的不是这些子对象而是其父对象
// 		if($dom.is(".line_dot , .center")){
// 			$dom = $dom.parent()
// 			$dom.removeClass('ui-selected')
// 		}
// 		unfocusingDom($dom)
// 	},
// 	start:function(){
// 		//消除之前的选中体和selected类
// 		$(".ui-selected").removeClass('ui-selected')
// 		destroyComposite($(this).find(".select_composite"))
// 	},
// 	stop:function(){
// 		//将选中的对象变成一个选中体=临时组合体
// 		createComposite($(this).find('.ui-selected'),"select")

// 	}
// })




//底部按键changeBar
	//1.创建画布对应的切换按钮,将画布的id作为属性置入button中
	function createHuabuButton(huabu) {
		//判断是否已经存在对应画布的button
		var id = $(huabu).attr("id") + "_button"
		if($("#huabu_buttonBar").find("#"+id).length > 0 ){
			//如果已经存在了，那就先删掉旧的按钮，再创建新的按钮
			deleteHuabuButton(huabu)
		}

		//如果是嵌套画布，则text改为其来源的tile的标题 > 画布名
		//若不存在的标题，则显示来源的tile所在的画布的名称
		if($(huabu).is(".nested_huabu")){
			var tile = $(huabu).data("nest_from")
			var from = $(tile).children(".tile_title").text()
			if(from == null || from == ""){
				from = $(tile).parents(".huabu").attr("name")
			}
			var text = from + " > "+$(huabu).attr("name")
		}
		else{
			var text = $(huabu).attr("name")
		}

		let button = $("<div></div>", {
			"class": "huabu_button",
			"id": id,
			"huabu": $(huabu).attr("id")
		});
		$(button).text(text)

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
		$(".huabu_button").css("color", "black")
		//令该画布对应的画布按钮聚焦
		$("#" + $(huabu).attr("id") + "_button").css("color", "red")
	}
	//2.画布切换按钮的点击事件，点击即可切换到另一张画布
	$("#huabu_buttonBar").on("mousedown",".huabu_button",function(event){
		var huabu = $("#" + $(this).attr("huabu"))
		//切换到当前画布
		changeHuabu(huabu); 
		//右键事件，打开对应的子菜单
		if(event.button === 2) {
			showHuabuMenu(event,"huabu_button_menu");
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
				var huabu_width = $("#area_huabu").width();
				var huabu_left 	= $("#area_huabu").position().left;
				var huabu_right = $("#area_huabu").position().right;
				//根据点击判定框获取将要移动的区域
				var resize_width = $("#area_"+resizeside).prop("offsetWidth");

				//拖动的距离，将判定框向→拖动时，这是一个正数
				var distantX = event.clientX - resize_lastX;
				if(resizeside == "left"){
					//当修改左侧大小时，画布向左侧移动时令left减少，此时distantX为负数所以+distantX
					distantX = - distantX
				}
				//改变画布和对应区域的宽度
				$("#area_huabu").css({
					"width": huabu_width + distantX,
				})
				$("#area_"+resizeside).css({
					"width": resize_width - distantX,
				})
				resize_lastX = event.clientX;
			}
		}

		document.onmouseup=function(event){
			resize_dragging = false
		}
	})
