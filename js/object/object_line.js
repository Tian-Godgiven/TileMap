//基于jsplumb.js实现的磁贴对象链接系统
var connect_line_mode = false
var num = 0
var start
var end
//默认style
var style = {
	color : "black",
	line_width : "2",
	type : "besier",
	line_style : "solid",
	start_arrow: "none",
	end_arrow:"arrow"
}

//修改默认style，同时也会修改画布工具栏的设定
function changeLineStyle(new_style){


	if(["besier","flowchart","straight"].includes(new_style.type)){
		style.type = new_style.type
		//同时改变画布工具栏的设定
		$("#huabu_ability_lineType").find(".checked").removeClass('checked')
		$("#huabu_ability_lineType").find(".huabu_ability_button[value="+new_style.type+"]").addClass('checked')
	}
	if(new_style.color != undefined){
		style.color = new_style.color
	}
	if(new_style.line_width != undefined){
		style.line_width = new_style.line_width
	}
	if(["solid","dashed","dotted","dotdash"].includes(new_style.line_style)){
		style.line_style = new_style.line_style
		//同时改变画布工具栏的设定
		$("#huabu_ability_lineStyle_option").find(".checked").removeClass('checked')
		var the_div = $("#huabu_ability_lineStyle_option").find(".huabu_ability_button[value="+new_style.line_style+"]")
		$(the_div).addClass('checked')
		$("#huabu_ability_lineStyle").css("background-image",$(the_div).css("background-image"))
	}
	if(new_style.start_arrow != undefined){
		style.start_arrow = new_style.start_arrow
		//同时改变画布工具栏的设定
		if(new_style.start_arrow != "none"){
			$("#huabu_ability_startArrow").addClass('checked')
		}
		else{
			$("#huabu_ability_startArrow").removeClass('checked')
		}
	}
	if(new_style.end_arrow != undefined){
		style.end_arrow = new_style.end_arrow
		//同时改变画布工具栏的设定
		if(new_style.end_arrow != "none"){
			$("#huabu_ability_endArrow").addClass('checked')
		}
		else{
			$("#huabu_ability_endArrow").removeClass('checked')
		}
	}
}
//返回默认style，用于左侧线条工具的信息同步
function returnLineStyle(){
	return style
}

//进入连线模式，在此模式下选中两个tile对象可以使其相连
function startConnectingMode(){
	connect_line_mode = true
	//监听画布区域的点击
	$("#huabu_container").on("click.connectLineMode",function(event){
		//点击到磁贴时
		if($(event.target).is(".tile.huabu_object",)){
			var tile = event.target
			num += 1
			//第一次点击将其标记为start
			if(num == 1){
				start = $(tile)
				$(tile).addClass("line_connect_start")
			}
			//第二次点击将其标记为end，重置计数，并使得两个对象相连
			else if(num == 2){
				end = $(tile)
				num = 0
				if(!start.is(end)){
					//点击到另一个对象时添加end属性
					$(tile).addClass("line_connect_end")
					//两个对象必须存在在同一个画布
					var huabu = $(start).parents(".huabu")
					if($(end).parents(".huabu").is(huabu)){
						connectObjects(huabu,start,end)
					}
				}
				//等待一段时间后清除两个类
				setTimeout(function(){
					$(".line_connect_start").removeClass('line_connect_start')
					$(".line_connect_end").removeClass('line_connect_end')
				},500)
			}
		}
		//点击到别的地方时，归零并清除类
		else{
			num = 0
			$(".line_connect_start").removeClass('line_connect_start')
			$(".line_connect_end").removeClass('line_connect_end')
		}
	})
}

//结束连线模式
function endConnectingMode(){
	connect_line_mode = true
	//终止监听
	$("#huabu_container").off("click.connectLineMode")
	//清除类
	$(".line_connect_start").removeClass('line_connect_start')
	$(".line_connect_end").removeClass('line_connect_end')
}

//在画布内新创建一根线条，使其连接两个对象
function connectObjects(huabu, start, end ,the_style) {
	//创建一个线条对象
	var line_svg = createLine(the_style,null) 
	//是新的对象，所以给它一个id
 	var line_id = "line_" + createRandomId(20)
 	$(line_svg).attr("id",line_id)
 	//将其与两个元素绑定
 	connectLineAndObject(line_svg,start,end)
    //添加到画布
    objectIntoHuabu(line_svg,huabu)
    //刷新一下位置
    refreshLinePosition(line_svg)
}

