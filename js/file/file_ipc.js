//该文件内的函数均为渲染进程向主进程file_by_node.js调用ipc的函数

//传入一个文件的相对路径，获得对应的file(name+path(绝对路径)
async function getFileNameAndPath(file_path){
	var file = ipcRenderer.sendSync("get_fileNameAndPath",file_path)
	return file
}   

//读取一个指定类型的app文件的内容，传入文件的绝对路径，读取其中的内容并返回
async function getFileData(file_path,file_type){
	var data = ipcRenderer.sendSync("get_fileData",file_path,file_type)
	if(data){
		return data
	}
	else{
		return false
	}
}

//将新数据【覆写进】指定文件,要求绝对路径,新数据，文件类型
function changeFile(file_path,new_data,file_type){
	ipcRenderer.send('change_file', file_path,new_data,file_type);
}

//在指定文件路径中创建一个文件，并填入内容，会返回新文件的file对象
async function createFile(file,file_content,file_type){
	if(file_content == undefined){
		file_content = ""
	}
	var new_file = ipcRenderer.sendSync('create_file',file,file_content,file_type)
	return new_file
}

//向系统中导入一个已存在的文件
//打开文件选择框，在指定路径中产生一个选择文件(包含名称和路径）的复制，传回这个复制
async function insertFile(file_type,directory_path){
	//打开文件选择框
	var file = await openFileSelectDialog(file_type,directory_path)
	//选择的文件
	if(file){
		//将选中的文件生成一份复制到指定的路径，并返回生成的文件
		var new_file = ipcRenderer.sendSync('create_file_copy',file,null,directory_path)
		if(new_file){
			return new_file
		}
		else{
			return false
		}
	}
}

//从系统中导出一个app文件,传入文件的相对路径，可选打开保存框时的初始路径
//打开文件保存框，选择保存路径,并产生一个指定文件(包含名称和路径）的复制，传回这个复制
async function exportFile(file_type,file_url){
	//通过相对路径获得对应的文件绝对路径和信息
	var file = await getFileNameAndPath(file_url)
	//获取这个文件的内容
	var file_data = await getFileData(file.path,file_type)
	//打开保存文件框,将对应内容保存进选中的位置
	var new_file = await openFileSaveDialog(file_type,file.name,file_data,)
	if(new_file){
		return true
	}
	else{
		return false
	}
}

//删除指定的文件
function deleteFile(file_path){
	ipcRenderer.send('delete_file',file_path)
}

//读取指定的文件夹，返回其中每个文件的文件名组成的列表
async function getDirectoryFileName(directory_path) {
    // 发送请求获取文件名列表
    var name_list = ipcRenderer.sendSync('get_DirectoryFileName', directory_path);
    return name_list
}

//打开文件选择框，显示指定的file_type，返回选择文件（包含名称name和路径path）
//file_type分为picture和appFile
async function openFileSelectDialog(file_type){
	if(file_type == "picture"){
		type_name = "图片"
		file_type = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] 
	}
	else if(file_type === "tilemap" || file_type === "object_lib" || file_type === "object"){
		type_name = "应用文件"
		file_type = ['tilemap']
	}
	else{
		type_name = "其他文件"
		file_type = ['*']
	}
	//获取选择的文件，只支持获取1个
	var file = ipcRenderer.sendSync('open_fileSelectDialog',type_name, file_type)
	
	if(file){
		return file
	}
	else{
		console.error("文件获取失败！")
		return false
	}
}

//打开文件保存框，返回选择的新文件的名称和路径
async function openFileSaveDialog(file_type,file_name,file_content){
	if(file_type == "png"){
		save_name = "图片"
		save_type = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] 
	}
	else if(file_type === "tilemap" || file_type === "object_lib" || file_type === "object"){
		save_name = "应用文件"
		save_type = ['tilemap']
	}
	else{
		save_name = "*"
		save_type = [file_type]
	}

	if(file_content == null){
		file_content = ""
	}

	//获取选择的新文件
	var new_file = ipcRenderer.sendSync('open_fileSaveDialog',file_name,file_type,file_content,save_name,save_type)
	if(new_file){
		return new_file
	}
	else{
		return false
	}
}

//打开文件保存框，创建一个文件夹，并返回这个文件夹的路径
async function createFileDir(dir_name){
	var dir_path = ipcRenderer.sendSync("create_fileDir",dir_name)
	return dir_path
}

//将一个【本地文件路径】对应的图片转换为base64
async function getImgFileBase64(file_path){
	var base64 = ipcRenderer.sendSync('get_img_file_base64',file_path)
	return base64
}

//切换自动保存状态
function toggleAutoSaveMode(bool){
	ipcRenderer.send("toggle_autoSave",bool)
}

//获得一个base64对应的图片的信息
async function getImageInfoFromBase64(base64){
	var image_info = ipcRenderer.sendSync("get_base64Information",base64)
	return image_info
}

//将一个base64保存为png，需要指定绝对路径
async function saveBase64ToPng(file_path,base64){
	var bool = ipcRenderer.sendSync("save_base64ToPng",file_path,base64)
	return bool
}