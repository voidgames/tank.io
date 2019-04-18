module.exports = class GameObject {
    constructor(fWidth, fHeight, fX, fY, fAngle) {
        this.fWidth = fWidth;	// 幅
        this.fHeight = fHeight;	// 高さ
        this.fX = fX;	        // 位置(X)
        this.fY = fY;	        // 位置(Y)
        this.fAngle = fAngle;	// 向き（+x軸の方向が0。+y軸の方向がPI/2）

        this.fX = fX;
        this.fY = fY;
    }

    // GameObj 情報を json で送信
    toJson() {
        return {
            fX: this.fX,
            fY: this.fY,
            fAngle: this.fAngle
        };
    }
}