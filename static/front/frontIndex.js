//判断对象是否为空对象
function isNotEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return true;
    }
    return false;
}

var FLAG_FOLDER = 0;
var FLAG_TASK = 1;
//flag用于标记是是哪种调用 不过当flag实参不传递时 flag的值是undefined
function xhrFunc(url, flag) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            //如果后台返回的是空对象 json解析后也是空对象 因此需要判断返回的json解析后是否为空,不能简单判断它是否为null
            var response = JSON.parse(xhr.responseText);

            //先猜flag为undefined
            if ((typeof response === 'string' || isNotEmpty(response)) && flag != undefined) {
                switch (flag) {
                    //根据flag值不同 调用不同的函数 包括窗口刷新时的创建文件夹 
                    case FLAG_FOLDER:
                        for (var i = 0; i < response.length; i++) {
                            create(FLAG_FOLDER, response[i]);
                        }
                        break;
                    case FLAG_TASK:
                        for (var i = 0; i < response.length; i++) {
                            create(FLAG_TASK, response[i]);
                        }
                        break;
                    case 2:
                        var editBox = document.getElementById('editBox');
                        editBox.innerHTML = response || '';
                };
            }
        }
    };
    xhr.send();
}
window.addEventListener('load', init);
function init() {
    //load事件发生时从后台读取文件夹列表并创建
    xhrFunc('/api/load-folderLists-when-refresh', FLAG_FOLDER);
    //创建文件夹 文件
    var addFolder = document.getElementsByClassName('feet')[0];
    addFolder.addEventListener('click', function () {
        var folderName = prompt('输入文件夹名:', '');
        if (folderName != null && folderName != '') {
            xhrFunc('/api/create-folder?folderName=' + encodeURIComponent(folderName));
            create(FLAG_FOLDER, folderName);
        }
    });
    var addTask = document.getElementsByClassName('feet')[1];
    addTask.addEventListener('click', function () {
        var openMark0 = document.getElementById('openMark0');
        var folderName = openMark0.getAttribute('folderName');
        if (openMark0 != 'undefined' && openMark0 != null) {
            var taskName = prompt('输入文件名:', '');
            if (taskName != null && taskName != '') {
                xhrFunc('/api/create-task?folderName=' + encodeURIComponent(folderName) +'&taskName=' + encodeURIComponent(taskName));
                create(FLAG_TASK, taskName);
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
}
//flag用于表示要添加的是文件夹还是文件 为了和addClassify数组中的元素对应 分别取0和1
//name是用户输入的名字 需要给每个小的item都加上一个name属性 以便再次利用
function create(flag, name) {
    var mainBody = document.getElementsByClassName('mainBody');
    var mainBodyItem = document.createElement('div');
    mainBodyItem.className = 'mainBodyItem' + flag;
    mainBodyItem.addEventListener('click', function () {
        openedMark(this, flag);
    });
    mainBody[flag].appendChild(mainBodyItem);
    if (flag == FLAG_FOLDER) {
        mainBodyItem.setAttribute('folderName', name);
        var folderIcon = document.createElement('span');
        folderIcon.className = 'folderIcon';
        mainBodyItem.appendChild(folderIcon);
    }
    if (flag == FLAG_TASK) {
        mainBodyItem.setAttribute('taskName', name);
    }
    var displayName = document.createElement('span');
    displayName.className = 'displayName';
    displayName.innerHTML = name;
    mainBodyItem.appendChild(displayName);
    var removeIcon = document.createElement('span');
    removeIcon.className = 'removeIcon';
    removeIcon.addEventListener('click', function (event) {
        remove(this);
        //阻止冒泡
        event.stopPropagation();
    });
    mainBodyItem.appendChild(removeIcon);
}
//删除操作
function remove(ele) {
    var messageFromUser = confirm('确定要做删除操作吗?数据将被清空!');
    if (messageFromUser != null && messageFromUser != '') {
        var parentEle = ele.parentNode;
        if (parentEle.id == 'openMark0') {
            var name = parentEle.getAttribute('folderName');
            xhrFunc('/api/remove-folder?folderName=' + encodeURIComponent(name));
            cleanUpList(FLAG_FOLDER);
            cleanUpList(FLAG_TASK);
        } else if (parentEle.id == 'openMark1') {
            var name = parentEle.getAttribute('taskName');
            var openFolder = document.getElementById('openMark0');
            var folderName = openFolder.getAttribute('folderName');
            xhrFunc('/api/remove-task?folderName=' + encodeURIComponent(folderName) + '&taskName=' + encodeURIComponent(name));
            var mainBody = document.getElementsByClassName('mainBody')[1];
            mainBody.removeChild(parentEle);
        }
    }
}

//在显示当前打开的文件夹中的文件前，清除掉上一次打开文件夹中显示出的文件列表
function cleanUpList(flag) {
    if (flag == FLAG_FOLDER) {
        var mainBody = document.getElementsByClassName('mainBody')[0];
        var openFolder = document.getElementById('openMark0');
        mainBody.removeChild(openFolder);
    } else if(flag == FLAG_TASK) {
        var mainBody = document.getElementsByClassName('mainBody')[1];
        var mainBodyItems = document.getElementsByClassName('mainBodyItem1');
        while (mainBodyItems.length) {
            mainBody.removeChild(mainBodyItems[0]);
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
    if (flag == FLAG_FOLDER) {
        var folderName = ele.getAttribute('folderName');
        cleanUpList(FLAG_TASK);
        xhrFunc('/api/load-taskLists-when-folderOpened?folderName=' + encodeURIComponent(folderName), FLAG_TASK);
    } else if (flag == FLAG_TASK) {
        var folder = document.getElementById('openMark0');
        var folderName = folder.getAttribute('folderName');
        var taskName = ele.getAttribute('taskName');
        displayTaskName(taskName);
        xhrFunc('/api/read-data-when-taskOpened?folderName=' + encodeURIComponent(folderName) + '&taskName=' + encodeURIComponent(taskName), 2);
    }
}
function saveData() {
    var editBox = document.getElementById('editBox');
    var data = editBox.innerHTML;
    var folderName = returnOpenFile()[0];
    var taskName = returnOpenFile()[1];
    if (folderName == null || taskName == null) {
        alert('数据必须保存在文件中!');
    } else {
        xhrFunc('/api/writeData-when-saveButtonClicked?folderName=' + encodeURIComponent(folderName) + '&taskName=' + encodeURIComponent(taskName) + '&data=' + encodeURIComponent(data));
    }
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
    var openTask = document.getElementById('openMark1');
    if (openFolder != null || openTask !== null) {
        var folderName = openFolder.getAttribute('folderName');
        var taskName = openTask.getAttribute('taskName');
    }
    return [folderName, taskName];
}




