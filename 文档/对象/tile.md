	prop["textblock_bindState"] = $(tile).prop("textblock_bindState")
	prop["lock"] = $(tile).prop("lock")
	prop["show_title"] = $(tile).prop("show_title")
	prop["wrap_title"] = $(tile).prop("wrap_title")
	prop["tile_link"] = $(tile).prop("tile_link")
	prop["tile_link_menu"] = $(tile).prop("tile_link_menu")
	prop["tile_annotaition"] = $(tile).prop("tile_annotaition")
	prop["nestSet_dbClick"] = $(tile).prop("nestSet_dbClick")
	prop["nestSet_clickButton"] = $(tile).prop("nestSet_clickButton")
	prop["nestSet_noOpen"] = $(tile).prop("nestSet_noOpen")
	prop["background_gradient"] = $(tile).prop("background_gradient")
	prop["background_image"] = $(tile).prop("background_image")
	prop["size_limit"] = $(tile).prop("size_limit")

```

if($(tile).data("nest_huabu")!=null){
    data["nest_huabu"] = $(tile).data("nest_huabu")
}
if($(tile).data("textblock")!=null && !$(tile).prop("textblock_bindState")){
    data["textblock"] = $(tile).data("textblock")
}
if($(tile).data("tile_link")!=null && $(tile).prop("tile_link")){
    data["tile_link"] = $(tile).data("tile_link")
}
data["tiletext"] = $(tile).data("tiletext")
```

