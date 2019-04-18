// モジュール
const World = require('./World.js');
// 設定
const GameSettings = require('./GameSettings.js');
// ゲームクラス
// ・ワールドを保持する
// ・通信処理を有する
// ・周期的処理を有する
module.exports = class Game {
    // 始動
    start(io) {
        // setInterval()内での参照があるので、スコープを抜けても、生存し続ける（ガーベッジコレクションされない）。
        const world = new World(io);
        let iTimeLast = Date.now();
        // クライアント接続時（'connection'イベント）のサーバー側処理
        io.on('connection', (socket) => {
            console.log( 'connection : socket.id = %s', socket.id );
            let tank = null;
            // クライアント切断時（'disconnect'イベント）
            socket.on('disconnect', () => {
                console.log( 'disconnect : socket.id = %s', socket.id );
                if(!tank) { return; }
                world.destroyTank(tank);
                tank = null;	// 自タンクの解放
            });
            // クライアント側の接続確立時
            socket.on('enter-the-game',　() =>　{
                console.log( 'enter-the-game : socket.id = %s', socket.id );
                tank = world.createTank(); // 自タンク作成
            } );
            // クライアント側のキー入力時
            socket.on('change-my-movement', (objMovement) => {
                if(!tank) { return; }
                tank.objMovement = objMovement;	// 動作
            });
        });

        // 周期的処理（1秒間にFRAMERATE回の場合、delayは、1000[ms]/FRAMERATE[回]）
        setInterval(() => {
            // 経過時間の算出
            const iTimeCurrent = Date.now();    // ミリ秒単位で取得
            const fDeltaTime = (iTimeCurrent - iTimeLast) * 0.001;	// 秒に変換
            iTimeLast = iTimeCurrent;
            // 処理時間計測用
            const hrtime = process.hrtime();  // ナノ秒単位で取得
            // ゲームワールドの更新
            world.update(fDeltaTime);
            const hrtimeDiff = process.hrtime(hrtime);
            const iNanosecDiff = hrtimeDiff[0] * 1e9 + hrtimeDiff[1];
            // 最新状況をクライアントに送信
            io.emit('update', Array.from(world.setTank), iNanosecDiff);	// 送信
        }, 1000 / GameSettings.FRAMERATE);	// 単位は[ms]。1000[ms] / FRAMERATE[回]
    }
}
