//画布内对象的文件化，将其转换为json或转换回对象
//所有对象的json文件格式均为：
// {
// 		object_type : 对象类型，可以为tile，line，composite
// 		object_inner : 对象内容,包括css,attr,prop,data
//     {
// 			id:,css:{},attr:{},title:{}
		// }
// }


//将object变成json
	//通过一个对象创建一个对象json,这个json中保存了对象的所有信息
	async function objectToJson(object,mode){
		if($(object).is(".line")){
			var object_json = {
				object_type : "line",
				object_inner : lineToJSON(object,mode)
			}
		}
		else if($(object).is(".tile")){
			var object_json = {
				object_type : "tile",
				object_inner : tileToJson(object,mode)
			}
		}
		else if($(object).is(".composite")){
			var object_json = {
				object_type : "composite",
				object_inner : await compositeToJson(object,mode)
			}
		}

		return object_json
	}

	//将tile转变为json_type，这个tile_type是用于生成新建的tile的，与用于生成读取的tile是不同的
	function tileToJson(tile,mode){

		// 获取样式
		var style = getTileCSS(tile)
		// 获取Attr的JSON
		var attr = getTileAttr(tile)
		delete attr["id"]
		//获取PROP的JSON
		var prop = getTileProp(tile)
		//获取data的JSON
		var data = getTileData(tile)

		var json = {
		    id: $(tile).attr("id"),
		    css: style,
		    attr: attr,
		    prop: prop,
		    data: data,
		    title: $(tile).children('.tile_title').text()
		};

	    //如果为了样式和创建，则不需要位置信息
	    if(mode == "css" || mode == "new"){
	    	//删除多余的内容
	    	delete json["css"]["z-index"];
			delete json["css"]["top"];
			delete json["css"]["left"];
	    }

	    //如果是undo，则不会保存其tiletext，这些内容将由右侧编辑栏管理
	    if(mode == "undo"){
	    	delete json["data"]["tiletext"]
	    }

		//返回一个JSON字符串
		return json
	}
	//获取JSON格式的各种tile属性
		function getTileCSS(tile){
			var style = {};
		    $(tile).attr('style').split(';').forEach(function(declaration) {
		    	if(declaration.startsWith(" background-image")){
		    		//其中背景图片要单独存储,因为用这个方式读取的css会有问题！
		    		style["background-image"] = $(tile).css("background-image")
		    	}
		      	else{
		      		var propertyValue = declaration.split(':');
			      	if(propertyValue != ""){
			      		if(propertyValue[1] != undefined){
			      			var property = propertyValue[0].trim();
			      			var value = propertyValue[1].trim();
			      			style[property] = value;
			      		}
			      	}
			      }
		    });
		    var title_css = {}
		    $(tile).children(".tile_title").attr('style').split(';').forEach(function(declaration) {
	      		var propertyValue = declaration.split(':');
		      	if(propertyValue != ""){
		      		if(propertyValue[1] != undefined){
		      			var property = propertyValue[0].trim();
		      			var value = propertyValue[1].trim();
		      			title_css[property] = value;
		      		}
		      	}
		    });
		    
		    style["title_css"] = title_css

		    return style
		}
		//获取JSON格式attr
		function getTileAttr(tile){
			var attr = {}
			var the_attrs = $(tile)[0].attributes
			//变成json
			for(i=0;i<the_attrs.length;i++){
		        var propertyName = the_attrs[i].name.trim(); // 获取属性名并去除空格
		        var propertyValue = the_attrs[i].value.trim(); // 获取属性值并去除空格
		        attr[propertyName] = propertyValue; // 将属性名和属性值存储到对象中
			}
			//删除掉style,class
			delete attr["style"]
			delete attr["class"]

			return attr
		}
		//获取JSON格式prop
		function getTileProp(tile){
			var prop = {
			    textblock_bindState: $(tile).prop("textblock_bindState"),

			    lock: $(tile).prop("lock"),

			    show_title: $(tile).prop("show_title"),
			    wrap_title: $(tile).prop("wrap_title"),

			    tile_link: $(tile).prop("tile_link"),
			    tile_link_menu: $(tile).prop("tile_link_menu"),

			    tile_annotaition: $(tile).prop("tile_annotaition"),

			    nestSet_dbClick: $(tile).prop("nestSet_dbClick"),
			    nestSet_clickButton: $(tile).prop("nestSet_clickButton"),
			    nestSet_noOpen: $(tile).prop("nestSet_noOpen"),

			    background_gradient: $(tile).prop("background_gradient"),
			    background_image: $(tile).prop("background_image"),

			    size_limit: $(tile).prop("size_limit")
			};

			return prop
		}
		//获取JSON格式的data
		function getTileData(tile){
			var data = {}
			//如果绑定了画布，则获取其绑定画布的id
			if($(tile).data("nest_huabu")!=null){
				data["nest_huabu"] = $(tile).data("nest_huabu")
			}
			//如果分离了tiletext，则存入其对应tiletext的id
			if($(tile).data("textblock")!=null && !$(tile).prop("textblock_bindState")){
				data["textblock"] = $(tile).data("textblock")
			}
			//绑定的连接
			if($(tile).data("tile_link")!=null && $(tile).prop("tile_link")){
				data["tile_link"] = $(tile).data("tile_link")
			}
			//tiletext
			data["tiletext"] = $(tile).data("tiletext")

			return data
		}

	//将line转变为json
	function lineToJSON(line_svg,mode){
		var path = $(line_svg).children('.line_path')
		var line_json = {
			id:$(line_svg).attr('id'),
			//保存其链接的两个元素的id
			start_id:$(line_svg).attr("start_id"),
			end_id:$(line_svg).attr("end_id"),
			//保存其线条的样式
			style:{
				type : $(line_svg).attr("type"),
				color: $(path).attr('stroke'),
				line_width : $(path).attr("stroke-width"),
				line_style : $(path).attr("line_style"),
				start_arrow : $(path).attr("start_arrow"),
				end_arrow   : $(path).attr("end_arrow")
			},
			//保存其文本内容
			text:$(line_svg).find(".line_text").text()
		}

		return line_json
	}

	//生成composite的json内容，这个json内容还包含了这个模块的base64图片
	//因为生成图片的函数是一个异步函数，所以使用了async
	async function compositeToJson(composite,mode){
		//获得composite自身的样式属性,很少,只包括上下左右，比例限制
			var id = $(composite).attr("id")
			var style = {
				left:$(composite).css("left"),
				top:$(composite).css("top"),
				width:$(composite).css("width"),
				height:$(composite).css("height")
			}
			var prop = {
				size_limit:$(composite).prop("size_limit")
			}

		composite_img = ""
		if(mode == "new"){
			//获得这个composite的base64图片
			var base64_img = await domToPicture(composite,"base64")
			composite_img = base64_img
		}

		//随后是composite内部的子元素的json内容
		var components = []
		$(composite).children(".huabu_object").each(async function(){
			//生成对应类型的object_json内容
			var object_json = await objectToJson(this,mode)
			//另外，还要为其中的tile元素添加Left和top内容
			if($(this).is(".tile")){
				var left = parseInt($(this).css("left")) / $(composite).width() * 100 + "%"
				var top = parseInt($(this).css("top")) / $(composite).height() * 100 + "%"
				object_json["object_inner"]["css"]["left"] = left
				object_json["object_inner"]["css"]["top"] = top
			}
			//为其中的Line对象绑定
			//放进components里
			components.push(object_json)
		})
		//最终整合在一起为一个inner
		var type = {
			id:id,
			style : style,
			prop : prop,
			composite_img : composite_img,
			components : components
		}

		//返回
		return type
	}

		//不带图片的函数,是一个非异步函数
		function compositeToJson_2(composite,mode){
			//获得composite自身的样式属性,很少,只包括上下左右，比例限制
			var type = getCompositeState(composite)

			var components = []

			if(mode == "all"){
				//随后是composite内部的子元素的json内容
				for(object of $(composite).children(".huabu_object")){
					if($(object).is(".tile")){
						var object_inner = tileToJson(object,"file")

						var object_json = {
							object_type : "tile",
							object_inner : object_inner
						}
						
						var left = parseInt($(object).css("left")) / $(composite).width() * 100 + "%"
						var top = parseInt($(object).css("top")) / $(composite).height() * 100 + "%"
						object_json["object_inner"]["css"]["left"] = left
						object_json["object_inner"]["css"]["top"] = top
					}
					else if($(object).is(".line")){
						var object_inner = lineToJSON(object,"file")
						var object_json = {
							object_type : "line",
							object_inner : object_inner
						}
					}

					//放进components里
					components.push(object_json)
				}
			}

			type["components"] = components

			//返回
			return type
		}

		//样式和属性
		function getCompositeState(composite){

			var id = $(composite).attr("id")
			var style = {
				left:$(composite).css("left"),
				top:$(composite).css("top"),
				width:$(composite).css("width"),
				height:$(composite).css("height")
			}
			var prop = {
				size_limit:$(composite).prop("size_limit")
			}

			var type = {
				id:id,
				style : style,
				prop : prop,
			}

			return type
		}

