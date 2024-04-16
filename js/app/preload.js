/*预加载的【主进程】文件！*/
const { ipcRenderer , remote } = require('electron')

//切换深色和浅色模式
async function toggleAppTheme(theme){
  	var should_dark = await ipcRenderer.invoke('toggle_appTheme',theme)
  	//意思是现在是否是深色模式
  	if(should_dark){
  		$("#topAbility_toggleTheme").addClass("dark_mode").removeClass("light_mode")
  	}
  	else{
  		$("#topAbility_toggleTheme").addClass("light_mode").removeClass("dark_mode")
  	}
  	
  	//切换深色/亮色选项
  	$("#topAbility_changeAppTheme > div").removeClass("selected")
  	$("#topAbility_changeAppTheme > div[value = "+theme+"]").addClass("11selected")
}

//打开开发者工具
function openDevTool(){
	ipcRenderer.send('open_devTool')
}

//在浏览器中打开一个链接
function openLink(href){
	ipcRenderer.send('open_link', href);
}

//切换全屏模式
function toggleFullScreen(){
  	ipcRenderer.send('toggle_fullScreen')
}

//读取指定的log文件
async function readLog(log_name){
    //log文件的路径
    var path = "../../data/applog/" + log_name + ".txt"
    var file = await getFileNameAndPath(path)
    //使用这个url获取对应log文件的内容
    var file_data = await getFileData(file.path,"log")
            
    return file_data
}

//将新数据保存进log文件夹
async function saveLog(log_name,new_data){
    var path = "../../data/applog/" + log_name + ".txt"
    var file = await getFileNameAndPath(path)
    //修改对应Log文件的内容
    changeFile(file.path,new_data,"log")
}