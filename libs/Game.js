const World = require('./World.js');
const OverlapTester = require('./OverlapTester.js');

const SharedSettings = require('../public/js/SharedSettings.js');
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
            // まだゲーム開始前。プレイしていない通信のソケットIDリストに追加
            world.setNotPlayingSocketID.add(socket.id);

            // クライアント切断時（'disconnect'イベント）
            socket.on('disconnect', () => {
                console.log( 'disconnect : socket.id = %s', socket.id );
                if(!tank) {
                    // プレイしていない通信のソケットIDリストから削除
                    world.setNotPlayingSocketID.delete(socket.id);
                    return;
                }
                world.destroyTank(tank);
                tank = null;	// 自タンクの解放
            });

            // クライアント側の接続確立時
            socket.on('enter-the-game', (objConfig) => {
                console.log( 'enter-the-game : socket.id = %s', socket.id );
                tank = world.createTank(socket.id, objConfig.strNickName); // 自タンク作成
            });

            // クライアント側のキー（移動）入力時
            socket.on('change-my-movement', (objMovement) => {
                if(!tank || 0 === tank.iLife) { return; }
                tank.objMovement = objMovement;	// 動作
            });

            // クライアント側のキー（ショット）入力時
            socket.on('shoot', () => {
                if(!tank || 0 === tank.iLife) { return; }
                world.createBullet(tank);	// ショット
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
            // タンクごとの処理
            world.setTank.forEach((tank) => {
                // ボットは無処理
                if('' !== tank.strSocketID) {
                    const rectVisibleArea = {
                        fLeft: tank.fX - SharedSettings.CANVAS_WIDTH * 0.5,
                        fBottom: tank.fY - SharedSettings.CANVAS_HEIGHT * 0.5,
                        fRight: tank.fX + SharedSettings.CANVAS_WIDTH * 0.5,
                        fTop: tank.fY + SharedSettings.CANVAS_HEIGHT * 0.5,
                    };
                    io.to(tank.strSocketID).emit('update',
                        Array.from(world.setTank).filter((tank) => { return OverlapTester.overlapRects(rectVisibleArea, tank.rectBound); }),
                        Array.from(world.setWall).filter((wall) => { return OverlapTester.overlapRects(rectVisibleArea, wall.rectBound); }),
                        Array.from(world.setBullet).filter((bullet) => { return OverlapTester.overlapRects(rectVisibleArea, bullet.rectBound); }),
                        iNanosecDiff );	// 個別送信
                }
            });

            // プレーしていないソケットごとの処理
            const rectVisibleArea = {
                fLeft: SharedSettings.FIELD_WIDTH * 0.5 - SharedSettings.CANVAS_WIDTH * 0.5,
                fBottom: SharedSettings.FIELD_HEIGHT * 0.5 - SharedSettings.CANVAS_HEIGHT * 0.5,
                fRight: SharedSettings.FIELD_WIDTH * 0.5 + SharedSettings.CANVAS_WIDTH * 0.5,
                fTop: SharedSettings.FIELD_HEIGHT * 0.5 + SharedSettings.CANVAS_HEIGHT * 0.5,
            };
            world.setNotPlayingSocketID.forEach((strSocketID) => {
                io.to(strSocketID).emit('update',
                    Array.from(world.setTank).filter((tank) => { return OverlapTester.overlapRects(rectVisibleArea, tank.rectBound); }),
                    Array.from(world.setWall).filter((wall) => { return OverlapTester.overlapRects(rectVisibleArea, wall.rectBound); }),
                    Array.from(world.setBullet).filter((bullet) => { return OverlapTester.overlapRects(rectVisibleArea, bullet.rectBound); } ),
                    iNanosecDiff );	// 個別送信
            });

        }, 1000 / GameSettings.FRAMERATE);	// 単位は[ms]。1000[ms] / FRAMERATE[回]
    }
}
