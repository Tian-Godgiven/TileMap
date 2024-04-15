/*

本文档包含tile_text,即tile体所包含的文本内容的结构与功能
关于tile相关内容请参看：tile.js

*/

//创建一个与磁贴绑定的内容块元素
function createTextBlock(tile){
    //html内容
    var textblock = $("<div>\
                            <div class='textblock_bar'>\
                                <div class='textblock_title'></div>\
                                <div class='textblock_button'>\
                                    <div class='bindTile unbind' title='绑定切换'></div>\
                                    <div class='enternalShow' title='永久显示'></div>\
                                    <div class='enternalHide' title='永久隐藏'></div>\
                                </div>\
                            </div>\
                            <div class='textblock_content'></div>\
                        </div>")
    //属性
    var id = $(tile).attr("id") + "_textblock"
    $(textblock).attr({
        "id" : id,
        "class" : "textblock huabu_object",
        "state" : "normal",
    })
    $(textblock).append("<div class='center'></div>")
    var tile_title = $(tile).children(".tile_title").text()
    $(textblock).find(".textblock_title").text(tile_title)

    //与tlie相关联
    //将Id存进去
    $(tile).data("textblock",id)
    $(textblock).data("tile",$(tile).attr("id"))

    //功能
    $(textblock).resizable({
        autoHide:true,
        animate: false,
        animateEasing:"swing",
        handles:"n,e,s,w,se,sw,ne,nw",
        autoHide:true,
        stop:function(){
            //修改对应tile的textblock的size值
            $(tile).attr("textblock_width",$(this).width())
            $(tile).attr("textblock_height",$(this).height())
        }
    });
    
    return textblock
}

//改变内容块的标题
function changeTextBlockTitle(tile){
    var tile_title = $(tile).children(".tile_title").text()
    var textblock = $("#"+$(tile).data("textblock"))
    $(textblock).find(".textblock_title").text(tile_title)
}

//控制所有textblock显示
var all_textblock_showable = true
function changeAllTextBlockShowable(boal){
    all_textblock_showable = boal
}

//将对应的text内容以textblock的形式显示在tile旁边
//若boal为true,则为强制显示
function showTileTextblock(tile,boal){
    //如果全局禁止显示则返回false
    if(all_textblock_showable != true){
        return false
    }
    //如果这个tile的textblock设置为永久隐藏，则返回false
    if($(tile).attr("textblock_showState") == "enternalHide"  && boal != true){
        return false
    }

    var textblock_bind = $(tile).prop("textblock_bindState")

    //如果这个磁贴是绑定状态的
    if(textblock_bind){
        //如果这个tile已经显示了textblock，则先将其隐藏
        if($(tile).data("textblock") != null){
             hideTileTextblock(tile,true)
        }
        //创建并显示textblock
        var textblock = createTextBlock(tile)
        //获取tile所在的画布
        var huabu = $(tile).parents('.huabu')
        var textblock_container = $(huabu).find('.textblock_container')
        //创建与Tile相关的textblock,放入对应画布的text_container中
        $(textblock_container).append(textblock)
    }
    //如果是独立状态则令其显示
    else{
        $("#"+$(tile).data("textblock")).show()
        var textblock = $("#"+$(tile).data("textblock"))
    }
   

    //将Tile的内容放入对应的textblock中
    var tiletext = $(tile).data("tiletext")
    $(textblock).find(".textblock_content").html(tiletext)

    //根据tile的设置修改textblock的尺寸
    var block_width = $(tile).attr("textblock_width")
    var block_height = $(tile).attr("textblock_height")
    if(block_width != null){
        $(textblock).width(block_width)
    }
    if(block_height != null){
        $(textblock).height(block_height)
    }

    //若textblock绑定了tile，则根据tile的设置修改textblock的位置
    if(textblock_bind){
        setTextblockPosition(tile)
    }
    
    $(textblock).css({
        "z-index":$(tile).css("z-index")
    })
}

//隐藏textblock（用于一部分分离后固定显示的textblock的隐藏或者显示
//若boal传入true，则为强制隐藏
function hideTileTextblock(tile,boal){
    //如果tile的textblock状态为永久显示，则禁止隐藏
    if($(tile).attr("textblock_showState") == "enternalShow" && boal != true){
        return 1
    }
    else{
        //如果tile的textblock处于独立状态，且boal为真时令其隐藏
        if(!$(tile).prop("textblock_bindState") && boal){
            $("#"+$(tile).data("textblock")).hide()
        }
        //若不是独立状态，则令其消除
        else{
            //将指定Tile的textblock消除
            if($(tile).data("textblock") != null){
                $("#"+$(tile).data("textblock")).remove()
                $(tile).data("textblock",null)    
            }
        }
    }
}

//修改tile的textblock的显示模式
//type的值包括：0.normal普通状态，1.enternalShow永久显示，2.enternalHide永久隐藏
function setTileTextblockShowState(tile, type) {
    if (["normal", "enternalHide", "enternalShow"].includes(type)) {
        $(tile).attr("textblock_showState", type);
        if(type == "enternalShow"){
            showTileTextblock(tile,true)
        }
        else if(type == "enternalHide"){
            hideTileTextblock(tile,true)
        }
    }
}

//修改tile的textblock的绑定方式
function setTileTextblockBindState(tile,bool){
    if([true,false].includes(bool)){
        //若为绑定，则令textblock与tile绑定
        if(bool){
            bindTextblock(tile)
        }
        //否则令其解绑
        else{
            escapeTextblock(tile)
        }
    }
}

