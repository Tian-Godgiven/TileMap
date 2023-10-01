/*

本文档包含tile的结构与功能内容
关于“tile内的文本内容”相关内容请参看：tile_text.js

*/

//阻止右键网页功能
document.addEventListener("contextmenu", function(e) {
  e.preventDefault();
});

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
		"tiletext": "<div></div>"
	});
	$(tile).append("<div class='tile_title'></div>")

	// 创建后，默认将当前tile作为聚焦Tile
	focusing_tile = tile;

	var huabu = return_focusing_huabu(); // 获取当前聚焦的画布
	// 磁贴生成的地方，是每个画布的tileContainer
	let tile_container = $(huabu).find('.tile_container')[0];//转换为Dom对象
	// 将磁贴放进去
	tile_container.appendChild(tile[0]); 
	tile_id++;


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

//磁贴的拖动，缩放，放置功能
$("#huabu_container").on("mouseenter", ".tile:not(.ui-draggable-handle)", function() {
 	var click = { x:0, y:0};
 	var click_dot = { x:0, y:0}
 	//移动
    $(this).draggable({
    	snapTolerance:7,
    	addClasses:false,
    	disabled: false,
    	snap: true,
    	scroll: false,
    	zIndex:100,
    	containment:$(return_focusing_huabu()).find('.tile_container')[0],//转换为Dom对象
    	start: function(event) {
        	click.x = event.clientX;
        	click_dot.x = event.clientX;
        	click.y = event.clientY;
        	click_dot.y = event.clientY;
        	hideTextBlock(return_focusing_huabu())
    	},
    	drag: function(event, ui) {
        	var huabu_scale = return_scale();
        	var original = ui.originalPosition;
        	ui.position = {
            	left: (event.clientX - click.x + original.left) / huabu_scale,
            	top:  (event.clientY - click.y + original.top ) / huabu_scale
        	};
        	dragTileConnect(event,ui,this,click_dot)
    	}
	});

    //修改大小
    $(this).resizable({
    	autoHide:true,
    	animate: false,
    	animateEasing:"swing",
    	handles:"n,e,s,w,se,sw,ne,nw",
    	autoHide:true
    });

    //放置line_dot
	$(this).droppable({
		tolerance:"touch",
		greedy:true,
		accept:".line_dot",
		//当dot放置在Tile上时，会在tile的边框上显示出tile的吸附点
		over:function(event,ui){
			showTileSnapDot(this)
		},
		drop:function(event,ui){
			hideTileSnapDot(this)
			DotIntoTile(ui.draggable,this)
		},
		//当dot移出Tile时，将其与tile解绑
		out:function(event,ui){
			hideTileSnapDot(this)
			DotOutTile(ui.draggable,this)
			//令drag事件重启
			return_snap_tile(true)
			//将对象移动到鼠标的位置来
			var huabu_scale = return_scale();
			$(ui.helper).offset({
				left: event.clientX / huabu_scale,
				top:event.clientY / huabu_scale
			})
		}
	})
});

//监听tile大小变化修改字体
$("#huabu_container").on( "resize", ".tile" , function() {
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
});

//磁贴的单击，双击，右键功能
$("#huabu_container").on(
	{
		"click": function(){tileClick(event,this)},
		"dblclick": function(){tileDoubleClick(event,this)}
	},
	".tile"
)

//tile的单击事件    待重做：要求获取当前画布中的所有tile，而不是修改所有的tile
//tile的点击事件，点击后修改当前的focusing_tile，并显示到当前聚焦的简介
function tileClick(event,tile){
	focusing_tile = tile;
	$(".tile").css("z-index","1")
	$(tile).css("z-index","100")

	//在磁贴旁显示对应的tile_text
	showTileTextBlock(tile);

	//在右侧功能栏同步显示Tile_text
	rightArea_getTile(tile)
}