//创建一个线条，本质是一个svg
function createLine(the_style,text){
	//读取style
		if(the_style != null){
			//读取传入的style,有默认值
			var color = the_style.color ? the_style.color : "black";
			var line_width = the_style.line_width ? the_style.line_width : "2";
			var type = the_style.type ? the_style.type :　"besier"
			var line_style = the_style.line_style ? the_style.line_style : "solid"
			var start_arrow = the_style.start_arrow ? the_style.start_arrow : "none"
			var end_arrow = the_style.end_arrow ? the_style.end_arrow : "arrow"
		}
		//否则就用默认的style
		else{
			var color = style.color
			var line_width = style.line_width
			var type = style.type
			var line_style = style.line_style
			var start_arrow = style.start_arrow
			var end_arrow = style.end_arrow
		}
	// 创建 SVG 元素
    var line_svg = $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>');
 	// 添加对应的class
 	$(line_svg).addClass('line object')
 	// 创建路径元素
 	var path = document.createElementNS("http://www.w3.org/2000/svg", "path")
 	// 将元素添加到SVG中
 	$(path).addClass('line_path')
 	$(path).css("pointer-events","visiblePainted")
    $(line_svg).append(path);

 	//调整line的样式
	colorLine(line_svg,color)
	widthLine(line_svg,line_width)
	styleLine(line_svg,line_style)
	if(start_arrow != "none"){
		arrowLine(line_svg,"start")
	}
	if(end_arrow != "none"){
		arrowLine(line_svg,"end")
	}
	$(line_svg).attr("type",type)

	//添加线条文本
	if(text == null){
		createLineText(line_svg,"输入文本")
	}
	else{
		createLineText(line_svg,text)
	}

	//返回这个线条对象
	return line_svg
}

//更新线条的位置
function refreshLinePosition(line_svg,mode){
	//获取其绑定的元素
	var start = $("#"+ $(line_svg).attr("start_id"))
	var end = $("#"+ $(line_svg).attr("end_id"))

	//如果type为new或者file就重新绑定一次
	if(mode == "new" || mode == "file"){
		connectLineAndObject(line_svg,start,end)
	}
	//获取对应的元素的位置信息,这个位置信息应当是这个对象相对于线条所在的容器的相对距离
	var line_container = $(line_svg).parent()
	var a_position = positionAandB(line_container,start)
	var b_position = positionAandB(line_container,end)

	var a_left = a_position.left
	var a_top = a_position.top
	var b_left = b_position.left
	var b_top = b_position.top

 	var a_width = $(start).outerWidth()
 	var a_height = $(start).outerHeight()
 	//end
 	var b_width = $(end).outerWidth()
 	var b_height = $(end).outerHeight()

 	//获取线条两端的锚点位置，一共有4个锚点，上下左右，锚点位置在边框中心

	 	//获取两点x,y轴的中心差
	 	var dis_x = (a_left + a_width/2) - (b_left + b_width/2)
	 	var dis_y = (a_top + a_height/2) - (b_top + b_height/2)
	 	//判断两点的x,y轴差，若x轴差大于y轴差，则在左右
	 	if(Math.abs(dis_x) >= Math.abs(dis_y)){
	 		//如果dis为负数，则说明a在b的左边，a使用右锚点，b使用左锚点
	 		if(dis_x < 0){
	 			//右锚点即为left+完整的width和top+一半的高度
	 			var a_point = { left : a_left + a_width , top : a_top + a_height/2}
	 			//左锚点即为left+0的width和同上
	 			var b_point = { left : b_left, top : b_top + b_height/2}
	 		}
	 		//否则二者相反
	 		else{
	 			var a_point = { left : a_left , top : a_top + a_height/2}
	 			//左锚点即为0的left和同上
	 			var b_point = { left : b_left + b_width , top : b_top + b_height/2}
	 		}
	 		//此时的
	 	}
	 	//如果y轴差大于x轴差，则在上下
	 	else{
	 		//如果dis为负数，则说明a在b的上方，a用下锚点，b用上锚点
	 		if(dis_y < 0){
	 			var a_point = { left : a_left + a_width/2 , top : a_top + a_height}
	 			var b_point = { left : b_left + b_width/2 , top : b_top}
	 		}
	 		//否则二者相反
	 		else{
	 			//上锚点即为left+一半的宽度和top+0的高度
	 			var a_point = { left : a_left + a_width/2 , top : a_top}
	 			//左锚点即为同上和完整的top
	 			var b_point = { left : b_left + b_width/2 , top : b_top + b_height}
	 			
	 		}
	 	}

	//通过锚点来修改svg和line的刷新
    var pos1_left = a_point.left
 	var pos1_top = a_point.top
    var pos2_left = b_point.left
 	var pos2_top = b_point.top

	//根据锚点的位置更新svg本身的宽度和位置
	$(line_svg).attr({
 		"width":Math.abs(pos1_left - pos2_left)+100,
 		"height":Math.abs(pos1_top - pos2_top)+100
 	})
 	//移动到两点之间相对靠左上的位置-10
 	var svg_left = Math.min(pos1_left,pos2_left)-50
 	var svg_top = Math.min(pos1_top,pos2_top)-50
 	$(line_svg).css({
 		left:svg_left,
 		top:svg_top
 	})
 	//再更新线条的两端
	var line_x1 = pos1_left - svg_left
 	var line_x2 = pos2_left - svg_left
 	var line_y1 = pos1_top - svg_top
 	var line_y2 = pos2_top - svg_top
 	//获取路径对象
 	var path = $(line_svg).children("path")

 	var type = $(line_svg).attr("type")
 	//三次贝塞尔曲线
 	if(type == "besier"){
 		 //起点和终点
 		var p0 = {x:line_x1,y:line_y1}
 		var p3 = {x:line_x2,y:line_y2}

 		//贝塞尔曲线的设置,获得控制点
 		var [besier_1,besier_2]= besierControlPoints(p0,p3,dis_x,dis_y)
		//定义路径描述
 		var d = "M "+line_x1+" "+line_y1;
		d += " C "+ besier_1.x + " " + besier_1.y + " " + besier_2.x + " " + besier_2.y +" "+line_x2+" "+line_y2; 
 		$(path).attr("fill", "none");
 	}
 	//直线
 	else if(type == "straight"){
 		var d = "M "+line_x1+" "+line_y1 +" "+line_x2+" "+line_y2;
 	}
 	//折线
 	else if(type == "flowchart"){
 		//起点和终点
 		var start = {x:line_x1,y:line_y1}
 		var end = {x:line_x2,y:line_y2}
 		var d = flowchartPathD(start,end,dis_x,dis_y)
 	}
 	
	//修改路径
	$(path).attr("d", d);
}

