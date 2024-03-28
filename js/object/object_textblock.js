/*

本文档包含tile_text,即tile体所包含的文本内容的结构与功能
关于tile相关内容请参看：tile.js

*/

//创建一个与tile相关的textblock元素
function createTextBlock(tile){
    //html内容
    var textblock = $("<div>\
                            <div class='textblock_bar'>\
                                <div class='escape' title='脱离'>脱离</div>\
                                <div class='eternalshow' title='永久显示'>永久显示</div>\
                                <div class='eternalhide' title='永久隐藏'>永久隐藏</div>\
                            </div>\
                            <div class='textblock_content'></div>\
                        </div>")
    //属性
    $(textblock).attr({
        "id" : $(tile).attr("id") + "_textblock",
        "class" : "textblock",
        "state" : "normal",
    })

    //与tlie相关联
    $(tile).data("textblock",textblock)
    $(textblock).data("tile",tile)

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
            //则先将其隐藏，再显示，并刷新位置
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
        $(tile).data("textblock").show()
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
            $(tile).data("textblock").hide()
        }
        //若不是独立状态，则令其消除
        else{
            //将指定Tile的textblock消除
            if($(tile).data("textblock") != null){
                $(tile).data("textblock").remove()
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
function setTileTextblockBindState(tile,boal){
    if([true,false].includes(boal)){
        //若为绑定，则令textblock与tile绑定
        if(boal){
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
    var textblock = $(tile).data("textblock")
    //无法自由移动
    $(textblock).draggable("destroy")
    //修改属性值
    $(tile).prop("textblock_bindState",true)
    //回到tile身边
    showTileTextblock(tile)
}

//令tile对应的textblock脱离tile，其将会在点击tile后显示，并保持显示，直到点击x关闭
//其可以自由移动，其内容仍然与tile同步
function escapeTextblock(tile){
    //如果tile当前没有显示textblock，则先令textblock显示
    var textblock = $(tile).data("textblock")
    if(textblock == null){
        showTileTextblock(tile,true)
        textblock = $(tile).data("textblock")
    }
    //可以自由移动
    $(textblock).draggable()
    //修改属性值
    $(tile).prop("textblock_bindState",false)
    //如果此时显示设置为永久隐藏，则令其hide
    if($(tile).attr("textblock_showState") == "enternalHide"){
        hideTileTextblock(tile,true)
    }
}


//根据垂直和水平两个方向的值，修改textblock的位置
function setTextblockPosition(tile){
    var textblock = $(tile).data("textblock")

    var vertical = $(tile).attr("textblock_vertical")
    if(vertical == null){
        vertical = "center"
    }
    var horizontal = $(tile).attr("textblock_horizontal")
    if(horizontal == null){
        horizontal = "right"
    }

    //获取当前tile的位置与尺寸
    var tile_left = parseInt($(tile).css("left"))
    var tile_top = parseInt($(tile).css("top"))
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