var colorpicker//调色器本身
var color_target_dom //调色器修改颜色的对象
var color_target_colorpicker//调用调色器的选色器按钮对象
var color_type //调色器修改对象的类型，包括“background”，“text"和"border","huabu_grid"
//创建调色盘
function createColorpicker(dom_id){
	//生成调色盘对象，加入色圆和状态条
	colorpicker = new iro.ColorPicker(dom_id,{
		width:150,
		margin:4,
		layoutDirection:"horizontal",
		layout: [
			{
				component: iro.ui.Wheel,
			},
			{ 
	      	component: iro.ui.Slider,
	      	options: {
	        	sliderType: 'saturation' //也可以是 '', 'value', 'alpha' 或 'kelvin'
	      		}
	    	},
	    	{ 
	      	component: iro.ui.Slider,
	      	options: {
	        	sliderType: 'value' //也可以是 '', 'value', 'alpha' 或 'kelvin'
	      		}
	    	},
	    	{ 
	      	component: iro.ui.Slider,
	      	options: {
	        	sliderType: 'alpha' //也可以是 '', 'value', 'alpha' 或 'kelvin'
	      		}
	    	},

	  	]
	});
	//将色块填入选择区
	appendColorpickerSelect()
	//调色盘对象在颜色变化时，会将变化后的颜色值以hex形式显示在输入栏中
	colorpicker.on("color:change",function(color){
		color = color.hex8String.toUpperCase()
		changeColorpickerInput(color)
	})
}

//调用调色盘,在指定位置旁显示该调色盘
// target:调用调色盘的.colorpicker对象
// position：调色盘显示的位置，分为side（旁边）和down(下方)
// dom:调色盘修改颜色的对象，可为空
// type:调色盘修改颜色的对象的颜色对象，包括background和text，分别对应修改backgroundcolor和color
function showColorpicker(target,position,dom,type){
    //如果调色盘已经显示了，那么就把它隐藏
    if($('#colorpicker').css("display") != "none"){
        hideColorpicker()
        return 0
    }
	//传入修改对象的信息
	color_target_colorpicker = target
	color_target_dom = dom
	color_type = type
	//在目标位置旁边显示调色盘
	var colorpicker = $('#colorpicker')
	var target_left = $(target).offset().left
	var target_top  = $(target).offset().top

	//调色盘的位置与大小
	var the_left = 0
	var the_top = 0
	var the_width = $(colorpicker).outerWidth()
	var the_height = $(colorpicker).outerHeight()
	//在对象两侧显示调色盘
	if(position == "side"){
		//默认显示在右侧
		the_left = target_left + $(target).width()
		//如果目标的右侧不够显示调色盘，则在目标左侧显示，
		if(the_left + the_width > $(window).width()){
			the_left = target_left - the_width
		}

		//默认与目标的高度持平
		the_top = target_top
		//如果目标的下侧不够显示，则将其上移至能够显示
		if(the_top + the_height > $(window).height()){
			the_top = $(window).height() - the_height
		}
	}
	//在对象下方显示调色盘
	else if(position == "down"){
		//默认在对象下方
		the_top = target_top + $(target).height()
		//若下方的空间不够，则将其显示在右侧
		if(the_top + the_height > $(window).height()){
			the_left = target_left + $(target).width()
			//如果此时右侧空间不足，则将其显示在左侧
			if(the_left + the_width > $(window).width()){
				the_left = target_left - the_width
			}
			//尽可能地与目标持平
			the_top = target_top
			//否则将其上移至能够显示
			if(the_top + the_height > $(window).height()){
				the_top = $(window).height() - the_height
			}
		}
		else{
			//如果下方空间充足，则左侧与目标持平
			the_left = target_left
			//如果右侧的空间不够，则向左移动这个差值
			if(the_left + the_width > $(window).width()){
				the_left = $(window).width() - the_width
			}
		}
	}
	//修改调色盘的位置并将其显示
	$(colorpicker).show()
	$(colorpicker).offset({
		left:the_left,
		top:the_top
	})

	//修改调色盘对象的颜色使其与目标选色器当前的颜色相同
	var color = $(target).children(".colorpicker_color").css("background-color")
	changeColorpicker(color)

	//监听点击事件，点击到画布外则直接关闭调色盘
	$("#huabu_container").on("click",function(event){
		event.stopPropagation();
		//如果点击对象不是指定元素，则将其隐藏/删除并解除该事件绑定
		if(!colorpicker.is(event.target)){
			hideColorpicker()
			//使用Off解绑该元素所绑定even
			$(this).off(event)
		}
	})
}
//关闭调色盘，令该调色盘隐藏
function hideColorpicker(){
	$('#colorpicker').hide()
	color_target_dom = color_target_colorpicker = undefined
}



