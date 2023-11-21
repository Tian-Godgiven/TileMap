// 组合体对象的结构及相关的功能函数

var focusing_composite = undefined

//创建组合体/选中体，将目标元素塞进这个组合体当中
function createComposite(doms,type){

	if($(doms).length <= 0){
		return false
	}

	//构建组合体元素，这是一个定位方式为relative的元素
	//这使得其他元素加入其中时，位置不会相较于huabu发生改变
	var composite = $("<div>",{
		"class":"select_composite composite"
	})

	var left_list = []
	var top_list = []
	var right_list = []
	var bottom_list = []
	//遍历这些元素并收集其位置信息
	$(doms).each(function(){
		//如果是line对象，则收集其中的line_dot的位置信息并加上line自身的位移
		if($(this).is(".line")){
			var line_left = parseInt($(this).css("left"))
			var line_top  = parseInt($(this).css("top"))
			$(this).children('.line_dot').each(function(){
				var $this = $(this)
				const left = parseInt($this.css("left")) + line_left
				const top = parseInt($this.css("top")) + line_top
				if($this.is(".line_dotMidway")){
					$this = $this.children(".line_dotMidway_inner")
					var right = left + $this.outerWidth()/2;
					var bottom = top + $this.outerHeight()/2;
				}
				else{
					var right = left + $this.outerWidth();
					var bottom = top + $this.outerHeight();
				}
				left_list.push(left);
				top_list.push(top);
				right_list.push(right);
				bottom_list.push(bottom);
			})
		}
		else{
			//如果这个元素是旋转的,则收集其旋转后的位置信息
			if($(this).attr("angle") != 0 && $(this).attr("angle") != undefined){
				const $this = $(this);
				const left = parseInt($this.css("left"));
				const top = parseInt($this.css("top"));
				var width = $this.width();
	        	var height = $this.height()
				//中心点的位置
		        var center_left = left + width/2
		        var center_top = top + height/2
		        var angle = parseInt($(this).attr("angle"))
				left_angle = top_angle = angle
	            while(left_angle > 90){
	                left_angle -= 90
	            }
	            while(top_angle < 90){
	                top_angle += 90
	            }
	            while(top_angle > 180){
	                top_angle -= 90
	            }
	            var left_radians = (left_angle * Math.PI) / 180;
	            var top_radians = (top_angle * Math.PI) / 180;
	            var half_lenth = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
	            var old_radians = Math.atan(height / width);
	            var angle_left = half_lenth * Math.abs(Math.cos(old_radians - left_radians));
	            var angle_top = half_lenth * Math.abs(Math.sin(old_radians - top_radians));
	            left_list.push(center_left - angle_left - 4);
				top_list.push(center_top - angle_top - 4);
				right_list.push(center_left + angle_left + 4);
				bottom_list.push(center_top + angle_top + 4);
			}
			//否则就正常收集信息
			else{
				const $this = $(this);
				const left = parseInt($this.css("left"));
				const top = parseInt($this.css("top"));
				const right = left + $this.outerWidth();
				const bottom = top + $this.outerHeight();
				left_list.push(left);
				top_list.push(top);
				right_list.push(right);
				bottom_list.push(bottom);
			}
		}
	})
	//composite的位置应该是最左的left和最上的top
	var left = Math.min(...left_list)
	var top = Math.min(...top_list)

	//composite的宽高应该是最大的right - left，最大的bottom - top
	var width =  Math.max(...right_list) - left
	var height = Math.max(...bottom_list) - top 
	$(composite).css({
		"width":width,//还要算上边框的厚度,width里没有算的
		"height":height,
		"left":left,
		"top":top,
	})

	//修正各个元素的位置并将其加入composite中，禁用其draggable与resizable功能
	//为其添加component类表示其为元件的组成部分，将其width与height调整为百分比
	$(doms).each(function(){
		var new_left = (parseInt($(this).css("left")) - left) / width * 100 + "%"
		var new_top = (parseInt($(this).css("top")) - top) / height * 100 +"%"
		var new_wdith = $(this).width() / width * 100 +"%"
		var new_height = $(this).height() / height * 100 +"%"
		//如果这个元素是旋转的,则不做width和height的处理，旋转的对象不能随之变化大小
		if($(this).attr("angle") != 0 && $(this).attr("angle") != undefined){
			$(this).css({
				left:new_left,
				top:new_top,
			})
		}
		else{
			$(this).css({
				left:new_left,
				top:new_top,
				height:new_height,
				width:new_wdith
			})
		}
		
		//添加类，禁用功能
		$(this).addClass('component')
		$(this).draggable("disable")
		if($(this).is(".tile , .composite")){
			$(this).resizable("disable")//line对象没有resizable功能
		}
		$(composite).append(this)
	})

	//将composite加入画布中并聚焦
	$(return_focusing_huabu()).children('.object_container').append(composite)
	focusingComposite(composite,"click")

	//composite的功能
	$(composite).draggable({
	  	addClasses: false,
	  	drag: function() {
      		$(this).find('.line_dot:not(.line_dotInner)').each(function() {
        		dragLineDot(this);
	    	});
	  	},
	  	stop: function() {
      		$(this).find('.line_dot:not(.line_dotInner)').each(function() {
        		dragLineDot(this);
	    	});
	  	}
	});
	$(composite).resizable({
		handles : " n, e, s, w, ne, se, sw, nw ",
		resize:function(){
			$(this).find(".line_dot:not(.line_dotInner)").each(function(){
				dragLineDot(this)
			})
		}
	})

	//如果是选中体，则监听点击事件，若此时发生了composite以外的点击，则摧毁该选中体
	if(type == "select"){
		$("#huabu_container").on("click",function(event){
			if($(composite).has(event.target).length == 0){
				destroyComposite(composite)
				$(this).off(event)
			}
		})
	}
}

