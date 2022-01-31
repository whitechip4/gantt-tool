
//for frappe gantt view mode
const VIEW_MODE = {
    MONTH: 'Month',
    WEEK: 'Week',
    DAY: 'Day',    
    //QUARTER_DAY: 'Quarter Day',
    //HALF_DAY: 'Half Day',    
    //YEAR: 'Year'
};

let viewSelect = document.getElementById("view-select");
let loadFileInput = document.getElementById('jsonfile-input');
let gantt_chart;

let clickedTaskIndex = null;

let isUiDisplayed = false;
let uiBtn = document.getElementById('ui-button'); //UI表示/非表示切り替えボタン ([▶]のボタン)



//init
/**
 * ガントチャートの初期設定関数
 */
function ganttInit() {

    let task_tmp = newTask("Design");   //generate sample task 
    ganttData.tasks.splice(0, 0, task_tmp);

    
    gantt_chart = new Gantt("#gantt", ganttData.tasks, {    //generate gantt chart
        //events

        //task click event
        on_click: function (task) {                     
            console.log("Click",task);
            
            let clickedIndexTmp = getTasksIndexfromTaskInfo(task);
            console.log(clickedIndexTmp)
            
            clickedTaskIndex = clickedIndexTmp;                
            updateInputTextbox(clickedTaskIndex);
                
        },
        
        //date change event
        on_date_change: function(task, start, end) {    
            console.log("d_Change", task, start, end);

            let date = new Date(start);
            let startStr = dateToStr(date);

            date = new Date(end);
            let endStr = dateToStr(date);

            task.start = startStr;
            task.end = endStr;

            let clickedIndexTmp = getTasksIndexfromTaskInfo(task);
            console.log(clickedIndexTmp)

            clickedTaskIndex = clickedIndexTmp;                
            updateInputTextbox(clickedTaskIndex);
        },
        
        on_progress_change: function(task, progress) {  //progress change event
            console.log("p_Change", task, progress);
            
            let clickedIndexTmp = getTasksIndexfromTaskInfo(task);
            clickedTaskIndex = clickedIndexTmp;                
            updateInputTextbox(clickedTaskIndex);
        },

        //view change event
        on_view_change: function(mode) {    
            //console.log("v_change",mode);
        },

        //task detail popup event (on mouse)
        custom_popup_html: function(task) { 
            // the task object will contain the updated
            // dates and progress value
            
            const end_date = task._end.format('MMM D');
            return `
                <div class="details-container">
                <h5>${task.name}</h5>
                <p>Expected to finish by ${end_date}</p>
                <p>${task.memo} </p>
                <p></p>
                </div>
            `;
            
        },
        
        //set option 
        view_mode: 'Month',
        language: 'en',

        bar_corner_radius: 3,
        bar_height: 0,

    });
    console.log(gantt_chart);

}

/**
 * html周りで必要な初期化イベント
 */
function htmlInit() {
    //set title
    let ganttTitleElem = document.getElementById('gantt-title');
    ganttTitleElem.insertAdjacentHTML('afterbegin', ganttData.ganttTitle);

    //Make options for view select dropdown box
    let i = 0;
    for (let key in VIEW_MODE){
        let op = document.createElement("option");
        op.value = i;
        op.text = VIEW_MODE[key];
        viewSelect.appendChild(op);
        console.log(op.text)
        i++;
    }
    viewSelect.selectedIndex = 0;
    

}

/**
 * DOM Content Loaded Event
 */
document.addEventListener("DOMContentLoaded", function() {
    console.log("start application.");

    //initialization
    ganttInit();
    htmlInit();
}, false);



/**
 * //View Mode dropdown list Change event
 */
viewSelect.addEventListener('change', (event) => {
    const selectedIndex = viewSelect.selectedIndex;
    
    const selectedText = viewSelect.options[selectedIndex].text;
    gantt_chart.change_view_mode(selectedText);
});



//Input textbox event
////////////////////////////////////
/**
 * タスク名のテキストボックス変更イベント
 */
