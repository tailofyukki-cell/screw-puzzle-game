/**
 * PlateSystem - プレート・ネジ管理システム
 */
const PlateSystem = {
    nextPlateId: 1,
    nextScrewId: 1,

    /**
     * プレートを作成
     * @param {string} type - 'circle' または 'ellipse'
     * @param {number} x - 中心X座標
     * @param {number} y - 中心Y座標
     * @param {number} radiusX - X軸半径
     * @param {number} radiusY - Y軸半径
     * @param {number} rotation - 回転角(ラジアン)
     * @param {number} zIndex - Z順
     * @param {string} color - 木材色
     * @param {number} screwCount - ネジの数
     * @returns {Object} プレートオブジェクト
     */
    createPlate(type, x, y, radiusX, radiusY, rotation, zIndex, color, screwCount) {
        const plate = {
            id: this.nextPlateId++,
            type: type,
            x: x,
            y: y,
            radiusX: radiusX,
            radiusY: radiusY,
            rotation: rotation,
            zIndex: zIndex,
            color: color,
            screws: []
        };

        // ネジを配置
        for (let i = 0; i < screwCount; i++) {
            const angle = (Math.PI * 2 * i) / screwCount + (Math.random() * 0.3 - 0.15);
            const distance = (radiusX * 0.6) + (Math.random() * radiusX * 0.2);
            
            const screwX = x + Math.cos(angle + rotation) * distance;
            const screwY = y + Math.sin(angle + rotation) * distance;
            
            plate.screws.push(this.createScrew(plate.id, screwX, screwY));
        }

        return plate;
    },

    /**
     * ネジを作成
     * @param {number} plateId - 所属するプレートのID
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {Object} ネジオブジェクト
     */
    createScrew(plateId, x, y) {
        return {
            id: this.nextScrewId++,
            plateId: plateId,
            x: x,
            y: y,
            removed: false
        };
    },

    /**
     * ネジを外す
     * @param {Object} screw - ネジオブジェクト
     */
    removeScrew(screw) {
        screw.removed = true;
    },

    /**
     * プレートの全ネジが外れたか確認
     * @param {Object} plate - プレートオブジェクト
     * @returns {boolean}
     */
    isPlateCleared(plate) {
        return plate.screws.every(screw => screw.removed);
    },

    /**
     * 全プレートがクリアされたか確認
     * @param {Array} plates - 全プレートの配列
     * @returns {boolean}
     */
    areAllPlatesCleared(plates) {
        return plates.every(plate => this.isPlateCleared(plate));
    },

    /**
     * 残りネジ数をカウント
     * @param {Array} plates - 全プレートの配列
     * @returns {number}
     */
    countRemainingScrews(plates) {
        let count = 0;
        for (const plate of plates) {
            for (const screw of plate.screws) {
                if (!screw.removed) count++;
            }
        }
        return count;
    },

    /**
     * 総ネジ数をカウント
     * @param {Array} plates - 全プレートの配列
     * @returns {number}
     */
    countTotalScrews(plates) {
        let count = 0;
        for (const plate of plates) {
            count += plate.screws.length;
        }
        return count;
    },

    /**
     * プレートをIDで検索
     * @param {Array} plates - 全プレートの配列
     * @param {number} plateId - プレートID
     * @returns {Object|null}
     */
    findPlateById(plates, plateId) {
        return plates.find(plate => plate.id === plateId) || null;
    },

    /**
     * IDカウンターをリセット
     */
    resetIdCounters() {
        this.nextPlateId = 1;
        this.nextScrewId = 1;
    }
};