//摧毁一个选中体/组合体，令其中的元素回到画布上，并且位置保持不变：将其位置增加组合体的位移量
function destroyComposite(composite){
	//如果这个composite没有父元素，说明他已经被删除了
	if($(composite).parent().length == 0){
		$(composite).remove()
		return false
	}
	//获取composite的位移量
	var left = parseInt($(composite).css("left"))
	var top = parseInt($(composite).css("top"))
	//将composite的所有子元素放回huabu中
	$(composite).children(".component").each(function(){
		//修改这些子元素的位置并取消其聚焦
		var new_left = parseInt($(this).css("left")) + left
		var new_top = parseInt($(this).css("top")) + top
		var new_height = $(this).height()
		var new_width = $(this).width()
		//放回画布中并修改其css
		$(return_focusing_huabu()).children(".object_container").append(this)
		$(this).css({
			left:new_left,
			top:new_top,
			height:new_height,
			width:new_width
		})
		unfocusingDom(this)
		//恢复这些子元素的功能
		//如果是line的话
		if($(this).is(".line")){
			var list = $(this).data("connecting_dot")
			//如果其上没有处于链接状态的dot则恢复其draggable功能
			if(list == undefined || list.length == 0){
				$(this).draggable("enable")
			}
		}
		else{
			$(this).draggable("enable")
		}
		if($(this).is(".tile , .composite")){
			var angle = $(this).attr("angle")
			//只给没有被旋转的元素恢复resize功能
			if(angle == "0" || angle == undefined){
				$(this).resizable("enable")
			}
			
		}
		//删除元件类
		$(this).removeClass('component')
	})
	//将这个composite摧毁
	$(composite).remove()
}

//聚焦组合体，令其出现边框，在点击非组合体子元素的位置时，令边框消失
function focusingComposite(composite,type){
	focusing_composite = this

	//若这个composite已经聚焦了，则return 0
	if($(composite).is(".composite_selected")){
		return 0
	}
	else{
		//如果是通过点击聚焦的，则同一时间仅能存在一个聚焦tile，令其他tile取消聚焦
		if(type == "click"){
			$(".composite_selected").removeClass('composite_selected')
		}
		$(composite).addClass('composite_selected')
	}

	if(type == "click"){
		//点击composite以外的区域取消聚焦
		$("#huabu_container").on("click",function(event){
			event.stopPropagation()
			//如果点击对象不是composite的子元素，则取消聚焦
			if($(composite).has(event.target).length == 0 || !$(composite).is(event.target)){
				unfocusingComposite(composite)
				$(this).off(event)
			}
		})
	}

}
//
function unfocusingComposite(composite){
	focusing_composite = undefined
	$(composite).removeClass("composite_selected")
}

