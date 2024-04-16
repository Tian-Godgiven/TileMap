// //快捷键，监听来自主进程的快捷键指令，并调用渲染进程中的函数
// const { screen } = require('electron');

$(document).ready(function(){
    // 监听键盘按下事件
    $(document).keydown(function(event){
        // 检查是否按下了Ctrl键
        if (event.ctrlKey) {
            // 根据按下的键码执行相应操作
            switch (event.which) {
            	// 新建文件 ctrl+n
            	case 78:
            		createTilemapFile().then(file=>{
            			if(file){
            				loadTilemapFile(file)
            			}
					})
					break
                // 打开文件：Ctrl+O 或者 Ctrl+o
                case 79:
                case 111:
                    openTilemapFile()
                    break;
                // 保存文件：Ctrl+S 或者 Ctrl+s
                case 83:
                case 115:
                    saveTilemapFile();
                    break;
                // 撤销：Ctrl+Z 或者 Ctrl+z
                case 90:
                case 122:
                    undo();
                    break;
                // 重做：Ctrl+Y 或者 Ctrl+y
                case 89:
                case 121:
                    redo();
                    break;
                // 剪切：Ctrl+X 或者 Ctrl+x
                case 88:
                case 120:
                    copyFocusingObject();
                    deleteFocusingObject();
                    break;
                // 复制：Ctrl+C 或者 Ctrl+c
                case 67:
                case 99:
                    copyFocusingObject();
                    break;
                // 粘贴：Ctrl+V 或者 Ctrl+v
                case 86:
                case 118:
                    pasteObject();
                    break;
                // 删除：Ctrl+D 或者 Ctrl+d
                case 68:
                case 100:
                    deleteFocusingObject();
                    break;
                // 搜索：Ctrl+F 或者 Ctrl+f
                case 70:
                case 102:
                    showSearchMenu();
                    break;
                // 全选：Ctrl+A 或者 Ctrl+a
                case 65:
                case 97:
                    selectHuabuAll();
                    break;
                // 连线模式：Ctrl+L
                case 76:
                    toggleConnectMode();
                    break;
                default:
                    break;
            }
        }
    });
});


