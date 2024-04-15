//加载指定lib文件夹中的所有文件,并在左侧栏创建对应的collection容器，并加载对应的内容
function loadObjectLibDirectory(directory_name,type){
	//路径
	var path = "../object_lib/" + directory_name
	//变为绝对路径
	getFileNameAndPath(path).then(dir=>{
		var dir_path = dir.path
		//读取这个lib文件夹的文件名，得到一个文件名列表
		getDirectoryFileName(dir_path)
		.then(name_list => {
			//遍历文件名
			for(i in name_list){
				var file = {name : name_list[i] , path :dir_path + "/" + name_list[i]} 
				//在左侧创建对应lib文件的菜单
				createObjectCollection(file,type)
			}
		})
		.catch(error=>{
			console.log(error)
		})
	})
}

//读取一个lib库中的一个lib文件，并将其中的内容返回
function readLibFile(file_path, type , callback){
	
}

//创建一个lib文件,文件名默认与用户对集合的命名相同，重名再做调整
async function createLibFile(collection_name,type,file_content){
	//过程中可能会重命名
	if(file_content == null){
		var file_content = {
						collection_name : collection_name,
						collection_objects : [] 
					}
	}

	var file_path = "../object_lib/" + type + "_lib/" + collection_name + ".tilemap"
	//获得名称+绝对路径的file
	var file = await getFileNameAndPath(file_path)
	var new_file = await createFile(file,file_content,"object_lib")

	return new_file
}
//删除一个lib文件
function deleteLibFile(file_name,type){
	//生成对应的路径
	var path = "../object_lib/"+ type + "_lib/"+ file_name
	//将对应的文件删除
	deleteFile(path)
}

//将一个lib文件的内容替换为新的内容
function changeLibFile(file_name,type,new_lib){
	//生成对应的路径
	var path = "../object_lib/"+ type + "_lib/" + file_name
	//获得绝对路径
	getFileNameAndPath(path).then(file=>{
		//将json内容存进对应的文件中
		changeFile(file.path,new_lib,"object_lib")
	})
	
}
//将一个文件导入指定type的lib文件夹中
async function insertLibFile(type){
	var url = "../object_lib/"+type+"_lib/"
	var new_file = await insertFile("object_lib",url)
	if(new_file){
		return new_file
	}
}
//将一个collection导出为lib文件
async function exportLibFile(type,file_name){
	var url = "../object_lib/"+type+"_lib/"+file_name
	var result = await exportFile("object_lib",url)
	return result
}