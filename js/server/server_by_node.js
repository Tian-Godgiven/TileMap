const http = require('http');
const ipcMain = require('electron').ipcMain;

// Express 服务器运行的端口
const sever_port = "http://localhost:3000"
//当前登录的用户id和简单的信息
let login_user_id = null
let login_user_info = null

// 监听登录请求
ipcMain.on('user_login', async (event, loginData) => {
    try {
        // 定义登录请求的URL
        const url = sever_port + '/login';
        // 发送登录请求
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData) 
        });
        // 解析响应数据
        const responseData = await response.json();
        // 返回给渲染进程
        event.returnValue = responseData;
    } catch (error) {
        console.error('登录请求发生错误:', error);
        // 处理错误并将错误信息返回给渲染进程
        event.returnValue = { error: '登录请求发生错误' };
    }
});


//获取找回密码验证码请求
ipcMain.on('user_findPassword_getCode', async (event, email) => {
	try {
        // 定义登录请求的URL
        const url = sever_port + '/findPassword_getCode';
        // 发送登录请求
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            //发送邮箱验证邮箱是否存在
            body: JSON.stringify({email:email})
        });
        // 解析响应数据,返回给渲染进程
        const responseData = await response.json();
        event.returnValue = responseData;
    } catch (error) {
        console.error('登录请求发生错误:', error);
        // 处理错误并将错误信息返回给渲染进程
        event.returnValue = { error: '登录请求发生错误' };
    }
});

//找回密码
ipcMain.on('user_findPassword',async (event,findPassword_data) => {
	try {
        // 定义登录请求的URL
        const url = sever_port + '/findPassword';
        // 发送登录请求
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(findPassword_data)
        });
        // 解析响应数据,返回给渲染进程
        const responseData = await response.json();
        event.returnValue = responseData;
    } catch (error) {
        console.error('找回密码请求发生错误:', error);
        // 处理错误并将错误信息返回给渲染进程
        event.returnValue = false
    }
});

//获取注册验证码请求
ipcMain.on('user_regist_getCode', async (event, email) => {
  	try {
        // 定义登录请求的URL
        const url = sever_port + '/regist_getCode';
        // 发送登录请求
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email:email})
        });
        // 解析响应数据,返回给渲染进程
        const responseData = await response.json();
        event.returnValue = responseData;
    } catch (error) {
        console.error('注册验证码请求发生错误:', error);
        // 处理错误并将错误信息返回给渲染进程
        event.returnValue = false
    }
});

//注册请求
ipcMain.on('user_regist', async (event,regist_data) => {
  	try {
        // 定义登录请求的URL
        const url = sever_port + '/regist';
        // 发送登录请求
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(regist_data)
        });
        // 解析响应数据,返回给渲染进程
        const responseData = await response.json();
        event.returnValue = responseData;
    } catch (error) {
        console.error('注册验证码请求发生错误:', error);
        // 处理错误并将错误信息返回给渲染进程
        event.returnValue = false
    }
});

//在主进程保存用户信息，避免用户修改数据
ipcMain.on("save_userInfo",(event,user_info)=>{
    if(user_info){
        login_user_id = user_info.user_id
        login_user_info = user_info
    }
    else{
        console.error("用户id不能为空！")
    }
})

//上传头像请求
ipcMain.on("user_uploadIcon",async (event,user_icon)=>{
	//必须要有用户登录！
	if(login_user_id){
		try {
	        // 定义登录请求的URL
	        const url = sever_port + '/upload_icon';
	        // 发送图片数据和用户id到后端
	        const upload_data = {
	        	user_id : login_user_id,
	        	user_icon : user_icon
	        }
	    	const response = await fetch(url, {
	        	method: 'POST',
	        	headers: {'Content-Type': 'application/json'},
	        	body: JSON.stringify(upload_data)
	    	});
	        // 解析响应数据,返回给渲染进程
	        const responseData = await response.json();
	        event.returnValue = responseData;
	    } 
	    catch (error) {
	        console.error('上传头像请求发生错误:', error);
	        // 处理错误并将错误信息返回给渲染进程
	        event.returnValue = false
	    }
	}
    //没有登录则返回false
    else{
        event.returnValue = false
    }
})

