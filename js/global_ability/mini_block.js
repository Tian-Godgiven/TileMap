//获取一个miniblock的target
function getMiniBlockTarget(miniblock){
	var target = $(miniblock).data("target")
	//如果target为空，则通过id寻找对应的目标
	if(target == undefined){
		target = $("#" + $(miniblock).attr("target_id"))
		$(miniblock).data("target",target)
	}

	return target
}

//生成缩略画布块
function createMiniHuabu(huabu){
	//获取画布的背景颜色和名称
	var color = $(huabu).css("background-color")
	var name = $(huabu).attr("name")
	//生成缩略画布块，包含一个和画布同色的miniBlock_huabu和画布名称的span
	var miniHuabu = $("<span class='miniHuabu miniObject'>\
						 <span class='miniBlock_huabu' style='background-color:"+color+"'></span>\
						 <span class='miniBlock_title'>"+name+"</span>\
					   </span>")
	//绑定画布，顺便保存一个target，target就是Huabu的id
	$(miniHuabu).attr("target_id",$(huabu).attr("id"))
	//返回画布缩略块
	return miniHuabu
}

//当鼠标移到缩略块上时，更新缩略块的数据
$(document).on("mouseenter",".miniHuabu",function(){
	var target = getMiniBlockTarget(this)
	//更新颜色和名称
	var color = $(target).css("background-color")
	var name = $(target).attr("name")
	$(this).children(".miniBlock_huabu").css("background-color",color)
	$(this).children(".miniBlock_title").text(name)
})
//点击画布缩略块，移动到对应的画布
$(document).on("click",".miniHuabu",function(){
	var target = getMiniBlockTarget(this)
	//如果这是一个未打开的嵌套画布，则从当前画布打开这个画布
	if($(target).is(".hide")){
		var now_huabu = return_focusing_huabu()
		openNestedHuabu(now_huabu,target)
	}
	//否则就单纯地移动过去进行了
	else{
		changeHuabu(target)
	}
})



//生成磁贴缩略块
function createMiniTile(tile){
	//获取磁贴的背景颜色和名称
	var color = $(tile).css("background-color")
	var title = $(tile).children(".tile_title").text()
	if(title == ""){
		title = "磁贴"
	}
	//生成缩略磁贴块
	var miniTile = $("<span class='miniTile miniObject'>\
						 <span class='miniBlock_tile' style='background-color:"+color+"'></span>\
						 <span class='miniBlock_title'>"+title+"</span>\
					   </span>")
	//绑定磁贴,顺便绑定一份id
	$(miniTile).attr("target_id",$(tile).attr("id"))
	$(miniTile).data("target",tile)
	//返回磁贴缩略块
	return miniTile
}
//当鼠标移到缩略块上时，更新缩略块的数据
$(document).on("mouseenter",".miniTile",function(){
	var target = getMiniBlockTarget(this)
	//更新颜色和名称
	var color = $(target).css("background-color")
	var title = $(target).children(".tile_title").text()
	if(title == ""){
		title = "磁贴"
	}
	$(this).children(".miniBlock_tile").css("background-color",color)
	$(this).children(".miniBlock_title").text(title)
})

//点击磁贴缩略块，移动到对应的磁贴
$(document).on("click",".miniTile",function(){
	var target = getMiniBlockTarget(this)
	moveToTile(target)
})


//生成内容块缩略块
function createMiniTextBlock(tile,textblock){
	//获取对应的磁贴的标题
	var title = $(tile).children(".tile_title").text()
	if(title == ""){
		title = "磁贴"
	}
	//生成缩略内容块，包含一个表示内容块的miniBlock_textblock和磁贴名称的span
	var miniTextBlock = $("<span class='miniTextBlock miniObject'>\
						 <span class='miniBlock_textblock'></span>\
						 <span class='miniBlock_title'>"+title+"</span>\
					   </span>")
	//绑定内容块和id
	$(miniTextBlock).data("target",textblock)
	$(miniTextBlock).attr("target_id",$(textblock).attr("id"))
	//返回磁贴缩略块
	return miniTextBlock
}
//当鼠标移到缩略块上时，更新缩略块的数据
$(document).on("mouseenter",".miniTextBlock",function(){
	var target = getMiniBlockTarget(this)
	var tile = $(target).data("tile")
	//更新名称
	var title = $(tile).children(".tile_title").text()
	if(title == ""){
		title = "磁贴"
	}
	$(this).children(".miniBlock_title").text(title)
})
//点击内容块缩略块，移动到对应的内容块所在的位置
$(document).on("click",".miniTextBlock",function(){
	var target = getMiniBlockTarget(this)
	moveToTile(target)
})