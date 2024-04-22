//存储所有的Obejctcollection对应的lib内容，按照名字存储
var all_lib = {
	"customize":{},
	"default":{},
	"quickUse":{}
}

//从别的地方修改all_lib
function changeAllLib(file_name,type,new_lib){
	all_lib[type][file_name] = new_lib
}
function return_collection_lib(file_name,type){
	if(file_name == null){
		return all_lib[type]
	}
	else{
		return all_lib[type][file_name]
	}
}
//搜索lib中的方块对象，返回其所在的collection的type的file_name
function searchCollectionLib(object_type_name){
	var result = []
	//遍历all_lib三种collection_type
	for(collection_type in all_lib){
		var files = all_lib[collection_type]
		for(file_name in files){
			var temp = false
			var objects = files[file_name]["collection_objects"]
			for(i in objects){
				var object_type = objects[i]["type"]
				//如果名称包含了搜索值，则返回collection_type,file_name这样就能找到collection了
				if(object_type.includes(object_type_name)){
					//允许存储这个collection的信息
					temp = true
					break
				}
			}
			if(temp){
				result.push({type:collection_type,file_name:file_name})
			}
			
		}
	}
	return result
}

//读取一个lib文件,并存储进all_lib中，以type分类，每一个文件的文件名为标识
function readObjectLib(file,type,callback){
	var file_path = file.path
	var file_name = file.name
	//获得该文件中的数据
	getFileData(file_path,"object_lib").then(file_data=>{
		if(file_data){
			//存储进来
			all_lib[type][file_name] = file_data
			//返回这个内容
			callback(file_data)
		}
		else{
			alert("读取lib文件失败")
			callback(false)
		}
	})
}

