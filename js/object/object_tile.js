/*

本文档包含tile的结构与功能内容
关于“tile内的文本内容”相关内容请参看：tile_text.js

*/

//全局变量
var focusing_tile;//当前选中的tile

//返回当前聚焦的tile
function return_focusing_tile(type) {
	if($(focusing_tile).is(".tile")){
		//如果磁贴被锁定，则返回false
		if($(focusing_tile).prop("lock")){
			//如果type是manage_lock，则返回磁贴
			if(type == "manage_lock"){
				return focusing_tile
			}
			else{
				return false		
			}
		}
		return focusing_tile
	}
	else{
		return false
	}
}


//删除指定的磁贴
function deleteTile(tile){
	//若指定磁贴没上锁
	if(!$(tile).prop("lock")){
		//删除与其相连的线条
		var line_list = $(tile).data("line_list")
		if(line_list != undefined){
			for(i in line_list){
				deleteObject($("#"+line_list[i]))
			}
		}
		//将其对应的textblock关闭
		hideTileTextblock(tile)
		//将指定对象删除
		$(tile).remove()
	}
}

//磁贴的使用，当一个磁贴被创建在画布前调用
function useTile(tile,mode){
	if(mode == "new"){
		//赋予新的id
		$(tile).attr("id","tile_" + createRandomId(20));
	}
	
	//添加一个center标记，用于：1.套索的选取2.旋转后元素的正确拖拽
	$(tile).append("<div class='center'></div>")
	//赋予功能
	abilityTile(tile)
	//聚焦这个磁贴
	focusingObject(tile,"click")
}

//磁贴的拖动，缩放，放置，左键，左键双击，右键功能
function abilityTile(tile) {
	//拖拽
		var showTileTextBlock_boal = false
		$(tile).draggable({
			snapTolerance:10,
			snap: ".tile.huabu_object",
			addClasses:false,
			scroll: false,
			start: function(event) {
				//保存到撤销栈
				pushToUndo(tile)
				//拖拽开始时，暂时令与tile绑定的textblock隐藏
				if($(tile).data("textblock") != null && $(tile).prop("textblock_bindState")){
					showTileTextBlock_boal = true
					hideTileTextblock(tile,true)
				}
				else{
					showTileTextBlock_boal = false
				}
				//并且令“进入画布”按键隐藏
				hideOpenNestedHuabuButton()
			},
			drag: function(event, ui) {
				//将tile的位置信息同步到右侧编辑栏
				showTilePosition(tile)
				//同步刷新与其绑定的线条svg的位置
				refreshTileLine(tile)
			},
			stop:function(){
				//如果拖拽开始时使得磁贴的textblock隐藏了，则在之后令其显示
				if(showTileTextBlock_boal){
					showTileTextblock(tile)
				}
			}
		});

	//缩放

		$(tile).resizable({
			autoHide:true,
			animate: false,
			animateEasing:"swing",
			handles:"n,e,s,w,se,sw,ne,nw",
			start:function(){
				pushToUndo(tile)
			},
			resize:function(event,ui){
				//信息同步到右侧编辑栏
				showTilePosition(tile)
				showTileSize(tile)
				//监听tile大小变化修改字体，在没有设定tile的标题字号前都可以生效，设定后则固定位设定值大小
				var newwidth = $(this).outerWidth();
				var newheight = $(this).outerHeight();
				if( newheight > newwidth){
					var newfontsize = Math.floor(newwidth/3)
					if (newfontsize > 5) {
						$(this).css({
							"font-size": newfontsize
						})
						showTileTitleSize(this)
					}
				}
				else{
					var newfontsize = Math.floor(newheight/3)
					if (newfontsize > 5) {
						$(this).css({
							"font-size": newfontsize
						})
						showTileTitleSize(this)
					}
				}
				refreshTileLine(tile)
			},
			stop:function(){
			}
		});
		//同步一些特殊的修改内容
	    $(tile).resizable("option", "aspectRatio", $(tile).prop("size_limit") )

	//点击
	var statrX,startY
	$(tile).on("mousedown",function(event){
		//左键或右键选中
		if(event.button != 1){
			startX = event.clientX;
			startY = event.clientY;
			//隐藏画布内菜单
			hideObjectMenu("all")
		}
	})
	//左键双击
	$(tile).on("dblclick",function(){
		doubleClickTile(event,this)
	})
	//右键点击显示子菜单
	$(tile).on("mouseup",function(event){
		//如果鼠标没有移动，则判定为点击
		if(startX == event.clientX && startY == event.clientY){
			//如果点击右键
			if(event.button == 2){
				//显示磁贴菜单
				showTileMenu(event,tile)
			}
			//否则触发点击事件
			else{
				clickTile(event,this)
			}
		}
		//移动结束时，重新聚焦一下
		else{
			focusingTile(tile)
		}
	})
};

