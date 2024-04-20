//上传用户头像
async function uploadUserIcon(user_icon){
	// 去掉 base64 数据头部的标识信息
    const base64Data = user_icon.replace(/^data:image\/\w+;base64,/, '');
	var result = ipcRenderer.sendSync("user_uploadIcon",base64Data)
	return result.success
}
//上传用户名
async function uploadUserName(user_name){
	var result = ipcRenderer.sendSync("user_uploadName",user_name)
	return result.success
}
//上传用户数据
async function uploadUserData(file_data){
	var result = ipcRenderer.sendSync("user_uploadData",file_data)
	console.log(result)
	return result.success
}

//获取上传数据的信息
async function getUserUploadInfo(file_type){
	const result = ipcRenderer.sendSync("get_userUploadInfo",file_type)
	return result
}

//删除上传的数据
async function deleteUserFile(file_name,file_type){
	const result = ipcRenderer.sendSync("delete_userFile",file_name,file_type)
	return result.success
}

//下载上传的文件
async function downloadUserFile(file_name,file_type){
	const result = ipcRenderer.sendSync("download_userFile",file_name,file_type)
	console.log(result)
	return result
}