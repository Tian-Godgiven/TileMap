//显示当前工程文件名称
function showFileName(file_name){
	var file_name = file_name.replace(".tilemap","")
	$("#topArea_fileName span").text(file_name)
}

//点击工程文件名弹出打开or新建选项
$("#topArea_fileName span").on("click",function(){
	//如果当前没有文件则是新建
	if(return_focusing_tilemap() == null){
		createTilemapFile().then(file=>{
			if(file){
				//加载
				loadTilemapFile(file)
			}	
		})
	}
	//如果有了，则先保存之前当前画布，再打开新的画布
	else{
		saveTilemapFile().then(bool=>{
			if(bool){
				openTilemapFile()
			}
		})
		
	}
})





