var focusing_object

//创建一个对象
async function createObject(data,type,mode){
	//type表示生成对象的方式
	if(type == "json"){
		var object = await jsonToObject(data,mode)
	}

	return object
}

//监听huabu_container中的点击事件
$("#huabu_container").on("mousedown",function(event){
	event.stopPropagation()
	var target = event.target

	//如果点到了线条的内部元素,则换成线条
	if($(target).is(".line_path , .line_text")){
		target = $(target).parents('.line')
	}

	if($(target).is(".textblock_content")){
		target = $(target).parents(".textblock")
	}

	//分为两种情况，如果点击对象是一个画布内对象
	if($(target).is(".huabu_object")){
		//如果点击是中键，则删除指定的画布内对象
		if(event.button == 1){
			deleteObject(target)
		}
		else{
			//如果这对象正在聚焦，则无事发生
			if($(target).is(".focusing")){
			}
			//否则取消其他聚焦，并聚焦到这个对象
			else{
				unfocusingObject("all")
				focusingObject(target,"click")
			}
		}
	}
	//否则聚焦到画布上
	else if($(target).is(".huabu")){
		//令所有聚焦中的对象取消聚焦
		unfocusingObject("all")
		//聚焦画布
		focusingHuabu(event.target)
	}
})

//聚焦指定对象
function focusingObject(object,type){
	//若这个元素已经被聚焦了，则return 0
	if($(object).is(".focusing")){
		return 0
	}

	//如果是通过点击聚焦的话，则取消所有其他的聚焦
	if(type == "click"){
		unfocusingObject("all")
	}

	
	//修改“当前聚焦对象”
	$object = focusing_object = $(object)

	//聚焦到这个对象，并调用不同的聚焦函数
	$object.addClass("focusing")

	if($object.is('.tile')){
		focusingTile(object)
	}
	else if($object.is('.line')){
		focusingLine(object)
	}
	else if($object.is(".composite")){
		focusingComposite(object)
	}
	else if($object.is(".textblock")){
		focusingTextblock(object)
	}
}

//取消该对象的聚焦
function unfocusingObject(object){
	if(object == "all"){
		//取消所有正在聚焦的dom的聚焦
		$(".focusing").each(function(){
			unfocusingObject(this)
		})
		//并令当前聚焦对象为空
		focusing_object = null
		return false
	}

	var $object = $(object)

	if($object.is(".focusing")){

		$object.removeClass('focusing')

		if($object.is(".tile")){
			unfocusingTile(object)
		}
		else if($object.is(".line")){
			unfocusingLine(object)
		}
		else if($object.is(".composite")){
			unfocusingComposite(object)
		}
	}
}

//重新聚焦一次该对象
function refocusingObject(object){
	unfocusingObject(object)
	focusingObject(object)
}

//返回当前画布中的聚焦对象
function return_focusing_object(type){
	if($(focusing_object).is(type)){
		return focusing_object
	}
	else{
		return false
	}
}

//删除画布中所有的聚焦元素
function deleteFocusingObject(){
	if(focusing_object != undefined){
		$(return_focusing_huabu()).find(".focusing").each(function(){
			//如果这是第一个临时组合体，则直接调用删除组合体函数
			if($(this).is(".temp_composite")){
				deleteComposite(this)
			}
			else{
				deleteObject(this)
			}
		})
	}
}

//拷贝聚焦的元素
function copyFocusingObject(){
	var object = return_focusing_object(".tile , .composite")
	copyObject(object)
}

//粘贴元素
function pasteFocusingObject(){
	pasteObject()
}

