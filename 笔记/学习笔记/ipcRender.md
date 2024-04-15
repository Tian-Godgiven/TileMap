https://blog.csdn.net/qq_39448719/article/details/123081213

主进程回复给渲染进程：invoke通过return，reply监听

这些都是异步的！

只有这个是同步返回：
1.主进程：on()，设置event.returnValue = 要返回的值;
2.渲染进程：

```
ipcRenderer.sendSync('主进程ipc名', 变量);
```

也就是sync（同步）send

------

只有main.js的主进程可以向渲染进程通信，其他地方的主进程不可以！