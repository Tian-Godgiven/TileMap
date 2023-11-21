/*

本文档包含tile_text,即tile体所包含的文本内容的结构与功能
关于tile相关内容请参看：tile.js

*/

//创建textblock，在创建画布的同时为这个画布创建其对应的textblock
function createTextBlock(huabu){
    var textblock = $("<div>\
                            <div class='textblock_bar'>\
                                <div class='escape' title='脱离'>脱离</div>\
                                <div class='eternalshow' title='永久显示'>永久显示</div>\
                                <div class='eternalhide' title='永久隐藏'>永久隐藏</div>\
                            </div>\
                            <div class='textblock_content'></div>\
                        </div>")
    $(textblock).attr({
        "id" : $(huabu).attr("id") + "_textblock",
            "class" : "textblock",
            "state" : "normal",
            "hideable" : true,//默认可以隐藏
            "able" : true//默认显示
    })
    $(textblock).resizable({
        autoHide:true,
        animate: false,
        animateEasing:"swing",
        handles:"n,e,s,w,se,sw,ne,nw",
        autoHide:true
    });
    $(huabu).children('.container').append(textblock)
}

//将对应的text内容以textblock的形式显示在tile旁边
function showTileTextBlock(tile){

    var huabu = return_focusing_huabu()
    var object_container = $(huabu).find('.object_container')
    var textblock = $(huabu).find(".textblock")

    //如果没有被隐藏则显示
    if($(textblock).attr("able") == "true"){
        //将对应Tile的tiletext放入其中
        var tiletext = $(tile).attr("tiletext")
        $(textblock).find(".textblock_content").html(tiletext)

        //获取当前tile的位置与宽度，在它旁边显示textblock
        var left = parseInt($(tile).css("left")) + parseInt($(object_container).css("left"));
        var top = parseInt($(tile).css("top")) + parseInt($(object_container).css("top")) ;
        var width = $(tile).width();
        var height = $(tile).height()
        //中心点的位置
        var center_left = left + width/2
        var center_top = top + height/2
        //textblock的位置
        var block_left = center_left + width/2
        var block_top = center_top - height/2

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

        $(textblock).css({
            "z-index":"100",
            "left":block_left + 4,
            "top" :block_top,
            "display":"block",})

        //点击到其他地方时隐藏textblock
        $(huabu).on("mousedown",function(event){
            if(!$(".textblock, .textblock *,.tile").is(event.target) && $(textblock).css("display")=="block"){
                $(textblock).hide()
                $(this).off(event)
            }
        }) 
    }
}

//隐藏textblock（用于一部分分离后固定显示的textblock的隐藏或者显示）
function hideTextBlock(huabu){
    //检索所有textblock，将其中允许hide的部分隐藏起来
    $(huabu).find(".textblock").each(function(){
        if($(this).attr("hideable") == "true"){
            $(this).hide()
        }
    })
}

//切换textblock模式
$(document).on("click",".textblock_bar > div",function(){
    console.log(this)
})