//将画布中所有的聚焦元素的z-index+1
function upZIndexFocusingObject(){
	if(focusing_object != undefined){
		$(return_focusing_huabu()).find(".focusing").each(function(){
			//如果是这是一个临时的composite，则令其中的子元素的z-index改变
			if($(this).is(".temp_composite")){
				$(this).find(".tile , .composite").each(function(){
					ZIndexObject(this,"up")
				})
			}
			else{
				ZIndexObject(this,"up")
			}
			
		})
	}
}
//将画布中所有的聚焦元素的z-index-1
function downZIndexFocusingObject(){
	if(focusing_object != undefined){
		$(return_focusing_huabu()).find(".focusing").each(function(){
			//如果是这是一个临时的composite，则令其中的子元素的z-index改变
			if($(this).is(".temp_composite")){
				$(this).find(".tile , .composite").each(function(){
					ZIndexObject(this,"down")
				})
			}
			else{
				ZIndexObject(this,"down")
			}
		})
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
	pushToUndo(dom)
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

//改变对象的z-index
function ZIndexObject(object,type,value){
	pushToUndo(object)
	//只能修改tile和composite的z-index
	if($(object).is(".tile , .composite")){
		if(type == "up"){
			//获取object当前的层叠值并+1
			var z_index = parseInt($(object).attr("z_index")) + 1
			//修改object当前的层叠值
			ZIndexObject(object,"change",z_index)
		}
		else if(type == "down"){
			//获取object当前的层叠值并+1
			var z_index = parseInt($(object).attr("z_index")) - 1
			//修改object当前的层叠值
			ZIndexObject(object,"change",z_index)
		}
		else if(type == "change"){
			//获取object所在的画布的最大，最小层叠值
			var huabu = $(object).parents(".huabu")
			var zIndexMax = parseInt($(huabu).attr("z_index_max"))
			var zIndexMin = parseInt($(huabu).attr("z_index_max"))
			//若该z-index大于Max或者小于Min,则令其为新的Max/Min
			if(value > zIndexMax){
				$(huabu).attr("z_index_max",value)
			}	
			if(value < zIndexMin){
				$(huabu).attr("z_index_min",value)
			}
			//修改z_index属性值
			$(object).attr("z_index",value)
			//修改z-index
			$(object).css("z-index",value)
			//同步显示其z-index
			if($(object).is(".tile")){
				showTileZIndex(object)
			}
			else if($(object).is(".composite")){
				showCompositeZIndex(object)
			}
		}
	}
}


//删除选中的对象
function deleteObject(object,range,mode){

	//进入撤销栈
	if(mode != "undo"){
		pushToUndo(object,"delete")
	}
	

	//根据对象调用不同的删除函数
	if($(object).is(".line")){
		deleteLine(object)
	}	
	else if($(object).is(".tile")){
		deleteTile(object)
	}
	else if($(object).is(".composite")){
		deleteComposite(object)
	}
	else if($(object).is(".huabu")){
		deleteHuabu(object)
	}

	//解除其聚焦
	unfocusingObject(object)
	
}

//选择对象的背景图片
function selectObjectBackgroundImg(dom,callbacks){
	//打开文件选择器，选择类型为图片
	openFileSelectDialog("picture")
	.then(img=>{
		if(img){
			//将这个图片变成dom的背景图片
			backgroundImgObject(dom,img,function(){
				//显示背景设置选项,并默认为放置
				setObjectBackground(dom,"放置")
				//由于默认是放置，因此显示背景图片位置设定,位置默认设定为0,0
				$(dom).css("background-position","0 0")
				callbacks()
			})
			
		}
	})
	.catch(err=>{
		console.log(err)
	})
}

//为dom增添图片背景
function backgroundImgObject(dom,img,callback){
	if(dom != undefined){
		//读取图片文件的base64编码
		getImgFileBase64(img.path)
		.then(base64 => {
			//修改dom的属性
			$(dom).prop("background_image",true)
			//做成背景字符串
			var image = "url(data:image/png;base64,"+base64+")"
			//保存图片文件的名称
			$(dom).attr("background_image_name",img.name)
			//修改其css属性，默认平铺不重复，暂时去除其背景颜色避免颜色混合
			$(dom).css({
				"background-repeat":"no-repeat",
				"background-color":"transparent",
			})
			//将base64编码作为当前对象的背景图片
			$(dom).css("background-image",image)
			//如果对象存在gradient渐变效果，则还要重新附加一次渐变效果
			if($(dom).prop("background_gradient")){
				//转至渐变效果附加背景
				gradientBackgroundTile(dom,null,null)
			}
			callback()
		})	
	}
	else{
		return false;
	}
}
//去除dom的图片背景
function UnbackgroundImgObject(dom){
	pushToUndo(dom)
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