//令tile的textblock与其绑定，其会根据设置显示在tile周围，并随着tile的移动而隐藏/显示，其无法被拖拽
function bindTextblock(tile){
    var textblock = $("#"+$(tile).data("textblock"))
    //无法自由移动
    $(textblock).draggable("destroy")
    $(textblock).find(".bindTile").toggleClass('unbind bind')
    //修改属性值
    $(tile).prop("textblock_bindState",true)
    //回到tile身边
    showTileTextblock(tile)
}

//令tile对应的textblock脱离tile，其将会在点击tile后显示，并保持显示，直到点击x关闭
//其可以自由移动，其内容仍然与tile同步
function escapeTextblock(tile){
    //如果tile当前没有显示textblock，则先令textblock显示
    var textblock = $("#"+$(tile).data("textblock"))
    if(textblock == null){
        showTileTextblock(tile,true)
        textblock = $("#"+$(tile).data("textblock"))
    }
    //可以自由移动
    $(textblock).draggable()
    $(textblock).find(".bindTile").toggleClass('unbind bind')
    //修改属性值
    $(tile).prop("textblock_bindState",false)
    //如果此时显示设置为永久隐藏，则令其hide
    if($(tile).attr("textblock_showState") == "enternalHide"){
        hideTileTextblock(tile,true)
    }
}


//根据垂直和水平两个方向的值，修改textblock的位置
function setTextblockPosition(tile){
    var textblock = $("#"+$(tile).data("textblock"))

    var vertical = $(tile).attr("textblock_vertical")
    if(vertical == null){
        vertical = "center"
    }
    var horizontal = $(tile).attr("textblock_horizontal")
    if(horizontal == null){
        horizontal = "right"
    }

    //获取当前磁贴所在的画布中的container
    var container = $(tile).parents(".object_container")
    //获取当前tile的位置与尺寸
    var tile_position = positionAandB(container,tile)
    var tile_left = tile_position.left
    var tile_top = tile_position.top
    var tile_width = $(tile).outerWidth();
    var tile_height = $(tile).outerHeight()
    //获取当前textblock的尺寸
    var block_width = $(textblock).outerWidth()
    var block_height = $(textblock).outerHeight()


    //根据垂直方向判定
    if(vertical == "top"){
        var block_top = tile_top - block_height
    }
    else if(vertical == "center"){
        var block_top = tile_top
    }
    else if(vertical == "bottom"){
        var block_top = tile_top + tile_height
    }
    else{
        throw new Error("textblock的垂直位置设定出现异常")
    }

    //根据水平方向判定
    if(horizontal == "left"){
        var block_left = tile_left - block_width
    }
    else if(horizontal == "left_edge"){
        var block_left = tile_left
    }
    else if(horizontal == "center"){
        var block_left = tile_left + (tile_width - block_width)/2
    }
    else if(horizontal == "right_edge"){
        var block_left = tile_left + (tile_width - block_width)
    }
    else if(horizontal == "right"){
        var block_left = tile_left + tile_width
    }

    //如果这个tile旋转了，则调整textblock的位置
    if($(tile).attr("angle") != 0 && $(tile).attr("angle") != undefined){
        var angle = parseInt($(tile).attr("angle"))
        left_angle = top_angle = angle
        while(left_angle > 90){
            left_angle -= 90
        }
        while(top_angle < 90){
            top_angle += 90
        }
        while(top_angle > 180){
            top_angle -= 90
        }
        var left_radians = (left_angle * Math.PI) / 180;
        var top_radians = (top_angle * Math.PI) / 180;
        var half_lenth = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
        var old_radians = Math.atan(height / width);
        var angle_left = half_lenth * Math.abs(Math.cos(old_radians - left_radians));
        var angle_top = half_lenth * Math.abs(Math.sin(old_radians - top_radians));
        var block_left = center_left + angle_left;
        var block_top = center_top - angle_top
    }

    //设定textblock的位置
    $(textblock).css({
        "left":block_left,
        "top":block_top
    })
}

//聚焦到一个textblock，令右侧输入栏为其对应的磁贴的内容栏
function focusingTextblock(textblock){
    var tile = $("#"+$(textblock).data("tile"))
    changeTileEdit(tile)
    changeModel("edit")
}


//按键功能
    //解除绑定
    $("#huabu_container").on("click",".textblock .bindTile.unbind",function(e){
        e.stopPropagation()
        var textblock = $(this).parents('.textblock')
        var tile = $("#"+$(textblock).data("tile"))
        setTileTextblockBindState(tile,false)
    })
    //重新绑定
    $("#huabu_container").on("click",".textblock .bindTile.bind",function(e){
        e.stopPropagation()
        var textblock = $(this).parents('.textblock')
        var tile = $("#"+$(textblock).data("tile"))
        setTileTextblockBindState(tile,true)
    })
    //永久显示
    $("#huabu_container").on("click",".textblock .enternalShow",function(e){
        e.stopPropagation()
        var textblock = $(this).parents('.textblock')
        var tile = $("#"+$(textblock).data("tile"))
        setTileTextblockShowState(tile, "enternalShow")
    })
    //永久隐藏
    $("#huabu_container").on("click",".textblock .enternalHide",function(e){
        e.stopPropagation()
        console.log("123")
        var textblock = $(this).parents('.textblock')
        var tile = $("#"+$(textblock).data("tile"))
        setTileTextblockShowState(tile, "enternalHide")
    })