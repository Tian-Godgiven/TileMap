const { app } = require('electron');
const lib_path  = require('path')
const fs = require('fs')

// 初始化appData
// 获取应用程序的安装目录
const appInstallDir = path.dirname(app.getPath('exe'));

// 创建文件夹的函数
async function createFolderIfNotExists(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
}

// 创建应用数据文件夹路径
const appDataDir = path.join(appInstallDir, 'AppData');
createFolderIfNotExists(appDataDir);
// 创建 lib 文件夹
const libDir = path.join(appDataDir, "object_lib");
createFolderIfNotExists(libDir);
// 创建两种可自定义的 lib 文件夹
const quickUse_lib = path.join(libDir, "quickUse_lib");
createFolderIfNotExists(quickUse_lib)
const customize_lib = path.join(libDir, "customize_lib");
createFolderIfNotExists(customize_lib);
// 获取默认lib的地址
let appDir = __dirname;
if (process.mainModule.filename.indexOf('app.asar') !== -1) {
    // 如果处于 asar 打包模式下，需要调整路径
    appDir = path.dirname(process.mainModule.filename);
}
const default_lib = path.join(appDir,"js/object_lib/default_lib")

// 构建快捷使用文件
const quickUseTilmapPath = path.join(quickUse_lib, 'quickUse.tilmap');
// 检查文件是否存在
fs.access(quickUseTilmapPath, fs.constants.F_OK, (err) => {
    if (err) {
        // 如果文件不存在，则调用函数 a
        createLibFile("快捷使用","quickUse",null,"quickUse")
    }
});

//获取lib文件的文件夹路径
function getLibDirPath(type){
	//根据类型切换路径
	if(type == "default"){
		var dir_path = default_lib
	}
	else if(type == "quickUse"){
		var dir_path = quickUse_lib
	}	
	else{
		var dir_path = customize_lib
	}
}

//加载指定lib文件夹中的所有文件,并在左侧栏创建对应的collection容器，并加载对应的内容
async function loadObjectLibDirectory(directory_name,type){
	var dir_path = getLibDirPath(type)
	//读取这个lib文件夹的文件名，得到一个文件名列表
	var name_list = await getDirectoryFileName(dir_path)
	//遍历文件名
	for(i in name_list){
		var file = {name : name_list[i] , path :dir_path + "/" + name_list[i]} 
		//在左侧创建对应lib文件的菜单
		createObjectCollection(file,type)
	}
}

//创建一个lib文件,文件名默认与用户对集合的命名相同，重名再做调整
async function createLibFile(collection_name,type,file_content,file_name){
	//默认为空
	if(file_content == null){
		var file_content = {
			collection_name : collection_name,
			collection_objects : [] 
		}
	}

	if(file_name == null){
		file_name = collection_name
	}

	const dir_path = getLibDirPath(type)
	var file = {
		path:path.join(dir_path,collection_name + ".tilemap"),
		name:file_name
	}
	var new_file = await createFile(file,file_content,"object_lib")

	return new_file
}
//删除一个lib文件
function deleteLibFile(file_name,type){
	//根据类型切换路径
	const dir_path = getLibDirPath(type)
	//生成对应的路径
	var file_path = path.join(dir_path,file_name)
	//将对应的文件删除
	deleteFile(file_path)
}

//将一个lib文件的内容替换为新的内容
function changeLibFile(file_name,type,new_lib){
	//生成对应的路径
	const dir_path = getLibDirPath(type)
	var file_path = path.join(dir_path,file_name)
	//将json内容存进对应的文件中
	changeFile(file_path,new_lib,"object_lib")
}
//将一个文件导入指定type的lib文件夹中
async function insertLibFile(type){
	var dir_path = getLibDirPath(type)
	var new_file = await insertFile("object_lib",dir_path)
	if(new_file){
		return new_file
	}
}
//将一个collection导出为lib文件
async function exportLibFile(type,file_name){
	var dir_path = getLibDirPath(type)
	var file_path = path.join(dir_path,file_name)
	var result = await exportFile("object_lib",file_path)
	return result
}