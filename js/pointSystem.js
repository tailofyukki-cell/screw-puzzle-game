/**
 * PointSystem - ポイント・広告システム(将来拡張用)
 */
const PointSystem = {
    /**
     * ポイントを付与(ダミー実装)
     * @param {number} amount - 付与するポイント数
     * @param {string} reason - 付与理由
     */
    grantPoints(amount, reason) {
        console.log(`[PointSystem] +${amount} points (${reason})`);
        
        // 将来実装予定:
        // - サーバーへの送信
        // - トランザクション記録
        // - 実績解除チェック
        
        return amount;
    },

    /**
     * リワード広告をリクエスト(ダミー実装)
     * @param {string} context - 広告表示コンテキスト
     * @returns {Promise} 広告視聴結果
     */
    async requestRewardedAd(context) {
        console.log(`[AdSystem] Rewarded ad requested: ${context}`);
        
        // 将来実装予定:
        // - AdMob/AdSense SDK連携
        // - 広告読み込み
        // - 広告表示
        // - 報酬付与
        
        return {
            success: false,
            reason: 'Not implemented yet',
            reward: 0
        };
    },

    /**
     * ステージクリア報酬を計算
     * @param {number} stageNumber - ステージ番号
     * @returns {number} 報酬ポイント
     */
    calculateStageReward(stageNumber) {
        // 基本報酬 + 難易度ボーナス
        const baseReward = 100;
        const difficultyBonus = Math.floor(stageNumber / 5) * 10;
        return baseReward + difficultyBonus;
    },

    /**
     * アイテム購入コストを取得
     * @param {string} itemType - アイテムタイプ
     * @returns {number} コスト
     */
    getItemCost(itemType) {
        const costs = {
            hint: 50,
            expose: 50,
            drill: 100,
            shuffle: 150
        };
        return costs[itemType] || 0;
    },

    /**
     * BGMパック購入コストを取得
     * @param {string} packId - パックID
     * @returns {number} コスト
     */
    getBGMPackCost(packId) {
        const costs = {
            default: 0,
            workshop: 1000,
            nature: 1500
        };
        return costs[packId] || 0;
    },

    /**
     * アイテムを購入(将来実装)
     * @param {string} itemType - アイテムタイプ
     * @param {number} currentPoints - 現在のポイント
     * @returns {Object} { success: boolean, newPoints: number }
     */
    purchaseItem(itemType, currentPoints) {
        const cost = this.getItemCost(itemType);
        
        if (currentPoints < cost) {
            return { success: false, newPoints: currentPoints, reason: 'Insufficient points' };
        }
        
        console.log(`[PointSystem] Purchased ${itemType} for ${cost} points`);
        return { success: true, newPoints: currentPoints - cost };
    },

    /**
     * BGMパックを購入(将来実装)
     * @param {string} packId - パックID
     * @param {number} currentPoints - 現在のポイント
     * @returns {Object} { success: boolean, newPoints: number }
     */
    purchaseBGMPack(packId, currentPoints) {
        const cost = this.getBGMPackCost(packId);
        
        if (currentPoints < cost) {
            return { success: false, newPoints: currentPoints, reason: 'Insufficient points' };
        }
        
        console.log(`[PointSystem] Purchased BGM pack '${packId}' for ${cost} points`);
        return { success: true, newPoints: currentPoints - cost };
    }
};
