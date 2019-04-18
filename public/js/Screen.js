// Game画面描画クラス
class Screen {
    constructor(socket, canvas) {
        this.socket = socket;
        this.canvas = canvas;
        // canvas の描画API にアクセスできるオブジェクト(=context)の参照を取得
        this.context = canvas.getContext('2d');
        this.assets = new Assets();
        this.iProcessingTimeNanoSec = 0;
        this.aTank = null;
        // キャンバスの初期化
        this.canvas.width = SharedSettings.FIELD_WIDTH;
        this.canvas.height = SharedSettings.FIELD_HEIGHT;
        // ソケットの初期化
        this.initSocket();
        // コンテキストの初期化
        // アンチエイリアスの抑止（画像がぼやけるのの防止）
        this.context.mozImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;
        this.context.imageSmoothingEnabled = false;
    }

    // ソケットの初期化
    initSocket() {
        // 接続確立
        this.socket.on('connect', () => {
            console.log('connect : socket.id = %s', socket.id);
            this.socket.emit('enter-the-game');
        });
        // サーバーからの定期更新通知
        this.socket.on('update', (aTank, iProcessingTimeNanoSec) => {
            this.aTank = aTank;
            this.iProcessingTimeNanoSec = iProcessingTimeNanoSec;
        });
    }

    // アニメーション（無限ループ処理）
    animate(iTimeCurrent) {
        requestAnimationFrame((iTimeCurrent) => {
            this.animate(iTimeCurrent);
        });
        this.render(iTimeCurrent);
    }

    // 画面の描画。animateから無限に呼び出される
    render(iTimeCurrent) {
        // キャンバスのクリア
        this.context.clearRect( 0, 0, canvas.width, canvas.height );
        // キャンバスの塗りつぶし
        this.renderField();
        // タンクの描画
        if(null !== this.aTank) {
            const fTimeCurrentSec = iTimeCurrent * 0.001; // iTimeCurrentは、ミリ秒。秒に変換。
            const iIndexFrame = parseInt( fTimeCurrentSec / 0.2 ) % 2;  // フレーム番号
            this.aTank.forEach((tank) =>{
                this.renderTank(tank, iIndexFrame);
            });
        }
        // キャンバスの枠の描画
        this.context.save(); // strokeRect前の状態
        this.context.strokeStyle = RenderingSettings.FIELD_LINECOLOR;
        this.context.lineWidth = RenderingSettings.FIELD_LINEWIDTH;
        this.context.strokeRect( 0, 0, canvas.width, canvas.height );
        this.context.restore(); // strokeRect前の状態をリストア
        // 画面右上にサーバー処理時間表示
        this.context.save(); 
        this.context.font = RenderingSettings.PROCESSINGTIME_FONT;
        this.context.fillStyle = RenderingSettings.PROCESSINGTIME_COLOR;
        this.context.fillText((this.iProcessingTimeNanoSec * 1e-9).toFixed(9) + ' [s]', this.canvas.width - 30 * 10, 40);
        this.context.restore();
    }

    renderField() {
        this.context.save();　// renderField前の状態
        let iCountX = parseInt(SharedSettings.FIELD_WIDTH / RenderingSettings.FIELDTILE_WIDTH);
        let iCountY = parseInt(SharedSettings.FIELD_HEIGHT / RenderingSettings.FIELDTILE_HEIGHT);
        for(let iIndexY = 0; iIndexY < iCountY; iIndexY++) {
            for( let iIndexX = 0; iIndexX < iCountX; iIndexX++ ) {
                this.context.drawImage( this.assets.imageField,
                    this.assets.rectFieldInFieldImage.sx, this.assets.rectFieldInFieldImage.sy,	// 描画元画像の右上座標
                    this.assets.rectFieldInFieldImage.sw, this.assets.rectFieldInFieldImage.sh,	// 描画元画像の大きさ
                    iIndexX * RenderingSettings.FIELDTILE_WIDTH,// 画像先領域の右上座標（領域中心が、原点になるように指定する）
                    iIndexY * RenderingSettings.FIELDTILE_HEIGHT,// 画像先領域の右上座標（領域中心が、原点になるように指定する）
                    RenderingSettings.FIELDTILE_WIDTH,	// 描画先領域の大きさ
                    RenderingSettings.FIELDTILE_HEIGHT );	// 描画先領域の大きさ
            }
        }
        this.context.restore(); // renderField前の状態をリストア
    }

    renderTank(tank, iIndexFrame) {
        this.context.save(); // translate前の状態
        // タンクの座標値に移動
        this.context.translate(tank.fX, tank.fY);
        // 画像描画
        this.context.save(); // rotate, drawImage前の状態
        this.context.rotate(tank.fAngle);
        this.context.drawImage(this.assets.imageItems,
            this.assets.arectTankInItemsImage[iIndexFrame].sx, this.assets.arectTankInItemsImage[iIndexFrame].sy,	// 描画元画像の右上座標
            this.assets.arectTankInItemsImage[iIndexFrame].sw, this.assets.arectTankInItemsImage[iIndexFrame].sh,	// 描画元画像の大きさ
            -SharedSettings.TANK_WIDTH * 0.5,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
            -SharedSettings.TANK_HEIGHT * 0.5,	// 画像先領域の右上座標（領域中心が、原点になるように指定する）
            SharedSettings.TANK_WIDTH,	        // 描画先領域の大きさ
            SharedSettings.TANK_HEIGHT);	    // 描画先領域の大きさ
        
        this.context.restore(); // rotate, drawImage前の状態をリストア

        this.context.restore(); // translate前の状態をリストア
    }
}
