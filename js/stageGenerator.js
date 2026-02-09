/**
 * StageGenerator - ステージ生成・難易度管理システム
 */
const StageGenerator = {
    /**
     * 難易度に応じた木材色を取得
     * @param {number} difficulty - 難易度(ステージ番号)
     * @returns {string} 木材色(HEX)
     */
    getWoodColor(difficulty) {
        const colorStages = [
            { max: 10, color: '#D4A574' },  // 明るい木色
            { max: 30, color: '#A67C52' },  // 標準的な茶色
            { max: 50, color: '#8B5A3C' },  // 濃い茶色
            { max: Infinity, color: '#6B4423' } // 焦げ茶
        ];

        for (const stage of colorStages) {
            if (difficulty <= stage.max) {
                return stage.color;
            }
        }
        return colorStages[colorStages.length - 1].color;
    },

    /**
     * 難易度パラメータを計算
     * @param {number} stageNumber - ステージ番号
     * @returns {Object} 難易度パラメータ
     */
    calculateDifficultyParams(stageNumber) {
        const difficulty = stageNumber;
        
        return {
            plateCount: Math.min(3 + Math.floor(difficulty / 5), 12), // 最大12枚
            screwsPerPlate: Math.min(2 + Math.floor(difficulty / 10), 6), // 最大6個
            ellipseRatio: Math.min(0.7, difficulty * 0.05), // 最大70%
            minPlateRadius: Math.max(40, 60 - difficulty * 0.5), // 最小40
            maxPlateRadius: Math.min(100, 80 + difficulty * 0.3), // 最大100
            overlapDensity: Math.min(0.8, 0.3 + difficulty * 0.02) // 最大80%
        };
    },

    /**
     * ステージを生成
     * @param {number} stageNumber - ステージ番号
     * @param {number} canvasWidth - キャンバス幅
     * @param {number} canvasHeight - キャンバス高さ
     * @returns {Object} ステージデータ
     */
    generateStage(stageNumber, canvasWidth, canvasHeight) {
        const maxAttempts = 10;
        let attempt = 0;
        
        while (attempt < maxAttempts) {
            attempt++;
            
            const stage = this._generateStageInternal(stageNumber, canvasWidth, canvasHeight);
            
            // 詰み防止チェック
            if (CollisionDetector.hasRemovableScrews(stage.plates)) {
                console.log(`[StageGenerator] Stage ${stageNumber} generated successfully (attempt ${attempt})`);
                return stage;
            }
            
            console.warn(`[StageGenerator] Stage ${stageNumber} has no removable screws, regenerating... (attempt ${attempt})`);
        }
        
        // 最大試行回数に達した場合は最後の生成結果を返す
        console.error(`[StageGenerator] Failed to generate valid stage after ${maxAttempts} attempts`);
        return this._generateStageInternal(stageNumber, canvasWidth, canvasHeight);
    },

    /**
     * ステージ生成の内部実装
     * @private
     */
    _generateStageInternal(stageNumber, canvasWidth, canvasHeight) {
        PlateSystem.resetIdCounters();
        
        const params = this.calculateDifficultyParams(stageNumber);
        const woodColor = this.getWoodColor(stageNumber);
        const plates = [];
        
        // プレート生成
        for (let i = 0; i < params.plateCount; i++) {
            const isEllipse = Math.random() < params.ellipseRatio;
            const type = isEllipse ? 'ellipse' : 'circle';
            
            // プレートサイズ
            const radiusX = params.minPlateRadius + 
                           Math.random() * (params.maxPlateRadius - params.minPlateRadius);
            const radiusY = isEllipse ? 
                           (radiusX * (0.5 + Math.random() * 0.4)) : radiusX;
            
            // プレート位置(キャンバス内に収める)
            const margin = Math.max(radiusX, radiusY) + 20;
            const x = margin + Math.random() * (canvasWidth - margin * 2);
            const y = margin + Math.random() * (canvasHeight - margin * 2);
            
            // 回転角
            const rotation = Math.random() * Math.PI * 2;
            
            // Z順(ランダムだが重なりを考慮)
            const zIndex = i;
            
            // ネジ数(ランダム性を持たせる)
            const screwCount = Math.max(2, 
                params.screwsPerPlate + Math.floor(Math.random() * 3 - 1));
            
            const plate = PlateSystem.createPlate(
                type, x, y, radiusX, radiusY, rotation, zIndex, woodColor, screwCount
            );
            
            plates.push(plate);
        }
        
        return {
            stageNumber: stageNumber,
            difficulty: stageNumber,
            plates: plates,
            woodColor: woodColor,
            params: params
        };
    },

    /**
     * 同難易度でステージを再生成(シャッフル)
     * @param {number} stageNumber - ステージ番号
     * @param {number} canvasWidth - キャンバス幅
     * @param {number} canvasHeight - キャンバス高さ
     * @returns {Object} ステージデータ
     */
    shuffleStage(stageNumber, canvasWidth, canvasHeight) {
        console.log(`[StageGenerator] Shuffling stage ${stageNumber}`);
        return this.generateStage(stageNumber, canvasWidth, canvasHeight);
    }
};
