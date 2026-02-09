/**
 * CollisionDetector - 重なり判定システム
 */
const CollisionDetector = {
    /**
     * 点が円の内部にあるか判定
     * @param {number} px - 点のX座標
     * @param {number} py - 点のY座標
     * @param {number} cx - 円の中心X座標
     * @param {number} cy - 円の中心Y座標
     * @param {number} radius - 円の半径
     * @returns {boolean}
     */
    isPointInCircle(px, py, cx, cy, radius) {
        const dx = px - cx;
        const dy = py - cy;
        return (dx * dx + dy * dy) <= (radius * radius);
    },

    /**
     * 点が楕円の内部にあるか判定
     * @param {number} px - 点のX座標
     * @param {number} py - 点のY座標
     * @param {number} cx - 楕円の中心X座標
     * @param {number} cy - 楕円の中心Y座標
     * @param {number} radiusX - 楕円のX軸半径
     * @param {number} radiusY - 楕円のY軸半径
     * @param {number} rotation - 楕円の回転角(ラジアン)
     * @returns {boolean}
     */
    isPointInEllipse(px, py, cx, cy, radiusX, radiusY, rotation) {
        // 点を楕円の座標系に変換
        const dx = px - cx;
        const dy = py - cy;
        
        // 回転を考慮
        const cos = Math.cos(-rotation);
        const sin = Math.sin(-rotation);
        const rotatedX = dx * cos - dy * sin;
        const rotatedY = dx * sin + dy * cos;
        
        // 楕円の方程式: (x/a)^2 + (y/b)^2 <= 1
        const normalized = (rotatedX * rotatedX) / (radiusX * radiusX) +
                          (rotatedY * rotatedY) / (radiusY * radiusY);
        
        return normalized <= 1;
    },

    /**
     * 点がプレートの内部にあるか判定
     * @param {number} px - 点のX座標
     * @param {number} py - 点のY座標
     * @param {Object} plate - プレートオブジェクト
     * @returns {boolean}
     */
    isPointInPlate(px, py, plate) {
        if (plate.type === 'circle') {
            return this.isPointInCircle(px, py, plate.x, plate.y, plate.radiusX);
        } else if (plate.type === 'ellipse') {
            return this.isPointInEllipse(px, py, plate.x, plate.y, 
                plate.radiusX, plate.radiusY, plate.rotation);
        }
        return false;
    },

    /**
     * ネジが他のプレートに覆われているか判定
     * @param {Object} screw - ネジオブジェクト
     * @param {Object} screwPlate - ネジが属するプレート
     * @param {Array} allPlates - 全プレートの配列
     * @returns {Object} { covered: boolean, coveringPlates: Array }
     */
    isScrewCovered(screw, screwPlate, allPlates) {
        const coveringPlates = [];
        
        // ネジが属するプレートより上位のプレートをチェック
        for (const plate of allPlates) {
            // 同じプレートまたは下位プレートはスキップ
            if (plate.id === screwPlate.id || plate.zIndex <= screwPlate.zIndex) {
                continue;
            }
            
            // ネジの中心点がプレート内部にあるか判定
            if (this.isPointInPlate(screw.x, screw.y, plate)) {
                coveringPlates.push(plate);
            }
        }
        
        return {
            covered: coveringPlates.length > 0,
            coveringPlates: coveringPlates
        };
    },

    /**
     * ステージに外せるネジが存在するか確認(詰み防止)
     * @param {Array} plates - 全プレートの配列
     * @returns {boolean}
     */
    hasRemovableScrews(plates) {
        for (const plate of plates) {
            for (const screw of plate.screws) {
                if (screw.removed) continue;
                
                const result = this.isScrewCovered(screw, plate, plates);
                if (!result.covered) {
                    return true; // 外せるネジが見つかった
                }
            }
        }
        return false; // 外せるネジが1つもない(詰み)
    },

    /**
     * キャンバス座標からネジを検索
     * @param {number} x - クリック/タップのX座標
     * @param {number} y - クリック/タップのY座標
     * @param {Array} plates - 全プレートの配列
     * @param {number} hitRadius - ヒット判定の半径
     * @returns {Object|null} { screw, plate } または null
     */
    findScrewAt(x, y, plates, hitRadius = 15) {
        // Z順が高い(上位)プレートから優先的にチェック
        const sortedPlates = [...plates].sort((a, b) => b.zIndex - a.zIndex);
        
        for (const plate of sortedPlates) {
            for (const screw of plate.screws) {
                if (screw.removed) continue;
                
                const dx = x - screw.x;
                const dy = y - screw.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= hitRadius) {
                    return { screw, plate };
                }
            }
        }
        
        return null;
    }
};
