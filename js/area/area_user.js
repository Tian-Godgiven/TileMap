const path = require("path")
const GridManager = require('gridmanager')

// 跳转到用户页面
	function showUserArea(){
		//要求必须要用户处于已登录状态
		ifUserLogin().then(bool=>{
			if(bool){
				$("#area_bottom > div").hide()
				$("#area_user").show()
				//加载这个用户上传文件信息
				loadUserUploadInformation()
			}
			else{
				alert("请先登录!")
			}
		})
	}
	
// 返回
	function hideUserArea(){
		$("#area_bottom > div").show()
		$("#area_user").hide()
	}
	$("#userArea_return").on("click",function(){
		hideUserArea()
	})

// 头像修改菜单
	$("#userArea_userIcon").on("click",function(){		
		showModalMenu($("#userIcon_change_menu"))
	})

// 修改用户名
	$("#userArea_changeUserName").on("click",function(){
		swal.fire({
            html: '<input placeholder="请输入新用户名" id="changeUserName_input">'
        }).then((result) => {
        	//确认
            if (result.isConfirmed) {
            	var new_userName = $("#changeUserName_input").val()
            	if(new_userName != ""){
            		//将这个新的用户上传至服务器
            		uploadUserName(new_userName).then(bool=>{
            			if(bool){
            				changeUserName(new_userName)
            			}
            			else{
            				alert("上传用户名失败！")
            			}
            		})
            	}
            } 
        });
	})

// 密码修改窗口
	$("#userArea_changePassword").on("click",function(){
		//其实就是“找回密码窗口”，但是没有“返回登录”
		showChangePassword()
	})

// 在线房间管理菜单
	$("#userArea_userOnlineRoom").on("click",function(){

	})

// 退出登录
	$("#userArea_quit").on("click",function(){
		userQuit()
	})

//用户修改头像
	function changeUserIcon(user_icon){
		if(user_icon != null && user_icon != ""){
			var user_icon = "url(" + user_icon + ")"
		}
		else{
			//使用默认头像
			var user_icon = "var(--no-icon-)"
		}
		//将用户头像用作其背景图片
		$("#topArea_userIcon").css({
			"background-image" : user_icon 
		}).text("")
		//同时修改用户主页中的头像
		$("#userArea_userIcon").css({
			"background-image" : user_icon 
		}).text("")
		//头像改变框的头像
		$("#userIcon_change_menu_inner").css({
			"background-image" : user_icon 
		})
	}

//用户改变名称
	function changeUserName(user_name){
		$("#topArea_userIcon").attr("title",user_name)
		$("#userArea_userName").text(user_name)
	}

//加载已上传的文件的信息，这个操作只会进行1次，随后需要用户手动刷新
	var first_time = true
	function loadUserUploadInformation(){
		if(first_time){
			//加载已上传的集合信息
			loadUserUploadObjectInfo()
			//加载已上传的文件信息
			loadUserUploadFileInfo()
			first_time = false
		}
	}
//点击刷新键刷新
	$("#userArea_refreshObjectTable").on("click",function(){
		loadUserUploadObjectInfo()
	})
	$("#userArea_refreshFileTable").on("click",function(){
		loadUserUploadFileInfo()
	})

//加载已上传的集合
	function loadUserUploadObjectInfo(){
		//清空
		$("#userArea_object .userArea_container .file_info_block").remove()
		//获取服务端的集合信息
		getUserUploadInfo("collection").then(result=>{
			var success = result.success
			if(success == "no_file"){
				var div = "<span>无上传的文件</span>"
				$("#userArea_object .userArea_container").append(div)
			}
			else if(success){
				// 使用 map() 方法遍历数组对象，并修改属性值
				const file_infos = result.info.map(obj => {
				    // 使用 path.basename() 函数获取文件名，并赋值给 file_name 属性
				    return {
				        ...obj,
				        file_name: path.basename(obj.file_path)
				    };
				});
				// 定义列的配置
		        const columnDefs = [
		            { key: 'file_name', text: '文件名' },
		            { key: 'upload_time', text: '上传时间' },
		            { key: 'file_info', text: '备注' },
		            {
				        key: 'operation',
				        text: '操作',
				        template: function(value, row, index) {
				            // 返回自定义的 HTML 模板，包含两个按钮
				            return `
				             	<button class="userArea_fileDownload" data-index="${index}">下载</button>
				                <button class="userArea_fileDelete" data-index="${index}">删除</button>
				            `;
				        }
				    }
		        ];
		        // 模拟的数据
		        const rowData = {data:file_infos};

		        // 将数据转换为 GridManager 要求的格式
				$('#userArea_objectTable').GM({
					gridManagerName: 'object_grid',
					width:"100%",
					height:"140px",
					supportAdjust:true,//宽度调整
					columnData: columnDefs,
					ajaxData: rowData,
					supportCheckbox: false, // 不显示勾选列
    				supportAutoOrder: false // 不显示序号列
				});
	
			}
		})
	}

//上传集合
	$("#userArea_uploadObject").on("click",function(){
		//打开上传菜单
		showObjectUploadMenu()
	})

//点击删除对应的集合文件，弹出提示并在确认后删除服务端的文件
	$("#userArea_objectTable").on("click",".userArea_fileDelete",function(){
		//弹窗确认删除
		swal.fire({
            title: "确认删除该文件吗？本操作无法撤回！",
        }).then((result) => {
        	//确认
            if (result.isConfirmed) {
            	// 获取按钮所在行的索引
			    const rowIndex = $(this).parents('tr')[0];
			    // 获取行数据
			    const rowData = GM.getRowData('object_grid', rowIndex);
			    // 需要获得其中的file_name
			    const file_name = rowData.file_name
			    // 删除对应的文件
			    deleteUserFile(file_name,"collection")
			    // 删除对应的行
			    $(this).parents('tr').remove()
            } 
        });
		
	})