//object_collection创建与加载过程

	//collection部分
		//通过lib文件，创建一个collection并加入到左侧栏
		//type分为normal和customize两种，后者会有一个工具栏
		function createObjectCollection(file,type){
			//读取一个lib文件,获得其中的数据
			readObjectLib(file,type,function(file_data){
				//读取成功时，用文件中的集合名创建collection
				if(file_data){
					//创造一个集合
					var collection = createCollectionDiv(file.name,file_data,type)
					//加入左侧栏
					$("#leftArea_object_collection_container").append(collection)
					//读取其对应的json文件
					loadLibToCollection(file_data,type,collection)
				}
			})
		}

		//创建一个object_collection容器并返回
		function createCollectionDiv(file_name,file_data,type){
			var collection_name = file_data["collection_name"]
			//外壳+标题+容器
			var object_collection = 
			$("<div class='object_collection slide_menu'>\
		            <div class='collection_name slide_title unfolding'>\
		            	<span>"+collection_name+"</span>\
		            </div>\
					<div class='slide_inner objectCollection_container'></div>\
			   </div>")
			.attr({
				"file_name":file_name,
				"type":type
			})

			//自定义collection还有工具栏
			if(type == "customize"){
				//工具栏本体:添加，编辑，删除
				var toolbar = $("<div class='objectCollection_toolbar'>\
									<div title='导出为文件' class='objectCollection_export'> </div>\
									<div title='将当前聚焦的对象加入' class='objectCollection_append'> </div>\
									<div title='编辑' class='objectCollection_edit'> </div>\
									<div title='删除' class='objectCollection_delete'></div>\
								 </div>")
				$(object_collection).children(".slide_title").append(toolbar)
			}
			//如果是“快捷使用”则去掉删除工具,改为清空工具
			if(type == "quickUse"){
				var toolbar = $("<div class='objectCollection_toolbar'>\
									<div title='导出为文件' class='objectCollection_export'> </div>\
									<div title='将当前聚焦的对象加入' class='objectCollection_append'> </div>\
									<div title='编辑' class='objectCollection_edit'> </div>\
									<div title='清空' class='objectCollection_clear'></div>\
								 </div>")
				$(object_collection).children(".slide_title").append(toolbar)
			}
			
			return object_collection
		}

		//删除一个object_collection,同时会删除其在本地对应的lib
		function deleteObjectCollection(collection){
			//获取file_name
			var file_name = $(collection).attr("file_name")
			var type = $(collection).attr("type")
			//删除这个collection
			$(collection).remove()
			//删除all_lib中的数据
			delete all_lib[type][file_name]
			//删除对应的lib文件
			deleteLibFile(file_name,type)
		}

		//清空一个object_collectiion,同时会修改其在本地对应的lib文件
		function clearObjectCollection(collection){
			//获取file_name
			var file_name = $(collection).attr("file_name")
			var type = $(collection).attr("type")
			//清空这个collection
			$(collection).children(".objectCollection_container").empty()
			//清空all_lib中对应的数据
			all_lib[type][file_name]["collection_objects"] = []
			//修改对应的lib文件
			changeLibFile(file_name,type,all_lib[type][file_name])
		}

		//加载collection对应的lib文件，将其中的内容转化为对象块
		function loadLibToCollection(file_data,type,collection){
			var the_objects = file_data["collection_objects"]
			//遍历对应的lib将对应的object_json依次变成对象块，加入collection中
			for(i in the_objects){
				var object_json = the_objects[i]
				appendBlockToCollection(collection,object_json)
			}
		}

	//block部分
		//将一个指定type加载进指定的collection中
		function appendBlockToCollection(collection,object_json){
			//先创建一个block
			var block = createObjectBlock(object_json,50)
			//令其可以拖拽进画布,用object_json来存放拖拽对象的样式
			dragToHuabuBlock(object_json,block)
			//加入collection_container中
			$(collection).children('.objectCollection_container').append(block)
		}

		//通过json代码创建显示在objectCollection中的objectBlock
		function createObjectBlock(object_json,size){
			//创建一个Block
			var block = $("<div title='"+object_json.type+"' class='objectBlock'></div>")
			//其内部包含了一个对应缩小版object和type名称
			//如果object_json的类型是tile，则生成一个小型的tile
			if(object_json["object_type"] == "tile"){
				var mini_object = jsonToObject(object_json,"css")
				//将这个tile缩小
				var width = $(mini_object).outerWidth()
				var height = $(mini_object).outerHeight()
				//判断其宽度和高度哪个更高，缩小其较大的一个值并等比缩小较小的一个值
				if(width >= height){
					var scale = size/width 
				}
				else{
					var scale = size/height
				}
				//借此获得了一个显示tile结构的方块，将其放入miniObject中即可
				$(mini_object).css("transform","scale("+scale+")")
				
			}
			//否则这个object是一个组合体，我们用其中存储的图片来显示小型化的组合体
			else{
				//获得了img的base64编码
				var composite_img = object_json["object_inner"]["composite_img"]
				//接着创建一个小型的div，将这个img作为其背景图片
				var mini_object = $("<div class='objectBlock_mini_composite'></div>")
				//设置这个div的尺寸，将Img作为其背景图片
				$(mini_object).css({
					width:size+"px",
					height:size+"px",
					"background-image": "url('"+composite_img+"')",
				})
			}
				
			
			//获得了缩小版object的显示
			var miniObject = $("<div class='objectBlock_mini'></div>").append(mini_object)
			//type名称
			var type_name = $('<span class="objectBlock_name">'+object_json.type+'</span>')
			//放进去
			$(block).append(miniObject).append(type_name)

			return block
		}

		//赋予objectBlock拖动到画布中的功能
		function dragToHuabuBlock(object_json,block){
			//拖动到画布中
			$(block).draggable({
		        helper: function() {
		            // 创建幻影元素，这是一个只有css样式的对象
		            return jsonToObject(object_json,"css");
		        },
		        opacity:"0.7",
		        appendTo:'body',//加上这句就可以将选项拖拽出来
		       	start:function(event,ui){
		       		//将block_type保存进helper中
		       		ui.helper.data("object_json",object_json)
		       	},
		        drag:function(event,ui){
		        	var huabu = return_focusing_huabu()
			        // 设置助手的位置，使其左上角与鼠标位置重叠
			        ui.position.left =  event.pageX
		        	ui.position.top =   event.pageY
		        }
		    });
		}