//删除线条
function deleteLine(line_svg){
	var id = $(line_svg).attr("id")
	//删除绑定它的tile的line_list中的它
	var start = $("#" + $(line_svg).attr("start_id"))
	var start_list = $(start).data("line_list")
	start_list = $.grep(start_list, function(value) {
	    return value !== id;
	});
	$(start).data("line_list",start_list)

	var end = $("#" + $(line_svg).attr("end_id"))
	var end_list = $(end).data("line_list")
	end_list = $.grep(end_list, function(value) {
	    return value !== id;
	});
	$(end).data("line_list",end_list)
	//最后才删除掉这个元素
	$(line_svg).remove()
}

//右键线条显示线条菜单
$("#huabu_container").on("mouseup",".line_path,.line_text",function(event){
	//如果是右键
	if(event.button == 2){
		var line_svg = $(this).parents('.line')
		showLineMenu(event,line_svg)
	}
})
//双击线条时，若其文本没有内容，添加“输入文本”
$("#huabu_container").on("dblclick",".line_path",function(event){
	var text_div = $(this).parents('.line').find('.line_text')
	if($(text_div).text() == ""){
		$(text_div).text("输入文本")
		$(text_div).dblclick()
	}
})

//生成线条
	// 让线条svg对象与对象互联
	function connectLineAndObject(line_svg,start,end){
		var line_id = $(line_svg).attr("id")
		//对象的id保存进svg内
		$(line_svg).attr("start_id",$(start).attr("id"))
		$(line_svg).attr("end_id",$(end).attr("id"))
		//svg的id保存进对象的line_list内，一个对象可以绑定多个line_svg
		var list = $(start).data("line_list")

		//要求list为空或不存在对应的line_svg
		if(list == undefined || !list.includes(line_id)){
			if(list == undefined){
				list = []
			}
			list.push(line_id)
			$(start).data("line_list",list)
		}
		//end的
		var list2 = $(end).data("line_list")
		//要求list为空或不存在对应的line_svg
		if(list2 == undefined || !list2.includes(line_id)){
			if(list2 == undefined){
				list2 = []
			}
			list2.push(line_id)
			$(end).data("line_list",list2)
		}
	}

	//生成贝塞尔曲线控制点参数
	function besierControlPoints(p0, p3,dis_x,dis_y) {
	    // 计算中心点
	    var center = {
	        x: (p0.x + p3.x) / 2,
	        y: (p0.y + p3.y) / 2
	    };

	    // 计算控制点
	    var distance_x = (p0.x + p3.x)/3; // 控制点到端点的距离为端点之间距离的 1/3
	    var distance_y = (p0.y + p3.y)/3

	    // 根据位置关系控制反转
	  	if(Math.abs(dis_x) >= Math.abs(dis_y)){
	 		if(dis_x < 0){
	 			if(dis_y > 0){
	 				distance_x_p1 = distance_x
	 				distance_y_p1 = distance_y
	 				distance_x_p2 = - distance_x
	 				distance_y_p2 = - distance_y
	 			}
	 			else{
	 				distance_x_p1 = distance_x
	 				distance_y_p1 = - distance_y
	 				distance_x_p2 = - distance_x
	 				distance_y_p2 = distance_y
	 			}
	 			
	 		}
	 		//水平反转
	 		else{
	 			if(dis_y > 0){
	 				distance_x_p1 = - distance_x
	 				distance_y_p1 = distance_y
	 				distance_x_p2 = distance_x
	 				distance_y_p2 = - distance_y
	 			}
	 			else{
	 				distance_x_p1 = - distance_x
	 				distance_y_p1 = - distance_y
	 				distance_x_p2 = distance_x
	 				distance_y_p2 = distance_y
	 			}
	 		}
	 	}
	 	else{
	 		if(dis_y < 0){
	 			if(dis_x > 0){
	 				distance_x_p1 = distance_x
	 				distance_y_p1 = distance_y
	 				distance_x_p2 = - distance_x
	 				distance_y_p2 = - distance_y
	 			}
	 			else{
	 				distance_x_p1 = - distance_x
	 				distance_y_p1 = distance_y
	 				distance_x_p2 = distance_x
	 				distance_y_p2 = - distance_y
	 			}
	 		}
	 		else{
	 			if(dis_x > 0){
	 				distance_x_p1 = distance_x
	 				distance_y_p1 = - distance_y
	 				distance_x_p2 = - distance_x
	 				distance_y_p2 = distance_y
	 			}
	 			else{
	 				distance_x_p1 = - distance_x
	 				distance_y_p1 = - distance_y
	 				distance_x_p2 = distance_x
	 				distance_y_p2 = distance_y
	 			}
	 		}
	 	}

	 	// 计算控制点坐标
	 	var p1 = {
			x: center.x + distance_x_p1,
			y: center.y + distance_y_p1
		};
		var p2 = {
		    x: center.x + distance_x_p2,
		    y: center.y + distance_y_p2
		};

	    return [p1, p2];
	}

	//生成折线的d
	function flowchartPathD(pointA,pointB,dis_x,dis_y){
		// 获取起点和终点的坐标
	    var x1 = pointA.x;
	    var y1 = pointA.y;
	    var x2 = pointB.x;
	    var y2 = pointB.y;

	    // 计算水平和垂直的偏移距离
	    var deltaX = (x1 - x2)/2;
	    var deltaY = (y1 - y2)/2;

	    // 根据位置关系控制反转
	  	if(Math.abs(dis_x) >= Math.abs(dis_y)){
	 		p1_x = x1 - deltaX
			p1_y = y1
			p2_x = x1 - deltaX
			p2_y = y2
	 	}
	 	else{
	 		p1_x = x1
			p1_y = y1 - deltaY
			p2_x = x2
			p2_y = y1 - deltaY
	 	}

	    // 两个转折点
	 	var p1 = {
			x: p1_x,
			y: p1_y
		};
		var p2 = {
		    x: p2_x,
			y: p2_y
		};

	    // 创建路径
	    var d = "M" + x1 + "," + y1 + " L" + p1.x + "," + p1.y + " L" + p2.x + "," + p2.y + " L" + x2 + "," + y2;
	    return d
	}

