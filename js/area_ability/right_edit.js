//画布edit
	//切换至画布edit
	function changeHuabuEdit(huabu){
		//将其他的edit隐藏
		$(".rightArea_edit_inner_block").hide()
		//将画布edit显示出来
		$("#rightArea_edit_huabu").show()
		//将画布的数据载入
		$("#huabu_member_tree").html(createHuabuTree(huabu))
	}



//磁贴edit
	//切换到磁贴edit
	function changeTileEdit(tile){
		//将其他的edit隐藏
		$(".rightArea_edit_inner_block").hide()
		//将磁贴edit显示出来,并将磁贴绑定给它
		$("#rightArea_edit_tile").show().data("tile",tile)
		//同步磁贴的标题和内容
		showTileTitle(tile)
		showTileText(tile)
		//打开修改权限
		$("#rightArea_tile_edit_title").attr("contenteditable","true")
		$("#rightArea_tile_edit_text").attr("contenteditable","true")
	}

	//修饰部分,通过tinyMCE实现
		//tinyMCE初始化
		  	tinymce.init({
			  	license_key: 'gpl',
			    selector: '#rightArea_tile_edit_text',
			    inline: true,
			   	menubar: false,
			   	plugins:"code table myplugins autolink link lists advlist emoticons",
			   	//强制根元素为div不使用p
			   	forced_root_block : "div", 
			    //工具按种类排列
			    toolbar:"|undo redo cut copy paste TextClear\
			    		 |fontfamily fontsizeinput\
			    		 |bullist numlist subscript superscript hr selectAll\
			    		 |TextColor BackgroundColor bold italic \
			    		  underline strikethrough \
			    		  outdent indent alignleft aligncenter alignright alignjustify \
			    		 |quickTable TextInsert emoticons link code",
			   	//显示工具栏，允许换行
			    toolbar_persist:true,
			    toolbar_mode:"wrap",
			    //放置工具栏
			    fixed_toolbar_container:"#rightArea_tile_text_design",
			    //禁止修改的类型
			    noneditable_class: 'miniObject',
			    //使用br换行
			    newline_behavior:'linebreak',
			    //可用字体
			    font_family_formats:'微软雅黑=Microsoft YaHei, Arial, sans-serif;宋体=SimSun, "Songti SC", serif;黑体=SimHei, Arial, sans-serif;楷体=KaiTi, cursive;仿宋=FangSong, serif;Arial=Arial, sans-serif;Helvetica=Helvetica, sans-serif;Times New Roman="Times New Roman", serif;Georgia=Georgia, serif;Verdana=Verdana, sans-serif;Courier New="Courier New", monospace',
			    //撤销次数
			    custom_undo_redo_levels:30,
			    //其他设置
			    table_toolbar: 'tabledelete tabledeleterow  tabledeletecol | tableinsertrowbefore tableinsertrowafter tableinsertcolbefore tableinsertcolafter',
			    remove_trailing_brs: false,
			    	//允许任何标签和任何类
			    valid_elements:"*[*]",
			    	//从新窗口打开链接
			    default_link_target: "_blank",
			    link_context_toolbar: true,
			    link_title:false,
			    placeholder: '在这里输入磁贴内容',
			   	language:'zh_CN',//默认为中文模式

			});


	//显示和编辑部分
		//同步磁贴的标题
		function showTileTitle(tile){
			var title = $(tile).children(".tile_title").html();
			$("#rightArea_tile_edit_title").html(title)
		}
		//同步磁贴的内容
		function showTileText(tile){
			var tiletext = $(tile).data("tiletext");			
			if(tiletext == undefined || tiletext == null){
				tinymce.get('rightArea_tile_edit_text').setContent('');
			}
			else{
				tinymce.get('rightArea_tile_edit_text').setContent(tiletext);
			}
		}

		//监听标题修改，并同步修改给tile
		$("#rightArea_tile_edit_title").on("change",function(){
			var tile = $("#rightArea_edit_tile").data("tile")
			var title = $(this).html()
			//修改title
			pushToUndo(tile)
			changeTileTitle(tile,title)
		})

		//监听内容修改，同步反馈给tile本身
		var editer = tinymce.get('rightArea_tile_edit_text')
		editer.on("change input",function(){
			var tile = $("#rightArea_edit_tile").data("tile")
			var text = editer.getContent()
			//修改text
			changeTileText(tile,text)
		})



//组合体edit
	//切换至组合体edit
		function changeCompositeEdit(huabu){
			//将其他的edit隐藏
			$(".rightArea_edit_inner_block").hide()
			//将画布edit显示出来
			$("#rightArea_edit_composite").show()
		}