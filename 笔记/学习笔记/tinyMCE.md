使用insertHTML向其中加入html字符串时

​	注意其会筛查元素的attr属性，使其消失，用下面这个，可以使其不再筛查任何元素的任何属性

```
valid_elements:"*[*]",
```



如果要在其中加入不可被修改和编辑的内容

```
noneditable_class: '类名，不是选择器，自带选择器',
```



其中的div都会换行，所以要用span加入行内元素，另外，span的内部不能用div，所以必须全换成span