/**
 * Renderer - Canvas描画システム
 */
const Renderer = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,

    /**
     * 初期化
     * @param {HTMLCanvasElement} canvas - キャンバス要素
     */
    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        
        // 高DPI対応
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.width = rect.width;
        this.height = rect.height;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    },

    /**
     * リサイズ
     */
    resize() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight, 600);
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
    },

    /**
     * 画面をクリア
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    },

    /**
     * ステージを描画
     * @param {Object} stage - ステージデータ
     * @param {Object} highlightData - ハイライトデータ
     */
    drawStage(stage, highlightData = {}) {
        this.clear();
        
        // プレートをZ順でソート(下から描画)
        const sortedPlates = [...stage.plates].sort((a, b) => a.zIndex - b.zIndex);
        
        for (const plate of sortedPlates) {
            // クリア済みプレートはスキップ
            if (PlateSystem.isPlateCleared(plate)) {
                continue;
            }
            
            // ハイライト判定
            const isHighlighted = highlightData.coveringPlates && 
                                 highlightData.coveringPlates.some(p => p.id === plate.id);
            
            this.drawPlate(plate, isHighlighted);
            this.drawScrews(plate, highlightData);
        }
    },

    /**
     * プレートを描画
     * @param {Object} plate - プレートオブジェクト
     * @param {boolean} highlighted - ハイライト表示
     */
    drawPlate(plate, highlighted = false) {
        this.ctx.save();
        
        // 木目テクスチャ風の描画
        this.ctx.translate(plate.x, plate.y);
        this.ctx.rotate(plate.rotation);
        
        // 影
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 3;
        this.ctx.shadowOffsetY = 3;
        
        // プレート本体
        this.ctx.fillStyle = highlighted ? 'rgba(255, 200, 0, 0.5)' : plate.color;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, plate.radiusX, plate.radiusY, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 縁取り
        this.ctx.shadowColor = 'transparent';
        this.ctx.strokeStyle = this._darkenColor(plate.color, 20);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 木目風の線(簡易)
        this.ctx.strokeStyle = this._darkenColor(plate.color, 10);
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        for (let i = 0; i < 3; i++) {
            const offset = (i - 1) * plate.radiusY * 0.3;
            this.ctx.beginPath();
            this.ctx.ellipse(0, offset, plate.radiusX * 0.8, plate.radiusY * 0.2, 0, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    },

    /**
     * ネジを描画
     * @param {Object} plate - プレートオブジェクト
     * @param {Object} highlightData - ハイライトデータ
     */
    drawScrews(plate, highlightData = {}) {
        for (const screw of plate.screws) {
            if (screw.removed) continue;
            
            // ハイライト判定
            const isHinted = highlightData.hintedScrews && 
                            highlightData.hintedScrews.some(s => s.screw.id === screw.id);
            
            this.drawScrew(screw, isHinted);
        }
    },

    /**
     * ネジを描画
     * @param {Object} screw - ネジオブジェクト
     * @param {boolean} hinted - ヒント表示
     */
    drawScrew(screw, hinted = false) {
        this.ctx.save();
        
        const size = 12;
        
        // ヒント時のハイライト
        if (hinted) {
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(screw.x, screw.y, size + 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // ネジ本体(円)
        this.ctx.fillStyle = '#C0C0C0';
        this.ctx.strokeStyle = '#808080';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(screw.x, screw.y, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // プラス溝
        this.ctx.strokeStyle = '#606060';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        
        // 縦線
        this.ctx.beginPath();
        this.ctx.moveTo(screw.x, screw.y - size * 0.6);
        this.ctx.lineTo(screw.x, screw.y + size * 0.6);
        this.ctx.stroke();
        
        // 横線
        this.ctx.beginPath();
        this.ctx.moveTo(screw.x - size * 0.6, screw.y);
        this.ctx.lineTo(screw.x + size * 0.6, screw.y);
        this.ctx.stroke();
        
        this.ctx.restore();
    },

    /**
     * クリア演出を描画
     */
    drawClearEffect() {
        this.ctx.save();
        
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.font = 'bold 48px sans-serif';
        this.ctx.fillStyle = '#FFD700';
        this.ctx.strokeStyle = '#FF8C00';
        this.ctx.lineWidth = 3;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const text = 'CLEAR!';
        this.ctx.strokeText(text, this.width / 2, this.height / 2);
        this.ctx.fillText(text, this.width / 2, this.height / 2);
        
        this.ctx.restore();
    },

    /**
     * 色を暗くする
     * @param {string} color - HEX色
     * @param {number} amount - 暗くする量
     * @returns {string} 暗くした色
     */
    _darkenColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, (num >> 16) - amount);
        const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
        const b = Math.max(0, (num & 0x0000FF) - amount);
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    },

    /**
     * キャンバス座標を取得
     * @param {Event} event - イベントオブジェクト
     * @returns {Object} { x, y }
     */
    getCanvasCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
};
