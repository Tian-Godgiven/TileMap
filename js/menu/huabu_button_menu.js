//画布拷贝
$("#copy_huabu").on("click",function(){
	copyHuabu(return_focusing_huabu())
})

//画布重命名
$("#rename_huabu").on("click",function(){
	renameHuabu(return_focusing_huabu())
})

//画布删除
$("#delete_huabu").on("click",function(){
	deleteHuabu(return_focusing_huabu())
})
