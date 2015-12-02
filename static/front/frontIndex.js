//判断对象是否为空对象
function isNotEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return true;
    }
    return false;
}
//flag用于标记是是哪种调用 不过当flag实参不传递时 flag的值是undefined
function xhrFunc(url, flag) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            //如果后台返回的是空对象 json解析后也是空对象 因此需要判断返回的json解析后是否为空,不能简单判断它是否为null
            var response = JSON.parse(xhr.responseText);
            //先猜flag为undefined
            if (isNotEmpty(response) && flag != 'undefined') {
                switch (flag) {
                    //根据flag值不同 调用不同的函数 包括窗口刷新时的创建文件夹 
                    case 0:
                        for (var i = 0; i < response.length; i++) {
                            create(0, response[i]);
                        }
                        break;
                    case 1:
                        for (var i = 0; i < response.length; i++) {
                            create(1, response[i]);
                        }
                        break;
                    case 2:
                        var editBox = document.getElementById('editBox');
                        editBox.innerHTML = response;
                };
            }
        }
    };
    xhr.send();
}
window.addEventListener('load', init);
function init() {
    //load事件发生时从后台读取文件夹列表并创建
    xhrFunc('/api/load-folderLists-when-refresh', 0);
    //创建文件夹 文件
    var addFolder = document.getElementsByClassName('feet')[0];
    addFolder.addEventListener('click', function () {
        var folderName = prompt('输入文件夹名:', '');
        if (folderName != null && folderName != '') {
            xhrFunc('/api/create-folder?folderName=' + encodeURIComponent(folderName));
            create(0, folderName);
        }
    });
    var addTask = document.getElementsByClassName('feet')[1];
    addTask.addEventListener('click', function () {
        var openMark0 = document.getElementById('openMark0');
        var folderName = openMark0.getAttribute('name');
        if (openMark0 != 'undefined' && openMark0 != null) {
            var taskName = prompt('输入文件名:', '');
            if (taskName != null && taskName != '') {
                xhrFunc('/api/create-task?folderName=' + encodeURIComponent(folderName) +'&taskName=' + encodeURIComponent(taskName));
                create(1, taskName);
            }
        } else {
            alert('文件必须保存在文件夹中!');
        }
    });

    //editBox可编辑
    var edit = document.getElementById('edit');
    edit.addEventListener('click', editData);
    //保存editBox数据
    var save = document.getElementById('save');
    save.addEventListener('click', saveData);

    //删除
    var removeIcon = document.getElementById('removeIcon');
    removeIcon.addEventListener('click')
}
//flag用于表示要添加的是文件夹还是文件 为了和addClassify数组中的元素对应 分别取0和1
//name是用户输入的名字 需要给每个小的item都加上一个name属性 以便再次利用
function create(flag, name) {
    var mainBody = document.getElementsByClassName('mainBody');
    var mainBodyItem = document.createElement('div');
    mainBodyItem.className = 'mainBodyItem' + flag;
    mainBodyItem.setAttribute('name', name);
    mainBodyItem.addEventListener('click', function () {
        openedMark(this, flag);
    });
    mainBody[flag].appendChild(mainBodyItem);
    if (flag == 0) {
        var folderIcon = document.createElement('span');
        folderIcon.className = 'folderIcon';
        mainBodyItem.appendChild(folderIcon);
    }
    var displayName = document.createElement('span');
    displayName.className = 'displayName';
    displayName.innerHTML = name;
    mainBodyItem.appendChild(displayName);
    var removeIcon = document.createElement('span');
    removeIcon.className = 'removeIcon';
    mainBodyItem.appendChild(removeIcon);
}

//删除. 去掉多次点击同一文件夹时出现重复文件的bug
function remove(flag) {
    if (flag == 0) {
        var mainBody = document.getElementsByClassName('mainBody')[0];
        } else if(flag == 1) {
            var mainBody = document.getElementsByClassName('mainBody')[1];
            var mainBodyItems = document.getElementsByClassName('mainBodyItem1');
            for (var i = 0; i < mainBodyItems.length; i++) {
                mainBody.removeChild(mainBodyItems[i]);
            }      
        }
}


function openedMark(ele, flag) {
    var mainBody = document.getElementsByClassName('mainBody');
    var mainBodyItems = document.getElementsByClassName('mainBodyItem' + flag);
    for (var i = 0; i < mainBodyItems.length; i++) {
        mainBodyItems[i].id = '';
    }
    ele.id = 'openMark' + flag;
    if (flag == 0) {
        var folderName = ele.getAttribute('name');
        remove(1);
        xhrFunc('/api/load-taskLists-when-folderOpened?folderName=' + encodeURIComponent(folderName), 1);
    } else if (flag == 1) {
        var folder = document.getElementById('openMark0');
        var folderName = folder.getAttribute('name');
        var taskName = ele.getAttribute('name');
        displayTaskName(taskName);
        xhrFunc('/api/read-data-when-taskOpened?folderName=' + encodeURIComponent(folderName) + '&taskName=' + encodeURIComponent(taskName), 2);
    }
}
function saveData() {
    var editBox = document.getElementById('editBox');
    var data = editBox.innerHTML;
    var folderName = returnOpenFile()[0];
    var taskName = returnOpenFile()[1];
    xhrFunc('/api/writeData-when-saveButtonClicked?folderName=' + encodeURIComponent(folderName) + '&taskName=' + encodeURIComponent(taskName) + '&data=' + encodeURIComponent(data));
}
function editData() {
    var editBox = document.getElementById('editBox');
    editBox.contentEditable = 'true';
}

function displayTaskName(taskName) {
    var displayTaskName = document.getElementById('displayTaskName');
    displayTaskName.innerHTML = taskName;
}

//这个函数是嘛来着...
function markType() { }

//返回打开的文件和文件夹
function returnOpenFile() {
    var openFolder = document.getElementById('openMark0');
    var folderName = openFolder.getAttribute('name');
    var openTask = document.getElementById('openMark1');
    var taskName = openTask.getAttribute('name');
    return [folderName, taskName];
}