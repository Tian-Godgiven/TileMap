//通過node.js的fs對文件進行管理，通过ipcrender与file_ipc.js通信
const { app, BrowserWindow , dialog} = require('electron');
const fs = require('fs');
const path = require('path');
const ipcMain = require('electron').ipcMain;
const imageSize = require('image-size')

//软件数据地址
let appDir = __dirname;
// if (process.mainModule.filename.indexOf('app.asar') !== -1) {
//     // 如果处于 asar 打包模式下，需要调整路径
//     appDir = path.dirname(process.mainModule.filename);
// }

//创建文件时，确保其文件名不重复，若重复则加数字后缀
function getUniqueFileName(directory_path, fileName) {
    let newFileName = fileName;
    let index = 1;
    while (fs.existsSync(path.join(directory_path, newFileName))) {
        newFileName = `${path.parse(fileName).name}_${index}${path.extname(fileName)}`;
        index++;
    }
    //返回新的路径
    var newFilePath = path.join(directory_path, newFileName)
    return { name:newFileName,path:newFilePath }
}

//创建app文件时，根据其类型，加上不同的类型和文件头，并返回
//app文件一共有3种类型，tilemap工程文件，object对象文件, object_lib集合文件
function createAppFile(file_data,file_type){
    //文件头
    file_head = {
        app:"tilemap",
        app_version : "1.0.0",//备忘：应用版本号
        create_time: new Date(),
        github:"https://github.com/Tian-Godgiven/TileMap",
    }
    //生成完整的文件
    file = {
        file_head:file_head,
        file_type:file_type,
        file_data:file_data
    }

    //将这个内容变成json字符串
    var file_json = JSON.stringify(file, null, 2)

    return file_json
}

//读取app文件时，检查其文件头，并返回文件的{data:实际内容,type:文件类型}
//如果传入了file_type，则还会检查文件类型，并返回文件的data
function checkAppFile(file,type){

    //将文件变回json
    var file = JSON.parse(file)

    if(type != null){
        //备忘：文件头的检查,如果格式不对则报错
        var file_head = file.file_head
        if(file_head == undefined || file_head["app"] != "tilemap"){
             dialog.showErrorBox('Error', `文件错误或文件内容损坏！`);
        }
        else{
            const file_type = file.file_type
            const file_data = file.file_data
            
            if(file_type != type){
                dialog.showErrorBox('Error', `文件不正确！可能是选择了错误的文件或文件内容损坏！`);
                return false
            }
            else{
                return file_data
            }
        }
    }
    else{
        dialog.showErrorBox('Error', `非内部的读取方式！`);
        return false
    }
}


