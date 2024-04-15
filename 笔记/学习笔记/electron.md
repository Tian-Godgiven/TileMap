	// 创建浏览窗口
	const mainWindow = new BrowserWindow({
		/*添加对渲染进程的node框架支持*/
		webPreferences: {
			nodeIntegration: true,
			contextIsolation:false
		},
	}

1.require未定义↑

2.使用上述设置后后概率导致jquery失效，在main.html调用所有js文件前加

<script>if (typeof module === 'object') {window.module = module; module = undefined;}</script>

在调用所有js文件后加

<script>if (window.module) module = window.module;</script>

3.快捷键的注册与注销，如果函数在渲染进程里面，则要用ipc通信

```
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile('index.html');

    // 注册全局快捷键
    globalShortcut.register('CommandOrControl+F', () => {
        mainWindow.webContents.send('save-shortcut-triggered');
    });
});


// 在应用程序关闭时取消注册所有全局快捷键
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

```

```
渲染进程：
 // 监听保存快捷键触发事件
ipcRenderer.on('save-shortcut-triggered', () => {
    // 在这里执行保存函数
    saveFunction();
});

// 在这里定义保存函数
function saveFunction() {
    // 实现你的保存逻辑
    console.log('执行保存函数');
}
```

