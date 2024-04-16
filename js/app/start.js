
$(document).ready(function(){
	//先读取快捷使用lib
	loadObjectLibDirectory("quickUse_lib","quickUse")
	//然后读取默认lib文件夹
	loadObjectLibDirectory("default_lib","default")
	//读取本地的自定义lib文件夹
	loadObjectLibDirectory("customize_lib","customize")
	//修改保存提示状态图
	changeSaveReminder("saved")
	//开局默认为样式模式
	changeModel("design")
	//开局默认切换为auto主题
	toggleAppTheme("auto")
	//读取log文件
	readFileLog()
})
