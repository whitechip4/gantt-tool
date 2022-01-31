# 概要
エクセルガントチャートが嫌だったのでfrappe-ganttを使ってガントチャートを作成できるようにしたツール


# Usage
index.htmlを開いて編集する。
* Project日程となってる部分をダブルクリックでタイトル変更
* New Taskをクリックし、ポップアップに挿入したい行か挿入したい場所の前にあるタスクを入力するとそこにタスクが挿入される
* タスクを画面上でダブルクリックして、右の欄を埋めるとそれが画面上に反映される
  * 依存先のタスク名を入力するとそのタスクから選択タスクまで矢印が引かれる
* タスクを消したいときはタスクをダブルクリックで選択した状態でRemoveTaskをクリック
* タスクを移動させたいときは画面上ドラッグ、または右の欄の開始日・終了日を変更
* Saveを押すと現在のガントチャートがJson形式で保存される。LoadでそのJsonを読み込むと復元される
* ImgSaveを押すと現在の画面が画像で保存される。
* 表示範囲をかえたいときは画面左上の表示と書かれたリストボックスを変更。日・月・年が現在選択できる



