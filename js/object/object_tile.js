/*

本文档包含tile的结构与功能内容
关于“tile内的文本内容”相关内容请参看：tile_text.js

*/

//全局变量
var tile_id=1;//用于提供tileid初值，以防止tile重名
var focusing_tile;//当前选中的tile

//返回当前聚焦的tile，预计整合时删除
function return_focusing_tile() {
	return focusing_tile
}
//返回当前的tile_id，必定会设计到新tile的创建
function return_tile_id(){
	var old_tile_id = tile_id;
	tile_id++
	return old_tile_id
}

//创建tile，其本质上是一个div元素
function createTile(){
	
	let tile = $("<div></div>", {
		"class": "tile",
		"id": "tile_" + tile_id,
		"title": "",
		"tiletext": "<div></div>",
		"angle":0
	});
	//显示磁贴的标题
	$(tile).append("<div class='tile_title'></div>")
	//添加一个center标记，用于：1.套索的选取2.旋转后元素的正确拖拽
	$(tile).append("<div class='center'></div>")

	// 磁贴生成的地方，是每个画布的tileContainer
	var huabu = return_focusing_huabu(); 
	let tile_container = $(huabu).find('.tile_container');//转换为Dom对象
	$(tile_container).append(tile); 
	tile_id++;

	// 创建后，默认将当前tile作为聚焦Tile
	focusing_tile = tile;
	//为磁贴附加功能
	abilityTile(tile)

	//给tile随机的初始背景颜色
	var color=["#FF7F50","#ED9121","#FFE384","#00C957","#7FFFD4","#03A89E","#A066D3","#FCE6C9","#215E21"];
	var i = parseInt(Math.random()*9);
	var thecolor=color[i];
	$(tile).css("background-color",thecolor)
}

//加载旧的磁贴
function loadTile(old_tile){
	var new_tile = $(old_tile).clone()
	$(new_tile).attr({
		"id":"tile_" + tile_id,
		"class":"tile",
	})
	tile_id++ 
	return new_tile
}

//磁贴的拖动，缩放，放置，左键，左键双击，右键功能
function abilityTile(tile) {
	//拖拽
	$(tile).draggable({
		snapTolerance:7,
		snap: ".tile",
		addClasses:false,
		scroll: false,
		zIndex:100,
		//containment:$(return_focusing_huabu()),
		start: function(event) {
			hideTextBlock(return_focusing_huabu())
		},
		drag: function(event, ui) {
			//同时令tile内的line_dot子元素进行链接
			$(this).children('.connected_dot').each(function(){
				dragLineDot(this)
			})
		}
	});

	//缩放
	$(tile).resizable({
		autoHide:true,
		animate: false,
		animateEasing:"swing",
		handles:"n,e,s,w,se,sw,ne,nw",
		resize:function(event,ui){
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
		}
	});

	//放置line_dot
	$(tile).droppable({
		tolerance:"touch",
		accept:".line_dot",
		//当dot放置在Tile上时，会在tile的边框上显示出tile的吸附点
		over:function(event,ui){
			showTileSnapDot(tile)
		},
		drop:function(event,ui){
			event.stopPropagation()
			hideTileSnapDot(tile)
			DotIntoTile(ui.draggable,tile)
		},
		//当dot移出Tile时，将其与tile解绑
		out:function(event,ui){
			hideTileSnapDot(tile)
			return_snap_tile(true)
			//令drag事件重启
			DotOutTile(ui.draggable,tile)
			
		}
	})

	//点击
	var statrX,startY
	$(tile).on("mousedown",function(event){
		event.stopPropagation()
		//左键或右键选中
		if(event.button != 1){
			if(event.button == 2){
				startX = event.clientX;
				startY = event.clientY;
			}
			else{
				//隐藏子菜单菜单
				hideHuabuMenu("tile_menu")
			}
		}
		//中键删除
		else if(event.button == 1){
			deleteTile(this)
			return false
		}
		//聚焦该磁贴
		focusingTile(tile,"click")
	})
	//左键双击
	$(tile).on("dblclick",function(){
		doubleClickTile(event,this)
	})
	//右键点击显示子菜单
	$(tile).on("mouseup",function(event){
		//如果右键点击时鼠标没有移动，就显示其右键子菜单
		if(startX == event.clientX && startY == event.clientY && event.button == 2){
			//显示子菜单
			event.stopPropagation()
			showHuabuMenu(event,"tile_menu")
			changeTileMenu(tile)
		}
		clickTile(event,this)
	})

};