//将json变为object
	//通过一段object_json获得一个对象
	//mode的值决定了生成对象的内容：
	//"css"：在生产tile和composite对象时只产生有对应样式的对象
	//"new"：在生产时，这个对象会有一个新的id，覆盖原本的id
	//"file"：在生产时，这个对象的id不会改变
	function jsonToObject(json,mode){
		var object_inner = json.object_inner

		if(json.object_type == "line"){
			var object = jsonToLine(object_inner,mode)
		}
		else if(json.object_type == "tile"){
			var object = jsonToTile(object_inner,mode)
		}
		else if(json.object_type == "composite"){
			var object = jsonToComposite(object_inner,mode)
		}

		return object
	}

	//磁贴：生成与读取对应样式和信息的json_type
	//通过json_type创建一个磁贴，若mode为css则创建的磁贴只有type中的样式
		function jsonToTile(object_inner,mode){
			var tile = $("<div></div>", {
				"class": "tile object",
			})
			//显示磁贴的标题
			$(tile).append("<div class='tile_title'></div>")

			//只要求外观那么就只应用style
			if(mode == "css"){
				styleTileByType(tile,object_inner)
			}
			//否则应用style，数据，并进行use
			else{
				//为磁贴同步json中的数据
				$(tile).attr("id",object_inner["id"])
				styleTileByType(tile,object_inner)
				stateTileByType(tile,object_inner)
				//use会为这个tile附加对应的功能
				useTile(tile,mode)
			}
			
			return tile
		}
			//将json_type中保存的的外形同步给tile
			function styleTileByType(tile,json_type){
				$(tile).css(json_type.css)
				if($(tile).css("background-image") == ""){
					$(tile).css("background-image","none")
				}

				$(tile).children('.tile_title').css(json_type["css"]["title_css"])			
				$(tile).children('.tile_title').text(json_type.title)
			}
			//将type中的属性attr,prop和数据data同步给tile
			function stateTileByType(tile,object_inner){
				//备忘录，未完成：磁贴形状
				//读取type的内容,根据内容修改tile的属性
				//读取attr
			    $(tile).attr(object_inner.attr)
			    //读取prop
			    var type_prop = object_inner.prop
			    for(key in type_prop){
			    	$(tile).prop(key,type_prop[key])
			    }
			    //读取data
			    var type_data = object_inner.data
			    for(key in type_data){
			    	$(tile).data(key,type_data[key])
			    }
			}

	//线条：生成连接着两个对象的线条，必须在tile对象之后进行生成！
	//此时的线条并未正确显示在画布上，需要通过refreshLine来刷新其位置
		function jsonToLine(line_json,mode){
			//获取起点和终点元素
			var start_id = line_json.start_id
			var end_id = line_json.end_id
			//获取style
			var style = line_json.style
			var id = line_json.id

			//生成线条元素
			var text = line_json.text
			var line_svg = createLine(style,text)
			$(line_svg).attr({
				"start_id":start_id,
				"end_id":end_id,
				"id":id
			})

			//如果mode为new，则添加新的id
			if(mode == "new"){
				$(line_svg).attr("id","line_" + createRandomId(20))
			}

			return line_svg
		}

	//组合体：读取json内容，生成一个composite
		function jsonToComposite(json,mode){
			//创建一个composite对象
			var composite = $("<div>",{
				"class":"composite object",
			})
			//读取并应用style
			var style = json.style
			$(composite).css(style)

			//如果mode不为css则附加属性
			if(mode != "css"){
				$(composite).attr("id",json["id"])
				var prop = json.prop
				for(key in prop){
					$(composite).prop(key,prop[key])
				}
			}
				
			//读取component，依次加入组合体内部
			var components = json.components
			var tile_id = {}
			//先生成其中的tile对象
			for(var i in components){
				var object_json = components[i]
				if(object_json["object_type"] == "tile"){
					//如果是new，则保存这个旧的id
					if(mode == "new"){
						var old_id = object_json["object_inner"]["id"]
					}

					//通过json生成tile，这些tile
					var object = jsonToObject(object_json,mode)

					//如果是new，获取其新的id，并放入tile_id中
					if(mode == "new"){
						tile_id[old_id] = $(object).attr("id")
					}

					//为其添加compnent类
					$(object).addClass('component')
					//将对应的对象填装进来
					$(composite).append(object)
				}
			}
			// 生成line对象并添加到composite中
			for(var i in components){
			    // 创建components[i]的深层副本
			    var object_json = $.extend(true, {}, components[i]);
			    if (object_json["object_type"] == "line") {
			        // 如果是新模式，则更改line链接的对象的id
			        if (mode == "new") {
			            var old_start_id = object_json["object_inner"]["start_id"];
			            object_json["object_inner"]["start_id"] = tile_id[old_start_id];
			            var old_end_id = object_json["object_inner"]["end_id"];
			            object_json["object_inner"]["end_id"] = tile_id[old_end_id];
			        }
			        // 生产一个line对象
			        var line = jsonToObject(object_json, mode);
			        // 为其添加component类
			        $(line).addClass('component');
			        // 将对应的对象填装进来
			        $(composite).append(line);
			    }
			}

			//如果mode不为css，则还要给这个composite对象附加功能
			if(mode != "css"){
				useComposite(composite)
			}

			//返回组合体
			return composite
		}