//改变线条样式
	//改变颜色
		function colorLine(line_svg,color){
			var path = $(line_svg).children('path')
			$(path).attr("stroke", color)
			//改变箭头的颜色
			$(line_svg).find(".arrow_inner").attr("stroke",color)
			$(line_svg).find(".arrow_inner").attr("fill",color)
		}
	//改变粗细
		function widthLine(line_svg,line_width){
			var path = $(line_svg).children('.line_path')
			$(path).attr("stroke-width", line_width)

		}
	//改变样式
		function styleLine(line_svg,line_style){
			var path = $(line_svg).children('path')
			$(path).attr("line_style",line_style)

			if(line_style == "solid"){
				$(path).attr("style","")
				path.attr("fill", "none"); // 取消空心样式
			}
			else if(line_style == "dashed"){
				$(path).attr("style","stroke-dasharray: 10,10")
				path.attr("fill", "none"); // 取消空心样式
			}
			else if(line_style == "dotted"){
				$(path).attr("style","stroke-dasharray: 2,5")
				path.attr("fill", "none"); // 取消空心样式
			}
			else if(line_style == "dotdash"){
				$(path).attr("style","stroke-dasharray: 2,10,10,10")
				path.attr("fill", "none"); // 取消空心样式
			}

		}
	//改变类型
		function typeLine(line_svg,type){
			//修改line的type
			$(line_svg).attr("type",type)
			//刷新线条
			refreshLinePosition(line_svg)
		}
