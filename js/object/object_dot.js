
var radius = 8
//返回dot元素的半径值
function returnDotRadius(new_radius){
	if(new_radius != undefined){
		radius = new_radius
	}
	return radius
}

//为一个object生成dot
function showDot(object,type){
	//如果是Line则调用对应的函数
	if($(object).is(".line")){
		showLineDot(object)
	}
	//否则生成type形状的dot圈
	else{
		$object = $(object)
		type = $object.attr("shape")
		//为object创建dot数据对象
		$object.data("dot",[])
		if(type == "square"){
			//获取对应信息
			var width = $object.outerWidth()
			var height = $object.outerHeight()
			var left = parseInt($object.css("left"))
			var top  = parseInt($object.css("top"))
			//每有100px宽则加一列
			var col_num = 1 + Math.ceil(width/100)
			var col_width = width / (col_num-1)
			//每有100px高则加一行
			var row_num = 1 + Math.ceil(height/100)
			var row_height = height / (row_num-1)
			
			//放在对象周围一圈
			var y = top
			for( i = 1; i <= row_num; i++){
				//只对第一行和最后一行创建所有列
				if( i == 1 || i == row_num){
					var x = left
					for(j = 1;j <= col_num;j++){
						//创建一个dot对象并且放在这个位置
						var dot = createDot(object,[x,y])
						x += col_width
					}
				}
				//其余行只在最左和最右分别创建一列
				else{
					var x = left
					var dot_left = createDot(object,[x,y])
					var dot_right = createDot(object,[x+width,y])
				}

				y += row_height

			}
		}
	}
}

//移出/隐藏与object关联的dot
function hideDot(object){
	//将这个对象所关联的所有dot删除
	var dots = $(object).data('dot')
	if($(dots).length != 0){
		for(i in dots){
			$(dots[i]).remove()
		}
		$(object).data("dot",null)
	}
}

function createDot(object,[x,y]){
	//创建LineDot对象并加入画布
	var dot = $("<div>",{class:"dot"})
	$(return_focusing_huabu()).find('.dot_container').append(dot)
	//为其赋予功能
	abilityDot(dot)
	//放置在指定位置
	positionDot(dot,[x,y])
	//将这个dot与对象关联
	$(object).data("dot").push(dot)
	$(dot).data("object",object)

	return dot
}

function abilityDot(dot){

}

//将某个点的圆心放在某个坐标位置上
function positionDot(dot,[x,y]){
	var radius = $(dot).width()/2
	$(dot).css({
		left:x - radius,
		top:y - radius
	})
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