//画布:画布的json用于填充工程文件，只能读取而不能创建，因此其中需要给
//格式有所改变，为：
	// {	
	// 	id:画布的id
	// 	css:画布的css，
	// 	attr:{
	// 		name:
	// 		size:
	// 		backgroud_image_name:
	// 		background_set:
	// 		z_index_max:
	// 		z_index_min:
	// 	}，
	// 	prop{
	// 		grid:
	// 		backgroud_image
	// 	}
	// 	huabu_objects：[
	// 		画布内对象
	// 	]
	// }
	
//把画布变成json格式
	//mode必须为"file"
	async function huabuToJson(huabu,mode){
		var huabu_json = getHuabuState(huabu)

		if(mode == "file"){
			//将画布内的huabu_object对象变成json放进去
			//注意，组合体中的组件会放在组合体json内
			for(const child of $(huabu).find(".huabu_object:not(.component)")) {
		        // 生成对应类型的 object_json 内容
		        var object_json = await objectToJson(child, mode);
		        // 放进里面
		        huabu_json["huabu_objects"].push(object_json);
		    }
		}
	
		return huabu_json

	}

	function getHuabuState(huabu){
		var css = {
			"width": $(huabu).css("width"),
		    "height": $(huabu).css("height"),
		    "background-color": $(huabu).css("background-color"),
		    "background-image": $(huabu).css("background-image"),
		};

		var attr = {
			"name": $(huabu).attr("name"),
			"size": $(huabu).attr("size"),
			"backgroud_image_name":$(huabu).attr("backgroud_image_name"),
			"background_set":$(huabu).attr("background_set"),
			"z_index_max":$(huabu).attr("z_index_max"),
			"z_index_min":$(huabu).attr("z_index_min"),
		}

		var prop = {
			"grid":$(huabu).prop("grid"),
			"backgroud_image":$(huabu).prop("background_image")
		}

		//如果是嵌套画布的话，一开始不会显示
		if($(huabu).is(".nest_huabu")){
			var nest = true
		}
		else{
			var nest = false
		}

		var huabu_objects = []

		var huabu_json = {
			id:$(huabu).attr("id"),
			nest:nest,
			css:css,
			attr:attr,
			prop:prop,
			huabu_objects:huabu_objects
		}

		return huabu_json
	}