document.getElementById('name').addEventListener('change', function () {
    if (clickedTaskIndex == null) {
        return;
    }

    if (clickedTaskIndex >= ganttData.tasks.length) {
        return;
    }
    ganttData.tasks[clickedTaskIndex].name =  document.getElementById('name').value;
    gantt_chart.refresh(ganttData.tasks);
});


/**
 * 開始日のテキストボックス変更イベント
 */
document.getElementById('start-date').addEventListener('change', function () {
    if (clickedTaskIndex == null) {
        return;
    }

    if (clickedTaskIndex >= ganttData.tasks.length) {
        return;
    }
    
    let inputTaskStart = document.getElementById('start-date');
    //変なDateになっていたら元に戻す
    if (new Date(inputTaskStart.value).toString() == "Invalid Date") {
        inputTaskStart.value = ganttData.tasks[clickedTaskIndex].start;
    }

    //endよりも後ろにいってたら元に戻す
    if (new Date(inputTaskStart.value) > new Date(ganttData.tasks[clickedTaskIndex].end)) {
        inputTaskStart.value = ganttData.ganttData.tasks[clickedTaskIndex].start;
    } else {
        ganttData.tasks[clickedTaskIndex].start = inputTaskStart.value;
    }

    gantt_chart.refresh(ganttData.tasks);

});
/**
 * 終了日のテキストボックス変更イベント
 */
document.getElementById('end-date').addEventListener('change', function () {
    
    if (clickedTaskIndex == null) {
        return;
    }
    if (clickedTaskIndex >= ganttData.tasks.length) {
        return;
    }
    
    let inputTaskEnd = document.getElementById('end-date');
    //変なDateになっていたら元に戻す
    if (new Date(inputTaskEnd.value).toString() == "Invalid Date") {
        inputTaskEnd.value = ganttData.tasks[clickedTaskIndex].end;
    }

    //endよりも後ろにいってたら元に戻す
    if (new Date(inputTaskEnd.value) < new Date(ganttData.tasks[clickedTaskIndex].start)) {
        inputTaskEnd.value = ganttData.tasks[clickedTaskIndex].end;
    } else {
        ganttData.tasks[clickedTaskIndex].end = inputTaskEnd.value;
    }

    gantt_chart.refresh(ganttData.tasks);

});

/**
 * 進捗率のテキストボックス変更イベント
 */
document.getElementById('task-progress').addEventListener('change', function () {
    if (clickedTaskIndex == null) {
        return;
    }

    if (clickedTaskIndex >= ganttData.tasks.length) {
        return;
    }
    
    //ignore if input value is not integer
    let inputTaskProgress = document.getElementById('task-progress');
    let progressInt = parseInt(inputTaskProgress.value);
    if (isNaN(progressInt)) {
        console.log('NAN');
        progressInt = parseInt(ganttData.tasks[clickedTaskIndex].progress);
    }

    if (progressInt> 100) {
        progressInt =100;
    }
    if (progressInt< 0) {
        progressInt = 0;
    }
    inputTaskProgress.value =  progressInt.toString();
    ganttData.tasks[clickedTaskIndex].progress =  progressInt.toString();
    
    
    gantt_chart.refresh(ganttData.tasks);

});

/**
 * メモのテキストボックス変更イベント
 */
document.getElementById('task-memo').addEventListener('change', function () {
    if (clickedTaskIndex == null) {
        return;
    }

    if (clickedTaskIndex >= ganttData.tasks.length) {
        return;
    }
    ganttData.tasks[clickedTaskIndex].memo =  document.getElementById('task-memo').value;
    gantt_chart.refresh(ganttData.tasks);

});

/**
 * 依存先テキストボックス変更イベント
 */
