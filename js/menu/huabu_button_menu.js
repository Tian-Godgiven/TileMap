//创建画布拷贝，本质上是加载/读取一个已经存在的画布，创建新的画布
$("#copy_huabu").mousedown(function() {
	//获取当前聚焦画布的名称
	var huabu = return_focusing_huabu()
	var huabu_name = $(huabu).attr("name")
	var clone_name = huabu_name + "的副本"
	var clone_num = 1
	
	//为了防止创建同一个画布的多个副本重名，为拷贝产生的副本进行重命名，重命名规则如下：
	//对一个“画布A”的拷贝，明明为"画布A的副本"，对其令一个拷贝，命名为“画布A的副本(2)”
	$("#huabu_container").find(".huabu").each(function(){
		while($(this).attr("name") == clone_name){
			clone_name = huabu_name + "的副本(" + clone_num + ")"
			clone_num += 1 
		}
	})

	clone_huabu = $(huabu).clone(true)
	$(clone_huabu).attr("name",clone_name)

	loadHuabu(clone_huabu)
})

//画布重命名按键与弹窗
$("#rename_huabu").mousedown(function() {
	var huabu = return_focusing_huabu()
	swal.fire({
		width: 600,
		backdrop: 'rgba(0,0,0,0.3)',
		html: '<div id="rename_alert">重命名：<input id="rename_input" value="' + $(huabu).attr("name") + '"></input></div>',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: '确认',
		cancelButtonText: '取消'
	}).then((result) => {
		if (result.isConfirmed) {
			renameHuabu(huabu)
		}
	})
})

//画布重命名函数
function renameHuabu(huabu) {
	//获取重命名画布和他的按钮
	let button = $("#" + $(huabu).attr("id") +"_button")
	//根据输入值修改画布和按钮的id，以及按钮显示的内容
	var newname = $("#rename_input").val()
	$(huabu).attr("name", newname)
	$(button).html(newname)
}

//画布删除按键与子菜单
$("#delete_huabu").mousedown(function() {
	var huabu = return_focusing_huabu()
	swal.fire({
		width: 400,
		backdrop: 'rgba(0,0,0,0.3)',
		html: '<div id="delete_alert">确认删除画布：' + $(huabu).attr("name") + ' 吗？</div>',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: '确认',
		cancelButtonText: '取消'
	}).then((result) => {
		if (result.isConfirmed) {
			deleteHuabu(huabu)
		}
	})
})
//画布删除函数,将会删除指定画布与对应的按钮
function deleteHuabu(huabu) {
	var button = $("#" + $(huabu).attr("id") +"_button")
 
	$(huabu).remove()
	$(button).remove()
}