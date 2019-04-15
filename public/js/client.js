'use strict';	// 厳格モードとする

// オブジェクト
const socket = io.connect();	                     // クライアントからサーバーへの接続要求
const canvas = document.querySelector('#canvas-2d'); // キャンバス
const screen = new Screen(socket, canvas);           // キャンバスオブジェクト
// キャンバスの描画開始
screen.animate(0);

// ページがunloadされる時（閉じる時、再読み込み時、別ページへ移動時）は、通信を切断する
$(window).on('beforeunload', (event) => {
    socket.disconnect();
});