//tile的单击事件    待重做：要求获取当前画布中的所有tile，而不是修改所有的tile
//tile的点击事件，点击后修改当前的focusing_tile，并显示到当前聚焦的简介
function clickTile(event,tile){
	$(".tile").css("z-index","1")
	$(tile).css("z-index","100")
	//在磁贴旁显示对应的tile_text
	showTileTextBlock(tile);
	//在右侧功能栏同步显示Tile_text
	rightArea_getTile(tile)
}

//tile的双击事件，双击tile会在其中心生成一个输入框，通过获取输入框中的内容修改tile的title
function doubleClickTile(event,tile){
	focusing_tile = tile;
	//若没有input框则生成
	if($(tile).find('.tile_input').length - 1){
		let input = $("<input class='tile_input' value='"+ tile.title +"'>")
		//将输入框放在该tile内,同时将原本显示的title内容给删去
		$(tile).find('.tile_title').html("")
		$(tile).append(input)
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

//snap_dot的droppable创建函数
function droppableSnapDot(){
	var snap_position
	$(".tile_snap_dot").droppable({
		tolerance: "pointer",
		accept:".line_dot",
		over:function(event,ui){
			event.stopPropagation()
			//令drag事件停止
			return_snap_tile(false)
			//获取修改信息
			var old_position = distantWithHuabu($(ui.draggable))
				snap_position = distantWithHuabu($(this))
			var x = snap_position.left - old_position.left
			var y = snap_position.top - old_position.top
			//原本line_dot的位置
			var old_left = parseInt($(ui.draggable).css("left"))
			var old_top = parseInt($(ui.draggable).css("top"))
			//修改line_dot的css以改变其位置
			$(ui.draggable).css({
				"left": old_left + x,
				"top": old_top + y
			})
			dragLineDot(ui.draggable)
		},
		drop:function(event,ui){
			event.stopPropagation()
			//绑定dot与磁贴
			DotIntoTile(ui.draggable,this)
			//修改line_dot的css以改变其在tile上的位置，令其与snap_dot的位置重叠
			var left = parseInt($(this).css("left"))
			var top = parseInt($(this).css("top"))
			if(left > 0){
				left = left / $(this).parent(".tile").width()  * 100 +"%"
			}
			
			if(top > 0){
				top = top / $(this).parent(".tile").height()  * 100 +"%"
			}
			$(ui.draggable).css({
				"left": left,
				"top": top
			})
			dragLineDot(ui.draggable)
			//恢复drag事件
			return_snap_tile(true)
		},
		out:function(event,ui){
			event.stopPropagation()
			//令这个dot的drag事件重启
			return_snap_tile(true)
		}
	})
}

//line_dot的drag控制事件
var snap_bool = true
function return_snap_tile(bool){
	if(bool == undefined){
		return snap_bool
	}
	else{
		snap_bool = bool
		return snap_bool
	}
}

//tile的line_dot移入事件，在这个tile上显示出吸附点(snap_dot)
function showTileSnapDot(tile){
	//创建四个角的吸附点
	var snap_dot_1 = snap_dot = $("<div>",{"class":"tile_snap_dot"})
	var snap_dot_2 = $(snap_dot_1).clone(true,true)
	var snap_dot_3 = $(snap_dot_1).clone(false)
	var snap_dot_4 = $(snap_dot_1).clone(false)

	//dot的半径大小
	var radius = 10
	//获取tile的宽度和高度位置
	var height = $(tile).height()
	var width = $(tile).width()
	//放在这个tile的四个角落上
	$(tile).append(snap_dot_1)
	$(tile).append(snap_dot_2)
	$(tile).append(snap_dot_3)
	$(tile).append(snap_dot_4)

	$(snap_dot_1).css({
		"top": -radius,
		"left": -radius
	})
	$(snap_dot_2).css({
		"top": height - radius,
		"left": -radius
	})
	$(snap_dot_3).css({
		"top": -radius,
		"left": width - radius
	})
	$(snap_dot_4).css({
		"top": height - radius,
		"left": width - radius
	})

	//先做上下两边
		//创建四条边的吸附点，0-50px一个，50-100px两个依次类推
		var snap_dot_width_num = Math.ceil(width/100)
		//每个dot之间的间隔距离
		var snap_dot_width_distant = width / (snap_dot_width_num+1)
		var snap_dot_width = snap_dot_width_distant
		for(var i = 0;i < snap_dot_width_num;i++){
			//创建两个snap_dot，两边各一个
			var snap_dot_width_1 = $(snap_dot_1).clone(false)
			var snap_dot_width_2 = $(snap_dot_1).clone(false)
			$(tile).append(snap_dot_width_1)
			$(tile).append(snap_dot_width_2)
			//以间隔距离放置，随后令这个间隔距离自加一倍
			$(snap_dot_width_1).css({
				"top": - radius,
				"left": snap_dot_width - radius
			})
			$(snap_dot_width_2).css({
				"top": height - radius,
				"left": snap_dot_width - radius
			})
			snap_dot_width += snap_dot_width_distant
		}
	//然后是左右两边
		var snap_dot_height_num = Math.ceil(height/100)
		//每个dot之间的间隔距离
		var snap_dot_height_distant = height / (snap_dot_height_num+1)
		var snap_dot_height = snap_dot_height_distant
		for(var i = 0;i < snap_dot_height_num;i++){
			//创建两个snap_dot，两边各一个
			var snap_dot_height_1 = $(snap_dot_1).clone(false)
			var snap_dot_height_2 = $(snap_dot_1).clone(false)
			$(tile).append(snap_dot_height_1)
			$(tile).append(snap_dot_height_2)
			//以间隔距离放置，随后令这个间隔距离自加一倍
			$(snap_dot_height_1).css({
				"top": snap_dot_height - radius,
				"left":  - radius
			})
			$(snap_dot_height_2).css({
				"top": snap_dot_height - radius,
				"left": width - radius
			})
			snap_dot_height += snap_dot_height_distant
		}
	 droppableSnapDot()
}

//tile的line_dot移出事件，令这个tile上的吸附点消失（删除）
function hideTileSnapDot(tile){
	$(tile).children('.tile_snap_dot').droppable("destroy");
	$(tile).children('.tile_snap_dot').remove()
}

//修改tile的title后修改tile的显示内容
function changeTileTitle(tile,type){
	$(tile).find('.tile_title').html(tile.title)
	//随后固定调用一次getTileText,以使得右侧的内容栏的内容及时得到修改
	rightArea_getTile(tile)
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

//选中指定的磁贴，为其附加tile_selected类使其出现
function focusingTile(tile,type){
	focusing_tile = tile;
	//若这个磁贴已经聚焦了，则return 0
	if($(tile).is(".tile_selected")){
		return 0
	}
	else{
		//如果是通过点击聚焦的，则同一时间仅能存在一个聚焦tile，令其他tile取消聚焦
		if(type == "click"){
			$(".tile_selected").removeClass('tile_selected')
		}
		$(tile).addClass('tile_selected')
	}
	
	if(type == "click"){
		//点击磁贴以外的区域取消聚焦
		$("#huabu_container").on("mousedown",function(event){
			event.stopPropagation()
			//如果点击对象既不是tile自身，也不是tile的子元素，则取消聚焦
			if(!$(tile).is(event.target) && $(focusing_tile).has(event.target).length == 0){
				unfocusingTile(tile)
				$(this).off(event)
			}
		})
	}

}
//取消选中指定的磁贴，消除其tile_selected类
function unfocusingTile(tile){
	focusing_tile = undefined;
	$(tile).removeClass('tile_selected')
	hideTextBlock(return_focusing_huabu())
}

//删除选中的磁贴
function deleteTile(tile){
	//先解除其聚焦
	unfocusingTile(tile)
	$(tile).remove()
}