//修改色轮当前的颜色值，该操作也会同时修改输入区的内容
function changeColorpicker(color){
	colorpicker.color.set(color)
}



//返回色轮当前的颜色值，实际上返回的是输入栏的值
function returnColorpicker(){
	//获取当前颜色的hex值
	var color = $("#colorpicker_input input").val()
	return color
}
//当输入区输入合法的颜色值时，修改调色盘的颜色
$("#colorpicker_input input").on("input",function(){
	var input = $("#colorpicker_input input").val()
	if(isColor(input)){
		changeColorpicker(input)
	}
})
//反过来在颜色修改时修改输入区的颜色值
function changeColorpickerInput(color){
	$("#colorpicker_input input").val(color)
}
//输入区的三个按钮
//确认：应用并关闭调色盘
$("#colorpicker_input_comfirm").on("click",function(){
    confirmColorpicker()
    hideColorpicker()
})
//复制：将Input中的内容复制到剪贴板
$("#colorpicker_input_copy").on("click",function(){
    var color = returnColorpicker()
    pushClickboard(color)
})
//收起/展开：将memeroy和select收起或者展开
$("#colorpicker_input_menu").on("click",function(){
    $("#colorpicker_menu").stop()
    $("#colorpicker_menu").slideToggle(500)
    //如果是展开状态，则令其收起，将按钮图标替换为menu_down，
    if($(this).attr("menu") == "down"){
        $(this).find("img").attr("src","./img/menu_down.png")
        $(this).attr("menu","up")
        $("#colorpicker").animate({height:"228px"},500)
    }
    //如果是收起状态，则令其展开，将按钮图标替换为menu_up
    else if($(this).attr("menu") == "up"){
        $(this).find("img").attr("src","./img/menu_up.png")
        $(this).attr("menu","down")
        $("#colorpicker").animate({height:"390px"},500)
    }
})



//将色块加入记忆区，被选择了“应用”的颜色会生成一个colorblock放在这里
function appendColorpickerMemory(color){
	var memory = $("#colorpicker_memory")
	//记忆区最多放置12个子元素,多余的颜色块会被舍弃
	if(memory.children().length == 12){
		memory.children("div:not(#delete)").last().remove()
	}
	var colorblock = $("<div>",{class:"colorblock"})
	colorblock.css("background-color",color)
	memory.prepend(colorblock)
}
//记忆区的色块被选中时，修改调色盘的当前颜色
$("#colorpicker_memory").on("click"," .colorblock:not(#delete)",function(){
	var color = $(this).css("background-color")
	changeColorpicker(color)
})
//记忆区的“删除”按钮，点击后清空记忆区的所有颜色块
$("#colorpicker_memory").on("click","#delete",function(){
	$("#colorpicker_memory").children('div:not(#delete)').remove()
})



