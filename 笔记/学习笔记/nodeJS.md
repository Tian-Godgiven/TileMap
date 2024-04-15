path

join路径中，相对路径使用   ../    而不是    ././    来表示当前目录的上一层目录

路径中含有中文：

        var Path = path.join(__dirname,file_path);
            Path = path.normalize(Path)





ipc通信：

​     

在主进程通信服务端使用

```
 event.reply('variableValue',file_path);
```

在渲染进程中使用

```
ipcRenderer.on('variableValue', (event, arg) => {
  	console.log(arg); // 输出变量值
});
```

以此进行变量在console中的打印