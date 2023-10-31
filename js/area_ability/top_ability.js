//点击在右侧弹出子级菜单,但是不会使得其他菜单被屏蔽
$(".menu").on("click",".side_menu",function(event){
	event.stopPropagation();
	showChildMenu(this,"right","dblclick")
})
