//禁用右键网页功能
document.addEventListener("contextmenu", function(e) {
  	e.preventDefault();
});

//返回一个元素a与另一个元素b的相对距离
function positionAandB(a,b){
	//如果a中没有b，则返回报错
	if($(a).find(b).length <= 0){
		console.error("b根本不在这个a元素内！")
		return false
	}
	//循环遍历b元素直到找到a对象，期间其所有父元素的left/top加上自身的left/top就是相较于huabu的left/top
	var b_parent = $(b).parent()
	var left = parseInt($(b).css("left"))
	var top  = parseInt($(b).css("top"))
	while(! $(b_parent).is(a)){
		left += parseInt($(b_parent).css("left"))
		top  += parseInt($(b_parent).css("top"))
		b_parent = $(b_parent).parent()
	}
	return {left:left,top:top}
}





//滑块函数,点击下滑标题下滑出子元素，再次点击收起
$(document).on("click",".slide_title",function(event) {
	$(this).siblings(".slide_inner").slideToggle(500)
	$(this).toggleClass('folding unfolding')
})
//不通过动画，直接切换滑块的显示
$.fn.changeSlideFold = function(type){
	this.each(function(){
		if(type == "fold"){
			$(this).removeClass("unfolding").addClass("folding")
			$(this).siblings(".slide_inner").hide()
		}
		else if(type == "unfold"){
			$(this).removeClass("folding").addClass("unfolding")
			$(this).siblings(".slide_inner").show()
		}
		else if(type == "fold_slide"){
			$(this).removeClass("unfolding").addClass("folding")
			$(this).siblings(".slide_inner").slideUp(500)
		}
		else if(type == "unfold_slide"){
			$(this).removeClass("folding").addClass("unfolding")
			$(this).siblings(".slide_inner").slideDown(500)
		}
		else{
			$(this).siblings(".slide_inner").toggle()
			$(this).toggleClass('folding unfolding')
		}
	})
	
}


//生成随机大小写数字的n位ID
function createRandomId(n) {
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var id = '';
  for (var i = 0; i < n; i++) {
    var randomIndex = Math.floor(Math.random() * characters.length);
    id += characters[randomIndex];
  }
  return id;
}


//html转义函数，将字符串转为可被执行的html代码
function toHTML(myString){
    htmlString = myString.split("&lt;").join("<");
    htmlString = htmlString.split("&gt;").join(">");
    htmlString = htmlString.split("&quot;").join("\"");
    htmlString = htmlString.split("&apos;").join("\'");
    return htmlString;
}

//已知两直角边求角度
function getAngle(x,y){
	var angle = 360*Math.atan(y/x)/(2*Math.PI)
	//atan的局限性使得在x小于0时将角度偏转180度
	if(x >= 0){
		angle = 180 + angle
	}
	return angle;
}

// 计算div沿中心旋转a度后，左上角相对于原本位置的水平距离和垂直距离
function rotatePositionChange(X, Y, a) {
  var radians = (a * Math.PI) / 180;
  var centerX = X / 2;
  var centerY = Y / 2;

  var topLeftX =
    centerX - (X / 2) * Math.cos(radians) + (Y / 2) * Math.sin(radians);
  var topLeftY =
    centerY - (Y / 2) * Math.cos(radians) - (X / 2) * Math.sin(radians);

  var horizontalDistance = topLeftX - centerX;
  var verticalDistance = topLeftY - centerY;

  return {left:horizontalDistance, top:verticalDistance};
}






//点击对应的上下按钮修改与其相邻的input的值
$("body").on("click",".input_button .input_button_up",function(){
	//获取改变值
	var value = parseFloat($(this).attr("step"))
	//获取与input_button相邻的input
	var input = $(this).parents(".input_button").siblings("input")
	var input_unit = $(input).attr("unit")
	if(input_unit == undefined){
		input_unit = null
	}
	//按照改变值增加Input的值
	var new_value = parseFloat($(input).val()) + value
	//随后将其标准化
	$(input).val(intValue(new_value,input_unit))

	//触发这个input的change监听
	$(input).change()
})
$(document).on("click",".input_button .input_button_down",function(){
	//获取改变值
	var value = parseFloat($(this).attr("step"))
	//获取与input_button相邻的input
	var input = $(this).parents(".input_button").siblings("input")
	var input_unit = $(input).attr("unit")
	if(input_unit == undefined){
		input_unit = null
	}
	//按照改变值增加Input的值
	var new_value = parseFloat($(input).val()) - value
	//随后将其标准化
	$(input).val(intValue(new_value,input_unit))
	
	//触发这个input的change监听
	$(input).change()
})

