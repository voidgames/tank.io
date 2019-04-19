const GameObject = require('./GameObject.js');
const GameSettings = require('./GameSettings.js');
const SharedSettings = require('../public/js/SharedSettings.js');
const OverlapTester = require('./OverlapTester.js');

module.exports = class Tank extends GameObject {
    constructor(rectField, setWall) {
        super( SharedSettings.TANK_WIDTH, SharedSettings.TANK_HEIGHT, 0.0, 0.0, Math.random() * 2 * Math.PI );

        this.objMovement = {};	// 動作コマンド
        this.fSpeed = GameSettings.TANK_SPEED;    // 速度[m/s]。1frameあたり5進む => 1/30[s] で5進む => 1[s]で150進む。
        this.fRotationSpeed = GameSettings.TANK_ROTATION_SPEED;    // 回転速度[rad/s]。1frameあたり0.1進む => 1/30[s] で0.1進む => 1[s]で3[rad]進む。
        // 障害物にぶつからない初期位置の算出
        do {
            this.setPos(rectField.fLeft   + Math.random() * (rectField.fRight - rectField.fLeft),
                        rectField.fBottom + Math.random() * (rectField.fTop   - rectField.fBottom));
        } while(this.overlapWalls(setWall));

        // 初期位置
        // this.fX = Math.random() * ( SharedSettings.FIELD_WIDTH - SharedSettings.TANK_WIDTH );
        // this.fY = Math.random() * ( SharedSettings.FIELD_HEIGHT - SharedSettings.TANK_HEIGHT );
    }

    update(fDeltaTime, rectField, setWall) {
        const fX_old = this.fX; // 移動前座標値のバックアップ
        const fY_old = this.fY; // 移動前座標値のバックアップ
        let bDrived = false;	// 前後方向の動きがあったか

        // 動作に従って、タンクの状態を更新
        if(this.objMovement['forward']) {	// 前進
            const fDistance = this.fSpeed * fDeltaTime;
            // this.fX += fDistance * Math.cos(this.fAngle);
            // this.fY += fDistance * Math.sin(this.fAngle);
            this.setPos(this.fX + fDistance * Math.cos(this.fAngle),
                        this.fY + fDistance * Math.sin(this.fAngle));
            bDrived = true;
        }
        if(this.objMovement['back']) {	// 後進
            const fDistance = this.fSpeed * fDeltaTime;
            // this.fX -= fDistance * Math.cos(this.fAngle);
            // this.fY -= fDistance * Math.sin(this.fAngle);
            this.setPos(this.fX - fDistance * Math.cos(this.fAngle),
                        this.fY - fDistance * Math.sin(this.fAngle));
            bDrived = true;
        }
        // 前進/後退時は不可侵領域との衝突判定、衝突有ならロールバック
        if(bDrived) {
            let bCollision = false; // 衝突判定
            // フィールド外に出る
            if(!OverlapTester.pointInRect(rectField, {fX: this.fX, fY: this.fY})){
                bCollision = true;
            }
            //  壁と衝突
            else if(this.overlapWalls(setWall)){
                bCollision = true;
            }
            // 衝突有ならロールバック
            if(bCollision){
                this.setPos(fX_old, fY_old);
                bDrived = false;	// 前後方向の動きはなし
            }
        }

        if(this.objMovement['left']) {	// 左転回
            //this.fAngle += this.fRotationSpeed * fDeltaTime;  // Y軸が「上」向き用（WebGLキャンバスへの描画用）
            this.fAngle -= this.fRotationSpeed * fDeltaTime;    // Y軸が「下」向き用（2Dキャンバスへの描画用）
        }
        if(this.objMovement['right']) {	// 右転回
            //this.fAngle -= this.fRotationSpeed * fDeltaTime;  // Y軸が「上」向き用（WebGLキャンバスへの描画用）
            this.fAngle += this.fRotationSpeed * fDeltaTime;    // Y軸が「下」向き用（2Dキャンバスへの描画用）
        }

        return bDrived;	// 前後方向の動きがあったかを返す（ボットタンクで使用する）
    }
}