//tile的双击事件，双击tile会在其中心生成一个输入框，通过获取输入框中的内容修改tile的title
function tileDoubleClick(event,tile){
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
		$(return_focusing_huabu()).on("click",function(event){
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
	var snap_position = {x:0 , y:0}
	$(".tile_snap_dot").droppable({
		tolerance: "pointer",
		accept:".line_dot",
		over:function(event,ui){
			event.stopPropagation()
			console.log("进入了")
			//令drag事件停止
			return_snap_tile(false)
			var huabu_scale = return_scale()
			//获取snap_dot的圆心
			var radius = $(this).width()/2 * huabu_scale
			snap_position.x = $(this).offset().left + radius
			snap_position.y = $(this).offset().top + radius
			//将对象的圆心移动到这里来
			var draggable_radius = $(ui.draggable).width()/2 * huabu_scale
			$(ui.draggable).offset({
				left: snap_position.x - draggable_radius,
				top: snap_position.y - draggable_radius
			})
			console.log($(ui.draggable).offset())
			dragLineDot(ui.draggable)

		},
		// drop:function(event,ui){
		// 	//将对象的圆心移动到snap_dot的圆心
		// 	var huabu_scale = return_scale()
		// 	$(ui.draggable).offset({
		// 		left: snap_position.x - $(ui.draggable).width()/ 2 /huabu_scale,
		// 		top: snap_position.y - $(ui.draggable).width()/ 2 /huabu_scale
		// 	})
		// 	dragLineDot(ui.draggable)
		// 	//恢复drag事件
		// 	return_snap_tile(true)
		// },
		// out:function(event,ui){
		// 	var huabu_scale = return_scale()
		// 	event.stopPropagation()
		// 	//令drag事件重启
		// 	return_snap_tile(true)
		// 	//将对象移动到鼠标的位置来
		// 	$(ui.helper).offset({
		// 		left: event.clientX /huabu_scale,
		// 		top:event.clientY /huabu_scale
		// 	})
		// }
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




















//删除对话框的设置
$(function(){
	$("#dialog_confirm").dialog({
		autoOpen:false,
		dialogClass: "no-close",
		show:{
			effect:"clip",
			duration:300,
		},
		hide:{
			effect:"clip",
			duration:300,
		},
		resizable:false,
		height:230,
		modal:true,
		buttons:{
			"确认删除":function(){
				$(this).dialog("close");
			},
			"返回":function(){
				$(this).dialog("close");
			}
		}
	})
	})

var delete_array=[];//待删除队列，用于删除与回溯函数中，存储移入回收站但仍可回溯的tile
var delete_size_array=[];//待删除队列中的tile的size属性记录

//删除函数
function delete_confirm(a){

 	//获取tile
	var tileid="tileid_"+a.children()[0].id.substr(a.children()[0].id.lastIndexOf("_")+1);
	let the_tile = document.getElementById(tileid);
	//获取tile对应的简介
	var tile_textid="tile_textid_"+a.children()[0].id.substr(a.children()[0].id.lastIndexOf("_")+1);
	let tile_textcontainer = document.getElementById(tile_textid);

	//用于记录缩放前的tile大小，因为ui本身的不可查性，只好使用==“”来辅助大小监控
	var the_height=the_tile.style.height
	if(the_height=="")
	{
		the_height=80;
	}
	else
	{
		the_height=the_height.slice(0,-1);
		the_height=the_height.slice(0,-1);
	}
	var the_width=the_tile.style.width
	if(the_width=="")
	{
		the_width=80
	}
	else
	{
		the_width=the_width.slice(0,-1);
		the_width=the_width.slice(0,-1);
	}
	var the_size=the_height+"_"+the_width;

	//动态变化tile大小，避免出现过大tile无法移出的情况
	a.animate({
		height:50,
		width:50
	})

	//弹出对话框确认
	$("#dialog_confirm").dialog("open");

	//选择“确认删除”时的函数
	$(".ui-dialog-buttonset").children()[0].onclick=function(){
	//将删除但尚未remove的tile隐藏起来
		the_tile.style.display="none";
		tile_textcontainer.style.display="none"
	//当待删除队列有已经有5个tile时，删除最先进入的tile，再将新tile添加进待删除队列
		if(delete_array.length>=5){
			//将最先进入的tile与对应的简介，以及size队列中的数据删除掉
			delete_size_array.shift();
			delete_array.shift().remove();
			tile_textcontainer.remove();
			//将新移入的tile加入待删除队列中
			delete_size_array.push(the_size);
			delete_array.push(the_tile);
		}
		else{
		//将tile删除前的size保存进队列中
			delete_size_array.push(the_size);
			delete_array.push(the_tile);
		}
	}

	//选择“返回”时，令该tile大小，位置恢复
	$(".ui-dialog-buttonset").children()[1].onclick=function(){
		a.animate({
			height: the_height,
			width:the_width,
		})
	}
}

//回溯对话框的设置
$(function(){
	$("#undelete_dialog").dialog({
		autoOpen:false,
		dialogClass: "no-close",
		resizable:false,
		height:200,
		modal:true,
		buttons:{
			"返回":function(){
				$(this).dialog("close");
			}
		}
	})
	})

//回溯按键函数,会从后到前回溯待删除队列中的tile
function delete_undelete(){
	var array_length=delete_array.length;
	if(array_length>0){
		delete_array[array_length-1].style.display="block";
		//回溯后的tile大小恢复，位置
		var the_size=delete_size_array[array_length-1];
		var the_width=the_size.slice(0,the_size.lastIndexOf("_"));
		var the_height=the_size.slice(the_size.lastIndexOf("_")+1,);

		delete_array[array_length-1].style.width=the_width+"px";
		delete_array[array_length-1].style.height=the_height+"px";

		delete_array.pop();
		delete_size_array.pop();
	}
	else{
		$("#undelete_dialog").dialog("open");
	}
}

var colorpicker_situation = 0
//选色器按钮
$("#colorbutton").on("click",function(){
	if(colorpicker_situation==0){
		$("#colorpickercontainer").css({"display":"block"});
		colorpicker_situation = 1
	}
	else{
		$("#colorpickercontainer").css({"display":"none"});
		colorpicker_situation = 0
	}})

//选色器部件设置
var colorpicker = new iro.ColorPicker("#colorpicker",{
	id:"thecolorpicker",
	width: 250,
	wheelLightness: false,
});



//由于id命名的后置性，不得不将函数体放在ready内，其用于解决选色版的移动与选色功能的冲突
$(document).ready(function(){
	$(".IroWheel").attr("id","colorwheel");
	$(".IroSlider").attr("id","colorslider");

	$("#colorslider").mouseenter(function(){
		$("#colorpickercontainer").draggable({disabled:true})
		$(this).css('cursor',"auto");
	})
	$("#colorslider").mouseleave(function(){
		$("#colorpickercontainer").draggable({disabled:false})
		$(this).css('cursor',"move");
	})

	$("#colorwheel").on("mousemove",function(){

	var center = $(".IroWheelHue")
	var centerX = center.offset().left+center.outerWidth()/2;
	var centerY = center.offset().top+center.outerWidth()/2;
	
	//鼠标相对于中心点的距离
	var distantX = event.pageX-centerX;
	var distantY = event.pageY-centerY;
	var distant = Math.round(Math.pow( Math.pow(distantX,2) + Math.pow(distantY,2) , 0.5))

	//这个距离小于125（半径）时，禁止拖动选色板
	if( distant < 125)
	{
		$("#colorpickercontainer").draggable({disabled:true})
		$(this).css('cursor',"auto");
	}
	else{
		$("#colorpickercontainer").draggable({disabled:false,scroll: false, scrollSensitivity: 100 , scrollSpeed: 100})
		$(this).css('cursor',"move");
	}})})

//同步选色板颜色函数
function changecolorpicker(){

	var the_color=focusing_tile.style.backgroundColor;
	colorpicker.color.rgbString=the_color
}


//同步修改选色板和当前锁定DIV的颜色
colorpicker.on("color:change",function(color){
	$("#colorpickercontainer").css({"background-color":color})
	$(focusing_tile).css({"background-color":color})
})