//磁贴的锁定设置
	//锁定磁贴，取消其一部分功能
	function lockTile(tile) {
		//令其lock属性为true
		$(tile).prop("lock",true)
		//取消拖拽
		$(tile).draggable("destroy");
		//取消缩放
		$(tile).resizable("destroy");
	};
	//解除锁定
	function unlockTile(tile){
		//令其lock属性为false
		$(tile).prop("lock",false)
		//恢复其功能
		abilityTile(tile)
	}


//获取一个tile的位置，包括top和left
function getTilePosition(tile){
	//如果这是一个组合体元件，则返回值+其所在的组合体的偏移量
	if($(tile).is(".component")){
		var composite = $(tile).parents(".composite")
		var left = parseInt($(tile).css("left")) + parseInt($(composite).css("left")) + 1
		var top = parseInt($(tile).css("top")) + parseInt($(composite).css("top")) + 1
	}
	else{
		var left = parseInt($(tile).css("left"))
		var top = parseInt($(tile).css("top"))
	}

	return {left:left,top:top}
}


//tile的点击事件，点击后修改当前的focusing_tile，并显示到当前聚焦的简介
function clickTile(event,tile){
	//如果tile绑定了超链接，则显示tile_link_block
	if($(tile).prop("tile_link")){
		clickOpenTileLinkMenu(tile)
	}
	//在磁贴旁显示对应的tile_text
	showTileTextblock(tile);
}

//tile的双击事件
function doubleClickTile(event,tile){
	focusing_tile = tile;
	//若双击打开嵌套画布设置为true，则打开画布，
	if($(tile).data("nest_huabu") != null && $(tile).prop("nestSet_dbClick")){
		openNestedHuabu(tile)
	}
	//否则进行磁贴标题的修改
	else{
		clickOpenTileTitleEdit(event,tile)
	}
}

//将tile的title变为可修改模式，随后获取输入的内容修改磁贴标题
function clickOpenTileTitleEdit(event,tile){
	//若磁贴当前的状态为不显示标题，则退出函数
	if($(tile).prop("show_title") == false){
		return false
	}
	//若磁贴当前锁定，则退出函数
	if($(tile).prop("lock")){
		return false
	}

	pushToUndo(tile)

	var tile_title = $(tile).children('.tile_title')
	//变为可修改状态
	$(tile_title).attr('contenteditable', 'true');
	// 将焦点设置在可编辑元素上,
	$(tile_title).focus(); 
	$(tile_title).css("user-select","auto")
	//并将光标移动到最后一位
	let range = document.createRange(); // 返回一个Range对象(包含节点与文本节点的一部分的文档片段)
	range.selectNodeContents($(tile_title)[0]);
	range.collapse(false);
	let sel = window.getSelection(); // 表示用户选择的文本范围或光标的当前位置
	sel.removeAllRanges();
	sel.addRange(range);
}
// 磁贴标题失去焦点时应用其中的内容修改磁贴标题
$(document).on('blur', ".tile_title", function() {
	//变为不可编辑状态
    $(this).attr('contenteditable', 'false');
    $(this).css("user-select","none")
   	var tile = $(this).closest(".tile")
    var value = $(this).text()
    //固定调用标题修改事件
	changeTileTitle(tile,value);
});

//通过点击触发，在tile中心位置出现一个“打开链接”提示框，点击确认时，打开tile绑定的超链接
function clickOpenTileLinkMenu(tile){
	var $tile = $(tile)

	//如果磁贴设置了禁止显示弹窗，则不会生成
	if($tile.prop("tile_link_menu") == false){
		return 0
	}

	//修改对应的Check属性
	$("#tile_link_menu_check").prop("checked",false)

	var link = $(tile).data("tile_link")
	//如果未能成功绑定链接，则显示如下
	if(link == undefined || link == null){
		link = "未绑定链接"
	}

	var link_str = link
	//缩短link,取开头20个字符和结尾10个字符，中间加上省略号,作为简略名称
	if (link_str.length > 30) { // 如果字符串长度超过30个字符
    	link_str = link_str.substring(0, 20) + '……' + link_str.substring(link_str.length - 10); 
  	}
	//获取"打开链接"框，将连接放入其中
	var link_menu = $("#tile_link_menu")
		$(link_menu).children("a").attr("href",link)
		$(link_menu).children("a").text(link_str)

	//将tile与menu绑定
	$(link_menu).data("tile",tile)

	//将其移动到tile的中心位置，使其中心与Tile中心重叠
	var menu_left = $tile.offset().left + ($tile.width() - $(link_menu).width())/2
	var menu_top = $tile.offset().top + ($tile.height() - $(link_menu).height())/2
	$(link_menu).css({
		"display":"flex",
		"left":menu_left,
		"top":menu_top
	})
}


