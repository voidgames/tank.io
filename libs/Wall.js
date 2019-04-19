const GameObject = require( './GameObject.js' );
const SharedSettings = require( '../public/js/SharedSettings.js' );

// 壁クラス
module.exports = class Wall extends GameObject {
    constructor(fX, fY) {
        super( SharedSettings.WALL_WIDTH, SharedSettings.WALL_HEIGHT, fX, fY, 0 );
    }
}