//自定义object_collection中功能

	//collection功能
		//修改一个object_collection的名称
		function changeCollectionName(collection,new_name){
			var type = $(collection).attr("type")
			var file_name = $(collection).attr("file_name")
			//如果名字没有变化就走了
			var collection_name = all_lib[type][file_name]["collection_name"]
			if(collection_name == new_name){
				return false
			}
			//修改对应的lib中的collection_name属性
			var the_lib = all_lib[type][file_name]
			the_lib["collection_name"] = new_name
			//用lib修改对应的文件
			changeLibFile(file_name,type,the_lib)
			//修改集合span的名字，就不重新读取了
			$(collection).find('.collection_name span').text(new_name)
		}
		//导出一个自定义的collection为文件
		function exportCollectionToFile(collection){
			var file_name = $(collection).attr("file_name")
			exportLibFile("customize",file_name)
			.then(result=>{
				if(result){
					//备忘
					alert("导出集合成功！")
				}
			})
		}
		//选择文件，并导入为自定义collection
		function insertFileToCollection(){
			//在customize中导入这个同名的文件
			insertLibFile("customize")
			.then(new_file=>{
				if(new_file){
					//用这个lib文件生成collection
					createObjectCollection(new_file,"customize")
					//备忘：alert样式没有做
					alert("导入集合成功！")
				}
			})
		}
	//toolbar功能

		//点击collection_name中的span时可以修改collection的名称
		$(document).on('click', '.collection_name span', function(event) {
			//只能修改自定义类型的
			if($(this).parents('.object_collection').attr("type") == "customize"){
				event.stopPropagation()
	        	$(this).attr('contenteditable', 'true');
	        	$(this).focus(); // 将焦点设置在可编辑元素上
			}
	    });
	    // 失去焦点时应用其中的内容修改对应的collection的name
	    $(document).on('blur', '.collection_name span', function() {
	        $(this).attr('contenteditable', 'false');
	        var collection = $(this).parents('.object_collection')
	        var new_name = $(this).text()
	        changeCollectionName(collection,new_name)
	    });

		//将这个collection的内容导出为文件
		$(document).on("click",".objectCollection_export",function(event){
			event.stopPropagation()
			//获取collection的信息
			var collection = $(this).parents('.object_collection')
			exportCollectionToFile(collection)
		})

		//将当前聚焦的对象加入该collection
		$(document).on("click",".objectCollection_append",function(event){
			event.stopPropagation()
			//获取当前聚焦对象,限制为tile或composite
			var object = return_focusing_object(".tile, .composite")
			//若当前没有聚焦对象则弹出提示
			if(!object){
				alert("当前没有聚焦对象")
				return false
			}
			//如果当前聚焦对象是临时组合体，则弹出提示
			else if($(object).is(".temp_composite")){
				alert("请先将选中部分设定为组合")
				return false
			}

			//获取需要修改的collection
			var collection = $(this).parents('.object_collection')
			var file_name = $(collection).attr("file_name")
			var type = $(collection).attr("type")
			
			//获取聚焦对象的json内容
			objectToJson(object,"new").then(json=>{
				var block_json = json
				//将其转化为JSON对象，并加入lib文件中，然后重新读取这个lib文件
				block_json["type"] = "未命名"
				var json = JSON.parse(JSON.stringify(block_json));

				//放入对应lib的object中
				var the_lib = all_lib[type][file_name]
				the_lib["collection_objects"].push(json)

				//用有新内容的the_lib修改对应的lib文件
				changeLibFile(file_name,type,the_lib)

				//向这个集合中加入这个对象
				appendBlockToCollection(collection,block_json)
			})
		})

		//打开collection_edit_menu
		$(document).on("click",".objectCollection_edit",function(event){
			event.stopPropagation()
			var collection = $(this).parents('.object_collection')
			//打开集合编辑菜单
			showCollectionEditMenu(collection)
		})

		//删除collection
		$(document).on("click",".objectCollection_delete",function(event){
			event.stopPropagation()
			var collection = $(this).parents('.object_collection')
			//提示弹窗
			swal.fire({
				title:"确认删除该集合？<br><b>这也会删除对应的本地文件!</b>",
			})
			.then((result)=>{
				//确认
				if(result.isConfirmed){
					//删除这个集合
					deleteObjectCollection(collection)
				}
			})
		})

		//清空collection
		$(document).on("click",".objectCollection_clear",function(event){
			event.stopPropagation()
			var collection = $(this).parents('.object_collection')
			//提示弹窗
			swal.fire({
				title:"确认清空快捷使用？<br>该操作无法撤销！",
			})
			.then((result)=>{
				//确认
				if(result.isConfirmed){
					//清空这个集合
					clearObjectCollection(collection)
				}
			})
		})

		//创建一个collection
		$("#leftArea_create_collection").on("click",function(){
			//弹窗让用户输入名字
			swal.fire({
	            html: '<div id="leftArea_create_collection_menu">输入集合名称：\
						   <input>\
					   </div>'
	        }).then((result) => {
	        	//确认
	            if (result.isConfirmed) {
	            	//获取名称
	            	var name = $("#leftArea_create_collection_menu input").val()
	            	if(name != ""){
	            		//创建一个以其为基础名的lib文件，如果重名会加上_1、2、3等等
	            		createLibFile(name,"customize",null)
	            		.then(new_file=>{
	            			//创建这个文件的collection
	            			createObjectCollection(new_file,"customize")
	            		})
	            	}
	            } 
	        });
		})

		//导入collection
		$("#leftArea_insert_collection").on("click",function(){
			insertFileToCollection()
		})




