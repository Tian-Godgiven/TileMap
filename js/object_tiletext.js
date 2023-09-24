/*

本文档包含tile_text,即tile体所包含的文本内容的结构与功能
关于tile相关内容请参看：tile.js

*/

//创建textblock，用来放置tile_text，为了和画布同时缩进，每个画布都应该有一个textblock
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
    $(huabu).append(textblock)
}

//将对应的text内容以textblock的形式显示在tile旁边
function showTileTextBlock(tile){

    var huabu = return_focusing_huabu()
    var textblock = $(huabu).find(".textblock")

    //如果没有被隐藏则显示
    if($(textblock).attr("able") == "true"){
        //将对应Tile的tiletext放入其中
        var tiletext = $(tile).attr("tiletext")
        $(textblock).find(".textblock_content").html(tiletext)

        //获取当前tile的位置与宽度，在它旁边显示textblock
        var tile_left = getLeft(tile);
        var tile_width = $(tile).width();
        var tile_top = getTop(tile);

        $(textblock).css({
            "z-index":"100",
            "left":tile_left+tile_width+2,
            "top" :tile_top,
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