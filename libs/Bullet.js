const GameObject = require('./GameObject.js');
const OverlapTester = require('./OverlapTester.js');

const SharedSettings = require('../public/js/SharedSettings.js');
const GameSettings = require('./GameSettings.js');

// 弾丸クラス
module.exports = class Bullet extends GameObject {
    constructor(fX, fY, fAngle, tank) {
        super(SharedSettings.BULLET_WIDTH, SharedSettings.BULLET_HEIGHT, fX, fY, fAngle);

        this.fSpeed = GameSettings.BULLET_SPEED;
        this.tank = tank;	// どのタンクから発射されたか
        this.fLifeTime = GameSettings.BULLET_LIFETIME_MAX;
    }

    update(fDeltaTime, rectField, setWall) {
        // 一定時間経ったら消失
        this.fLifeTime -= fDeltaTime;
        if(0 > this.fLifeTime) {   
            return true;
        }
        // 前進
        const fDistance = this.fSpeed * fDeltaTime;
        this.setPos(this.fX + fDistance * Math.cos(this.fAngle),
                    this.fY + fDistance * Math.sin(this.fAngle));
        // 不可侵領域との衝突判定、衝突有なら消失
        let bCollision = false;
        // フィールドの外に出た
        if(!OverlapTester.pointInRect(rectField, {fX: this.fX, fY: this.fY})) {
            bCollision = true;
        }
        // 壁に当たった
        else if( this.overlapWalls(setWall)) {
            bCollision = true;
        }
        return bCollision;    // 消失かどうかを返す。
    }
};
