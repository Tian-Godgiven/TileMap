//点击在下方弹出子级菜单
$(document).on("click",".down_menu",function(event){
	event.stopPropagation();
	//再弹出Dom对应的菜单
	showChildMenu(this,"down","dblclick")
})

//滑动在下方弹出子级菜单,但只有在已经点击弹出了菜单后才能启用
$(document).on("mouseenter",".down_menu",function(event){
	var slideable = false
	//判断是否已经有同级别的元素的菜单弹出
	$(this).siblings().children(".menu").each(function(){
		if($(this).css("display") == "block"){
			slideable = true;
			return 0;
		}
	})
	if(slideable){
		hideMenu(this,"all")
		showChildMenu(this,"down")
	}
})

//点击在右侧弹出子级菜单,但是不会使得其他菜单被屏蔽
$("#area_top .menu").on("click",".side_menu",function(event){
	event.stopPropagation();
	showChildMenu(this,"right","dblclick","mouseleave")
})

//左侧工具栏
	//文件
		//新建文件
			$("#topAbility_createNewTilemapFile").on("click",function(){
				createTilemapFile().then(file=>{
					if(file){
						loadTilemapFile(file)
					}
				})
				hideMenu(this,"parent")
			})
		//打开工程文件
			$("#topAbility_openTilemapFile").on("click",function(){
				openTilemapFile()
				hideMenu(this,"parent")
			})
		//点击后在子菜单中显示最近加载的10个文件
			$("#topAbility_openRecentlyTilemapFile").on("click",function(){
				var menu = $(this).children(".menu")
				//清空
				$(menu).empty()
				//读取log文件中保存的文件路径
				var data = return_recently_tilemaps()
				if(data.length == 0){
					$(menu).prepend("<div class='hover'>无最近加载的文件</div>")
				}
				else{
					for(file of data){
						//生成一个div，添加到子菜单中
						var file_div = $("<div class='hover'>"+file.name+"</div>")
						$(file_div).data("file",file)
						//越后面的文件越往前
						$(menu).prepend(file_div)
					}
				}
				
			})

			$("#topAbility_openRecentlyTilemapFile > .menu").on("click","div",function(){
				var file = $(this).data("file")
				if(file){
					//加载这个文件
					loadTilemapFile(file)
				}
				
			})
		//保存当前文件
			$("#topAbility_saveTilemapFile").on("click",function(){
				saveTilemapFile()
				hideMenu(this,"parent")
			})
		//保存到账户:备忘
		//另存为
			$("#topAbility_saveTilemapFileAs").on("click",function(){
				showFileSaveAsMenu()
				hideMenu(this,"parent")
			})

		//导入
			$("#topAbility_insertFileToApp").on("click",function(){
				showFileInsertMenu()
				hideMenu(this,"parent")
			})
		//导出
			$("#topAbility_exportFileFromApp").on("click",function(){
				showFileExportMenu()
				hideMenu(this,"parent")
			})
		//关闭文件
			$("#topAbility_closeTilemapFile").on("click",function(){
				closeTilemapFile()
				hideMenu(this,"parent")
			})
	//编辑
		//撤销
			$("#topAbility_undo").on("click",function(){
				undo()
			})
		//重做
			$("#topAbility_redo").on("click",function(){
				redo()
			})
		//见切
			$("#topAbility_cut").on("click",function(){
				copyFocusingObject()
				deleteFocusingObject()
			})
		//复制
			$("#topAbility_copy").on("click",function(){
				copyFocusingObject()
			})
		//粘贴
			$("#topAbility_paste").on("click",function(){
				pasteObject()
			})
		//删除
			$("#topAbility_delete").on("click",function(){
				deleteFocusingObject()
			})
	//界面
		//界面显示
			$("#topAbility_showArea > div").on("click",function(){
				var value = $(this).attr("value")
				//取消显示
				if($(this).is(".selected")){
					if(value == "leftArea"){
						$("#area_left").hide()
						//把他的宽度加给画布
						var width = $("#area_left").width()
						var huabu_width = $("#area_huabu").width()
						$("#area_huabu").width(huabu_width + width)
					}
					else if(value == "topArea"){
						$("#area_top").height("38px")
						$("#topArea_user").hide()
						$("#topArea_icon").hide()
						$("#topArea_fileName").hide()
						$("#area_bottom").height("calc(100% - 40px)")
					}
					else if(value == "rightArea"){
						var width = $("#area_right").width()
						$("#area_right").hide()
						//把他的宽度加给画布
						var huabu_width = $("#area_huabu").width()
						$("#area_huabu").width(huabu_width + width)
					}
				}
				//显示
				else{
					if(value == "leftArea"){
						$("#area_left").show()
						//把画布的宽度还回来
						var width = $("#area_left").width()
						var huabu_width = $("#area_huabu").width()
						$("#area_huabu").width(huabu_width - width)
					}
					else if(value == "topArea"){
						$("#area_top").height("118px")
						$("#topArea_user").show()
						$("#topArea_icon").show()
						$("#topArea_fileName").show()
						$("#area_bottom").height("calc(100% - 120px)")
					}
					else if(value == "rightArea"){
						$("#area_right").show()
						var width = $("#area_right").width()
						//把他的宽度减给画布
						var huabu_width = $("#area_huabu").width()
						$("#area_huabu").width(huabu_width - width)
					}
				}
				$(this).toggleClass("selected")
			})
		//界面分离
			$("#topAbility_divideArea > div").on("click",function(){
				var value = $(this).attr("value")
				// 取消分离
				if($(this).is(".selected")){
					if(value == "leftArea"){
						unseparateWindow($("#area_left"),$("#area_bottom"),"before")
						//把画布的宽度还回来
						var width = $("#area_left").width()
						var huabu_width = $("#area_huabu").width()
						$("#area_huabu").width(huabu_width - width)
					}
					else if(value == "rightArea"){
						unseparateWindow($("#area_right"),$("#area_bottom"),"after")
						//把画布的宽度还回来
						var width = $("#area_right").width()
						var huabu_width = $("#area_huabu").width()
						$("#area_huabu").width(huabu_width - width)
					}
					else if(value == "quickUse"){
						//回来
						var dom = $(".object_collection[type='quickUse']")
						unseparateWindow(dom,$("#leftArea_object_collection_container"),"before")
					}
					else if(value == "rightEdit"){
						//回来
						unseparateEdit()
						var dom = $("#rightArea_edit_inner")
						console.log(dom)
						unseparateWindow(dom,$("#area_right"),"after")
					}

				}
				// 分离
				else{
					if(value == "leftArea"){
						//把他的宽度加给画布
						var width = $("#area_left").width()
						var huabu_width = $("#area_huabu").width()
						$("#area_huabu").width(huabu_width + width)
						//分离
						separateWindow($("#area_left"),"left")
					}
					else if(value == "rightArea"){
						//把他的宽度加给画布
						var width = $("#area_right").width()
						var huabu_width = $("#area_huabu").width()
						$("#area_huabu").width(huabu_width + width)
						//分离
						separateWindow($("#area_right"),"right")
					}
					else if(value == "quickUse"){
						//分离
						var dom = $("#leftArea_object_collection_container > div[type=quickUse]")
						var container = separateWindow(dom,"left")
						//改下高宽
						$(container).css({
							height:"400px",
							width:"250px"
						})
					}
					else if(value == "rightEdit"){
						//分离
						var dom = $("#rightArea_edit_inner")
						separateEdit()
						var container = separateWindow(dom,"right")
						//改下高宽
						$(container).css({
							height:"70%",
							width:"280px"
						})
					}
				}
				$(this).toggleClass("selected")
			})
	//其他
		//切换主题颜色
			$("#topAbility_changeAppTheme > div").on("click",function(){
				var value = $(this).attr("value")
				toggleAppTheme(value)
			})
		//切换自动保存，默认是开启的
			$("#topAbility_autoSave").on("click",function(){
				//如果当前已经开启，则关闭
				if($(this).is(".autoSaving")){
					toggleAutoSave(false)
				}
				else{
					toggleAutoSave(true)
				}
			})
		
	//关于
		//打开开发者工具
			$("#topAbility_openDevTool").on("click",function(){
				openDevTool()
				//关闭菜单
				hideMenu(this,"parent")
			})

