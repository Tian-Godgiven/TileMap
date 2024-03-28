var focusing_object
//点击huabu_container中的某个对象时，令其被聚焦
$("#huabu_container").on("mousedown",function(event){
	event.stopPropagation()
	if($(event.target).is('.huabu')){
		focusingHuabu(event.target)
	}
	else if($(event.target).is('.tile')){
		focusingObject(event.target,"click")
	}
})



function focusingObject(object,type){
	$object = focusing_object = $(object)
	//若这个元素已经被聚焦了，则return 0
	if($object.is(".focusing")){
		return 0
	}

	//如果是通过点击聚焦的话，则取消所有其他的聚焦
	if(type == "click"){
		$(".focusing").removeClass('focusing')
		//并且使得所有dot消失
		$(return_focusing_huabu()).find(".dot").remove()
	}

	//将其聚焦
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
		$("#huabu_container").on("click",function(event){
			event.stopPropagation()

			if($object.is('.tile')){
				var textblock = $object.data("textblock")
			}

			//如果点击对象不是元素自身
			if( !$(object).is(event.target) 
			//也不是元素的子元素
			 && $(object).has(event.target).length == 0
			//也不是一个dot元素
			 && !$(event.target).is(".dot")
			//也不是tile绑定的textblock或其子元素
			 && !$(event.target).closest('.textblock').is(textblock))
			{
			 //则取消聚焦
				unfocusingObject(object)
				$(this).off(event)
			}
		})
	}

}

//取消该dom的聚焦，根据不同对象调用不同的取消聚焦函数
function unfocusingObject(object){
	if(object == "all"){
		//取消所有正在聚焦的dom的聚焦
		$(".focusing").each(function(){
			unfocusingObject(this)
		})
	}
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

function refocusingObject(object){
	unfocusingObject(object)
	focusingObject(object)
}

//删除画布中聚焦的元素
function deleteFocusingObject(){
	if(focusing_object != undefined){
		deleteObject($(return_focusing_huabu()).find(".focusing"))
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
	//再根据对象调用不同的删除函数
	if($(object).is(".line")){
		deleteLine(object)
	}	
	else if($(object).is(".tile")){
		deleteTile(object)
	}
	
}

//为dom增添图片背景
function backgroundImgObject(dom,img){
	if(dom != undefined){
		//修改dom的属性
		$(dom).prop("background_image",true)
		//读取图片文件的base64编码
		var reader = new FileReader();
		reader.onload = function(e) {
			//将base64编码作为当前画布的背景图片，
			var base64 = e.target.result
			//保存图片文件的名称
			$(dom).attr("background_image_name",img.name)
			//保存base64编码
			$(dom).data("background_image",base64)
			//修改其css属性，默认平铺不重复，暂时去除其背景颜色避免颜色混合
			$(dom).css({
				"background-repeat":"no-repeat",
				"background-color":"transparent",
			})
			//如果对象存在gradient渐变效果
			if($(dom).prop("background_gradient")){
				//转至渐变效果附加
				gradientBackgroundTile(dom,null,null)
			}
			else{
				$(dom).css("background-image","url('"+base64+"')")
			}
			
		};
		reader.readAsDataURL(img);
	}
	else{
		return false;
	}
}
//去除dom的图片背景
function UnbackgroundImgObject(dom){
	//修改dom的属性
	$(dom).prop("background_image",false)
	//并删除存储的图片名称
	$(dom).attr("background_name",null)
	//删除存储的图片对象
	$(dom).data("background_image",null)

	//如果对象存在渐变效果
	if($(dom).prop("background_gradient")){
		//转至渐变效果附加
		gradientBackgroundTile(dom,null,null)
	}
	//否则直接设置为none
	else{
		var background_color = $(dom).attr("background_color")
		//令画布的背景图片设置为none
		$(dom).css({
			"background-image":"none",
			"background-color":background_color
		})

	}
}
//改变dom的背景显示模式
function setObjectBackground(dom,type){
	if(type == "放置"){
		//去除重复和拉伸
		$(dom).css("background-repeat","no-repeat")
		$(dom).css("background-size","auto")
	}
	else if(type == "拉伸"){
		$(dom).css("background-repeat","no-repeat")
		$(dom).css("background-size","100% 100%")
	}
	else if(type == "重复"){
		$(dom).css("background-repeat","repeat")
		$(dom).css("background-size","auto")
	}
	//将相关值保存进画布中
	$(dom).attr("background_set",type)
}