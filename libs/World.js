// ワールドクラス
// ・ゲーム内の各種要素を保持する
// ・ゲームに保持される
// ・ゲームワールドの更新処理を有する（ゲームから要請を受け、保持する各種要素を更新する）
// ・ゲーム内の各種要素の生成、破棄を有する
const Tank = require('./Tank.js');
const Wall = require('./Wall.js');
const OverlapTester = require('./OverlapTester.js');
const BotTank = require('./BotTank.js');

const SharedSettings = require('../public/js/SharedSettings.js');
const GameSettings = require('./GameSettings.js');

module.exports = class World {
    // コンストラクタ
    constructor(io) {
        this.io = io;   // socketIO
        this.setTank = new Set();	// タンクセット ※SetクラスはES6の機能
        this.setWall = new Set();	// 壁セット
        this.setBullet = new Set();	// 弾丸リスト
        this.setNotPlayingSocketID = new Set(); // プレイしていない通信のソケットIDリスト
        // ランダムに壁を生成
        for(let i=0; i < GameSettings.WALL_COUNT; i++) {
            // ランダム座標値の作成
            const fX_left   = Math.random() * ( SharedSettings.FIELD_WIDTH - SharedSettings.WALL_WIDTH );
            const fY_bottom = Math.random() * ( SharedSettings.FIELD_HEIGHT - SharedSettings.WALL_HEIGHT );
            // 壁生成
            const wall = new Wall(fX_left   + SharedSettings.WALL_WIDTH  * 0.5,
                                  fY_bottom + SharedSettings.WALL_HEIGHT * 0.5 );
            // 壁リストへの登録
            this.setWall.add(wall);
        }
        // ボットの生成
        for(let i = 0; i < GameSettings.BOTTANK_COUNT; i++) {
            this.createBotTank('Bot' + (i + 1));
        }
    }

    // 更新処理
    update(fDeltaTime) {
        // オブジェクトの座標値の更新
        this.updateObjects(fDeltaTime);
        // 衝突チェック
        this.checkCollisions();
        // 新たな行動（特に、ボットに関する生成や動作
        this.doNewActions(fDeltaTime);
    }

    // オブジェクトの座標値の更新
    updateObjects(fDeltaTime) {
        // タンクの可動域
        const rectTankField = {
            fLeft:   0 + SharedSettings.TANK_WIDTH  * 0.5,
            fBottom: 0 + SharedSettings.TANK_HEIGHT * 0.5,
            fRight: SharedSettings.FIELD_WIDTH  - SharedSettings.TANK_WIDTH  * 0.5,
            fTop:   SharedSettings.FIELD_HEIGHT - SharedSettings.TANK_HEIGHT * 0.5
        };
        // 各タンク処理
        this.setTank.forEach((tank) => {
            tank.update(fDeltaTime, rectTankField, this.setWall);
        });

        // 弾丸の可動域
        const rectBulletField = {
            fLeft:   0 + SharedSettings.BULLET_WIDTH  * 0.5,
            fBottom: 0 + SharedSettings.BULLET_HEIGHT * 0.5,
            fRight: SharedSettings.FIELD_WIDTH  - SharedSettings.BULLET_WIDTH  * 0.5,
            fTop:   SharedSettings.FIELD_HEIGHT - SharedSettings.BULLET_HEIGHT * 0.5
        };
        // 各弾丸処理
        this.setBullet.forEach((bullet) => {
            // 前進した後、消失判定が返ってくる
            const bDisappear = bullet.update(fDeltaTime, rectBulletField, this.setWall);
            // 消失判定有なら消す
            if(bDisappear) {
                this.destroyBullet(bullet);
            }
        });
    }

    // 衝突のチェック
    checkCollisions() {
        // 弾丸ごとの処理
        this.setBullet.forEach((bullet) => {
            // タンクごとの処理
            this.setTank.forEach((tank) => {
                // 発射元のタンクとの衝突処理はなし
                if(tank !== bullet.tank) {
                    // 衝突したらダメージ
                    if(OverlapTester.overlapRects(tank.rectBound, bullet.rectBound)) {
                        // ライフ無くなった
                        if(0 === tank.damage()) {
                            console.log('dead : socket.id = %s', tank.strSocketID);
                            this.destroyTank(tank); // タンクの削除
                        }
                        this.destroyBullet(bullet);
                        bullet.tank.iScore++;	// 当てたタンクの得点を加算する
                    }
                }
            });
        });
    }

    // 新たな行動
    doNewActions(fDeltaTime) {
        this.setTank.forEach((tank) => {
            // ボットは、新たな弾丸を打つかも
            if(tank.isBot) {
                // 1秒でN発の発射確率で発射する。（N = GameSettings.BOTTANK_SHOOT_PROBABILITY_PER_SEC）
                if(GameSettings.BOTTANK_SHOOT_PROBABILITY_PER_SEC * fDeltaTime > Math.random()) {
                    this.createBullet(tank);
                }
            }
        });
    }

    // タンクの生成
    createTank(strSocketID, strNickName) {
        // ゲーム開始。プレイしていない通信のソケットIDリストから削除
        this.setNotPlayingSocketID.delete(strSocketID);
        // タンクの可動域
        const rectTankField = {
            fLeft:   0 + SharedSettings.TANK_WIDTH  * 0.5,
            fBottom: 0 + SharedSettings.TANK_HEIGHT * 0.5,
            fRight: SharedSettings.FIELD_WIDTH  - SharedSettings.TANK_WIDTH  * 0.5,
            fTop:   SharedSettings.FIELD_HEIGHT - SharedSettings.TANK_HEIGHT * 0.5
        };
        const tank = new Tank(strSocketID, strNickName, rectTankField, this.setWall);
        this.setTank.add(tank);
        return tank;
    }

    // ボットタンクの生成
    createBotTank(strNickName) {
        // タンクの可動域
        const rectTankField = {
            fLeft: 0 + SharedSettings.TANK_WIDTH * 0.5,
            fBottom: 0 + SharedSettings.TANK_HEIGHT * 0.5,
            fRight: SharedSettings.FIELD_WIDTH - SharedSettings.TANK_WIDTH * 0.5,
            fTop: SharedSettings.FIELD_HEIGHT - SharedSettings.TANK_HEIGHT * 0.5
        };
        const tank = new BotTank(strNickName, rectTankField, this.setWall);
        this.setTank.add(tank);
    }

    // タンクの破棄
    destroyTank(tank) {
        this.setTank.delete(tank);
        // 破棄タンクがボットなら、一定時間後に、新たなボット生成
        if(tank.isBot) {
            setTimeout(() => {
                this.createBotTank(tank.strNickName);
            },
            GameSettings.BOTTANK_WAIT_FOR_NEW_BOT);
        } else {
            // ゲーム開始前に戻るので、プレイしていない通信のソケットIDリストに追加
            this.setNotPlayingSocketID.add(tank.strSocketID);
            // 破棄タンクのクライアントにイベント'dead'を送信
            this.io.to(tank.strSocketID).emit('dead');
        }
    }

    // 弾丸の生成
    createBullet(tank) {
        const bullet = tank.shoot();
        if(bullet) {
            this.setBullet.add(bullet);
        }
    }

    // 弾丸の破棄
    destroyBullet(bullet) {
        this.setBullet.delete(bullet);
    }
}
