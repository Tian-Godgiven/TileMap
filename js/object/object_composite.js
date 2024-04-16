// 组合体对象的结构及相关的功能函数

var focusing_composite = undefined

//创建临时组合体对象
function createTempComposite(doms,huabu){
	//没有选中对象，或者只选中了一个对象时直接返回false
	if($(doms).length <= 1){
		focusingObject(doms)
		return false
	}
	//如果doms只有.line对象，则不会生成组合体
	//使用 .filter() 方法过滤出不属于指定类的元素
	var all_line = doms.filter(function() {
	  	return !$(this).hasClass("line");
	});
	if(all_line.length == 0){
		return false
	}

	//筛选出line中的，两端都在doms中的line对象
	var doms = doms.filter(function() {
		if($(this).is(".line")){
			//判断其两端是否都在doms中
			var start = $("#" + $(this).attr("start_id"))
			var end = $("#" + $(this).attr("end_id"))
			// 使用 .filter() 方法检查 start 和 end 是否在 doms 中
			var num = 0
			$(doms).each(function(){
	        	if($(this).is(start) || $(this).is(end) || $(this).find(start).length > 0 || $(this).find(end).length > 0){
	        		num += 1
	        	}
	        	else if($(this).find(start).length > 0 && $(this).find(end).length > 0){
					num += 2
	        	}
			})
	        return num === 2
		}
		else{
			return true
		}
	});

	//创建一个组合体，令其为临时组合体
	var temp_composite = createComposite(doms)
	$(temp_composite).addClass('temp_composite')

	//将composite加入画布中并聚焦
	objectIntoHuabu(temp_composite,huabu)
	focusingObject(temp_composite,"click")
}

//创建组合体对象，将目标元素塞进这个组合体当中
function createComposite(doms,type){
	//构建组合体元素
	var composite = $("<div>",{
		"class":"composite object",
	})
	$(composite).attr("z_index","1")
	//给他一个center元素以便拖动
	$(composite).append("<div class='center'></div>")

	//遍历这些元素并收集其位置信息，以此生成composite的位置信息
		var composite_position = {
			right:Number.MIN_SAFE_INTEGER,
			bottom:Number.MIN_SAFE_INTEGER,
			top:Number.MAX_SAFE_INTEGER,
			left:Number.MAX_SAFE_INTEGER
		}
		$(doms).each(function(){
			const $this = $(this);
			if($this.is(".line")){
				var object_left = parseInt($this.css("left")) - 20;
				var object_top = parseInt($this.css("top")) - 20
				var object_right = object_left + $this.outerWidth() - 20
				var object_bottom = object_top + $this.outerHeight() - 20
			}
			else{
				var object_left = parseInt($this.css("left"));
				var object_top = parseInt($this.css("top"));
				var object_right = object_left + $this.outerWidth();
				var object_bottom = object_top + $this.outerHeight();
			}
			//composite的位置应该是最小的left/top和最大的right/bottom
			composite_position.left = Math.min(composite_position.left,object_left)
			composite_position.top = Math.min(composite_position.top,object_top)
			composite_position.right = Math.max(composite_position.right,object_right)
			composite_position.bottom = Math.max(composite_position.bottom,object_bottom)
		})

		//composite的宽高应该是right - left，bottom - top
		var composite_width =  composite_position.right - composite_position.left
		var composite_height = composite_position.bottom - composite_position.top
		//备忘：什么意思：还要算上边框的厚度,width里没有算的
		$(composite).css({
			"width":composite_width,
			"height":composite_height,
			"left":composite_position.left,
			"top":composite_position.top,
		})

	//修正各个元素的位置并将其加入composite中，禁用其draggable与resizable功能
	//为其添加component类表示其为元件的组成部分，将其width与height调整为百分比
	$(doms).each(function(){
		
		var new_left = (parseInt($(this).css("left")) - composite_position.left) / composite_width * 100 + "%"
		var new_top = (parseInt($(this).css("top")) - composite_position.top) / composite_height * 100 +"%"
		//位置与选中体同步
		$(this).css({
			left:new_left,
			top:new_top,
		})

		//只会变化其中的tile类元素,线条svg不受影响
		if($(this).is(".tile")){
			//尺寸为组合体比例，跟随组合体的大小变化
			var new_width = $(this).width() / composite_width * 100 +"%"
			var new_height = $(this).height() / composite_height * 100 +"%"
			$(this).css({
				height:new_height,
				width:new_width
			})
		}
		
		//添加类
		$(this).addClass('component')
		//添加到composite中
		$(composite).append(this)
	})

	//为组合体赋予功能
	abilityComposite(composite)

	return composite
}

