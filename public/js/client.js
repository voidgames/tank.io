'use strict';	// 厳格モードとする

const socket = io.connect();	                     // クライアントからサーバーへの接続要求
const canvas = document.querySelector('#canvas-2d'); // キャンバス
const screen = new Screen(socket, canvas);           // キャンバスオブジェクト
// キャンバスの描画開始
screen.animate(0);

// ページがunloadされる時（閉じる時、再読み込み時、別ページへ移動時）は、通信を切断する
$(window).on('beforeunload', (event) => {
    socket.disconnect();
});

// 方向キーのキーダウン or キーアップをサーバに送信
let objMovement = {};	// 動作
$(document).on('keydown keyup', (event) => {
    // 1. イベント名とコマンド名のマッピング
    const KeyToCommand = {
        'ArrowUp': 'forward',
        'ArrowDown': 'back',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
    };
    // 2. 入力されたコマンドが、
    const command = KeyToCommand[event.key];
    // 3. キーダウン or キーアップを判定し、
    if(command) {
        if( event.type === 'keydown' ) {
            objMovement[command] = true;
        } else { // if( event.type === 'keyup' )
            objMovement[command] = false;
        }
        // 4. サーバーに送信
        socket.emit('change-my-movement', objMovement);
    }
    // spaceが押されたらサーバーに'shoot'を送信
    if(' ' === event.key && 'keydown' === event.type) {
        socket.emit('shoot');
    }
});

// スタートボタン
$('#start-button').on('click', () => {
    // サーバーに'enter-the-game'を送信
    const objConfig = { strNickName: $('#nickname').val() };
    socket.emit('enter-the-game', objConfig);
    $('#start-screen').hide();
});

// タッチ情報（キー：identifier, 値：（pageX, pageY）のリスト
const touches = {};

// タッチ開始
$('#canvas-2d').on('touchstart', (event) => {
    event.preventDefault();	// ブラウザ規定の動作の抑止
    socket.emit('shoot');	// ショット
    objMovement['forward'] = true;	// 前進
    // タッチ情報のリストへの追加
    Array.from(event.originalEvent.changedTouches).forEach((touch) => {
        touches[touch.identifier] = { pageX: touch.pageX, pageY: touch.pageY };
    });
});

// タッチしながら移動
$('#canvas-2d').on('touchmove', (event) => {
    event.preventDefault();	// ブラウザ規定の動作の抑止
    objMovement['right'] = false;	// 右旋回の設定の解除
    objMovement['left'] = false;	// 左旋回の設定の解除
    // 開始点に対するスライド方向い従い、右旋回、左旋回を設定する
    Array.from(event.originalEvent.changedTouches).forEach((touch) => {	
        const startTouch = touches[touch.identifier];
        objMovement['right'] |= ( 30 < ( touch.pageX - startTouch.pageX ) );
        objMovement['left'] |= ( -30 > ( touch.pageX - startTouch.pageX ) );
    });
    socket.emit('change-my-movement', objMovement);
});

// タッチ終了
$('#canvas-2d').on('touchend', (event) => {
    event.preventDefault();	// ブラウザ規定の動作の抑止
    // タッチ情報の削除
    Array.from(event.originalEvent.changedTouches).forEach((touch) => {	
        delete touches[touch.identifier];
    });
    // 移動終了
    if(0 === Object.keys(touches).length) {
        objMovement = {};
        socket.emit('change-my-movement', objMovement);
    }
});
