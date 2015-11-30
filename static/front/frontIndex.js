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
    var addFolder = document.getElementById('addFolder');
    addFolder.addEventListener('click', function () {
        var folderName = prompt('输入文件夹名:', '');
        if (folderName != null && folderName != '') {
            xhrFunc('/api/create-folder?folderName=' + encodeURIComponent(folderName));
            create(0, folderName);
        }
    });
    var addTask = document.getElementById('addTask');
    addTask.addEventListener('click', function () {
        var taskName = prompt('输入文件名:', '');
        if (taskName != null && taskName != '') {
            create(1, taskName);
        }
    });
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
function remove() { }
function openedMark(ele, flag) {
    var mainBody = document.getElementsByClassName('mainBody');
    var mainBodyItems = document.getElementsByClassName('mainBodyItem' + flag);
    for (var i = 0; i < mainBodyItems.length; i++) {
        mainBodyItems[i].id = '';
    }
    ele.id = 'openMark' + flag;
    var folderName = ele.getAttribute('name');
    if (flag == 0) {
        xhrFunc('/api/load-taskLists-when-folderOpened?folderName=' + encodeURIComponent(folderName), 1);
    }
}
function saveData() {
    var editBox = document.getElementById('editBox');
    var data = editBox.innerHTML;
    xhrFunc('/api/writeData-when-saveButtonClicked?data=' + encodeURIComponent(data));
}
function editData() { }
function displayData() { }
function displayTaskName() { }
function markType() { }