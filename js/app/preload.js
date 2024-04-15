/*预加载的【主进程】文件！*/
const { ipcRenderer , remote } = require('electron')

//切换深色和浅色模式
function toggleAppTheme(){
  	ipcRenderer.invoke('toggle_appTheme')
}

//打开开发者工具
function openDevTool(){
	ipcRenderer.send('open_devTool')
}

//在浏览器中打开一个链接
function openLink(href){
	ipcRenderer.send('open_link', href);
}

