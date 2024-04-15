//快捷键，监听来自主进程的快捷键指令，并调用渲染进程中的函数

//快捷保存
ipcRenderer.on("keyboard_saveFile",()=>{
	saveTilemapFile()
})