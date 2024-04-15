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
					loadTilemapFile(file)
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
				//备忘：没做哦
			})
		//保存当前文件
			$("#topAbility_saveTilemapFile").on("click",function(){
				saveTilemapFile()
				hideMenu(this,"parent")
			})
		//保存到账户
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
	//其他
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
		

	//主题颜色切换
	$("#topAbility_toggleTheme").on('click', function(){
	  	toggleAppTheme()
	})



