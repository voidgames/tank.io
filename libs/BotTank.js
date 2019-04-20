const Tank = require( './Tank.js' );
const GameSettings = require( './GameSettings.js' );

// 自動で動くボットタンククラス
module.exports = class BotTank extends Tank {
    constructor(strNickName, fFieldWidth, fFieldHeight, setWall) {
        super('', strNickName, fFieldWidth, fFieldHeight, setWall);
        this.isBot = true;
        this.fSpeed = GameSettings.BOTTANK_SPEED;
        this.objMovement['forward'] = true;	// ひたすら前進。ものに当たったら、方向をランダムで変える。
    }

    update(fDeltaTime, rectField, setWall) {
        // タンククラスの更新処理
        const bDrived = super.update(fDeltaTime, rectField, setWall);
        // 前進できなかったら方向転換
        if(!bDrived) {
            this.fAngle = Math.random() * 2 * Math.PI;
        }
    }
}