document.getElementById('task-dependencies').addEventListener('change', function () {   
    if (clickedTaskIndex == null) {
        return;
    }
    if (clickedTaskIndex >= ganttData.tasks.length) {
        return;
    }
    
    let inputTaskDependencies = document.getElementById('task-dependencies');

    //参照先に指定したTaskIDが存在した場合、もしくは何も入力されていない場合（依存無しにする場合）のみ更新
    if (inputTaskDependencies.value != "") {
        for (let i = 0; i < ganttData.tasks.length; i++) {
            if (ganttData.tasks[i].name == inputTaskDependencies.value) {
                ganttData.tasks[clickedTaskIndex].dependencies = ganttData.tasks[i].id;
            }
        }
    } else {
        ganttData.tasks[clickedTaskIndex].dependencies = "";
    }
    inputTaskDependencies.value =  getDependenciesTaskNamefromTaskInfo(ganttData.tasks[clickedTaskIndex]);   //ボックス側にも反映
                                                                                                            //紐づけ自体はIDでやっているが、IF上表示と指定はnameを対象にする
    gantt_chart.refresh(ganttData.tasks);
});










///BUTTON
////////////////////////////////////

/**
 * タスク追加ボタンクリックイベント
 */
document.getElementById('add-button').addEventListener('click', function() {

    promptStr = window.prompt("挿入する行、または挿入したい行の前のタスク名を入れてください", "");

    let row = -1;
    //タイトルとマッチングしたものの次の番地を挿入先に指定
    for (i = 0; i < ganttData.tasks.length; i++){

        if (promptStr == ganttData.tasks[i].name) {
            row = i + 1;
            break;
        }

    }
    
    //数字指定だった場合（タイトル指定でマッチングが無かった場合こっちで挿入先番地指定
    if (row == -1) {
        let promptInputNum = parseInt(promptStr);   //numberに変換

        if (isNaN(promptInputNum)) {            //変な数字が入っていた場合
            row = ganttData.tasks.length;       //最後の行を指定
            console.log("Nan")
        } else {
            if (promptInputNum > ganttData.tasks.length) {
                row = ganttData.tasks.length;
            }else if (promptInputNum < 0) {
                row = 0;
            } else {
                row = promptInputNum;
            }
        }
    }


    //挿入
    let task = newTask("Task" + String(ganttData.tasks.length));
    console.log(task);
    ganttData.tasks.splice(row, 0, task);
    console.log(ganttData.tasks)

    gantt_chart.refresh(ganttData.tasks); //refresh
    
    clickedTaskIndex = getTasksIndexfromTaskInfo(task);                
    updateInputTextbox(clickedTaskIndex);

});

/**
 * 削除ボタンクリックイベント
 */
document.getElementById('erase-button').addEventListener('click', function() {

    if (clickedTaskIndex == null) {
        return;
    }
    if (clickedTaskIndex >= ganttData.tasks.length) {
        return;
    }

    if (ganttData.tasks.length == 1) { //最後の１個は消さない
        return;
    }


    let inputTaskId = document.getElementById('task-id');
    //IDがかぶる場合は元に戻す


    //TaskIdが変わった場合全てタスクのdependenciesも更新する
    for (let i = 0; i < ganttData.tasks.length; i++){
        if (ganttData.tasks[i].dependencies == ganttData.tasks[clickedTaskIndex].id) {
            ganttData.tasks[i].dependencies = "";
        }
    }

        
    ganttData.tasks.splice(clickedTaskIndex, 1);  //選択されたものの要素を削除
    clickedTaskIndex = null;
    gantt_chart.refresh(ganttData.tasks); //refresh
    

    updateInputTextbox(clickedTaskIndex);

});

/**
 * 保存ボタンクリックイベント
 */
document.getElementById('save-button').addEventListener('click', function() {
    
    let copiedGanttData = Object.assign(ganttData); //deep copy
 
    //保存で必要のない部分は消しておく
    for (i = 0; i < copiedGanttData.tasks.length; i++) {
        delete copiedGanttData.tasks[i]._end;
        delete copiedGanttData.tasks[i]._start;
        delete copiedGanttData.tasks[i]._index;        
    }

    let write_json=JSON.stringify(copiedGanttData ,null , "\t");   //json文字列にする
    let blob=new Blob([write_json], {type: 'application/json'});
 

    //download json file
    let a = document.createElement("a");
    a.href=URL.createObjectURL(blob);
    document.body.appendChild(a); // Firefoxで必要
    a.download=ganttData.ganttTitle + '_gantt.json'; //ファイル名
    a.click();

    //作ったリンクのオブジェクト削除
    document.body.removeChild(a); // Firefoxで必要
    URL.revokeObjectURL(a.href);

});
/**
 * 読み込みボタンを押された時の（ファイルダイアログのファイル読まれた時の）処理
 */
