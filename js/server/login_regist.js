// server服务的渲染→主进程接口

//登录验证  
async function checkUserlogin(login_data){
	var result = ipcRenderer.sendSync("user_login",login_data)
	//若登录成功，则将其中的用户信息发送到主进程并启动登录程序
	if(result.success){
		ipcRenderer.send("save_userInfo",result)
		userLogin(result)
	}
	return result.success
}
	function userLogin(user_info){
		//修改头像和用户名
		changeUserIcon(user_info.user_icon)
		//修改用户名
		changeUserName(user_info.user_name)
		$("#topArea_user").addClass("logged_in")
	}

//获取找回密码验证码,将验证码发送给用户邮箱
async function userFindPasswordGetCode(email){
	var result = ipcRenderer.sendSync("user_findPassword_getCode",email)
	return result.success
}

//找回密码
async function checkUserFindPassword(findPassword_data){
	var result = ipcRenderer.sendSync("user_findPassword",findPassword_data)
	console.log(result)
	return result.success
}

//获取注册验证码,将验证码发送给用户邮箱
async function userRegistGetCode(email){
	var result = ipcRenderer.sendSync("user_regist_getCode",email)
	return result.success
}

//注册验证
async function checkUserRegist(regist_data){
	var result = ipcRenderer.sendSync("user_regist",regist_data)
	return result.success
}

//退出登陆
function userQuit(){
	//清除主进程保存的用户信息
	var result = ipcRenderer.send("user_quit")
	//修改头像和用户名
	$("#topArea_userIcon").css("background-image","none").text("未登录")
	//同时修改用户主页中的头像
	$("#userArea_userIcon").css("background-image","none").text("未登录")
	//头像改变框的头像
	$("#userIcon_change_menu_inner").css("background-image","none")
	//修改用户名
	changeUserName("未登录")
	$("#topArea_user").removeClass("logged_in")
	//退出用户区域
	hideUserArea()
	//关闭用户菜单
	$("#topArea_userMenu").hide()
}

//判断是否处于已登录状态
async function ifUserLogin(){
	var result = ipcRenderer.sendSync("if_userLogin")
	return result
}
