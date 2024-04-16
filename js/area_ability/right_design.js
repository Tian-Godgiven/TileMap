

//画布
	//切换至画布design
	function changeHuabuDesign(huabu){
		//将其他的design隐藏
		$(".rightArea_design_inner_block").hide()
		//将画布design显示出来
		$("#rightArea_design_huabu").show()
		//将画布的数据载入
		showHuabuScale(huabu)//显示该画布的scale
		showHuabuName(huabu)//显示该画布的名称
		showHuabuSize(huabu)//显示该画布的尺寸
		showHuabuColor(huabu)//显示该画布的颜色
		showHuabuGrid(huabu)//显示该画布的网格
		showHuabuBackground(huabu)//显示该画布的背景
	}
	//画布属性
		//画布名称
			//显示当前画布的名称，在画布切换时,画布重命名时调用
			function showHuabuName(huabu){
				var name = $(huabu).attr("name")
				if(name == undefined){
					name = "　　　　"
				}
				//在名称栏后显示画布的名称
				$("#huabu_state_name").children('div').eq(0).text(name)
			}
			//点击画布名称后面的编辑按钮即可对画布进行重命名
			$("#huabu_state_name_edit").on("click",function(){
				var huabu = return_focusing_huabu()
				if(huabu){
					renameHuabu(huabu)
				}
			})
		//画布尺寸
			//显示当前画布的尺寸，在画布切换，画布大小改变时调用
			function showHuabuSize(huabu){
				//在选项栏显示画布的尺寸
				var size = $(huabu).attr("size")
				$("#huabu_state_size_select select").val(size)
				//在输入框显示画布的尺寸
				var width = $(huabu).css("width")
				var height = $(huabu).css("height")
				$("#huabu_state_size_width").val(width)
				$("#huabu_state_size_height").val(height)
			}
			//通过选项改变画布的尺寸
			$("#huabu_state_size_select select").on("change",function(){
				//获取画布
				var huabu = return_focusing_huabu()
				if(huabu){
					//获取选项
					var option = $(this).val()
					//根据不同的选项修改画布的大小
					switch (option) {
						case 'customization':
						  //为画布加上尺寸标识
				    	  $(huabu).attr("size","customization")
						  return 0;
				        case 'A0':
				          width = "841mm";
				          height = "1189mm";
				          break;
				        case 'A1':
				          width = "594mm";
				          height = "841mm";
				          break;
				        case 'A2':
				          width = "420mm";
				          height = "594mm";
				          break;
				        case 'A3':
				          width = "297mm";
				          height = "420mm";
				          break;
				        case 'A4':
				          width = "210mm";
				          height = "297mm";
				          break;
				        case 'A5':
				          width = "148mm";
				          height = "210mm";
				          break;
				        case 'A6':
				          width = "105mm";
				          height = "148mm";
				          break;
				        case 'B4':
				          width = "250mm";
				          height = "353mm";
				          break;
				        case 'B5':
				          width = "176mm";
				          height = "250mm";
				          break;
				        case '16:9':
				          width = "1600px";
				          height = "900px";
				          break;
				        case '4:3':
				          width = "400px";
				          height = "300px";
				          break;
				        default:
				          //不修改画布的大小
				          return 0
				    }
			      	//修改画布的大小
				    $(huabu).css("width",width)
				    $(huabu).css("height",height)
				    //为画布加上尺寸标识
				    $(huabu).attr("size",option)
				    //同步输入框的值
				    showHuabuSize(huabu)
				}
			})
			//可以直接通过输入来改变当前画布的尺寸
			$("#huabu_state_size_width").on("change",function(){
				//处理输入值，使其为百分数或带px单位的数
				var width = intValue($(this).val(),"px")
				var huabu = return_focusing_huabu()
				if(huabu){
					$(huabu).css("width",width)
					$(this).val(width)
				}
			})
			$("#huabu_state_size_height").on("change",function(){
				//处理输入值，使其为百分数或带px单位的数
				var height = intValue($(this).val(),"px")
				var huabu = return_focusing_huabu()
				if(huabu){
					$(huabu).css("height",height)
					$(this).val(height)
				}
			})
	//画布显示
		//画布颜色
			//显示当前画布的颜色，在画布切换，画布颜色改变时调用
			function showHuabuColor(huabu){
				//将对应色块的颜色改变
				var color = $(huabu).css("background-color")
				if(color == undefined){
					color = "white"
				}
				$("#huabu_display_color .colorpicker .colorpicker_block").css("background-color",color)
			}
			//点击画布颜色对应的选色器，调用颜色修改器
			$("#huabu_display_color .colorpicker").on("click",function(){
				var huabu = return_focusing_huabu()
				if(huabu){
					showColorpicker(this,"down",huabu,"background")
				}
			})
		//画布网格
			//判断画布是否已经显示了网格背景，画布切换时调用
			function showHuabuGrid(huabu){
				//如果已经显示
				if($(huabu).prop("grid")){
					//令画布网格选项框选中
					$("#huabu_display_grid_checkbox").prop("checked",true)
					//显示网格操作
					$("#huabu_display_grid_inner").css("display","flex")
					//获取该画布的网格数据信息
					var huabu_grid = $(huabu).children(".huabu_grid")
					var grid_size = huabu_grid.attr("grid_size") + "px"
					var grid_color = huabu_grid.attr("grid_color")
					//修改网格数据
					$("#huabu_display_grid_size input").val(grid_size)
					$("#huabu_display_grid .colorpicker .colorpicker_block").css("background-color",grid_color)
				}
				//否则令其非选中并隐藏网格
				else{
					//取消网格选项框的选中
					$("#huabu_display_grid_checkbox").prop("checked",false)
					//隐藏网格操作
					$("#huabu_display_grid_inner").hide()
				}
			}
			//点击画布网格选项框，操作网格的显示
			$("#huabu_display_grid_checkbox").on("change",function(){
				var value = $(this).prop("checked")
				var huabu = return_focusing_huabu()
				if(huabu){
					//若为选中则显示网格与网格操作
					if(value){
						//显示画布的网格背景
						gridHuabu(huabu)
						//显示网格操作并同步数据
						$("#huabu_display_grid_set").show()
						showHuabuGrid(huabu)
					}
					//否则取消网格和网格操作的显示
					else{
						//取消画布的网格背景
						UngridHuabu(huabu)
						//隐藏网格操作
						$("#huabu_display_grid_set").hide()
					}
				}
			})
			//修改输入框中的数据，同步修改网格的大小
			$("#huabu_display_grid_size input").on("change",function(){
				var value = $(this).val().match(/\d+/g)
				var huabu = return_focusing_huabu()
				if(huabu){
					if(value == null){
						value = 0
					}
					//修改网格的size数据
					$(huabu).children(".huabu_grid").attr("grid_size",value)
					//重新生成网格
					gridHuabu(huabu)
					value += "px"
					$(this).val(value)
				}
			})
			//点击选色器，调用调色盘修改网格颜色
			$("#huabu_display_grid .colorpicker").on("click",function(){
				showColorpicker(this,"down",undefined,"huabu_grid")
			})
			//画布网格的特殊颜色修改函数
			function changeHuabuGridColor(color){
				var huabu = return_focusing_huabu()
				if(huabu){
					var grid = $(huabu).children(".huabu_grid")
					//无法直接通过调色盘修改网格颜色,重新生成对应颜色的grid
					$(grid).attr("grid_color",color)
					gridHuabu(huabu)
				}
			}
		//画布背景
			//根据画布的背景信息，控制该操作栏的内容显示
			function showHuabuBackground(huabu){
				//判断画布是否具备背景图片
				var background = $(huabu).prop("background_image")
				if(background){
					//若存在背景图片，则首先修改[插入画布]按键名称
					var img_name = $(huabu).attr("background_image_name")
					$("#huabu_display_background .file_insert").text(img_name)
					$("#huabu_display_background .file_insert").attr("title",img_name)
					//显示背景图片删除键
					$("#huabu_display_background .file_delete").show()
					//显示背景设置选项并相应地修改当前选项
					$("#huabu_display_background_set").show()
					var background_set = $(huabu).attr("background_set")
					$("#huabu_display_background_set select").val(background_set)
					//根据背景设置选项决定是否展开位置操作
					if(background_set == "放置" || background_set == "重复"){
						$("#huabu_display_background_position").css("display","flex")
						//获取画布的背景位置信息
						var position = $(huabu).css("background-position").split(" ")
						$("#huabu_display_background_left").val(position[0])
						$("#huabu_display_background_top").val(position[1])
					}
					else{
						$("#huabu_display_background_position").hide()
					}
				}
				//若无背景图片则显示为初态
				else{
					huabuDisplayBackgroundState_0()
				}
			}
			//初态，即画布无背景图片的状态
			function huabuDisplayBackgroundState_0(){
				$("#huabu_display_background .file_insert").text("插入图片")
				$("#huabu_display_background .file_delete").hide()
				$("#huabu_display_background_set").hide()
				$("#huabu_display_background_position").hide()
			}
			//点击插入图片，弹出文件选择菜单,在选择菜单后将对应图片放入tile
			$("#huabu_display_background .file_insert").on("click",function(){
				//如果当前没有聚焦画布，则不触发input
				var huabu = return_focusing_huabu()
				if(huabu){
					selectObjectBackgroundImg(huabu,function(){
						//刷新显示
						showHuabuBackground(huabu)
					})
				}
			})
			//点击取消,删除画布的背景，回归初态
			$("#huabu_display_background .file_delete").on("click",function(){
				UnbackgroundImgObject(return_focusing_huabu())
				huabuDisplayBackgroundState_0()
			})
			//通过选项栏的值设置画布背景的显示方式
			$("#huabu_display_background_set select").on("change",function(){
				var value = $(this).val()
				if(value == "拉伸"){
					$("#huabu_display_background_position").hide()
				}
				else{
					$("#huabu_display_background_position").show()
				}
				setObjectBackground(return_focusing_huabu(),value)
			})
			//通过位置栏的输入调整画布背景的位置
			$("#huabu_display_background_position_left").on("change",function(){
				//处理输入值，使其为百分数或带px单位的数
				var x = intValue($(this).val(),"px")
				$(this).val(x)
				$(return_focusing_huabu()).css("background-position-x",x)
			})
			$("#huabu_display_background_position_top").on("change",function(){
				//处理输入值，使其为百分数或带px单位的数
				var y = intValue($(this).val(),"px")
				$(this).val(y)
				$(return_focusing_huabu()).css("background-position-y",y)
			})
	//画布操作
		//回到中心
		$("#huabu_operate_returnCenter").on("click",function(){
			var huabu = return_focusing_huabu()
			if(huabu){
				backCenterHuabu(huabu)
			}
		})
		//删除画布
		$("#huabu_operate_delete").on("click",function(){
			var huabu = return_focusing_huabu()
			if(huabu){
				deleteHuabu(huabu)
			}
		})
		//拷贝画布
			//根据设置情况调用拷贝函数
			$("#huabu_operate_copy").on("click",function(){
				var huabu = return_focusing_huabu()
				if(huabu){
					//若勾选了不拷贝画布内元素
					if($("#huabu_operate_noCopyTile").prop("checked")){
							var type = "no_cpoy_tile"
					}
					copyHuabu(huabu,type)
				}
			})

