/*

本文档包含tile的结构与功能内容
关于“tile内的文本内容”相关内容请参看：tile_text.js

*/

//全局变量
var focusing_tile;//当前选中的tile

//返回当前聚焦的tile，预计整合时删除
function return_focusing_tile() {
	return focusing_tile
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
		"shape":"square"
	});
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

	// 创建后，聚焦该tile
	focusingObject(tile,"click")
	
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
		//"id":"tile_" + tile_id,
		"class":"tile",
	})
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
			hideDot(tile)
			hideTextBlock(return_focusing_huabu())
		},
		drag: function(event, ui) {
			//同时令tile内的line_dot子元素进行链接
			$(this).children('.connected_dot').each(function(){
				dragLineDot(this)
			})
		},
		stop:function(){
			showDot(tile)
		}
	});

	//缩放
	$(tile).resizable({
		autoHide:true,
		animate: false,
		animateEasing:"swing",
		handles:"n,e,s,w,se,sw,ne,nw",
		resize:function(event,ui){
			hideDot(tile)
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
			showDot(tile)
		}
	});

	//放置line_dot
	$(tile).droppable({
		tolerance:"touch",
		accept:".line_dot",
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
		//左键或右键选中
		if(event.button != 1){
			if(event.button == 2){
				startX = event.clientX;
				startY = event.clientY;
			}
			//隐藏子菜单菜单
			hideHuabuMenu("all")
			focusingObject(tile,"click")
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
		//如果右键点击时鼠标没有移动，就显示其右键子菜单
		if(startX == event.clientX && startY == event.clientY && event.button == 2){
			//显示子菜单
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
function focusingTile(tile){
	focusing_tile = tile;
	showDot(tile)
}
//取消选中指定的磁贴，消除其focusing类
function unfocusingTile(tile){
	focusing_tile = undefined;
	hideDot(tile)
	hideTextBlock(return_focusing_huabu())
}




