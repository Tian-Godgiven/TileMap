/*

本文档包含tile的结构与功能内容
关于“tile内的文本内容”相关内容请参看：tile_text.js

*/

//全局变量
var focusing_tile;//当前选中的tile

//返回当前聚焦的tile，预计整合时删除
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

//创建tile，其本质是一个div元素
function createTile(){
	
	var tile_id = "tile_" + createRandomId()
	var tile = $("<div></div>", {
		"class": "tile object",
		"id": tile_id,
		"title": "",
		"tiletext": "<div></div>",
		"angle":0,
		"shape":"square",
		"z_index":1,
		"title_horizontal":0,
		"title_vertical":0,
		"textblock_showState":"normal",
		"textblock_vertical":"center",
		"textblock_horizontal":"right"
	});

	$(tile).prop({
		"show_title":true,
		"wrap_title":true,
		"textblock_bindState":true
	})
	//显示磁贴的标题
	$(tile).append("<div class='tile_title'></div>")
	//添加一个center标记，用于：1.套索的选取2.旋转后元素的正确拖拽
	$(tile).append("<div class='center'></div>")

	//放进画布的object_container里面
	var huabu = return_focusing_huabu(); 
	let object_container = $(huabu).find('.object_container');
	$(object_container).append(tile); 

	//为磁贴附加功能
	abilityTile(tile)
	
	//给tile随机的初始背景颜色
	var color=["#FF7F50","#ED9121","#FFE384","#00C957","#7FFFD4","#03A89E","#A066D3","#FCE6C9","#215E21"];
	var i = parseInt(Math.random()*9);
	backgroundColorTile(tile,color[i])

	//创建后，聚焦该tile
	focusingObject(tile,"click")
}

//加载旧的磁贴
function loadTile(old_tile){
	var new_tile = $(old_tile).clone()
	$(new_tile).attr({
		//"id":"tile_" + tile_id,
		"class":"tile",
	})
	return new_tile
}

//删除指定的磁贴
function deleteTile(tile){
	//将指定对象删除
	$(tile).remove()
}

