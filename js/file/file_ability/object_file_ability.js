//由于object对象都是以lib的内容物的形式存在，因此函数会以type作为对象，需要进一步导入进对应的lib文件中

//打开一个文件选择栏，导入一个object文件
async function insertObjectFile(){
	var file_type = "object"
	//打开文件选择框
	var file = await openFileSelectDialog(file_type)
	if(file){
		//获得object的内容
		var file_data = await getFileData(file.path,"object")
		if(file_data){
			//返回数据
			return file_data
		}
		else{
			return false
		}
	}
}
//将一个object导出为文件
async function exportObjectFile(type){
	var file_name = type["type"] + ".tilemap"
	//打开文件保存框，保存到指定位置
	var file = await openFileSaveDialog("object",file_name,type)
	if(file){
		return true
	}
	else{
		return false
	}

}