//将色块加入选择区,只会在创建时调用一次
function appendColorpickerSelect(){
	//一共是12列7行
	var row = 7;
	var col = 12;
	var r = g = b = 255
	//第一行是透明+黑白变化，透明已经占了一格了，所以col-1
	for(var i = col-2; i >= 0 ; i-- ){
		//颜色从白到黒
		var color = "rgb(" + r*i*0.1 +"," + g*i*0.1 + "," + b*i*0.1 +")"
		var colorblock = $("<div>",{class:"colorblock"})
		colorblock.css("background-color",color)
		$("#colorpicker_select").append(colorblock)
	}
	row -= 1

	//随后的6行中颜色以rgb的形式依次变化
	for(var i = 1; i <= row; i++){
		//每一列中的变化趋势为：白→纯色→黒，也就是其余两色值变小→纯色→纯色值变小
		//前三层当中其余两色值逐渐变小，纯色值不变，即每过一层最小值为最大值减少64=255/4，
		if( i < 4){
			var max = 255
			var min = 64 * (4-i)
			
		}
		//第4层即为纯色层
		else if(i == 4){
			var max = 255
			var min = 0
		}
		//最后两层纯色值减少64，太暗的最后两层(第7，8层）颜色就不要了
		else if(i > 4){
			var max = 64 * (8-i)
			var min = 0
		}
		var mid = (max + min)/2
		//每一行中的变化趋势为：红→黄→绿→青→蓝→紫→红，从红色开始
		r = max
		g = min
		b = min
		for(var j = 1; j <= col; j++){
			//每一行所使用的max和mid值不同,一行12列，每种变化2列
			//红→黄:rb不变，g依次取mid和max
			if(j > 1 && j<= 3){
				if(g != mid){
					g = mid
				}
				else{
					g = max
				}
			}
			//黄→绿:gb不变，r依次取mid和min
			else if(j>3 && j<= 5){
				if(r != mid){
					r = mid
				}
				else{
					r = min
				}
			}
			//绿→青:rg不变，b依次取mid和max
			else if(j>5 && j<= 7){
				if(b != mid){
					b = mid
				}
				else{
					b = max
				}
			}
			//青→蓝:rb不变，g依次取mid和min
			else if(j>7 && j<= 9){
				if(g != mid){
					g = mid
				}
				else{
					g = min
				}
			}
			//蓝→紫:gb不变，r依次取mid和max
			else if(j>9 && j<=11){
				if(r != mid){
					r = mid
				}
				else{
					r = max
				}
			}
			//紫→红：rg不变，b依次取mid,min就是开头那个
			else if(j>11){
				b = mid
			}
			//最终得到rgb的值
			var color = "rgb(" + r +"," + g + "," + b +")"
			var colorblock = $("<div>",{class:"colorblock"})
			colorblock.css("background-color",color)
			$("#colorpicker_select").append(colorblock)
		}
	}
}

//选择区的色块被选中时，修改调色盘的当前颜色
$("#colorpicker_select").on("click"," .colorblock",function(){
	var color = $(this).css("background-color")
	changeColorpicker(color)
})



//底部栏的“应用”按钮，按下后修改目标元素的颜色并将这个颜色填入记忆区
$("#colorpicker_bottom_confirm").on("click",function(){
	confirmColorpicker()
})
//“应用颜色”函数
function confirmColorpicker(){
	
	pushToUndo(color_target_dom)

    var color = returnColorpicker()
    //放进记忆区
    appendColorpickerMemory(color)
    //修改选色器方块的颜色
    $(color_target_colorpicker).children(".colorpicker_color").css("background-color",color)

    //特殊type的颜色修改,更高优先级
    //huabu_grid的处理
    if(color_type == "huabu_grid"){
    	changeHuabuGridColor(color)
    	return 1
    }
    else if(color_type == "tile_background_gradient"){
    	gradientBackgroundTile(color_target_dom,null,color)
    	return 1
    }
    else if(color_type == "text_shadow"){
    	textShadowTile(color_target_dom,null,null,null,color)
    	return 1
    }
    else if(color_type == "line_color"){
    	colorLine(color_target_dom,color)
    	return 1
    }
    else if(color_type == "line_style_color"){
    	var style = {color : color}
    	changeLineStyle(style)
    	return 1
    }
    else if(color_type == "composite"){
    	colorComposite(color_target_dom,color)
    	return 1
    }
    
    //修改目标颜色
    if(color_target_dom != undefined){
        if(color_type == "background"){
            $(color_target_dom).css("background-color",color)
        }
        else if(color_type == "text"){
            $(color_target_dom).css("color",color)
        }
        else if(color_type == "border"){
            $(color_target_dom).css("border-color",color)
        }
        //将这个颜色保存到目标内
        $(color_target_dom).attr(color_type+"_color",color)
        //重新聚焦一次目标元素
        refocusingObject(color_target_dom)
    }

    return color
}
//底部栏的“关闭”按钮，按下后关闭选色器
$("#colorpicker_bottom_cancel").on("click",function(){
	hideColorpicker()
})


//判断一个值是否为hex8或者rgba字符串
function isColor(value) {
  // 定义两个正则表达式，用于匹配十六进制字符串和RGBA字符串
  var hex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
  var rgb = /^rgb\(\s*\d+,\s*\d+,\s*\d+\)$/;
  var rgba = /^rgba\(\s*\d+,\s*\d+,\s*\d+,\s*[\d\.]+\)$/;


  // 使用正则表达式进行匹配，并返回匹配结果
  return hex.test(value) || rgb.test(value) || rgba.test(value);
}