//增加箭头
	function arrowLine(line_svg, arrow_position) {
	    var path = $(line_svg).children('path');
	    if (arrow_position == "start") {
	        // 添加开始箭头
	        var startArrow = createArrow(path,"start");
	        $(startArrow).attr("id", "start_arrow"); // 添加唯一的ID
	        $(line_svg).append(startArrow);
	        $(path).attr("marker-start", "url(#start_arrow)");
	        $(path).attr("start_arrow","arrow")
	    } 
	    else if (arrow_position == "end") {
	        // 添加结束箭头
	        var endArrow = createArrow(path,"end");
	        $(endArrow).attr("id", "end_arrow"); // 添加唯一的ID
	        $(line_svg).append(endArrow);
	        $(path).attr("marker-end", "url(#end_arrow)");
	        $(path).attr("end_arrow","arrow")
	    } 
	}
	//去除箭头
	function unarrowLine(line_svg,arrow_position){
		var path = $(line_svg).children('path');
		if (arrow_position == "start") {
	        $(line_svg).children('#start_arrow').remove(); // 移除所有箭头元素
	        $(path).attr("marker-start", ""); // 移除开始箭头引用
	        $(path).attr("start_arrow","none")
	    } 
	    else if(arrow_position == "end") {
	        $(line_svg).children('#end_arrow').remove(); // 移除所有箭头元素
	        $(path).attr("marker-end", ""); // 移除结束箭头引用
	        $(path).attr("end_arrow","none")
	    }
	}
	/*创造箭头本身*/
	function createArrow(path,position) {
		if(position == "start"){
	 		var d = "M9,0 L9,6 L0,3 z" // 修改箭头方向，使其指向路径起点
        	var refX = "0" // 调整箭头位置，使其与路径起点对齐
        }
        else if(position == "end"){
        	var d = "M0,0 L0,6 L9,3 z"
        	var refX = "8"
        }
        var arrow = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        $(arrow).attr({
            "markerWidth": "10",
            "markerHeight": "10",
            "refX":refX,
            "refY": "3",
            "orient": "auto",
            "markerUnits": "strokeWidth"
        });
        // 定义箭头内部路径
        var arrow_inner = document.createElementNS("http://www.w3.org/2000/svg", "path");
        var color = $(path).attr("stroke")
        $(arrow_inner).attr({
            "d":d,
            "fill": color,
            "class": "arrow_inner",
        });

        // 将箭头内部路径附加到箭头上
        $(arrow).append(arrow_inner);

        return arrow;
    }

//增添文字内容
	//在线条中心插入一个文本内容
	function createLineText(line_svg,text){
	    // 创建文本的外壳
	    var textElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
	    // 设置外壳的属性
	    $(textElement).attr({
	   		'width': '100%',
	   		"height":"100%"
	   	}); 

	    // 创建文本本体
	    var text_div = $("<div class='line_text'>"+text+"</div>")
	    // 放入外壳中
	    $(textElement).append(text_div)

	    // 将文本元素添加到 SVG 容器中
	    $(line_svg).append(textElement);
	}

	// 双击线条文本，可以将其聚焦并修改
	$("#huabu_container").on("dblclick",".line_text",function(event){
		event.stopPropagation()
		$(this).addClass('focusing_lineText')
		$(this).attr('contenteditable', 'true');
		$(this).focus()
	})
	// 失去焦点时结束修改
    $("#huabu_container").on("mousedown",function(event){
    	if(!$(event.target).is(".focusing_lineText")){
    		$(".focusing_lineText").attr('contenteditable', 'false');
        	$(".focusing_lineText").removeClass('focusing_lineText')
    	}
    });

//聚焦线条
function focusingLine(line_svg){
	//备忘，我也不知道聚焦线条干什么
}	
//取消线条的聚焦
function unfocusingLine(line_svg){
	//隐藏line_menu
	hideObjectMenu("line_menu")
}


//启用一个线条对象
function useLine(line_svg){
	var start = $("#"+$(line_svg).attr("start_id"))
	var end = $("#"+$(line_svg).attr("end_id"))
	//将svg与这两个元素绑定
	connectLineAndObject(line_svg,start,end)
	//刷新它的位置
	refreshLinePosition(line_svg)
}