//点击下载对应的集合文件并导入到软件中
	$("#userArea_objectTable").on("click",".userArea_fileDownload",function(){
		//弹窗确认下载
		swal.fire({
            title: "确认下载该文件并导入到软件中吗？",
        }).then((result) => {
        	//确认
            if (result.isConfirmed) {
            	// 获取按钮所在行的索引
			    const rowIndex = $(this).parents('tr')[0];
			    // 获取行数据
			    const rowData = GM.getRowData('object_grid', rowIndex);
			    // 需要获得其中的file_name
			    const file_name = rowData.file_name
			    // 获取对应的文件的数据
			    downloadUserFile(file_name,"collection").then(result=>{
			    	//其中的数据
			    	var file_data = JSON.parse(result.content)
			    	//将其创建到自定义lIb文件中
			    	var name = file_data["collection_name"]
	                createLibFile(name,"customize",file_data)
	                .then(new_file=>{
	                    //创建这个文件的collection
	                    createObjectCollection(new_file,"customize")
	                })
			    })
            } 
        });
	})

//加载已上传的文件
	function loadUserUploadFileInfo(){//清空
		$("#userArea_fileTable").empty()
		//获取服务端的集合信息
		getUserUploadInfo("tilemap").then(result=>{
			var success = result.success
			if(success == "no_file"){
				var div = "<span>无上传的文件</span>"
				$("#userArea_fileTable").append(div)
			}
			else if(success){
				$("#userArea_fileTable").empty()
				// 使用 map() 方法遍历数组对象，并修改属性值
				const file_infos = result.info.map(obj => {
				    // 使用 path.basename() 函数获取文件名，并赋值给 file_name 属性
				    return {
				        ...obj,
				        file_name: path.basename(obj.file_path)
				    };
				});
				// 定义列的配置
		        const columnDefs = [
		            { key: 'file_name', text: '文件名' },
		            { key: 'upload_time', text: '上传时间' },
		            { key: 'file_info', text: '备注' },
		            {
				        key: 'operation',
				        text: '操作',
				        template: function(value, row, index) {
				            // 返回自定义的 HTML 模板，包含两个按钮
				            return `
				             	<button class="userArea_fileDownload" data-index="${index}">下载</button>
				                <button class="userArea_fileDelete" data-index="${index}">删除</button>
				            `;
				        }
				    }
		        ];
		        // 模拟的数据
		        const rowData = {data:file_infos};

		        // 将数据转换为 GridManager 要求的格式
				$('#userArea_fileTable').GM({
					gridManagerName: 'file_grid',
					width:"100%",
					height:"140px",
					supportAdjust:true,//宽度调整
					columnData: columnDefs,
					ajaxData: rowData,
					supportCheckbox: false, // 不显示勾选列
    				supportAutoOrder: false // 不显示序号列
				});
	
			}
		})	
	}

//点击弹出输入备注弹窗，随后弹出文件选择框，上传工程文件
	$("#userArea_uploadTilemap").on("click",async function(){
		//弹出文件选择框，选择文件
        var file = await openFileSelectDialog("tilemap")
		//弹出弹窗，要求输入备注
		swal.fire({
            title: "输入文件备注",
            html: '<input id="userArea_uploadFileInput">'
        }).then(async(result) => {
            if (result.isConfirmed) {
            	//获得文件数据
				var file_data = await getFileData(file.path,"tilemap")
		    	var file_info = $("#userArea_uploadFileInput").val()
		    	var bool = await uploadUserData({
		            name:file.name,
		            data:file_data,
		            type:"tilemap",
		            info:file_info,
		        })
            } 
        });
	})

//点击删除对应的工程文件
	$("#userArea_fileTable").on("click",".userArea_fileDelete",function(){
		//弹窗确认删除
		swal.fire({
            title: "确认删除该文件吗？本操作无法撤回！",
        }).then((result) => {
        	//确认
            if (result.isConfirmed) {
            	// 获取按钮所在行的索引
			    const rowIndex = $(this).parents('tr')[0];
			    // 获取行数据
			    const rowData = GM.getRowData('file_grid', rowIndex);
			    // 需要获得其中的file_name
			    const file_name = rowData.file_name
			    // 删除对应的文件
			    deleteUserFile(file_name,"tilemap")
			    // 删除对应的行
			    $(this).parents('tr').remove()
            } 
        });
		
	})

//点击下载对应的工程文件存放在指定位置，如果当前软件没有工程文件，则会加载这个文件
	$("#userArea_fileTable").on("click",".userArea_fileDownload",function(){
		//弹窗确认下载
		swal.fire({
            title: "确认下载该文件并导入到软件中吗？",
        }).then(async(result) => {
        	//确认
            if (result.isConfirmed) {
            	// 获取按钮所在行的索引
			    const rowIndex = $(this).parents('tr')[0];
			    // 获取行数据
			    const rowData = GM.getRowData('file_grid', rowIndex);
			    // 需要获得其中的file_name
			    const file_name = rowData.file_name
			    // 获取对应的文件的数据
			    var result = await downloadUserFile(file_name,"tilemap")
		    	var file_data = JSON.parse(result.content)
		    	// 打开文件保存框，将对应数据的文件保存在指定位置
		    	var file = await openFileSaveDialog("tilemap",file_name,file_data)
		    	// 如果当前没有打开文件的话，则加载这个文件
		    	if(!return_focusing_tilemap()){
		    		loadTilemapFile(file)
		    	}
            } 
        });
	})
