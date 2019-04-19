const OverlapTester = require('./OverlapTester.js');

module.exports = class GameObject {
    constructor(fWidth, fHeight, fX, fY, fAngle) {
        this.fWidth = fWidth;	// 幅
        this.fHeight = fHeight;	// 高さ
        this.fX = fX;	        // 位置(X)
        this.fY = fY;	        // 位置(Y)
        this.fAngle = fAngle;	// 向き（+x軸の方向が0。+y軸の方向がPI/2）
        this.rectBound = {};
        this.setPos(fX, fY);
        // this.fX = fX;
        // this.fY = fY;
    }

    // GameObj 情報を json で送信
    toJson() {
        return {
            fX: this.fX,
            fY: this.fY,
            fAngle: this.fAngle
        };
    }

    // GameObjの 座標 & 存在範囲 指定
    setPos(fX, fY) {
        this.fX = fX;
        this.fY = fY;
        // 存在範囲は原点から
        this.rectBound = {
            fTop:    fY + this.fHeight * 0.5,
            fBottom: fY - this.fHeight * 0.5,
            fRight:  fX + this.fWidth  * 0.5,
            fLeft:   fX - this.fWidth  * 0.5,
        };
    }

    // 壁との干渉チェック
    overlapWalls(setWall) {
        return Array.from( setWall ).some((wall) => {
            if(OverlapTester.overlapRects(this.rectBound, wall.rectBound)) {
                return true;
            }
        });
    }
}