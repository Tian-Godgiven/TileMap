const { app, BrowserWindow, screen, ipcMain, nativeTheme , globalShortcut} = require('electron')
const { ipcRenderer } = require('electron');
const path = require('path');

require('./js/file/file_by_node.js');

module.exports.ipcRenderer = ipcRenderer;

//窗口定义，包含监听和快捷键
const createWindow = () => {
  	// 创建浏览窗口
      	const mainWindow = new BrowserWindow({
        	width: 800, // 窗口宽度
        	height: 600, // 窗口高度
    		autoHideMenuBar:true,//隐藏菜单栏
    	    icon: path.join(__dirname, '/img/icon_small.png'),
    		/*添加对渲染进程的node框架支持*/
    		webPreferences: {
    			nodeIntegration: true,
    			contextIsolation:false
    		},
      	})

    	mainWindow.setBackgroundColor("#ffffff")

    	// 加载 index.html
    	mainWindow.loadFile('main.html')

    	mainWindow.once('ready-to-show', () => {
        // 最大化
    		maxSizeScreenWindow(mainWindow)
    		// 打开开发者工具
      		mainWindow.webContents.openDevTools();
    	})

    //监听
        // 切换亮色or暗色主题
            ipcMain.handle('toggle_appTheme', () => {
                if (nativeTheme.shouldUseDarkColors) {
                    nativeTheme.themeSource = 'light'
                } 
                else {
                    nativeTheme.themeSource = 'dark'
                }
                return nativeTheme.shouldUseDarkColors
            })

        //打开开发者工具
            ipcMain.on('open_devTool', () => {
                mainWindow.webContents.openDevTools();
            });

        //在用户的默认浏览器打开一个链接
            ipcMain.on("open_link",(event,href)=>{
                require('electron').shell.openExternal(href);
            })
        //切换自动保存
            let saveInterval
            ipcMain.on('toggle_autoSave', (event,bool) => {
                if (bool) {
                    //清除之前的计时器，一次只有一个计时器
                    if(saveInterval){
                        clearInterval(saveInterval);
                    }
                    //新建计时器，启用自动保存，每隔5分钟执行一次保存函数
                    saveInterval = setInterval(() => {
                        mainWindow.webContents.send('keyboard_saveFile');
                    }, 1000 * 60 * 5); // 5分钟
                } 
                else {
                    // 禁用自动保存，清除保存定时器
                    clearInterval(saveInterval);
                }
            });
    //注册快捷键
        //ctrl+S保存工程文件
            globalShortcut.register('CommandOrControl+S', () => {
                if (mainWindow.isFocused()) {
                    mainWindow.webContents.send('keyboard_saveFile');
                }
            });
        //ctrl+F搜索

        //ctrl+
}

app.whenReady().then(() => {
  	createWindow()
})

// 在应用程序关闭时取消注册所有全局快捷键
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
// 关闭
app.on('window-all-closed', () => {
  	if (process.platform !== 'darwin') app.quit()
})





//主进程功能函数

  //将目标Win修改为最大化并显示
  function maxSizeScreenWindow(mainWindow){
      mainWindow.maximize(true);
      mainWindow.show();
  }
  //将目标Win修改为全屏并显示
  function fullScreeWindow(mainWindow){
    //备忘录
      mainWindow.maximize(true);
      mainWindow.show();
  }