//保存提示
	//修改保存提示的状态
	function changeSaveReminder(save_state){
		//已保存
		if(save_state == "saved"){
			$("#topAbility_saveReminder").removeClass("unsave").addClass("saved").text("当前内容均已保存")
		}
		else if(save_state == "unsave"){
			$("#topAbility_saveReminder").removeClass("saved").addClass("unsave").text("当前内容未保存 | 点击此处保存")
		}
	}
	//点击它可以保存
	$("#topAbility_saveReminder").on("click",function(){
		saveTilemapFile()
	})
//右侧工具栏
	//是否显示textblock功能
		$("#topAbility_toggleTextblockShow").on("click",function(){
			//如果此时已经将其显示了那就切换成隐藏状态
			if($(this).is(".show_textblock")){
				//令所有的textBlock都无法显示
		        changeAllTextBlockShowable(false)
		        //并且隐藏所有textblock
		        $(".textblock").hide()
			}
			//否则切换为显示状态
			else{
				//令所有的textBlock都可以显示
		        changeAllTextBlockShowable(true)
			}
			$(this).toggleClass("show_textblock hide_textblock")
		})
		

	//搜索
	$("#topAbility_search").on("click",function(){
		showSearchMenu()
	})

	//主题颜色切换
	$("#topAbility_toggleTheme").on('click', function(){
		//切换回亮色模式
		if($(this).is(".dark_mode")){
			toggleAppTheme("light")
		}
		else if($(this).is(".light_mode")){
			toggleAppTheme("dark")
		}
	})

	//全屏
	$("#topAbility_toggleFullScreen").on("click",function(){
		toggleFullScreen()
		$(this).toggleClass("fullScreen unfullScreen")
	})



//将一个dom变成分离的窗口
function separateWindow(dom,position){
	//制作一个window container
	var container = $("<div class='separate_window'>\
							<div class='window_title'></div>\
							<div class='window_inner'></div>\
						</div>")
	//将其放入
	$(container).children(".window_inner").append(dom)
	//使得窗口可以拖动和缩放
	$(container).draggable({
		handle: ".window_title",
	})
	$(container).resizable({
		handles: "n, e, s, w",
	})
	//窗口放在body下
	$("body").append(container)

	if(position == "left"){
		$(container).css({
			left:20,
			top:"20%"
		})
	}
	else if(position == "right"){
		$(container).css({
			right:20,
			top:"20%"
		})
	}

	return container
}

//把分离窗口放回去
function unseparateWindow(dom,parent,where){
	var container = $(dom).parents(".separate_window")
	if(where == "before"){
		$(parent).prepend(dom)
	}
	else if(where == "after"){
		$(parent).append(dom)
	}
	
	$(container).remove()
}