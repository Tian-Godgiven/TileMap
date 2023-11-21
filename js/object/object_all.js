//点击object_container中的某个对象时，令其被聚焦
function focusingObject(object,type){
	$object = $(object)
	//若这个元素已经被聚焦了，则return 0
	if($object.is(".focusing")){
		return 0
	}

	//如果是通过点击聚焦的话，则取消所有其他的聚焦
	if(type == "click"){
		$(".focusing").removeClass('focusing')
		//并且使得所有dot消失
		$(return_focusing_huabu().find(".object_container").find(".dot")).remove()
	}

	//否则将其聚焦
	$object.addClass("focusing")
	//为其显示dot
	if($object.is('.tile')){
		focusingTile(object)
	}
	else if($object.is('.line')){
		focusingLine(object)
	}
	else if($object.is(".composite")){
		foucingComposite(dom)
	}

	if(type == "click"){
		//点击这个元素以外的区域取消聚焦
		$("#huabu_container").on("mousedown",function(event){
			event.stopPropagation()
			//如果点击对象不是元素自身
			if( !$(object).is(event.target) 
			//也不是元素的子元素
			 && $(object).has(event.target).length == 0
			//也不是一个dot元素
			 && !$(event.target).is(".dot")){
			 	//则取消聚焦
				unfocusingObject(object)
				$(this).off(event)
			}
		})
	}

}


//取消该dom的聚焦，根据不同对象调用不同的取消聚焦函数
function unfocusingObject(object){
	var $object = $(object)

	$object.removeClass('focusing')

	if($object.is(".tile")){
		unfocusingTile(object)
	}
	else if($object.is(".line")){
		unfocusingLine(object)
	}
	else if($object.is(".composite")){
		unfoucingComposite(object)
	}
}

//为该dom对象赋予功能，根据不同的对象调用不同的功能函数
function abilityDom(dom){
	var $dom = $(dom)
	if($dom.is(".tile")){
		abilityTile(dom)
	}
	else if($dom.is(".line")){
		abilityLine(dom)
	}
	else if($dom.is(".composite")){
		abilityComposite(dom)
	}
}

//顺时针旋转angle度,旋转后的对象无法被resize
function rotateDom(dom,angle,type){
	$dom = $(dom)
	var old_angle = $dom.attr("angle")
	if(old_angle == undefined){
		old_angle = 0
	}

	if(type == "change"){
		var new_angle = angle
	}
	else if(type == "plus"){
		var new_angle = parseInt(old_angle) + angle
	}
	
	//角度不大于360也不小于0-360
	if(new_angle >= 360){
		new_angle -= 360
	}
	else if(new_angle <= -360){
		new_angle += 360
	} 

	//如果这个新角度不为0则禁用其拖拽功能,否则启用
	if($dom.hasClass('ui-resizable')){
		if(new_angle != 0){
			$dom.resizable("disable")
		}
		else if(new_angle == 0){
			$dom.resizable("enable")
		}
	}

	//将其旋转对应的角度并将角度信息记录
	$dom.css({
		transform:"rotate(" + new_angle + "deg)",
	})
	$dom.attr("angle",new_angle)
}


//删除选中的对象
function deleteObject(object){
	//先解除其聚焦
	unfocusingObject(object)
	$(object).remove()
}