//令组合体固定
function staticComposite(composite){
	pushToUndo(composite)
	//移除临时组合体类
	$(composite).removeClass("temp_composite")
	//令组合体中的组合体对象中的dom换一个组合体
	$(composite).find(".composite").each(function(){
		var old_composite = this
		var old_left = parseInt($(this).css("left"))
		var old_top = parseInt($(this).css("top"))
		//将这个组合体的成分提取出来
		var doms = $(this).find(".component")
		$(doms).each(function(){
			//修改这些子元素的位置,加上old_composite的偏移值
			var new_left = parseInt($(this).css("left")) + old_left
			var new_top = parseInt($(this).css("top")) + old_top
			//修改其css
			$(this).css({
				left:new_left,
				top:new_top
			})
			//修改tile元素的height和width,和新的composite成比例
			if($(this).is(".tile")){
				var new_height = $(this).height() / $(composite).height() * 100 +"%"
				var new_width = $(this).width() / $(composite).width() * 100 +"%"
				$(this).css({
					width:new_width,
					height:new_height
				})
			}
			//将这个元素放进新的composite里
			$(composite).append(this)
		})
		//删掉久的composite
		$(old_composite).remove()
	})
}

//解除组合体的固定
function unstaticComposite(composite){
	pushToUndo(composite)
	//添加临时组合体类
	$(composite).addClass("temp_composite")
}


//启用一个composite对象，这个对象往往是通过加载json代码产生的
//这个过程也会启用其子对象
function useComposite(composite){
	//添加id
	$(composite).attr({
		"id": "composite_" + createRandomId(20)
	});
	//添加一个center标记
	$(composite).append("<div class='center'></div>")
	//为其附加功能
	abilityComposite(composite)
	//聚焦
	focusingObject(composite,"click")
}

//组合体的功能
function abilityComposite(composite){
	//拖拽
	$(composite).draggable({
	  	addClasses: false,
	  	start:function(){
	  		pushToUndo(composite)
	  	},
	  	drag:function(event,ui){
	  		event.stopPropagation()
	  		 $(this).children(".tile.huabu_object").each(function(){
	  		 	refreshTileLine(this,"composite")
	  		 })
	  	}
	});
	//缩放
	$(composite).resizable({
		handles : " n, e, s, w, ne, se, sw, nw ",
		start:function(){
			pushToUndo(composite)
		},
		resize:function(){
			//其中的线条元素会刷新位置
			$(composite).find(".line").each(function(){
				refreshLinePosition(this)
			})
		}
	})
}

//摧毁一个组合体，令其中的元素回到指定位置上，并且位置保持不变：将其位置增加组合体的位移量
function destroyComposite(composite){
	//如果这个composite没有父元素，说明他已经被删除了
	if($(composite).parent().length == 0){
		$(composite).remove()
		return false
	}
	//获取composite所在的画布
	var huabu = $(composite).closest('.huabu')
	//获取composite的位移量
	var left = parseInt($(composite).css("left"))
	var top = parseInt($(composite).css("top"))
	//将composite的所有子元素放回huabu中
	$(composite).children(".component").each(function(){
		//删除元件类
		$(this).removeClass('component')

		//修改这些子元素的位置
		var new_left = parseInt($(this).css("left")) + left
		var new_top = parseInt($(this).css("top")) + top
		//修改其css
		$(this).css({
			left:new_left,
			top:new_top
		})
		//修改tile元素的height和width
		if($(this).is(".tile")){
			var new_height = $(this).height()
			var new_width = $(this).width()
			$(this).css({
				width:new_width,
				height:new_height
			})
		}
		//放回画布中
		$(huabu).find(".object_container").append(this)

		//取消聚焦
		unfocusingObject(this)
		
	})
	//将这个composite摧毁
	$(composite).remove()
}

//删除一个组合体，全杀了
function deleteComposite(composite){
	$(composite).remove()
}

//聚焦组合体，在右侧显示组合体的样式和内容，在点击非组合体子元素的位置时，令边框消失
function focusingComposite(composite,type){
	focusing_composite = composite
	changeCompositeDesign(composite)
	changeCompositeEdit(composite)
}
//取消组合体的聚焦，如果这是一个临时组合体，则将其摧毁
function unfocusingComposite(composite){
	focusing_composite = undefined

	if($(composite).is(".temp_composite")){
		destroyComposite(composite)
	}
}

//备忘
//右键一个组合体时，弹出对应的菜单，内容仅有1.组合or解除组合2.加入到选择的记忆面包

//改变组合体的颜色，实质上是改变其中所有tile和Line的颜色
function colorComposite(composite,color){
	pushToUndo(composite)
	$(composite).attr("color",color)
	//备忘：修改会调用所有函数，所以撤回时请注意！
	$(composite).find(".tile").each(function(){
		backgroundColorTile(this,color)
	})
	$(composite).find(".line").each(function(){
		colorLine(this,color)
	})
}

//改变组合体的位置
function positionComposite(composite,left,top){
	pushToUndo(composite)
	if(left){
		$(composite).css("left",left)
	}
	if(top){
		$(composite).css("top",top)
	}
}

//改变组合体的长度or宽度
function sizeComposite(composite,height,width){
	pushToUndo(composite)
	if(width){
		$(composite).css("width",width)
	}
	if(height){
		$(composite).css("height",height)
	}
}