//刷新磁贴所连接的线条
function refreshTileLine(tile,type){
	//同步刷新与其绑定的线条svg的位置
	var line_list = $(tile).data("line_list")
	if(line_list != undefined){
		for(i in line_list){
			var line_svg = $("#" + line_list[i])
			//如果type == composite，并且这个线条和自己在同一个composite里面,则不移动
			if(type == "composite" && $(tile).parents(".composite").is($(line_svg).parents(".composite"))){
				return false
			}
			refreshLinePosition(line_svg)
		}
	}
}
//修改tile的title
function changeTileTitle(tile,text){
	//修改标题内容
	$(tile).find('.tile_title').html(text)
	//随后同步修改磁贴的标题
	showTileTitle(tile)
	showTileTitleText(tile)
	changeTextBlockTitle(tile)
	//如果这个tile嵌套了画布，并且这嵌套画布正在显示，那么还需要修改这个嵌套画布的button名称
	if($(tile).data("nest_huabu")!=null){
		var nested_huabu = $("#"+$(tile).data("nest_huabu"))
		if(!$(nested_huabu).is(".hide")){
			createHuabuButton(nested_huabu)
		}
	}
}
//修改磁贴的内容
function changeTileText(tile,text){
	//修改磁贴的内容
	$(tile).data("tiletext",text)
	//如果磁贴的textblock处于显示状态，则令其的内容也同步显示
	if($(tile).data("textblock")!=null){
		showTileTextblock(tile)
	}
}
function changeTilePosition(tile,left,top){
	pushToUndo(tile)
	if(left){
		$(tile).css("left",left)
	}
	if(top){
		$(tile).css("top",top)
	}
	refreshTileLine(tile)
}
function changeTileSize(tile,height,width){
	pushToUndo(tile)
	if(height){
		$(tile).css("height",height)
	}
	if(width){
		$(tile).css("width",width)
	}
	refreshTileLine(tile)
}

//移动到指定磁贴or内容块所在的位置，将其显示在画布区中心
function moveToTile(tile){
	//移动到磁贴所在的画布
	var target_huabu = $(tile).parents(".huabu")
	//如果这个画布是一个未打开的嵌套画布，则从当前画布打开这个画布
	if($(target_huabu).is(".hide")){
		var now_huabu = return_focusing_huabu()
		openNestedHuabu(now_huabu,target_huabu)
	}
	//否则就单纯地移动过去进行了
	else{
		changeHuabu(target_huabu)
	}
	//获取磁贴中心的位置信息
	var tile_left = $(tile).offset().left + $(tile).width()/2
	var tile_top = $(tile).offset().top + $(tile).height()/2
	//获得画布区中心的位置信息
	var AreaHuabu_left = $("#area_huabu").offset().left + $("#area_huabu").width()/2
	var AreaHuabu_top = $("#area_huabu").offset().top + $("#area_huabu").height()/2

	//移动画布
	$(target_huabu).css({
		"left":parseInt($(target_huabu).css("left")) + AreaHuabu_left - tile_left,
		"top":parseInt($(target_huabu).css("top")) + AreaHuabu_top- tile_top,
	})

	//聚焦到这个磁贴
	focusingObject(tile)
}

//选中指定的磁贴
function focusingTile(tile){
	//暂时将其z-index修改为10000
	$(tile).css("z-index",10000)
	//聚焦tile
	focusing_tile = tile;

	//在右侧设计栏同步选中磁贴的数据
	changeTileDesign(tile)
	changeTileEdit(tile)
	//如果tile嵌套了画布，并且设定侧键进入为true，则显示进入画布按键
	if($(tile).data("nest_huabu") != null && $(tile).prop("nestSet_clickButton")){
		showOpenNestedHuabuButton(tile)
	}

	refreshTileLine(tile)
}
//取消选中指定的磁贴
function unfocusingTile(tile){

	//将tile的z-index改回来
	$(tile).css("z-index",$(tile).attr("z_index"))
	focusing_tile = undefined;

	//隐藏与其绑定的，正在显示的textblock
	if($(tile).data("textblock") != null && $(tile).prop("textblock_bindState")){
		hideTileTextblock(tile)
	}
	//隐藏tile_menu
	hideObjectMenu("tile_menu")
	//隐藏tile_link_menu
	hideObjectMenu("tile_link_menu")
	//隐藏进入画布按键
	hideOpenNestedHuabuButton()
}