loadFileInput.addEventListener('change', function (e) {

    let file = loadFileInput.files[0];  //ダイアログで渡されたファイルを取得（1個だけなので０banme )
    console.log(file)

    let extention = file.name.split("/").reverse()[0].split('.')[1];
    console.log("extention:" ,extention);
    if (extention != "json") { //Json以外の場合は削除
        return;
    }

    let reader = new FileReader();  //ファイル内容を読むためのリーダーオブジェクト
    reader.readAsText(file);        //ファイルを読み込む（多分ノンブロッキング）
    reader.onload = function () {   //ファイルが読み込まれ終わったときのイベント登録
        console.log(reader.result)
        ganttData = JSON.parse(reader.result);  //読み込んだJsonファイル（テキストファイル）をjsonに変換
        clickedTaskIndex = null;
        gantt_chart.refresh(ganttData.tasks);     //refresh
        changeGanttTitle(ganttData.ganttTitle); //タイトル更新
    }


})

/**
 * 画像保存ボタンクリックイベント
 */
document.getElementById('img-button').addEventListener('click', function () {

    const targetElement = document.querySelector('#gantt-area');
        
    html2canvas(targetElement).then(canvas => {
        //ダウンロード
        const linkElement = document.createElement("a");
        linkElement.href = canvas.toDataURL('image/png');
        linkElement.download = ganttData.ganttTitle + '.png';
        linkElement.click();
        
        //作ったリンクのオブジェクトごと削除”
        document.body.removeChild(linkElement); // Firefoxで必要
        URL.revokeObjectURL(linkElement.href);
    });
});




/**
 * タイトルダブルクリック関数 タイトル変更
 */ 
document.getElementById('gantt-title').addEventListener('dblclick', function () {
    promptStr = window.prompt("タイトル変更", ganttData.ganttTitle);    //show input dialog

    console.log(promptStr);
    if (promptStr == null || promptStr == "") {
        return;
    }

    ganttData.ganttTitle = promptStr;

    changeGanttTitle(ganttData.ganttTitle);
});


/**
 * UI部分を表示／非表示切り替えるボタンをクリックしたときの関数。 ボタンの表示変更とUI部分の表示切替
 */
uiBtn.addEventListener('click', function () {
    
    if (isUiDisplayed == false) {
        isUiDisplayed = true;
        uiBtn.innerHTML = '▶';
        document.getElementById('ui-area').style.display = 'none';
        document.getElementsByClassName('f-container')[0].style.flexDirection = "column";  //ちょっと強引だけどflexの並びをcolumnにして片方を表示を消す感じにする
    } else {
        isUiDisplayed = false;
        uiBtn.innerHTML = '◀';
        document.getElementById('ui-area').style.display ='block'
        document.getElementsByClassName('f-container')[0].style.display = 'flex';
        document.getElementsByClassName('f-container')[0].style.flexDirection = "row";  //
    }


});






//other input
//-///////////////////////////////////
/**
 * 選択されたインデックスのタスクのプロパティを画面のinput用text boxに反映
 * @param {*} tIndex タスクのインデックス
 */
function updateInputTextbox(tIndex) {
    let inputTaskName = document.getElementById('name')
    let inputTaskStart = document.getElementById('start-date')
    let inputTaskEnd = document.getElementById('end-date')
    // let inputTaskId = document.getElementById('task-id')
    let inputTaskProgress = document.getElementById('task-progress')
    let inputTaskMemo = document.getElementById('task-memo')
    let inputTaskDependencies = document.getElementById('task-dependencies')

    if (tIndex != null) {
        inputTaskName.value = ganttData.tasks[tIndex].name;
        inputTaskStart.value = ganttData.tasks[tIndex].start;
        inputTaskEnd.value = ganttData.tasks[tIndex].end;
        //inputTaskId.value = ganttData.tasks[tIndex].id;
        inputTaskProgress.value = ganttData.tasks[tIndex].progress;
        inputTaskMemo.value = ganttData.tasks[tIndex].memo;
        inputTaskDependencies.value =  getDependenciesTaskNamefromTaskInfo(ganttData.tasks[tIndex]);    //
    } else {
        inputTaskName.value = "";
        inputTaskStart.value ="";
        inputTaskEnd.value = "";
       //inputTaskId.value = "";
        inputTaskProgress.value = "";
        inputTaskMemo.value = "";
        inputTaskDependencies.dependencies = "";
    }
}


