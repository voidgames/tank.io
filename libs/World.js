// ワールドクラス
// ・ゲーム内の各種要素を保持する
// ・ゲームに保持される
// ・ゲームワールドの更新処理を有する（ゲームから要請を受け、保持する各種要素を更新する）
// ・ゲーム内の各種要素の生成、破棄を有する
const Tank = require('./Tank.js');
const Wall = require('./Wall.js');

const SharedSettings = require('../public/js/SharedSettings.js');
const GameSettings = require('./GameSettings.js');

module.exports = class World {
    // コンストラクタ
    constructor(io) {
        this.io = io;   // socketIO
        this.setTank = new Set();	// タンクセット ※SetクラスはES6の機能
        this.setWall = new Set();	// 壁セット
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

        this.setTank.forEach((tank) => {
            tank.update(fDeltaTime, rectTankField, this.setWall);
        });
    }

    // 衝突のチェック
    checkCollisions() {
    }

    // 新たな行動
    doNewActions( fDeltaTime ) {
    }

    // タンクの生成
    createTank() {
        // タンクの可動域
        const rectTankField = {
            fLeft:   0 + SharedSettings.TANK_WIDTH  * 0.5,
            fBottom: 0 + SharedSettings.TANK_HEIGHT * 0.5,
            fRight: SharedSettings.FIELD_WIDTH  - SharedSettings.TANK_WIDTH  * 0.5,
            fTop:   SharedSettings.FIELD_HEIGHT - SharedSettings.TANK_HEIGHT * 0.5
        };
        const tank = new Tank(rectTankField, this.setWall);
        this.setTank.add(tank);
        return tank;
    }

    // タンクの破棄
    destroyTank(tank) {
        this.setTank.delete(tank);
    }
}