//磁贴
	//切换至磁贴design
	function changeTileDesign(tile){
		//将其他的design隐藏
		$(".rightArea_design_inner_block").hide()
		//将画布design显示出来
		$("#rightArea_design_tile").show()
		//将磁贴的数据载入
		showTileBackgroundColor(tile)
		showTileBackgroundGradient(tile)
		showTileBackgroundInsert(tile)
		showTilePosition(tile)
		showTileSize(tile)
		showTileBorder(tile)
		showTileZIndex(tile)
		showTileManage(tile)
		showTileTitleText(tile)
		showTileTitleSet(tile)
		showTileTitleFont(tile)
		showTileShadow(tile)
		showTileLink(tile)
		showTileAnnotation(tile)
		showTileNest(tile)
		showTileTextBlockSet(tile)
	}
		//锁定磁贴样式栏，禁止input输入或选取
		function lockTileDesign(){
			//属性上锁
			$("#right_design_tile").prop("lock",true)
			//禁止所有checkbox修改,除了锁定磁贴选项
			$('#right_design_tile input[type="checkbox"]:not("#tile_manage_lock")').prop('disabled', true);
			//所有Input改为只读
			$('#right_design_tile input').prop('readonly', true);
			//禁止所有select选择，除了加入磁贴选项
			$('#right_design_tile select:not("#tile_manage_add")').prop('disabled', true);
			//所有Input按键的点击无效化
			$('#right_design_tile .input_button div').css('pointer-events', 'none');
		}
		//解锁磁贴样式栏
		function unlockTileDesign(){
			//属性解锁
			$("#right_design_tile").prop("lock",false)
			//允许所有checkbox修改,除了锁定磁贴选项
			$('#right_design_tile input[type="checkbox"]').prop('disabled', false);
			//所有Input取消只读
			$('#right_design_tile input').prop('readonly', false);
			//允许所有select选择，除了加入磁贴选项
			$('#right_design_tile select').prop('disabled', false);
			//所有Input按键的点击恢复正常
			$('#right_design_tile .input_button div').css('pointer-events', 'auto');
		}
	//图形
		//背景
			//背景颜色
				function showTileBackgroundColor(tile){
					//将对应色块的颜色改变
					var color = $(tile).attr("background_color")
					if(color == undefined){
						color = "white"
					}
					$("#tile_background_color .colorpicker_block").css("background-color",color)
				}
				//点击对应的选色器，调用颜色修改器
				$("#tile_background_color").on("click",function(){
					var tile = return_focusing_tile()
					if(tile){
						showColorpicker(this,"down",tile,"background")
					}
				})

			//插入图片
				//根据磁贴的背景信息，控制该操作栏的内容显示
				function showTileBackgroundInsert(tile){
					//判断磁贴是否具备背景图片
					var background = $(tile).prop("background_image")
					if(background){
						//若存在背景图片，则首先修改[插入图片]按键名称
						var img_name = $(tile).attr("background_image_name")
						$("#tile_background_insert .file_insert").text(img_name)
						//显示背景图片删除键
						$("#tile_background_insert .file_delete").show()
						//显示背景设置选项并相应地修改当前选项
						$("#tile_background_insert_set").css("display","flex")
						var background_set = $(tile).attr("background_set")
						$("#tile_background_insert_set select").val(background_set)
						//根据背景设置选项决定是否展开位置操作
						if(background_set == "放置" || background_set == "重复"){
							$("#tile_background_insert_position").css("display","flex")
							//获取磁贴的背景位置信息
							var position = $(tile).css("background-position").split(" ")
							$("#tile_background_position_left").val(position[0])
							$("#tile_background_position_top").val(position[1])
						}
						else{
							$("#tile_background_insert_position").hide()
						}
					}
					//若无背景图片则显示为初态
					else{
						tileDisplayBackgroundState_0()
					}
				}
				//初态，即磁贴无背景图片的状态
				function tileDisplayBackgroundState_0(){
					$("#tile_background_insert .file_insert").text("插入图片")
					$("#tile_background_insert .file_input").val(null)
					$("#tile_background_insert .file_delete").hide()
					$("#tile_background_insert_set").hide()
					$("#tile_background_insert_position").hide()
				}
				//点击插入图片，弹出文件选择菜单,在选择菜单后将对应图片放入tile
				$("#tile_background_insert .file_insert").on("click",function(){
					//如果当前没有聚焦磁贴，则不触发input
					var tile = return_focusing_tile()
					if(tile){
						selectObjectBackgroundImg(tile,function(){
							//刷新显示
							showTileBackgroundInsert(tile)
						})
					}
				})
				//点击取消,删除tile的背景，回归初态
				$("#tile_background_insert .file_delete").on("click",function(){
					var tile = return_focusing_tile()
					if(tile){
						UnbackgroundImgObject(tile)
						tileDisplayBackgroundState_0()
					}
				})
				//通过选项栏的值设置tile背景的显示方式
				$("#tile_background_insert_set select").on("change",function(){
					var value = $(this).val()
					if(value == "拉伸"){
						$("#tile_background_insert_position").hide()
					}
					else{
						$("#tile_background_insert_position").css("display","flex")
					}
					setObjectBackground(return_focusing_tile(),value)
				})
				//通过位置栏的输入调整tile背景的位置
				$("#tile_background_position_left").on("change",function(){
					//处理输入值，使其为百分数或带px单位的数
					var x = intValue($(this).val(),"px")
					$(this).val(x)
					$(return_focusing_tile()).css("background-position-x",x)
				})
				$("#tile_background_position_top").on("change",function(){
					//处理输入值，使其为百分数或带px单位的数
					var y = intValue($(this).val(),"px")
					$(this).val(y)
					$(return_focusing_tile()).css("background-position-y",y)
				})

			//背景渐变
				//同步磁贴的背景渐变设置
				function showTileBackgroundGradient(tile){
					//获取该磁贴的相关设置属性
					var gradient = $(tile).prop("background_gradient")
					//若该值为true，则进一步修改渐变设置的值
					if(gradient){
						//修改渐变选项的值
						$("#tile_background_gradient input").prop("checked",true)
						//显示渐变设置
						$("#tile_background_gradient_set").css("display","flex")
						//获取tile的渐变设置
						var direction = $(tile).attr("gradient_direction")
						var color = $(tile).attr("gradient_color")
						//修改其渐变设置的值
						$("#tile_background_gradient_set select").val(direction)
						$("#tile_background_gradient_set .colorpicker_block").css("background-color",color)
					}
					//否则隐藏渐变设置
					else{
						//修改渐变选项的值
						$("#tile_background_gradient input").prop("checked",false)
						$("#tile_background_gradient_set").hide()
					}
				}
				//渐变选项
				$("#tile_background_gradient input").on("click",function(){
					var tile = return_focusing_tile()
					if(tile){
						var value = $(this).prop("checked")
						//若为无渐变对象指定了渐变(change为true)
						if(value){
							//显示渐变设置，默认设置为"向上"，默认颜色为黑色
							$("#tile_background_gradient_set").css("display","flex")
							$("#tile_background_gradient_set select").val("top")
							$("#tile_background_gradient_set .colorpicker_block").css("background-color","black")
							//为磁贴附加渐变
							gradientBackgroundTile(tile,"top","black")
						}
						//若取消了渐变
						else{
							//隐藏渐变设置
							$("#tile_background_gradient_set").hide()
							//去除渐变效果
							ungradientBackgroundTile(tile)
						}
						
					}
				})
				//渐变方向选项
				$("#tile_background_gradient_set select").on("change",function(){
					var tile = return_focusing_tile()
					if(tile){
						//获取渐变方向
						var direction = $(this).val()
						//修改磁贴的渐变效果
						gradientBackgroundTile(tile,direction,null)
					}
				})
				//渐变颜色设置
				$("#tile_background_gradient_set .colorpicker").on("click",function(){
					var tile = return_focusing_tile()
					if(tile){
						showColorpicker(this,"down",tile,"tile_background_gradient")
					}
				})
		//形状
			//磁贴位置
				//同步显示磁贴当前位置和角度
				function showTilePosition(tile){
					//获取当前tile的位置
					var left = $(tile).css("left")
					var top = $(tile).css("top")
					var angle = parseInt($(tile).attr("angle"))
					if(angle == undefined){
						angle = 0
					}
					//修改输入栏的值
					$("#tile_position_left").val(left)
					$("#tile_position_top").val(top)
					$("#tile_position_angle").val(angle + "°")
				}
				//通过输入值修改磁贴的属性
				$("#tile_position_left").on("change",function(){
					var tile = return_focusing_tile()
					if(tile){
						//令值规范化
						var value = intValue($(this).val(),"px")
						$(this).val(value)
						changeTilePosition(tile,value,null)
					}
				})
				$("#tile_position_top").on("change",function(){
					var tile = return_focusing_tile()
					if(tile){
						//令值规范化
						var value = intValue($(this).val(),"px")
						$(this).val(value)
						changeTilePosition(tile,null,value)
					}
				})
				$("#tile_position_angle").on("change",function(){
					var tile = return_focusing_tile()
					if(tile){
						var value = parseInt($(this).val())
						//令值规范化
						$(this).val(value + "°")
						//调用旋转函数
						rotateDom(tile,value,"change")
					}
				})
			//磁贴尺寸
				function showTileSize(tile){
					//获取当前tile的属性
					var width = $(tile).css("width")
					var height = $(tile).css("height")
					var limit = $(tile).prop("size_limit")

					//修改输入栏的值
					$("#tile_size_width").val(width)
					$("#tile_size_height").val(height)
					if(limit){
						$("#tile_size_limit").prop("checked",limit)
					}
					else{
						$("#tile_size_limit").prop("checked",false)
					}
				}
				//通过输入值修改磁贴的属性
				$("#tile_size_width").on("change",function(){
					var tile = return_focusing_tile()
					if(tile){
						//规范化值，但暂时不添加单位
						var width = intValue($(this).val())
						//若限制比例,则还要修改其高度
						if($(tile).prop("size_limit")){
							//获取旧的width与height,得到比例
							var ratio = $(tile).height()/$(tile).width()
							//获得对应的height
							var height = intValue(width * ratio,"px")
							$("#tile_size_height").val(height)
						}
						//为值添加单位
						$(this).val(width+"px")
						//改变Tile的尺寸
						changeTileSize(tile,height,width)
					}
				})
				$("#tile_size_height").on("change",function(){
					var tile = return_focusing_tile()
					if(tile){
						//规范化值，但暂时不添加单位
						var height = intValue($(this).val())
						//若限制比例,则还要修改其宽度
						if($(tile).prop("size_limit")){
							//获取旧的width与height,得到比例
							var ratio = $(tile).width()/$(tile).height()
							//获得对应的width
							var width = intValue(height * ratio,"px")
							$("#tile_size_width").val(width)
						}
						//为值添加单位
						$(this).val(height+"px")
						//改变Tile的尺寸
						changeTileSize(tile,height,width)
					}
				})
				//限制比例选项
				$("#tile_size_limit").on("change",function(){
					var tile = return_focusing_tile()
					if(tile){
						var value = $(this).prop("checked")
						//修改tile的属性
						$(tile).resizable("option", "aspectRatio", value )
						$(tile).prop("size_limit",value)
					}
				})
		//边框
			//同步磁贴的边框信息
			function showTileBorder(tile){
				//边框类型
				var type = $(tile).css("border-style")
				$("#tile_border_type").val(type)
				//边框粗度
				var width = $(tile).css("border-width")
				$("#tile_border_width").val(width)
				//边框颜色
				var color = $(tile).css("border-color")
				$("#tile_border_color .colorpicker_block").css("background-color",color)
				//边框弧度
				var radius = $(tile).css("border-radius")
				$("#tile_border_radius").val(radius)
			}
			//选择边框类型
			$("#tile_border_type").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//获取边框类型值
					var type = $(this).val()
					//分别对应地修改磁贴边框类型
					$(tile).css("border-style",type)
				}
			})
			//修改边框粗度
			$("#tile_border_width").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//获取值并标准话
					var value = intValue($(this).val(),"px")
					$(this).val(value)
					$(tile).css("border-width",value)
				}
			})
			//修改边框颜色
			$("#tile_border_color").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					showColorpicker(this,"down",tile,"border")
				}
			})
			//修改边框弧度
			$("#tile_border_radius").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//获取值并标准话
					var value = intValue($(this).val(),"px")
					$(this).val(value)
					$(tile).css("border-radius",value)
				}
			})
		//层叠
			//同步显示磁贴的层叠值
			function showTileZIndex(tile){
				var z_index = $(tile).attr("z_index")
				$("#tile_zIndex span").text(z_index)
			}
			//点击按键修改磁贴的层叠值
			$("#tile_zIndex_up").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					ZIndexObject(tile,"up")
				}
			})
			$("#tile_zIndex_down").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					ZIndexObject(tile,"down")
				}
			})
			//移至最前和移至最后
			$("#tile_zIndex_max").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					//获取磁贴所在的画布的最大层叠值并+1
					var huabu = $(tile).parents(".huabu")
					var z_index_max = parseInt($(huabu).attr("z_index_max")) + 1
					//修改tile当前的层叠值
					ZIndexObject(tile,"change",z_index_max)
				}
			})
			$("#tile_zIndex_min").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					//获取磁贴所在的画布的最小层叠值并-1
					var huabu = $(tile).parents(".huabu")
					var z_index_min = parseInt($(huabu).attr("z_index_min")) - 1
					//修改tile当前的层叠值
					ZIndexObject(tile,"change",z_index_min)
				}
			})
		//管理
			//同步显示磁贴当前的管理设置
			function showTileManage(tile){
				//同步显示锁定设置
				var lock = $(tile).prop("lock")
				$("#tile_manage_lock").prop("checked",lock)
				//若为true则锁定右侧样式栏
				if(lock){
					lockTileDesign()
				}
				//否则,若此时处于锁定状态则解锁
				else{
					if($("#right_design_tile").prop("lock")){
						unlockTileDesign()
					}
				}
			}
			//修改磁贴的锁定设置
			$("#tile_manage_lock").on("change",function(){
				var tile = return_focusing_tile("manage_lock")
				if(tile){
					//获取锁定设置的值
					var value = $(this).prop("checked")
					//进行锁定
					if(value){
						lockTile(tile)
						//同时还将锁定右侧设计栏中对磁贴的修改input
						lockTileDesign()
					}
					//解除锁定
					else{
						unlockTile(tile)
						//解锁修改Input
						unlockTileDesign()
					}
				}
			})
			//复制磁贴的样式:备忘未做
			$("#tile_manage_copy").on("click",function(){
				var tile = return_focusing_tile("manage_lock")
				if(tile){
					//得到磁贴的style
					var css = getTileCSS(tile)
					delete css["top"];
					delete css["left"];
					var attr = getTileAttr(tile)
					delete attr["id"]
					var prop = getTileProp(tile)
					var tile_style = {
						css : css,
						attr : attr,
						prop : prop
					}
					//将这些值打包保存到剪贴板
					pushClipboard(tile_style,"tile_style")
				}
			})
			//粘贴复制到的磁贴样式
			$("#tile_manage_paste").on("click",function(){
				var tile = return_focusing_tile("manage_lock")
				if(tile){
					//读取剪贴板中的磁贴样式
					var tile_style = popClipboard("tile_style")
					//将这些样式用在这个tile上
					styleTileByType(tile,tile_style)
					stateTileByType(tile,tile_style)
				}
			})
			//加入左侧操作栏
	//文本
		//磁贴标题
			//同步显示磁贴标题
			function showTileTitleText(tile){
				$("#tile_title_text").val($(tile).children(".tile_title").text())
			}
			//修改磁贴标题
			$("#tile_title_text").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					var value = $(this).val()
					pushToUndo(tile)
					changeTileTitle(tile,value)
				}
			})
		//标题设置
			//同步磁贴的标题设置
			function showTileTitleSet(tile){
				//显示标题
				$("#tile_title_show").prop("checked",$(tile).prop("show_title"))
				//自动换行
				$("#tile_title_wrap").prop("checked",$(tile).prop("wrap_title"))
				//标题位置
				$("#tile_title_horizontal").val($(tile).attr("title_horizontal"))
				$("#tile_title_vertical").val($(tile).attr("title_vertical"))
			}
			//切换显示标题
			$("#tile_title_show").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//获取其值
					var value = $(this).prop("checked")
					//若为true则显示磁贴的标题
					if(value){
						$(tile).prop("show_title",true)
						$(tile).children(".tile_title").css("display","flex")
					}
					//否则隐藏磁铁的标题
					else{
						$(tile).prop("show_title",false)
						$(tile).children(".tile_title").hide()
					}
				}
			})
			//切换自动换行
			$("#tile_title_wrap").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//获取其值
					var value = $(this).prop("checked")
					//若为true则令其标题自动换行
					if(value){
						$(tile).prop("wrap_title",true)
						$(tile).children(".tile_title").css("white-space","normal")
					}
					//否则取消其自动换行设置
					else{
						$(tile).prop("wrap_title",false)
						$(tile).children(".tile_title").css("white-space","nowrap")
					}
				}
			})
			//修改标题位置
			$("#tile_title_horizontal").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//获取当前值
					var value = $(this).val()
					//保存进tile内
					$(tile).attr("title_horizontal",value)
					//修改磁贴标题的left
					$(tile).children(".tile_title").css("left",value)
				}
			})
			$("#tile_title_vertical").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//获取当前值
					var value = $(this).val()
					//保存进tile内
					$(tile).attr("title_vertical",value)
					//修改磁贴标题的left
					$(tile).children(".tile_title").css("top",value)
				}
			})
		//字体
			//同步磁贴的字体设置
			function showTileTitleFont(tile){
				var title = $(tile).children(".tile_title")
				//字体类型
				$("#tile_font_style").val($(title).css("font-family"))
				//字体颜色
				var color = $(title).css("color")
				$("#tile_font_color .colorpicker_block").css("background-color",color)
				//字体大小
				showTileTitleSize(tile)
				//加粗
					if($(title).css("font-weight") == "700"){
						$("#tile_font_bold").buttonCheckedSituation(true)
					}
					else{
						$("#tile_font_bold").buttonCheckedSituation(false)
					}
				//斜体
					if($(title).css("font-style") == "italic"){
						$("#tile_font_italic").buttonCheckedSituation(true)
					}
					else{
						$("#tile_font_italic").buttonCheckedSituation(false)
					}
				//垂直
					if($(title).css("writing-mode") == "vertical-rl"){
						$("#tile_font_vertical").buttonCheckedSituation(true)
					}
					else{
						$("#tile_font_vertical").buttonCheckedSituation(false)
					}
				//上划线
					if($(title).css("text-decoration").includes("overline")){
						$("#tile_font_overline").buttonCheckedSituation(true)
					}
					else{
						$("#tile_font_overline").buttonCheckedSituation(false)
					}
				//中划线
					if($(title).css("text-decoration").includes("line-through")){
						$("#tile_font_strikeline").buttonCheckedSituation(true)
					}
					else{
						$("#tile_font_strikeline").buttonCheckedSituation(false)
					}
				//下划线
					if($(title).css("text-decoration").includes("underline")){
						$("#tile_font_underline").buttonCheckedSituation(true)
					}
					else{
						$("#tile_font_underline").buttonCheckedSituation(false)
					}
				//靠左居中靠右
					//把三个按键都取消
					$("#tile_font_alignLeft").buttonCheckedSituation(false)
					$("#tile_font_alignCenter").buttonCheckedSituation(false)
					$("#tile_font_alignRight").buttonCheckedSituation(false)
					//根据text-align来确认其中一个
					var text_align = $(title).css("text-align")
					if(text_align == "left"){
						$("#tile_font_alignLeft").buttonCheckedSituation(true)
					}
					else if(text_align == "right"){
						$("#tile_font_alignRight").buttonCheckedSituation(true)
					}
					else{
						$("#tile_font_alignCenter").buttonCheckedSituation(true)
					}
			}
			function showTileTitleSize(tile){
				var title = $(tile).children(".tile_title")
				$("#tile_font_size").val($(title).css("font-size"))
			}
			//为右侧设计栏的按键准备的状态切换函数
			$.fn.buttonCheckedSituation = function(situation){
				if(situation){
					$(this).addClass("rightArea_button_clicked")
					$(this).prop("clicked",true)
				}
				else{
					$(this).removeClass("rightArea_button_clicked")
					$(this).prop("clicked",false)
				}
			}
			//选择字体类型
			$("#tile_font_style").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//获取值
					var value = $(this).val()
					//修改磁贴的标题字体类型
					$(tile).children(".tile_title").css("font-family",value)
				}
			})
			//选择字体颜色
			$("#tile_font_color").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					//显示调色板，修改对象为tile_title的text
					showColorpicker(this,"down",$(tile).children(".tile_title"),"text")
				}
			})
			//修改字体大小
			$("#tile_font_size").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//获取规范化的值
					var value = intValue($(this).val(),"px")
					$(this).val(value)
					//修改磁贴的标题字体大小
					$(tile).children(".tile_title").css("font-size",value)
				}
			})	
			//字体加粗
			$("#tile_font_bold").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//查询该按键现状,若未被点击则附加效果
					if($(this).prop("clicked") != true){
						$(tile).children(".tile_title").css("font-weight","bold")
						//令该按键进入已被点击状态
						$(this).buttonCheckedSituation(true)
					}
					//否则取消其效果
					else{
						$(tile).children(".tile_title").css("font-weight","normal")
						//令该按键取消已被点击状态
						$(this).buttonCheckedSituation(false)
					}
				}
			})
			//字体斜体
			$("#tile_font_italic").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//查询该按键现状,若未被点击则附加效果
					if($(this).prop("clicked") != true){
						$(tile).children(".tile_title").css("font-style","italic")
						//令该按键进入已被点击状态
						$(this).buttonCheckedSituation(true)
					}
					//否则取消其效果
					else{
						$(tile).children(".tile_title").css("font-style","normal")
						//令该按键取消已被点击状态
						$(this).buttonCheckedSituation(false)
					}
				}
			})
			//字体垂直
			$("#tile_font_vertical").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//查询该按键现状,若未被点击则附加效果
					if($(this).prop("clicked") != true){
						$(tile).children(".tile_title").css("writing-mode", "vertical-rl");
						//令该按键进入已被点击状态
						$(this).buttonCheckedSituation(true)
					}
					//否则取消其效果
					else{
						$(tile).children(".tile_title").css("writing-mode", "horizontal-tb");
						//令该按键取消已被点击状态
						$(this).buttonCheckedSituation(false)
					}
				}
			})
			//给三个下划线准备的专用函数，提高可读性
			function buttonFontDecoration(button,tile,type){
				pushToUndo(tile)
				//查询该按键现状,若未被点击则附加效果
				if($(button).prop("clicked") != true){
					//获取磁贴现在的text_decoration
					var old_textDecoration = $(tile).children(".tile_title").css("text-decoration")
					//判断是否具有指定的type效果
					if(!old_textDecoration.includes(type)){
						//如果没有则添加type效果,记得去除字符串中的None
						var new_textDecoration = type + " " + old_textDecoration.replace("none","")
						$(tile).children(".tile_title").css("text-decoration",new_textDecoration)
					}
					//令该按键进入已被点击状态
					$(button).buttonCheckedSituation(true)
				}
				//否则取消其效果
				else{
					//获取磁贴现在的text_decoration
					var old_textDecoration = $(tile).children(".tile_title").css("text-decoration")
					//判断是否具有上划线效果
					if(old_textDecoration.includes(type)){
						//如果有则删除上划线效果
						var new_textDecoration = old_textDecoration.replace(type,"")
						$(tile).children(".tile_title").css("text-decoration",new_textDecoration)
					}
					//令该按键取消已被点击状态
					$(button).buttonCheckedSituation(false)
				}
			}
			//字体上划线
			$("#tile_font_overline").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					buttonFontDecoration(this,tile,"overline")
				}
			})
			//字体中划线
			$("#tile_font_strikeline").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					buttonFontDecoration(this,tile,"line-through")
				}
			})
			//字体下划线
			$("#tile_font_underline").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					buttonFontDecoration(this,tile,"underline")
				}
			})
			//给三个左右显示准备的专用函数，提高可读性
			function buttonFontAlign(button,tile,type){
				pushToUndo(tile)
				//查询该按键现状,若未被点击则附加效果
				if($(button).prop("clicked") != true){
					//令磁贴的标题往type方向设置
					$(tile).children(".tile_title").css({
						"text-align":type,
						"justify-content":type
					})
					//令该按键进入已被点击状态
					$(button).buttonCheckedSituation(true)

					return 1
				}
				//否则什么也不会做,因为三个按键要保持至少有一个被点击
				else{
					return 0
				}
			}
			//标题靠左显示
			$("#tile_font_alignLeft").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					if(buttonFontAlign(this,tile,"left")){
						//令另外两个按键处于未点击状态
						$("#tile_font_alignCenter").buttonCheckedSituation(false)
						$("#tile_font_alignRight").buttonCheckedSituation(false)
					}
				}
			})
			//标题居中显示
			$("#tile_font_alignCenter").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					if(buttonFontAlign(this,tile,"center")){
						//令另外两个按键处于未点击状态
						$("#tile_font_alignLeft").buttonCheckedSituation(false)
						$("#tile_font_alignRight").buttonCheckedSituation(false)
					}
				}
			})
			//标题靠右显示
			$("#tile_font_alignRight").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					if(buttonFontAlign(this,tile,"right")){
						//令另外两个按键处于未点击状态
						$("#tile_font_alignLeft").buttonCheckedSituation(false)
						$("#tile_font_alignCenter").buttonCheckedSituation(false)
					}
				}
			})
		//阴影
			//同步显示阴影设置
			function showTileShadow(tile){
				var shadow = $(tile).children('.tile_title').css("text-shadow")
				//显示
				if(shadow != undefined && shadow != null && shadow != "none"){
					//令附加阴影为true
					$("#tile_font_shadow_check").prop("checked",true)
					//获取阴影设置的值
					var regex = /(rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\))\s*(\d+px)\s+(\d+px)\s+(\d+px)/;
					var shadow = $(tile).children('.tile_title').css("text-shadow").match(regex);
					if(shadow != null){
						var color = shadow[1]
						var top = shadow[2]
						var left = shadow[3]
						var vague = shadow[4]
						//分别对应输入
						$("#tile_font_shadow_color .colorpicker_block").css("background-color",color)
						$("#tile_font_shadow_top").val(top)
						$("#tile_font_shadow_left").val(left)
						$("#tile_font_shadow_vague").val(vague)
					}
				}
				//不显示
				else{
					$("#tile_font_shadow_check").prop("checked",false)
				}
			}
			//点击附加阴影
			$("#tile_font_shadow_check").on('change',function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//获取值
					var value = $(this).prop("checked")
					var title = $(tile).children('.tile_title')
					if(value){
						//若为true，则为磁贴附加基础阴影，灰色,2px, 2px
						textShadowTile(tile,"2px","2px","2px","#A3A3A3")
						//显示阴影设置
						$("#tile_font_shadow_set").show()
						//同步值
						showTileShadow(tile)
					}
					else{
						//若为false，则删除阴影设置
						$(title).css("text-shadow","none")
						//隐藏阴影设置
						$("#tile_font_shadow_set").hide()
					}
				}
			})
			//修改阴影颜色
			$("#tile_font_shadow_color").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					showColorpicker(this,"down",tile,"text_shadow")
				}
			})
			//修改阴影位置
			$("#tile_font_shadow_top").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					var value = intValue($(this).val(),"px")
					$(this).val(value)
					//改变阴影的top位置
					textShadowTile(tile,value,null,null,null)
				}
			})
			$("#tile_font_shadow_left").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					var value = intValue($(this).val(),"px")
					$(this).val(value)
					//改变阴影的left位置
					textShadowTile(tile,null,value,null,null)
				}
			})
			//修改阴影的模糊半径
			$("#tile_font_shadow_vague").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					var value = intValue($(this).val(),"px")
					$(this).val(value)
					//改变阴影的left位置
					textShadowTile(tile,null,null,value,null)
				}
			})
	//高级
		//超链接
			//同步显示超链接绑定情况
			function showTileLink(tile){
				if($(tile).prop("tile_link")){
					$("#tile_content_link").prop("checked",true)
					$("#tile_content_link_set").show()
					$("#tile_content_link_input").val($(tile).data("tile_link"))
					var tile_link_menu = $(tile).prop("tile_link_menu")
					$("#tile_content_link_menu_check").prop("checked",!tile_link_menu)
				}
				else{
					$("#tile_content_link").prop("checked",false)
					$("#tile_content_link_set").hide()
				}
			}
			//确认绑定超链接选项
			$("#tile_content_link").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//若为确认，则弹出超链接输入框，并修改磁贴状态,同时重置输入框的输入内容
					if($(this).prop("checked")){
						$("#tile_content_link_set").show()
						$("#tile_content_link_input").val("")
						$(tile).prop("tile_link",true)
					}
					//否则关闭超链接输入框，修改磁贴状态，去除磁贴绑定的超链接
					else{
						$("#tile_content_link_set").hide()
						$(tile).prop("tile_link",false)
					}
				}
			})
			//通过输入为磁贴绑定超链接
			$("#tile_content_link_input").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					//为磁贴绑定输入的超链接
					var link = $(this).val()
					$(tile).data("tile_link",link)
				}
			})
			//禁止显示弹窗选项
			$("#tile_content_link_menu_check").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					var value = $(this).prop("checked")
					//修改tile的属性
					$(tile).prop("tile_link_menu",!value)
				}
			})
		//注释
			//同步显示磁贴的注释情况
			function showTileAnnotation(tile){
				//是否存在注释
				var value = $(tile).prop("tile_annotaition")
				//若存在，则显示
				if(value == true){
					$("#tile_content_annotation").prop("checked",true)
					$("#tile_content_annotation_input").show()
					$("#tile_content_annotation_input").val($(tile).attr("title"))
				}
				//若不存在则隐藏
				else{
					$("#tile_content_annotation").prop("checked",false)
					$("#tile_content_annotation_input").hide()
				}
			}
			//添加注释选项
			$("#tile_content_annotation").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					var value = $(this).prop("checked")
					//修改tile的属性
					$(tile).prop("tile_annotaition",value)
					//若为true，则显示input
					if(value){
						$("#tile_content_annotation_input").show()
					}
					else{
						$("#tile_content_annotation_input").hide()
					}
				}
			})
			//根据输入为磁贴添加注释
			$("#tile_content_annotation_input").on("change",function(){
				var tile = return_focusing_tile()
				if(tile){
					pushToUndo(tile)
					var annotation = $(this).val()
					//修改磁贴的注释，其本身是div元素Title属性
					$(tile).attr("title",annotation)
				}
			})
		//嵌套画布
			//同步显示磁贴的画布嵌套属性
			function showTileNest(tile){
				if($(tile).data("nest_huabu")!=null){
					//显示其嵌套的画布的名称，并修改嵌套按钮的属性，使之点击后进入该嵌套画布
					var nested_huabu_name = $("#"+$(tile).data("nest_huabu")).attr("name")
					$("#tile_content_nestHuabu").text("进入" + nested_huabu_name).prop("open",true)
					//显示删除键
					$("#tile_content_nestHuabu_delete").show()
					// 显示磁贴的进入嵌套画布设置
					$("#tile_content_nestSet").show()
					//同步磁贴的显示属性
					$("#tile_content_nestSet_dbClick").prop("checked",$(tile).prop("nestSet_dbClick"))
					$("#tile_content_nestSet_noOpen").prop("checked",$(tile).prop("nestSet_noOpen"))
					$("#tile_content_nestSet_clickButton").prop("checked",$(tile).prop("nestSet_clickButton"))
				}
				else{
					$("#tile_content_nestHuabu").text("嵌套画布").prop("open",false)
					$("#tile_content_nestHuabu_delete").hide()
					$("#tile_content_nestSet").hide()
				}
			}
			//点击嵌套画布按钮
			$("#tile_content_nestHuabu").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					//当前不是打开则进行嵌套
					if($(this).prop("open") == false){
						//弹出嵌套画布弹窗,并将tile与之绑定
						showHuabuNestMenu(tile)
					}
					else{
						//打开磁贴所嵌套的画布
						openNestedHuabu(tile)
					}
				}
			})
			//点击解除嵌套
			$("#tile_content_nestHuabu_delete").on("click",function(){
				var tile = return_focusing_tile()
				if(tile){
					unnestHuabuTile(tile)
					showTileNest(tile)
						
				}
			})
			//点击设置磁贴的嵌套设置
			$("#tile_content_nestSet_dbClick").on('change',function(){
				var tile = return_focusing_tile()
				if(tile){
					//获取值
					var value = $(this).prop("checked")
					//赋值给tile
					$(tile).prop("nestSet_dbClick",value)
				}
			})
			$("#tile_content_nestSet_clickButton").on('change',function(){
				var tile = return_focusing_tile()
				if(tile){
					//获取值
					var value = $(this).prop("checked")
					//赋值给tile
					$(tile).prop("nestSet_clickButton",value)
				}
			})
			$("#tile_content_nestSet_noOpen").on('change',function(){
				var tile = return_focusing_tile()
				if(tile){
					//获取值
					var value = $(this).prop("checked")
					//赋值给tile
					$(tile).prop("nestSet_noOpen",value)
				}
			})
			
		//磁贴内容
			//同步显示磁贴内容的设置
			function showTileTextBlockSet(tile){
				//显示尺寸
				$("#tile_textblock_size_width").val($(tile).attr("textblock_width"))
				$("#tile_textblock_size_height").val($(tile).attr("textblock_height"))
				//显示位置设定
				$("#tile_textblock_position_vertical").val($(tile).attr("textblock_vertical"))
				$("#tile_textblock_position_horizontal").val($(tile).attr("textblock_horizontal"))
				//显示状态设定
				$("#tile_textblock_showState").val($(tile).attr("textblock_showState"))
				//显示绑定设定
				$("#tile_textblock_bindState").prop("checked",$(tile).prop("textblock_bindState"))
			}
			//根据输入修改磁贴对应的textblock尺寸
				$("#tile_textblock_size_width").on('change',function(){
					var tile = return_focusing_tile()
					if(tile){
						pushToUndo(tile)
						//获取规范值
						var value = intValue($(this).val(),"px")
						$(this).val(value)
						$(tile).attr("textblock_width",value)
						$("#"+$(tile).data("textblock")).width(value)
					}
				})
				$("#tile_textblock_size_height").on('change',function(){
					var tile = return_focusing_tile()
					if(tile){
						pushToUndo(tile)
						//获取规范值
						var value = intValue($(this).val(),"px")
						$(this).val(value)
						//修改磁贴属性
						$(tile).attr("textblock_height",value)
						//修改磁贴对应的textblock的高度
						$("#"+$(tile).data("textblock")).height(value)

					}
				})
			//根据输入修改磁贴对应的textblock的显示位置
				$("#tile_textblock_position_vertical").on("change",function(){
					var tile = return_focusing_tile()
					if(tile){
						pushToUndo(tile)
						//修改tile的属性值
						$(tile).attr("textblock_vertical",$(this).val())
						//然后修改对应textblock的位置
						setTextblockPosition(tile)
					}
				})
				$("#tile_textblock_position_horizontal").on("change",function(){
					var tile = return_focusing_tile()
					if(tile){
						pushToUndo(tile)
						//修改tile的属性值
						$(tile).attr("textblock_horizontal",$(this).val())
						//然后修改对应textblock的位置
						setTextblockPosition(tile)
					}
				})
			//根据输入修改磁贴对应textblock的显示方式
				$("#tile_textblock_showState").on("change",function(){
					var tile = return_focusing_tile()
					if(tile){
						pushToUndo(tile)
						//修改tile的textblock显示状态属性
						var value = $(this).val()
						console.log(value)
						setTileTextblockShowState(tile,value)
					}
				})
			//通过选择修改磁贴对应的textblock的绑定方式
				$("#tile_textblock_bindState").on("change",function(){
					var tile = return_focusing_tile()
					if(tile){
						pushToUndo(tile)
						//修改tile的textblock_bindSate属性
						var value = $(this).prop("checked")
						setTileTextblockBindState(tile,value)
					}
				})

