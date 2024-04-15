//撤销栈，保存元素的修改前的状态
var undo_stack = []
//重做栈
var redo_stack = []

function return_undo_length(){
	return undo_stack.length
}

function return_redo_length(){

}

// 将一个元素修改前的状态保存进栈
// 将当前指针指向的位置替换为新状态，然后指针向后移1位
function pushToUndo(dom,type,undo_data){
	changeSaveReminder("unsave")
	if(undo_data == undefined){
		//制造元素的此时的状态数据
		var huabu = $(dom).parents(".huabu")
		var target = $(dom).attr("id")

		if($(dom).is(".huabu")){
			var target_type = "huabu"
			var huabu = dom
		}
		else if($(dom).is(".tile")){
			var target_type = "tile"
		}
		else if($(dom).is(".composite")){
			var target_type = "composite"
		}
		else if($(dom).is(".line")){
			return true
		}
		else {
			console.log("传入对象的类型有误："+dom)
		}

		//普通的样式修改
		if(type == undefined){
			//保存对象此时的json
			var state = null
			var state_info = objectToState(dom,target_type)
		}
		//如果这个元素即将被创建,则保存为create
		else if(type == "create"){
			//保存“create”和元素的完整json
			var state  = "create"
			var state_info = objectToState(dom,target_type,"all")
		}
		//如果这个元素即将被删除,则并标识为delete
		else if(type == "delete"){
			//保存dom的完整json，保存“delete"
			var state  = "delete"
			var state_info = objectToState(dom,target_type,"all")
		}

		//生成状态数据对
		var undo_data = {
			//对象所在的画布
			huabu: huabu,
			//对象的id
			target : target,
			//对象的类型
			target_type : target_type,
			//状态类型
			state:state,
			//状态信息
			state_info: state_info
		}
	}
	
	//undo栈的最大长度为20
	if(undo_stack.length >= 20){
		//移出第一个元素
		undo_stack.shift()
	}

	//将对应的状态数据保存进栈
	undo_stack.push(undo_data)
}

//撤回
function undo(){
	//若当前栈长度为0，则结束
	if(undo_stack.length == 0){
		console.log("撤销栈空了")
		return false
	}

	//获取其上一个状态
	var undo_data = undo_stack.pop()
	var huabu = undo_data["huabu"]
	var target = undo_data["target"]
	var target_type = undo_data["target_type"]
	var state = undo_data["state"]
	var state_info = undo_data["state_info"]
	
	//创建：即这个对象原本不存在，将其删除
	if(state == "create"){
		var dom = $("#" + target)
		//保存当前的json,重做则为重新创建
		var redo_info = objectToState(dom,target_type,"all")
		deleteObject(dom,null,"undo")
	}
	//删除
	else if(state == "delete"){
		//利用state_info中的数据重新生成这个对象
		var dom = stateToObject(state_info,null,target_type,"create")
		//放回画布
		objectIntoHuabu(dom,huabu,"file")
		focusingObject(dom)
		//保留重做对象,重做删除
		var redo_info = null
	}
	//普通的样式修改
	else{
		//获取修改对象
		var dom = $("#" + target)
		//保留重做对象，即保留修改前的样式
		var redo_info = objectToState(dom,target_type)
		//利用before中保存的json修改这个对象
		stateToObject(state_info,dom,target_type)
		focusingObject(dom)
	}

	//移动到画布
	changeHuabu(huabu)

	//生成重做数据
	redo_data = {
		huabu: huabu,
		target : target,
		target_type : target_type,
		state : state,
		state_info : redo_info
	}
	//塞进重做栈
	pushToRedo(undo_data,redo_data)
}


//加入重做栈
function pushToRedo(undo_data,redo_data){
	changeSaveReminder("unsave")
	//redo栈的最大长度为20
	if(redo_stack.length >= 20){
		//移出第一个元素
		redo_stack.shift()
	}
	//重做栈同时保留着两份数据
	var the_data = {
		undo:undo_data,
		redo:redo_data
	}
	//将对应的状态数据保存进栈
	redo_stack.push(the_data)
}