//将画布的json转换为huabu对象
	async function jsonToHuabu(json,mode){
		//创建画布对象
		let huabu = $("<div></div>", {
			"class": "huabu",
			"scale": 1,
		})

		stateHuabu(huabu,json)

		//在画布container中生成这个画布对象
		$("#huabu_container").append(huabu);
		//启用这个画布
		useHuabu(huabu)

		if(mode == "file"){
			//遍历其中的对象，生成对应的object，加入到进该画布中
			var huabu_objects = json.huabu_objects

			//优先生成tile
			for(i in huabu_objects){
				var object_json = huabu_objects[i]
				if(object_json["object_type"] == "tile"){
					var object = jsonToObject(object_json,"file")
					//将这个对象放入画布内
					objectIntoHuabu(object,huabu)
				}
			}
			//然后生成line
			for(i in huabu_objects){
				var object_json = huabu_objects[i]
				if(object_json["object_type"] == "line"){
					var object = jsonToObject(object_json,"file")
					//将这个对象放入画布内
					//刷新一下线条的绑定
					objectIntoHuabu(object,huabu)
					refreshLinePosition(object,"file")
				}
			}
			//最后生成composit
			for(i in huabu_objects){
				var object_json = huabu_objects[i]
				if(object_json["object_type"] == "composite"){
					//创建对象并将其放入画布中
					var object = await createObject(object_json,"json","new")
					objectIntoHuabu(object,huabu)
				}
			}
		}

		//返回这个画布对象
		return huabu
	}
	//为画布对象应用样式和属性
		function stateHuabu(huabu,json){
			//装填id,css，属性
			$(huabu).attr("id",json["id"])
			
			var css = json.css
			$(huabu).css({
				"width": css["width"],
			    "height": css["height"],
			    "background-color": css["background-color"],
			    "background-image": css["background-image"],
			})
			var attr = json.attr
			$(huabu).attr({
				"name": attr["name"],
				"size": attr["size"],
				"backgroud_image_name":attr["backgroud_image_name"],
				"background_set":attr["background_set"],
				"z_index_max":attr["z_index_max"],
				"z_index_min":attr["z_index_min"]
			})
			var prop = json.prop
			$(huabu).prop({
				"grid":prop["grid"],
				"backgroud_image":prop["background_image"]
			})

			//如果是nest，则附加nest_huabu类
			if(json.nest){
				$(huabu).addClass("nest_huabu")
			}
		}