/////////////////////////////////////


//create task
/**
 * 
 * @param {string} taskName タスク名
 * @returns  タスク名で指定されたタスクのパラメータ連想配列
 */
function newTask(taskName) {

    //日付のDateをStringにする
    let formatStr = 'YYYY-MM-DD';

    let startDate = new Date();
    startDate.setDate(startDate.getDate()); //
    let endDate = new Date()
    endDate.setDate(startDate.getDate()+7) //適当に7日後の日を取得

    start = dateToStr(startDate);
    end = dateToStr(endDate);


    let tmp_id = null;  //取られてないIDを付ける
    let isSameIdFound = false;
    for (i = 0; ; i++){
        isSameIdFound = false;
        for (j = 0; j < ganttData.tasks.length; j++){
            if (('Task ' + String(i)) == ganttData.tasks[j].id) {
                isSameIdFound = true;
                break;
            }
        }
        
        if (isSameIdFound == false) {
            tmp_id = 'Task ' + String(i);
            break
        }
    }

    console.log(tmp_id)
    return {
        start: start,
        end: end,
        name: taskName,
        id: tmp_id,
        progress: 0,
        dependencies: "",
        memo : "" ,
    };

}

/**
 * タスクIDの重複が無いかチェックする関数
 * @param {string} idStr タスク名 
 * @returns {boolean} 重複が存在するかどうかの真理値。重複が存在する場合true
 */
function existTaskId(idStr) {
    let ret = false;
    for (j = 0; j < ganttData.tasks.length; j++){
        if (idStr == ganttData.tasks[j].id) {
            ret = true;
            break;
        }
    }
        
    return ret;

}

/**
 * Taskの情報から tasks配列の何番目に入ってるか返す
 * @param {*} lTask タスクの連想配列
 * @returns {number} タスク配列に引数のタスクが存在していた場合のインデックス番号。存在しない場合は-1
 */
function getTasksIndexfromTaskInfo(lTask){

    let ret = -1;
    for (j = 0; j < ganttData.tasks.length; j++){
        if (lTask.id == ganttData.tasks[j].id) {
            ret = j;
        }
    }
    return ret;
}
/**
 * 渡されたTaskのDependenciesに入っているIDから依存先のタスク名を取ってくる
 * @param {*} lTask タスクの連想配列
 * @returns {string} 依存先タスクのタスク名
 */

function getDependenciesTaskNamefromTaskInfo(lTask){

    let ret = "";
    for (j = 0; j < ganttData.tasks.length; j++){
        if (lTask.dependencies == ganttData.tasks[j].id) {
            ret = ganttData.tasks[j].name;
        }
    }
    return ret;
}

/**
 * dateを YYYY-MM-DD　の形に変更した文字列を返す
 * @param {Date} lDate Date構造体
 * @returns {string} 成形された文字列
 */

function dateToStr(lDate) {
    
    let year = lDate.getFullYear();
    let month = lDate.getMonth()+1;
    let day = lDate.getDate() ;

    let dateStr = 'YYYY-MM-DD';    
    dateStr = dateStr.replace(/YYYY/g, year);
    dateStr = dateStr.replace(/MM/g, month);
    dateStr = dateStr.replace(/DD/g, day);

    return dateStr;

}

/**
 * ガントチャートのタイトルを変更する
 * @param {string} title タイトル
 */
function changeGanttTitle(title) {
    document.getElementById('gantt-title').innerHTML = title;

}