//磁贴的拖动，缩放，放置，左键，左键双击，右键功能
function abilityTile(tile) {
	//拖拽
	var showTileTextBlock_boal = false
	$(tile).draggable({
		snapTolerance:7,
		snap: ".tile",
		addClasses:false,
		scroll: false,
		start: function(event) {
			hideConnectLineDot(tile)
			//拖拽开始时，暂时令与tile绑定的textblock隐藏
			if($(tile).data("textblock") != null && $(tile).prop("textblock_bindState")){
				showTileTextBlock_boal = true
				hideTileTextblock(tile,true)
			}
			else{
				showTileTextBlock_boal = false
			}
		},
		drag: function(event, ui) {
			dragConnectedLine(tile)
			//将tile的位置信息同步到右侧编辑栏
			showTilePosition(tile)
		},
		stop:function(){
			showConnectLineDot(tile)
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
		resize:function(event,ui){
			//信息同步到右侧编辑栏
			showTilePosition(tile)
			showTileSize(tile)
			//缩放的同时也会改变其上连接点的位置
			$(this).find(".line_dot").each(function(){
				dragLineDot(this)
			})
			//监听tile大小变化修改字体
			var newwidth = $(this).outerWidth();
			var newheight = $(this).outerHeight();
			if( newheight > newwidth){
				var newfontsize = newwidth/3;
				if (newfontsize > 5) {
					$(this).css({
						"font-size": newfontsize
					})
				}
			}
			else{
				var newfontsize = newheight/3;
				if (newfontsize > 5) {
					$(this).css({
						"font-size": newfontsize
					})
				}
			}
		},
		stop:function(){
		}
	});

	//放置line_dot
	$(tile).droppable({
		tolerance:"touch",
		accept:".LineDot",
		//当LineDot靠近tile时,令tile上显示dot
		over:function(event,ui){
			showDot(tile)
		},
		//当lineDot放置在tile上时，令lineInner与tile绑定
		drop:function(event,ui){
			event.stopPropagation()
			var $LineDot = $(ui.draggable)
			var $tile = $(tile)
			//只有在LineDot不为MidwayDot时（即为端点dot），并且没有与其他Tile链接时
			//才将其对应的lineInner与tile绑定
			if(!$LineDot.is(".MidwayDot") && !$LineDot.is(".connected")){
				$LineDot.addClass("connected")
				var $lineInner = $LineDot.data("lineInner")[0][0]
				//确定这个lineInner与tile的绑定方向
				if($lineInner.data("LeftDot").is($LineDot)){
					var position = "left"
				}
				else if($lineInner.data("RightDot").is($LineDot)){
					var position = "right"
				}
				var scale = return_huabu_scale()
				//获取绑定位置相对于tile的百分比
				var x = $LineDot.offset().left / scale + $LineDot.width()/2
				var y = $LineDot.offset().top  / scale + $LineDot.width()/2
				var left = Math.floor((( x - $tile.offset().left / scale ) / $tile.width()  * 100)) /100
				var top  = Math.floor((( y - $tile.offset().top / scale )  / $tile.height()  * 100)) /100
				lineInnerConnectTile($lineInner,tile,position,[left,top])
			}
		},
		//当lineDot移出Tile时，将lineInner与tile解绑
		out:function(event,ui){
			hideDot(tile)
			var LineDot = ui.draggable
			if(!$(LineDot).is(".MidwayDot") && $(LineDot).is(".connected")){
				$(LineDot).removeClass("connected")
				var lineInner = $(LineDot).data("lineInner")[0][0]
			}
			lineInnerDisconnectTile(lineInner,tile)
		}
	})

	//点击
	var statrX,startY
	$(tile).on("mousedown",function(event){
		//左键或右键选中
		if(event.button != 1){
			startX = event.clientX;
			startY = event.clientY;
			//隐藏画布内菜单
			hideHuabuMenu("all")
		}
		//中键删除
		else if(event.button == 1){
			deleteObject(focusing_tile)
			return false
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
				showHuabuMenu(event,"tile_menu")
				changeTileMenu(tile)
			}
			//否则触发点击事件
			else{
				clickTile(event,this)
			}

			//如果tile的textblock处于隐藏状态，则令其显示
			if($(tile).data("textblock") == null){
				showTileTextblock(tile)
			}
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
		//取消放置line_dot
		$(tile).droppable("destroy");
	};
	//解除锁定
	function unlockTile(tile){
		//令其lock属性为false
		$(tile).prop("lock",false)
		//恢复其功能
		abilityTile(tile)
	}



//显示与tile相连的线条的dot
function showConnectLineDot(tile){
	var lineInner_list = $(tile).data("connect_lineInner")
	if(lineInner_list && lineInner_list.length > 0){
		var $tile = $(tile)
		for(i in lineInner_list){
			var lineInner = $(lineInner_list[i][0])
			var line = lineInner.parent(".line")
			showLineDot(line)
		}
	}
}
//隐藏与tile相连的线条的dot
function hideConnectLineDot(tile){
	var lineInner_list = $(tile).data("connect_lineInner")
	if(lineInner_list && lineInner_list.length > 0){
		var $tile = $(tile)
		for(i in lineInner_list){
			var lineInner = $(lineInner_list[i][0])
			var line = lineInner.parent(".line")
			hideLineDot(line)
		}
	}
}
//移动与tile绑定的线条
function dragConnectedLine(tile){
	var lineInner_list = $(tile).data("connect_lineInner")
	var $tile = $(tile)

	for(i in lineInner_list){
		var lineInner = $(lineInner_list[i][0])
		var position = lineInner_list[i][1]
		var scale = return_huabu_scale()
		var [x,y] = lineInner_list[i][2]
		//将对应lineInner的对应位置移动到tile的对应位置
		var left = parseInt($tile.css("left")) / scale + $tile.width() * x
		var top = parseInt($tile.css("top")) / scale + $tile.height() * y
		if(position == "left"){
			positionLine(lineInner,[left,top],null)
		}
		else if(position == "right"){
			positionLine(lineInner,null,[left,top])
		}
	}
}



//tile的点击事件，点击后修改当前的focusing_tile，并显示到当前聚焦的简介
function clickTile(event,tile){
	//在磁贴旁显示对应的tile_text
	showTileTextblock(tile);
	//在右侧功能栏同步显示Tile_text
	rightArea_getTile(tile)
	//如果tile绑定了超链接，则显示tile_link_block
	if($(tile).prop("tile_link")){
		clickOpenTileLinkMenu(tile)
	}
	//如果tile嵌套了画布，并且设定为true，则显示进入画布按键
	if($(tile).is(".nested_tile") && $(tile).prop("nestSet_clickButton")){
		showOpenNestedHuabuButton(tile)
	}
}

//tile的双击事件
function doubleClickTile(event,tile){
	focusing_tile = tile;
	//若双击打开嵌套画布设置为true，则打开画布，否则进行改名
	if($(tile).is(".nested_tile") && $(tile).prop("nestSet_dbClick")){
		openNestedHuabu(tile)
	}
	else{
		clickOpenTileTitleInput(event,tile)
	}
}

//通过双击触发，在tile中心生成一个输入框，随后获取输入框中的内容修改tile的title
function clickOpenTileTitleInput(event,tile){
	//若磁贴当前的状态为不显示标题，则退出函数
	if($(tile).prop("show_title") == false){
		return false
	}
	//若没有input框则生成
	if($(tile).find('.tile_input').length - 1){
		var title = $(tile).find('.tile_title')
		var input = $("<input class='tile_input' value='"+ tile.title +"'>")
		//将输入框放在该tile内,同时将原本显示的title内容给删去
		$(title).html("")
		$(tile).append(input)
		//令Input框的字体样式与title同步
		$(input).css({
			"font-family":$(title).css("font-family"),
			"color":$(title).css("color"),
		})
		//聚焦到input框上，并令光标移动到最后一位上
		$(input).focus()
		var value = $(input).val()
		$(input).val("").val(value)
		//在input框外点击后，将输入内容赋值给tile_title，同时将该输入框移除
		$("#huabu_container").on("click",function(event){
			event.stopPropagation();
			if(!input.is(event.target)){
				tile.title = $(tile).find(".tile_input").val()
				$(tile).find(".tile_input").remove()
				//固定调用标题修改事件
				changeTileTitle(tile,"text");
				$(this).off(event)
			}
		})
	}
}

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

//修改tile的title后令修改同步到tile上
function changeTileTitle(tile,type){
	$(tile).find('.tile_title').html(tile.title)
	//随后固定调用一次getTileText,以使得右侧的内容栏的内容及时得到修改
	rightArea_getTile(tile)
	//如果这个tile嵌套了画布，并且这嵌套画布正在显示，那么还需要修改这个嵌套画布的button名称
	if($(tile).is(".nested_tile")){
		var nested_huabu = $(tile).data("nest_huabu")
		if(!$(nested_huabu).is(".hide")){
			createHuabuButton(nested_huabu)
		}
	}
}

//监听resize修改字体大小
	$("#div").resize(function(){
	});
		(function($, h, c) {
			var a = $([]), e = $.resize = $.extend($.resize, {}), i, k = "setTimeout", j = "resize", d = j
					+ "-special-event", b = "delay", f = "throttleWindow";
			e[b] = 350;
			e[f] = true;
			$.event.special[j] = {
				setup : function() {
					if (!e[f] && this[k]) {
						return false
					}
					var l = $(this);
					a = a.add(l);
					$.data(this, d, {
						w : l.width(),
						h : l.height()
					});
					if (a.length === 1) {
						g()
					}
				},
				teardown : function() {
					if (!e[f] && this[k]) {
						return false
					}
					var l = $(this);
					a = a.not(l);
					l.removeData(d);
					if (!a.length) {
						clearTimeout(i)
					}
				},
				add : function(l) {
					if (!e[f] && this[k]) {
						return false
					}
					var n;
					function m(s, o, p) {
						var q = $(this), r = $.data(this, d);
						r.w = o !== c ? o : q.width();
						r.h = p !== c ? p : q.height();
						n.apply(this, arguments)
					}
					if ($.isFunction(l)) {
						n = l;
						return m
					} else {
						n = l.handler;
						l.handler = m
					}
				}
			};
			function g() {
				i = h[k](function() {
					a.each(function() {
						var n = $(this), m = n.width(), l = n.height(), o = $
								.data(this, d);
						if (m !== o.w || l !== o.h) {
							n.trigger(j, [ o.w = m, o.h = l ])
						}
					});
					g()
				}, e[b])
			}
			})(jQuery, this);

//选中指定的磁贴
function focusingTile(tile){
	//暂时将其z-index修改为10000
	$(tile).css("z-index",10000)
	//聚焦tile
	focusing_tile = tile;

	showConnectLineDot(tile)

	//在右侧设计栏同步选中磁贴的数据
	changeTileDesign(tile)
	changeTileEdit(tile)
}
//取消选中指定的磁贴，消除其focusing类
function unfocusingTile(tile){

	//将tile的z-index改回来
	$(tile).css("z-index",$(tile).attr("z_index"))
	focusing_tile = undefined;

	hideDot(tile)
	hideConnectLineDot(tile)

	//隐藏与其绑定的，正在显示的textblock
	if($(tile).data("textblock") != null && $(tile).prop("textblock_bindState")){
		hideTileTextblock(tile)
	}
	//隐藏tile_menu
	hideHuabuMenu("tile_menu")
	//隐藏tile_link_menu
	hideHuabuMenu("tile_link_menu")
	//隐藏进入画布按键
	hideOpenNestedHuabuButton()
}

//将画布绑定到tile上
function nestHuabuTile(tile,huabu){
	//为磁贴添加属性
	$(tile).addClass("nested_tile")
	$(tile).data("nest_huabu",huabu)
	//为画布添加属性
	$(huabu).addClass("nested_huabu")
}

//解除画布与磁贴的嵌套关系
function unnestHuabuTile(tile){
	//获取tile所嵌套的画布对象
	var huabu = $(tile).data("nest_huabu")
	//删除磁贴属性
	$(tile).removeClass("nested_tile")
	$(tile).data("nest_huabu",null)
	//删除画布属性
	$(huabu).removeClass("nested_huabu")
}

//在磁贴上方显示一个【进入画布】按键
function showOpenNestedHuabuButton(tile){
	//先清除其他按键
	hideOpenNestedHuabuButton()
	//再生成该按键
	var nested_huabu = $(tile).data("nest_huabu")
	var nested_huabu_name = nested_huabu.attr("name")
	if($(tile).prop("nestSet_noOpen")){
		var text = "禁止进入画布"
	}
	else{
		var text = "进入画布："+nested_huabu_name
	}
	var button = $("<div class='openNestedHuabuButton huabu_menu'>"+text+"</div>")
	//把这个按键放在Tile正上方
	$("body").append(button)
	var left = $(tile).offset().left + ($(tile).width() - $(button).outerWidth())/2
	var top = $(tile).offset().top - $(button).height() - 10
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
	$("body .openNestedHuabuButton").remove()
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
		
		//获取磁贴的背景颜色
		var background_color = $(tile).attr("background_color")

		//制作gradient值
		var  gradient = ""
		//如果磁贴存在背景图片，添加背景图片链接
		if($(tile).prop("background_image")){
			var background_image = $(tile).data("background_image")
			gradient += 'url("' + background_image + '"), '
			$(tile).css("background-blend-mode","multiply")
		}
		//否则设置背景颜色
		else{
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
		$(tile).prop("background_gradient",false)
		$(tile).attr("gradient_direction",null)
		$(tile).attr("gradient_color",null)

		//如果对象存在背景图片
		if($(tile).prop("background_image")){
			var background_image = $(tile).data("background_image")
			$(tile).css({
				'background-image': 'url("' + background_image + '")',
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
	//设置磁贴的z-index属性
	function zIndexTile(tile,value){
		//获取tile所在的画布的最大，最小层叠值
		var huabu = $(tile).parents(".huabu")
		var zIndexMax = parseInt($(huabu).attr("z_index_max"))
		var zIndexMin = parseInt($(huabu).attr("z_index_max"))
		//若该z-index大于Max或者小于Min,则令其为新的Max/Min
		if(value > zIndexMax){
			$(huabu).attr("z_index_max",value)
		}	
		if(value < zIndexMin){
			$(huabu).attr("z_index_min",value)
		}
		//修改该磁贴的z_index属性值
		$(tile).attr("z_index",value)
		//修改该磁贴的z-index
		$(tile).css("z-index",value)
		//同步显示其z-index
		showTileZIndex(tile)
	}