//重做
function redo(){
	//若重做栈为空
	if(redo_stack.length == 0){
		console.log("重做栈空了")
		return false
	}

	changeSaveReminder("unsave")

	//获取当前状态
	var the_data = redo_stack.pop()
	var redo_data = the_data["redo"]
	var undo_data = the_data["undo"]
	//将undo_data填装回去
	pushToUndo(null,null,undo_data)

	var state = redo_data["state"]
	var target = redo_data["target"]
	var state_info = redo_data["state_info"]
	var target_type = redo_data["target_type"]
	var huabu = redo_data["huabu"]
	
	//如果当前状态为创建,则将这次创建重做
	if(state == "create"){
		//利用保存着之前数据的state_info重新生成这个对象
		var dom = stateToObject(state_info,null,target_type,"create")
		//放回画布
		objectIntoHuabu(dom,huabu,"file")
		focusingObject(dom)
	}
	//如果挡墙状态为删除，则将这次删除重做
	else if(state == "delete"){
		var target = $("#" + target)
		$(target).remove()
	}
	//普通的样式修改
	else{
		//获取修改对象
		var dom = $("#" + target)
		//利用after中保存的json修改这个对象
		stateToObject(state_info,dom,target_type)
		focusingObject(dom)
	}

	//移动到画布
	changeHuabu(huabu)
}


//将object转化为状态json
//mode的值包括“delete”“create”和无
	function objectToState(object,object_type,mode){
		if(object_type == "line"){
			var state =  lineToState(object,mode)
		}
		else if(object_type == "tile"){
			var state = tileToState(object,mode)
		}
		else if(object_type == "composite"){
			var state = compositeToState(object,mode)
		}
		else if(object_type == "huabu"){
			var state = huabuToState(object)
		}
		return state
	}

	//磁贴状态
		function tileToState(tile,mode){
			// 只需保存样式即可，不会保存tiletext
			if(mode == undefined){
				var state = tileToJson(tile,"undo")
			}
			// 保存磁贴的所有属性，用来重新创建被删除的磁贴
			else if(mode == "all"){
				var state = tileToJson(tile,"file")
			}

			return state
		}

	//组合体状态
		function compositeToState(composite,mode){
			if(mode == undefined){
				var state = compositeToJson_2(composite)
			}
			//包含了子元素
			else if(mode == "all"){
				var state = compositeToJson_2(composite,"all")
			}

			//保存其颜色，在调用时改变其子元素的颜色！
			state["color"] = $(composite).attr("color")
			//保存其temp属性，这样就可以在组合/临时组合之间切换
			if($(composite).is(".temp_composite")){
				state["temp"] = true
			}
			else {
				state["temp"] = false
			}

			return state
		}
	//画布状态
		function huabuToState(huabu,mode){
			// 只需保存样式即可，不会保存元素内容
			var state = getHuabuState(huabu,"undo")
			return state
		}

	//线条状态
//读取state，并应用给对象，而不是用json创造新的对象
	function stateToObject(state,object,object_type,mode){
		if(object_type == "line"){
			var result = stateToLine(state,object,mode)
		}
		else if(object_type == "tile"){
			var result = stateToTile(state,object,mode)
		}
		else if(object_type == "composite"){
			var result = stateToComposite(state,object,mode)
		}
		else if(object_type == "huabu"){
			var result = stateToHuabu(state,object,mode)
		}

		return result
	}

	//将样式引用给磁贴
		function stateToTile(state,tile,mode){
			//直接应用属性进行修改
			if(mode == undefined){
				//css应用
				styleTileByType(tile,state)
				//属性和数据应用
				stateTileByType(tile,state)
			}
			//重新创建对应的磁贴并返回
			else if(mode == "create"){
				var new_tile = jsonToTile(state,"file")
				return new_tile
			}
		}

	//将样式应用给组合体
		function stateToComposite(state,composite,mode){
			//仅修改样式
			if(mode == undefined){
				$(composite).css(state.style)
				$(composite).attr("id",state.id)
				var prop = state.prop
				for(key in prop){
					$(composite).prop(key,prop[key])
				}
				//如果是临时组合体，则还要
			}
			else if(mode == "create"){
				//创建对应的组合体并返回
				var composite = jsonToComposite(state)
				$(composite).attr("id",state.id)
				return composite
			}
		}

	//应用给画布
		function stateToHuabu(state,huabu,mode){
			//直接应用属性进行修改
			if(mode == undefined){
				stateHuabu(huabu,state)
				createHuabuButton(huabu) 
				changeHuabu(huabu)
			}
			//重新创建对应的画布并返回
			else if(mode == "create"){
				//创建画布对象
				let huabu = $("<div></div>", {
					"class": "huabu",
					"scale": 1,
				})

				stateHuabu(huabu,state)

				//在画布container中生成这个画布对象
				$("#huabu_container").append(huabu);
				//启用这个画布
				useHuabu(huabu)

				changeHuabu(huabu)

				return huabu
			}
		}