//处理输入值，返回纯数字或者百分数的值，纯数字值会带单位
function intValue(input,unit){
	//如果不包含数字则设为0
	if(isNaN(parseFloat(input))){
		input = 0
	}
	var regex = /^-?\d+(\.\d+)?%$/;
	//如果是百分数则添加%
    if(regex.test(input)) {
        input = parseFloat(input) +"%"
    } 
    //否则添加单位
    else{
    	//去除非数字部分
    	input = parseFloat(input)
    	//若为整数，则不作处理
    	if (Math.floor(input) === input){
    		input = parseInt(input)
    	}
    	//若为浮点数，则保留两位小数
    	else{
    		input = input.toFixed(2)
    	}
    	//添加单位
    	if(unit != null){
    		input = input + unit
    	}
    }

    //返回处理后的值
    return input
}

//获取网格图片的base64编码
function getGridBase64(grid_size,grid_color){
	var svg = '<svg width="' + grid_size + '" height="' + grid_size + '" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="' + grid_size + '" height="' + grid_size + '" patternUnits="userSpaceOnUse">\
				<path d="M 0 ' + grid_size/4 + ' L ' + grid_size + ' ' + grid_size/4 + ' M ' + grid_size/4 + ' 0 L ' + grid_size/4 + ' ' + grid_size + ' M 0 ' + grid_size/2 + ' L ' + grid_size + ' ' + grid_size/2 + ' M ' + grid_size/2 + ' 0 L ' + grid_size/2 + ' ' + grid_size + ' M 0 ' + grid_size*3/4 + ' L ' + grid_size + ' ' + grid_size*3/4 + ' M ' + grid_size*3/4 + ' 0 L ' + grid_size*3/4 + ' ' + grid_size + '" fill="none" stroke="'+ grid_color +'" opacity="0.2" stroke-width="1"/>\
				<path d="M ' + grid_size + ' 0 L 0 0 0 ' + grid_size + '" fill="none" stroke="'+ grid_color +'" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>';

	//将svg转化为base64编码
	var base64 = btoa(svg)
	return base64
}

//讲一个元素变成指定类型的图片
async function domToPicture(dom,type){

    //记录它的显示状态和left,top
    var before = $(dom).prev()
    if(before.length <= 0){
    	var container = $(dom).parent()
    }
    var show_state = $(dom).css("display")
    var dom_left = $(dom).css("left")
    var dom_top = $(dom).css("top")

    //将其临时放进global中，这里没有大小，overflow为0,并设定left和top为0
    $("#gloabl").append(dom)
    $(dom).css({
        "left":0,
        "top":0,
        "display":"block",
    })

    var the_dom = $(dom).get(0)

    //根据type调用不同的图片生成函数
    if(type == "img"){
    	var dataUrl = await domtoimage.toSvg(the_dom)
    	// 创建一个图片元素
    	var img = new Image();
    	// 将图片元素的 src 属性设置为获取到的 base64 编码数据 URL
    	img.src = dataUrl;
    	var result = img
    }
    else if(type == "base64" || type == "png"){
    	var result = await domtoimage.toPng(the_dom)
    }

    //然后把它放回来
    if(before.length>0){
    	$(before).after(dom)
    }
    else{
    	$(container).prepend(dom)
    }
    $(dom).css({
        "left":dom_left,
        "top":dom_top,
        "display":show_state,
    })

    return result
}

// 将字节转换为可读的文件大小
function byteToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

// // 讲一个dom保存为一个图片并返回base64编码
// async function domToBase64(dom){
// 	var dom = $(dom).get(0)
// 	var canvas = await html2canvas(dom)
//     // 将生成的 Canvas 元素转换为 PNG 图片
//     const imgData = canvas.toDataURL('image/png');
//     // 将 PNG 图片数据转换为 base64 格式
//     const base64 = imgData.replace(/^data:image\/(png|jpg);base64,/, '');
//     return base64
	
// }