//上传用户名请求
ipcMain.on("user_uploadName",async (event,user_name)=>{
    //必须要有用户登录！
    if(login_user_id){
        try {
            // 定义登录请求的URL
            const url = sever_port + '/upload_name';
            // 发送图片数据和用户id到后端
            const upload_data = {
                user_id : login_user_id,
                user_name : user_name
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(upload_data)
            });
            // 解析响应数据,返回给渲染进程
            const responseData = await response.json();
            event.returnValue = responseData;
        } 
        catch (error) {
            console.error('上传用户名请求发生错误:', error);
            // 处理错误并将错误信息返回给渲染进程
            event.returnValue = false
        }
    }
    //没有登录则返回false
    else{
        event.returnValue = false
    }
})

//用户退出登陆
ipcMain.on("user_quit",(event)=>{
    //清除当前存储的用户信息即可
    login_user_id = null
    login_user_info = null
})

//判断用户是否处于登录状态
ipcMain.on("if_userLogin",(event)=>{
    if(login_user_id == null){
        event.returnValue = false
    }
    else{
        event.returnValue = true
    }
})

//上传文件请求
ipcMain.on("user_uploadData",async(event,file_data)=>{
    //必须要有用户登录！
    if(login_user_id){
        try {
            // 定义登录请求的URL
            const url = sever_port + '/upload_file';
            // 发送图片数据和用户id到后端
            const upload_data = {
                user_id : login_user_id,
                user_file : file_data
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(upload_data)
            });
            // 解析响应数据,返回给渲染进程
            const responseData = await response.json();
            event.returnValue = responseData;
        } 
        catch (error) {
            console.error('上传文件请求发生错误:', error);
            // 处理错误并将错误信息返回给渲染进程
            event.returnValue = false
        }
    }
    //没有登录则返回false
    else{
        event.returnValue = false
    }
})

//获取上传文件的信息请求
ipcMain.on("get_userUploadInfo",async(event,file_type)=>{
    //必须要有用户登录！
    if(login_user_id){
        try {
            // 定义登录请求的URL
            const url = sever_port + '/search_file';
            // 发送图片数据和用户id到后端
            const upload_data = {
                user_id : login_user_id,
                file_type : file_type
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(upload_data)
            });
            // 解析响应数据,返回给渲染进程
            const responseData = await response.json();
            event.returnValue = responseData;
        } 
        catch (error) {
            console.error('上传文件请求发生错误:', error);
            // 处理错误并将错误信息返回给渲染进程
            event.returnValue = false
        }
    }
    //没有登录则返回false
    else{
        event.returnValue = false
    }
})

//删除指定的上传文件
ipcMain.on("delete_userFile",async(event,file_name,file_type)=>{
    //必须要有用户登录！
    if(login_user_id){
        try {
            console.log(file_name)
            // 定义删除请求的URL
            const url = sever_port + '/delete_file';
            // 发送图片数据和用户id到后端
            const upload_data = {
                user_id : login_user_id,
                file_name : file_name,
                file_type : file_type
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(upload_data)
            });
            // 解析响应数据,返回给渲染进程
            const responseData = await response.json();
            event.returnValue = responseData;
        } 
        catch (error) {
            console.error('上传文件请求发生错误:', error);
            // 处理错误并将错误信息返回给渲染进程
            event.returnValue = false
        }
    }
    //没有登录则返回false
    else{
        event.returnValue = false
    }
})

//下载指定的上传文件
ipcMain.on("download_userFile",async(event,file_name,file_type)=>{
    //必须要有用户登录！
    if(login_user_id){
        try {
            // 定义删除请求的URL
            const url = sever_port + '/download_file';
            // 发送图片数据和用户id到后端
            const upload_data = {
                user_id : login_user_id,
                file_name : file_name,
                file_type : file_type
            }
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(upload_data)
            });
            // 解析响应数据,返回给渲染进程
            const responseData = await response.json();
            event.returnValue = responseData;
        } 
        catch (error) {
            console.error('上传文件请求发生错误:', error);
            // 处理错误并将错误信息返回给渲染进程
            event.returnValue = false
        }
    }
    //没有登录则返回false
    else{
        event.returnValue = false
    }
})