//在磁贴上方显示一个【进入画布】按键
function showOpenNestedHuabuButton(tile){
	//先清除其他按键
	hideOpenNestedHuabuButton()

	//获取tile所在的画布
	var huabu = $(tile).parents(".huabu")

	//再生成该按键
	var nested_huabu = $("#"+$(tile).data("nest_huabu"))
	var nested_huabu_name = nested_huabu.attr("name")
	if($(tile).prop("nestSet_noOpen")){
		var text = "禁止进入画布"
	}
	else{
		var text = "进入画布："+nested_huabu_name
	}
	var button = $("<div class='openNestedHuabuButton'>"+text+"</div>")
	//把这个按键放在Tile正上方
	$(huabu).children(".container").append(button)
	var left = parseInt($(tile).css("left")) + ($(tile).width() - $(button).outerWidth())/2
	var top = parseInt($(tile).css("top")) - $(button).height() - 10
	$(button).css({
		"left":left,
		"top":top
	})
	//点击该按键进入对应的画布
	$(button).on("click",function(){
		openNestedHuabu(tile,nested_huabu)
	})
}
//清除【进入画布】按键
function hideOpenNestedHuabuButton(){
	$(".openNestedHuabuButton").remove()
}

//磁贴修饰
	//修改磁贴的背景颜色
	function backgroundColorTile(tile,color){
		//将这个颜色保存到目标内
        $(tile).attr("background_color",color)
        //修改磁贴的背景颜色
        $(tile).css("background",color)
	}
	//修改磁贴的text-shadow
	function textShadowTile(tile,position_top,position_left,radius,color){
		pushToUndo(tile)
		var tile_title = $(tile).children('.tile_title')
		//首先获取tile_title的shadow
		var old_shadow = $(tile_title).css("text-shadow")
		if(old_shadow != undefined && old_shadow != "none"){
			// 使用正则表达式一次性匹配颜色值和阴影属性
			var regex = /(rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\))\s*(\d+px)\s+(\d+px)\s+(\d+px)/;
			var old_shadow = old_shadow.match(regex);
			//分别获取四个值
			if(color == null){
				color = old_shadow[1]
			}
			if(position_top == null){
				position_top = old_shadow[2]
			}
			if(position_left == null){
				position_left = old_shadow[3]
			}
			if(radius == null){
				radius = old_shadow[4]
			}
			
		}
		//将值组成shadow字符串
		var new_shadow = color + " " +position_top +" "+position_left +" "+ radius
		//修改磁贴的text_shadow
		$(tile_title).css("text-shadow",new_shadow)
	}
	//为磁贴附加背景渐变
	function gradientBackgroundTile(tile,direction,gradient_color){
		pushToUndo(tile)
		//为磁贴附加对应的属性值
		$(tile).prop("background_gradient",true)
		//若参数无值则使用存储的属性
		if(direction == null){
			direction = $(tile).attr("gradient_direction")
		}
		//否则将参数存入对象中
		else{
			$(tile).attr("gradient_direction",direction)
		}
		if(gradient_color == null){
			gradient_color = $(tile).attr("gradient_color")
		}
		else{
			$(tile).attr("gradient_color",gradient_color)
		}

		//制作gradient值
		var  gradient = ""
		//如果磁贴存在背景图片，添加背景图片进入，并设置为混合
		if($(tile).prop("background_image")){
			var background_image = $(tile).css("background-image")
			gradient += background_image+', '
			$(tile).css("background-blend-mode","multiply")
		}
		//否则添加背景颜色进入，并设置为普通
		else{
			//获取磁贴的背景颜色
			var background_color = $(tile).attr("background_color")
			$(tile).css('background-color',background_color)
			$(tile).css("background-blend-mode","normal")
		}

		//通过css修改背景渐变
		if(direction == "radial"){
			gradient += 'radial-gradient(circle, rgba(0, 0, 0, 0), ' + gradient_color + ')';
			//修改磁贴的环形渐变
			$(tile).css('background-image',gradient)
		}
		else{
			gradient += 'linear-gradient(to '+direction+', '+gradient_color+', rgba(0, 0, 0, 0))';
			//修改磁贴的背景渐变
			$(tile).css('background-image',gradient)
		}
	}
	//去除磁贴的背景渐变和对应的属性值
	function ungradientBackgroundTile(tile){
		pushToUndo(tile)
		$(tile).prop("background_gradient",false)
		$(tile).attr("gradient_direction",null)
		$(tile).attr("gradient_color",null)

		//如果对象存在背景图片,则取消时要保留背景图片
		if($(tile).prop("background_image")){
			var background_image = $(tile).css("background-image").match(/url\((['"]?)(.*?)\1\)/)
			$(tile).css({
				'background-image': background_image[0],
			})
		}
		//若不存在则将背景颜色加上
		else{
			var background_color = $(tile).attr("background_color")
			$(tile).css({
				'background-image': "none",
				'background-color': background_color,
			})
		}
	}




