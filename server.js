var FS = require('fs-extra');
var express = require('express');
//获取路径
function getFolderPath(folderName) {
    var folderPath = 'taskManagerData/' + folderName;
    return folderPath;
}
function getTaskPath(folderName, taskName) {
    var taskPath = 'taskManagerData/' + folderName + '/' + taskName;
    return taskPath;
}
//创建
function createFolder(folderName) {
    FS.mkdirSync(getFolderPath(folderName));
}
function createTaskDoc(folderName, taskName) {
    FS.writeFileSync(getTaskPath(folderName, taskName));
}
//获取列表、数据
function listFolders() {
    return FS.readdirSync('taskManagerData');
}
function listTaskDocs(folderName) {
    return FS.readdirSync(getFolderPath(folderName));
}
function readTaskData(folderName, taskName) {
    //读取文件中的数据要指定编码方式
    return FS.readFileSync(getTaskPath(folderName, taskName), 'utf-8');
}
//删除
function removeFolder(folderName) {
    FS.removeSync(getFolderPath(folderName));
}
function removeTaskDoc(folderName, taskName) {
    FS.unlinkSync(getTaskPath(folderName, taskName));
}
//写入数据
function appendData(folderName, taskName, writeData) {
    FS.writeFileSync(getTaskPath(folderName, taskName), writeData);
}
var app = express();
app.use(express.static('static'));
app.get('/api/load-folderLists-when-refresh', function (req, res) {
    var listFolder = listFolders();
    res.json(listFolder);
});
app.get('/api/load-taskLists-when-folderOpened', function (req, res) {
    var listTask = listTaskDocs(req.query.folderName);
    res.json(listTask);
});
app.get('/api/create-folder', function (req, res) {
    createFolder(req.query.folderName);
    res.json({});
});
app.get('/api/create-task', function (req, res) {
    createTaskDoc(req.query.folderName, req.query.taskName);
    res.json({});
});
app.get('/api/remove-folder', function (req, res) {
    removeFolder(req.query.folderName);
    res.json({});
});
app.get('/api/remove-task', function (req, res) {
    removeTaskDoc(req.query.folderName, req.query.taskName);
});
app.get('/api/read-data-when-taskOpened', function (req, res) {
    var data = readTaskData(req.query.folderName, req.query.taskName);
    res.json(data);
});
app.get('/api/writeData-when-saveButtonClicked', function (req, res) {
    appendData(req.query.folderName, req.query.taskName, req.query.data);
    res.json({});
});
app.listen('1337');