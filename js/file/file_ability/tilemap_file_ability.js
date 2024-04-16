//当前打开的工程文件
var focusing_tilemap = null
var focusing_tilemap_information

function return_focusing_tilemap(){
	return focusing_tilemap
}

//工程文件是整个软件核心，其中存储着画布对象，再存储着画布内对象
//工程文件的结构为：
	// {
	// 	tilemap : {
	// 		name：工程文件名，
	// 		information:工程文件信息，
	// 		huabus：[
	// 			{
	// 				name:
	// 				css:
	// 				huabu_object:[
	// 					{
	// 						object_type:对象类型,
	// 						object_inner:对象内容
	// 					},
	// 					{
	// 						其他对象
	// 					}
	// 				]
	// 			},
	// 			{
	// 				其他画布
	// 			}
	// 		]
	// 	}
	// }

//通过文件保存框，新建一个工程文件
async function createTilemapFile(huabus_json){
	//创建一个新的工程文件的json内容
	var tilemap_json = createTilemapFileJson()

	if(huabus_json != null){
		tilemap_json["tilemap"]["huabus"] = huabus_json
	}

	//打开文件保存框，返回一个file，包含文件名和路径
	var file = openFileSaveDialog("tilemap","未命名工程文件.tilemap",tilemap_json)
	if(file){
		return file
	}
	else{
		return false
	}
}

//通过输入的文件名，新建一个工程文件对象的json内容
function createTilemapFileJson(information){
	if(information == null){
		information = ""
	}
	var new_tilemap_json = {
		"tilemap" : {
			"information":information,
			"huabus":[
			]
		}
	}

	return new_tilemap_json
}


//打开一个tilemap工程文件，然后读取
function openTilemapFile(){
	//打开一个文件选择框
	openFileSelectDialog("tilemap")
	.then(file=>{
		if(file){
			//清空huabu
			changeHuabu(null)
			//加载这个文件
			loadTilemapFile(file)
		}
	})
}

//关闭当前tilemap工程文件，先将其保存
function closeTilemapFile(){
	//先保存它
	saveTilemapFile()
	.then(a=>{
		if(a){
			//清空画布
			clearHuabuContainer()
			//当前聚焦为0
			focusing_tilemap = null
			//改变名字
			showFileName("点此新建工程文件")
			//关闭自动保存
			toggleAutoSave(false)
		}
	})
}


//读取工程文件，将其中的画布读取出来，如果其中没有画布，那么会在该文件下创建一个画布对象
//修改当前聚焦工程文件对象
async function loadTilemapFile(tilemap_file){
    try {
    	//清空当前画布内容
    	clearHuabuContainer()
    	//保存文件数据
    	saveFileLog(tilemap_file)
		//获得文件数据
        const file_data = await getFileData(tilemap_file.path,"tilemap");
        if(file_data){
            //获取其中的内容
            const tilemap_data = file_data["tilemap"]

            //修改当前聚焦的文件
            focusing_tilemap = tilemap_file
            focusing_tilemap_information = tilemap_data["information"]

            //首先同步当前显示的文件名
            showFileName(tilemap_file.name)

            //如果里面没有画布
            if(tilemap_data["huabus"].length <= 0){
                //弹窗提示创建新画布
                addNewHuabu()
            }
            //否则加载其中的画布,并移动到第一个画布页
            else{
                const huabus = tilemap_data["huabus"];
                for(const huabu of huabus){
                    await jsonToHuabu(huabu,"file");
                }
                //移动到第一个画布
                const first_huabu = $("#huabu_container").children(".huabu")[0];
                changeHuabu(first_huabu);
            }
            //打开自动读取
			toggleAutoSave(true)
        } 
        else {
            alert("读取工程文件失败，请确保文件内容没有出错！");
        }
    } 
    catch (error) {
        console.error("加载文件出错：", error);
    }
	
}


//保存当前聚焦中的工程文件
async function saveTilemapFile(){
	//获取当前画布container中的画布，转成json，存进当前文件中
	var huabus = []
	for(const huabu of $("#huabu_container").children(".huabu")) {
        var huabu_json = await huabuToJson(huabu,"file")
		huabus.push(huabu_json)
    }

	//如果当前没有打开的工程文件，则使用当前画布内的数据，生成一个新的文件
	if(focusing_tilemap == null){
		var file = await createTilemapFile(huabus)
		if(file){
			//随后打开这个新的文件
			showFileName(file.name)
			focusing_tilemap = file
		}
		
	}
	//否则修改当前的focusing_tilemap
	else{
		//生成文件
		var file_json = createTilemapFileJson(focusing_tilemap_information)
		//将画布内容填装进去
		file_json["tilemap"]["huabus"] = huabus
		//获取当前聚焦的工程文件的路径
		var file_path = focusing_tilemap.path
		//用新的文件内容修改原本的文件
		changeFile(file_path,file_json,"tilemap")
	}

	//修改保存提示的状态
	changeSaveReminder("saved")
	
	return true
}

//切换自动保存状态，在文件读取时自动开启
function toggleAutoSave(bool){
	//切换为自动保存状态
	if(bool){
		$("#topAbility_autoSave").addClass("autoSaving")
	}
	//取消自动保存状态
	else{
		$("#topAbility_autoSave").removeClass("autoSaving")
	}
	//向主进程发送请求
	toggleAutoSaveMode(bool)
}

//最近10次加载的工程文件
var recently_tilemaps = []

function return_recently_tilemaps(){
	return recently_tilemaps
}
//读取Log文件中保存的“上一次打开的工程文件”
function readFileLog(){
	readLog("file_log").then(data=>{
		recently_tilemaps = data
	})
}

//保存这一次打开的工程文件,最多保存10个，并且不会重复
function saveFileLog(file){
	//长度最多为10
	if(recently_tilemaps.length >= 10){
		recently_tilemaps.shift()
	}
	//不会重复判断的是路径而不是文件名
	for(var i = 0; i < recently_tilemaps.length; i++) {
	    if (recently_tilemaps[i].path === file.path) {
	        // 移除旧对象
	        recently_tilemaps.splice(i, 1);
	        break;
	    }
	}

	console.log(recently_tilemaps)

	// 将新对象添加到 recently_tilemaps 数组的末尾
	recently_tilemaps.push(file);
	//保存
	saveLog("file_log",recently_tilemaps)
}