//渲染进程监听器
app.on('ready', () => {

    //传入一个相对该文件的路径，返回绝对路径和文件名
    ipcMain.on('get_fileNameAndPath', (event, file_path)=>{
        var file_path = path.join(__dirname,file_path)
        var file_name = path.basename(file_path);
        event.returnValue = {path:file_path,name:file_name}
    })

    // 获得指定路径文件夹下的所有文件的文件名,返回一个文件名列表
    ipcMain.on('get_DirectoryFileName', (event, directory_path) => {
        fs.readdir(directory_path, (err, files) => {
            if (err) {console.error('Error reading dir:', err);return;}

            try {
                // 发送文件名列表给渲染进程
                event.returnValue = files;
            } 
            catch (error) {
                console.error('Error:', error);
            }
            
        });
    });

    // 修改指定路径app文件的内容，用New_data覆盖它
    ipcMain.on('change_file', (event,file_path,new_data,file_type) => {
        // 读取文件
        fs.readFile(file_path, 'utf8', (err, data) => {
            if (err) {console.error('Error reading file:', err);return;}
            try {
                // 将传入数据转化为文件，并覆盖原有的内容
                const file = createAppFile(new_data,file_type)

                fs.writeFile(file_path, file, 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        return;
                    }
                });
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        });
    });

    // 读取指定文件，要求绝对路径和文件类型，返回对应文件的data
    ipcMain.on('get_fileData', (event,file_path,file_type)=>{
        fs.readFile(file_path, 'utf8', (err, data) => {
            if (err) {
                console.error(err)
                event.returnValue = false
            } 
            else {
                // 如果成功读取文件，则检查文件内容
                var file_data = checkAppFile(data,file_type)
                if(file_data){
                    event.returnValue = file_data
                }
                else{
                    event.returnValue = false
                }
            }
        });
    })

    // 创建一个指定文件，并且不会重名，加入指定内容
    ipcMain.on('create_file', (event,file,file_content,file_type)=>{
        var file_name = file.name
        var file_path = file.path
        // 获得文件夹路径
        const Directory_path = path.dirname(file_path);
        // 确保不重名
        const new_file = getUniqueFileName(Directory_path,file_name)
        // 加上文件头
        const appfile = createAppFile(file_content,file_type)
        fs.writeFile(new_file.path,appfile,'utf8',(err)=>{
            if(err){
                console.error('Error writing file:',err)
                return false
            }
        })
        // 发送这个新名字给渲染进程
        event.returnValue = new_file;
    })

    //创建一个文件副本，用于导入或导出文件
    //将【包含名字和路径的file所对应的文件】复制一份到【指定的路径】下并返回新文件的路径
    //因为这个文件在创建时就有文件头，所以复制产物也是有文件头的，所以不用进行文件头管理
    ipcMain.on('create_file_copy', (event,file,new_file,directory_path)=>{
        var File_path = file.path
        
        //如果没有指定new_file的信息,则用原file的信息来创建new_file
        if(new_file == null){
            //构建到文件夹的路径
            var Directory_path = path.join(appDir,directory_path)
                Directory_path = path.normalize(Directory_path)
            // 用独一化的file_name构建对应的文件
            var File_name = file.name
            var new_file = getUniqueFileName(Directory_path,file.name)
        }

        var new_File_name = new_file.name
        var new_File_path = new_file.path

        // 创建源文件的可读流和新文件的可写流
        const readStream = fs.createReadStream(File_path);
        const writeStream = fs.createWriteStream(new_File_path);

        //将内容copy过去
        readStream.pipe(writeStream);
        readStream.on('end', () => {
            //返回新文件的名称与路径
            event.returnValue = {name:new_File_name,path:new_File_path}
        });
        readStream.on('error', (err) => {
            console.error('Error copying file:', err);
        });
    })

    //删除指定路径的文件
    ipcMain.on('delete_file', (event,file_path) => {
        // 删除文件
        fs.unlink(file_path, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
            return;
          }
        });
    });

    //打开一个“选择文件框”，限制选择文件的种类，并返回选择的文件对象的名称+路径
    ipcMain.on('open_fileSelectDialog', (event,type_name,file_type)=>{
        dialog.showOpenDialog({
            properties: ['openFile'],
            filters:[
                    {name:type_name,extensions:file_type}
                ]
        }).then(result => {
            // 用户选择的文件路径
            const filePaths = result.filePaths;
            if (filePaths && filePaths.length > 0) {
                // 获取文件名
                const fileName = path.basename(filePaths[0]);
                // 将文件路径和文件名一起返回
                event.returnValue = { name: fileName , path: filePaths[0] };
            } 
            else {
                event.returnValue = false;
            }
        }).catch(err => {
            console.error('Failed to open dialog', err);
            event.returnValue = false;
        });
    })

    //打开一个【保存文件框】，提示用户保存指定的文件，并返回用户用户选择的文件路径
    //要求：默认文件名，文件类型限制名，文件限制类型
    //另外，如果指定file_content，则会直接在该处生成拥有指定file_content的文件
    ipcMain.on('open_fileSaveDialog', (event,file_name,file_type,file_content,save_name,save_type)=>{
        dialog.showSaveDialog({
            defaultPath:file_name,
            filters:[
                    {name:save_name,extensions:save_type}
                ]
        }).then(result => {
            if (!result.canceled) {
                const file_path = result.filePath;
                const file_name = path.basename(file_path)

                //如果file_content不为空，则还要往这个文件中写入内容
                if(file_content != null){
                    //加上文件头
                    var appFile = createAppFile(file_content,file_type)
                    //写入内容
                    fs.writeFile(file_path, appFile, (err) => {
                        if (err) {
                            console.error('文件写入错误:', err);
                        } 
                        else {
                            event.returnValue = { name: file_name , path: file_path };
                        }
                    });
                }
            } 
            else {
                event.returnValue = false;
                console.log('用户取消了保存操作.');
            }
        }).catch(err => {
            console.error('Failed to open dialog', err);
            event.returnValue = false;
        });
    })

    //打开一个保存文件框，令用户选择路径，在这个路径下创建一个文件夹，并返回这个文件夹的路径
    ipcMain.on('create_fileDir', async (event, dir_name) => {
        // 打开保存对话框，让用户选择保存路径
        dialog.showSaveDialog({
            defaultPath:dir_name,
            properties: ['createDirectory']
        }).then(result => {
            if (!result.canceled) {
                // 获取文件夹路径
                const dir_path =  result.filePath
                // 检查文件夹是否已存在，如果不存在则创建文件夹
                if (!fs.existsSync(dir_path)) {
                    try {
                        fs.mkdirSync(dir_path);
                        event.returnValue = dir_path
                    } 
                    catch (error) {
                        console.log('folder_selected', false, error.message);
                        event.returnValue = false;
                    }
                } 
                else {
                    console.log("123")
                    event.returnValue = dir_path
                }
            } 
            else {
                event.returnValue = false;
                console.log('用户取消了保存操作.');
            }
        }).catch(err => {
            console.error('Failed to open dialog', err);
            event.returnValue = false;
        });
    });

    //将指定的【本地绝对路径】的图片文件转换为base64并返回
    ipcMain.on('get_img_file_base64', (event,file_path)=>{
        fs.readFile(file_path, (err, data) => {
            if (err) {
                console.error('Failed to read the file', err);
                return;
            }

            // 将图片数据转换为 base64 编码
            const base64_image = Buffer.from(data).toString('base64');

            event.returnValue = base64_image
        });
    })

    //将一个base64字符串保存为一个png文件，注意这个base64是没有前缀的
    ipcMain.on('save_base64ToPng', (event, file_path, base64) => {
        // 将base64数据解码为二进制数据
        const buffer = Buffer.from(base64, 'base64');

        //在生成多个画布对象是，不能有重名覆盖
        const dir_path = path.dirname(file_path);
        const file_name = path.basename(file_path);
        const new_file = getUniqueFileName(dir_path,file_name)

        file_path = new_file.path

        // 将二进制数据写入文件
        fs.writeFile(file_path, buffer, (err) => {
            if (err) {
                event.returnValue = false
            } else {
                event.returnValue = true
            }
        });
    });

    //返回一个base64图片的文件信息
    ipcMain.on("get_base64Information",(event,base64)=>{
        // 解码Base64字符串
        const buffer = Buffer.from(base64, 'base64');
        // 获取临时文件夹的路径（tilemap/data/temp）
        var tempDir = path.join(appDir, '../../data/temp');
            tempDir = path.normalize(tempDir);

        // 确保临时文件夹存在，如果不存在则创建
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true }); 
        }

        // 设置临时文件路径
        const tempFilePath = path.join(tempDir, 'tempImage.png');

        // 将文件写入临时文件
        fs.writeFileSync(tempFilePath, buffer);

        // 获取图像尺寸
        const dimensions = imageSize(tempFilePath);
        // 获取图像文件大小
        const stats = fs.statSync(tempFilePath);
        const fileSizeInBytes = stats.size;

        // 删除临时文件
        fs.unlinkSync(tempFilePath);

        // 返回图像信息
        event.returnValue = {
            width: dimensions.width,
            height: dimensions.height,
            fileSize: fileSizeInBytes
        };
    })

});
