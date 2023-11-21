

/*修改子菜单的显示 ：
	若剪贴板没有内容，则令“粘贴”键停用，
	若撤销指针没有内容，则令“撤回”键停用
	若重做指针没有内容，则令“重做”键停用
	若没有上一层画布，则令“返回上一层画布”键停用
*/
function changeHuabuMenu(){
	var menu = $("#huabu_menu")
	//判断剪贴板中的是否存在内容，如果不存在则将其disabled
	var clipboard = popClipboard()
	if(clipboard == undefined){
		menu.children('#huabu_paste_here').addClass('disabled')
	}
	else{
		menu.children('#huabu_paste_here').removeClass("disabled")
	}
	//判断撤销指针是否存在内容，如果不存在则将其disabled

}

//粘贴功能，将当前剪贴板上的内容放到鼠标所在的位置
$("#huabu_menu #huabu_paste_here").on("click",function(event){
	var temp = popClipboard()
	//如果是一个div对象，则将其放在鼠标所在的位置
	if($(temp).is("div")){
		$(focusing_huabu).children(".object_container").append(temp)
		$(temp).offset({
			left:event.clientX - 20,
			top:event.clientY - 20
		})
		//为这个对象赋予其对应的功能并令其失去聚焦
		abilityDom(temp)
		unfocusingDom(temp)
	}
	else if($(temp))
	hideHuabuMenu("huabu_menu")
})

//撤回功能，将画布恢复为撤回队列的上一个状态
$("#huabu_menu #huabu_undo").on("click",function(){
	console.log("撤回了")
})

//重做功能，将画布恢复为撤回队列的下一个状态
$("#huabu_menu #huabu_redo").on("click",function(){
	console.log("重做了")
})

//插入功能，当移动到“插入”选项时在右侧弹出子菜单
$("#huabu_menu #huabu_insert").on("mouseenter click",function(){
	showChildMenu(this,"right","dblclick","mouseleave")
})
//插入表格功能
$("#huabu_menu #huabu_insert_table").on("click",function(){
	console.log("插入了画布")
})
//插入图片功能
$("#huabu_menu #huabu_insert_picture").on("click",function(){
	console.log("插入了图片")
})
//插入链接功能
$("#huabu_menu #huabu_insert_link").on("click",function(){
	console.log("插入了链接")
})

//全选功能，将当前画布内的所有元素选中生成一个选中体
$("#huabu_menu #huabu_select_all").on("click",function(){
	var huabu = focusing_huabu
	$(huabu).children(".object_container").children().addClass('ui-selected')
	createComposite($(huabu).find('.ui-selected'),"select")
	hideHuabuMenu("huabu_menu")
})

//清空功能，将当前画布内的所有元素删除，但是会有一个提示框
$("#huabu_menu #huabu_delete_all").on("click",function(){
	var huabu = focusing_huabu
	//弹出选项框
	swal.fire({
		width: 400,
		backdrop: 'rgba(0,0,0,0.3)',
		html: '<div id="delete_alert">确认清空画布上的所有内容？',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: '确认',
		cancelButtonText: '取消'
	}).then((result) => {
		if (result.isConfirmed) {
			//清空huabu内的object_container就行了
			$(huabu).children(".object_container").empty()
			hideHuabuMenu("huabu_menu")
		}
	})
})