//组合体
	//切换至组合体design
		function changeCompositeDesign(composite){
			//将其他的design隐藏
			$(".rightArea_design_inner_block").hide()
			//将这个design显示出来
			$("#rightArea_design_composite").show()
			showCompositeComposeMode(composite)
			showCompositePosition(composite)
			showCompositeSize(composite)
			showCompositeZIndex(composite)
		}
	//组合体
		//切换组合状态
			//根据当前的显示状态改变显示的值
			function showCompositeComposeMode(composite){
				//如果这是一个临时组合体，则显示“组合”
				if($(composite).is(".temp_composite")){
					$("#composite_toggleCompose .rightArea_button").text("组合").addClass('compose')
				}
				//否则显示解除组合
				else{
					$("#composite_toggleCompose .rightArea_button").text("解除组合").removeClass('compose')
				}
			}
			//点击切换指定composite的组合状态
			$("#composite_toggleCompose .rightArea_button").on("click",function(){
				var composite = return_focusing_object(".composite")
				if(composite){
					//如果有“组合”类标识，则令其组合
					if($(this).is(".compose")){
						staticComposite(composite)
					}
					else{
						unstaticComposite(composite)
					}
					showCompositeComposeMode(composite)
				}
			})
		//加入记忆面包

	//组合样式
		//颜色
			//点击调出调色盘，修改当前聚焦的composite的颜色
			$("#composite_color .colorpicker").on("click",function(){
				var composite = return_focusing_object(".composite")
				if(composite){
					showColorpicker(this,"down",composite,"composite")
				}
			})
		//位置
			//同步显示当前位置
			function showCompositePosition(composite){
				//获取其left和top显示在对应div中
				$("#composite_position_left").val($(composite).css("left"))
				$("#composite_position_top").val($(composite).css("top"))
			}
			$("#composite_position_left").on("change",function(){
				var composite = return_focusing_object(".composite")
				if(composite){
					//修改其位置
					var left = intValue($(this).val(),"px")
					$(this).val(left)
					positionComposite(composite,left,null)
				}
			})
			$("#composite_position_top").on("change",function(){
				var composite = return_focusing_object(".composite")
				if(composite){
					//修改其位置
					var top = intValue($(this).val(),"px")
					$(this).val(top)
					positionComposite(composite,null,top)
				}
			})
		//尺寸
			//同步显示尺寸
			function showCompositeSize(composite){
				//获取当前tile的属性
				var width = $(composite).css("width")
				var height = $(composite).css("height")
				var limit = $(composite).prop("size_limit")

				//修改输入栏的值
				$("#composite_size_width").val(width)
				$("#composite_size_height").val(height)
				if(limit){
					$("#composite_size_limit").prop("checked",limit)
				}
				else{
					$("#composite_size_limit").prop("checked",false)
				}
			}
			//通过输入值修改
			$("#composite_size_width").on("change",function(){
				var composite = return_focusing_object(".composite")
				if(composite){
					//规范化值，但暂时不添加单位
					var width = intValue($(this).val())
					//若限制比例,则还要修改其高度
					if($(composite).prop("size_limit")){
						//获取旧的width与height,得到比例
						var ratio = $(composite).height()/$(composite).width()
						//获得对应的height
						var height = intValue(width * ratio,"px")
						$("#composite_size_height").val(height)
					}
					//为值添加单位
					$(this).val(width+"px")
					//改变composite的尺寸
					sizeComposite(composite,height,width)
				}
			})
			$("#composite_size_height").on("change",function(){
				var composite = return_focusing_object(".composite")
				if(composite){
					//规范化值，但暂时不添加单位
					var height = intValue($(this).val())
					//若限制比例,则还要修改其宽度
					if($(composite).prop("size_limit")){
						//获取旧的width与height,得到比例
						var ratio = $(composite).width()/$(composite).height()
						//获得对应的width
						var width = intValue(height * ratio,"px")
						$("#composite_size_width").val(width)
					}
					//为值添加单位
					$(this).val(height+"px")

					//改变composite的尺寸
					sizeComposite(composite,height,width)
				}
			})
			//限制比例选项
			$("#composite_size_limit").on("change",function(){
				var composite = return_focusing_object(".composite")
				if(composite){
					var value = $(this).prop("checked")
					//修改composite的属性
					$(composite).resizable("option", "aspectRatio", value )
					$(composite).prop("size_limit",value)
				}
			})

		//层叠
			function showCompositeZIndex(composite){
				var z_index = $(composite).attr("z_index")
				if(z_index){
					$("#composite_zIndex span").text(z_index)
				}
			}
			//点击按键修改磁贴的层叠值
			$("#composite_zIndex_up").on("click",function(){
				var composite = return_focusing_object(".composite")
				if(composite){
					ZIndexObject(composite,"up")
				}
			})
			$("#composite_zIndex_down").on("click",function(){
				var composite = return_focusing_object(".composite")
				if(composite){
					ZIndexObject(composite,"down")
				}
			})
			//移至最前和移至最后
			$("#composite_zIndex_max").on("click",function(){
				var composite = return_focusing_object(".composite")
				if(composite){
					//获取磁贴所在的画布的最大层叠值并+1
					var huabu = $(composite).parents(".huabu")
					var z_index_max = parseInt($(huabu).attr("z_index_max")) + 1
					//修改composite当前的层叠值
					ZIndexObject(composite,"change",z_index_max)
				}
			})
			$("#composite_zIndex_min").on("click",function(){
				var composite = return_focusing_object(".composite")
				if(composite){
					//获取磁贴所在的画布的最小层叠值并-1
					var huabu = $(composite).parents(".huabu")
					var z_index_min = parseInt($(huabu).attr("z_index_min")) - 1
					//修改composite当前的层叠值
					ZIndexObject(composite,"change",z_index_min)
				}
			})
