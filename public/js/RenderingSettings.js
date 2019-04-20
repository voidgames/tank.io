// クライアント側スクリプトでのみ使用する設定（描画設定）クラス
class RenderingSettings {
    // 背景タイルのサイズ
    static get FIELDTILE_WIDTH() { return 512; }
    static get FIELDTILE_HEIGHT() { return 512; }
    // フィールド
    static get FIELD_LINECOLOR() { return 'blue'; }
    static get FIELD_LINEWIDTH() { return 5; }
    // 処理時間
    static get PROCESSINGTIME_FONT() { return '30px Bold Arial'; }
    static get PROCESSINGTIME_COLOR() { return 'black'; }
    // ライフ
    static get LIFE_REMAINING_COLOR() { return 'green'; }
    static get LIFE_MISSING_COLOR() { return 'red'; }
    // スコア
    static get SCORE_FONT() { return '30px Bold Arial'; }
    static get SCORE_COLOR() { return 'black'; };
    // ニックネーム
    static get NICKNAME_FONT() { return '30px Bold Arial'; }
    static get NICKNAME_COLOR() { return 'blue'; }
}