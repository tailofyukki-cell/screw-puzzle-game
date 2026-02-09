/**
 * ItemManager - サポートアイテム管理システム
 */
const ItemManager = {
    activeItem: null,
    
    /**
     * アイテムを使用
     * @param {string} itemType - アイテムタイプ
     * @param {Object} gameState - ゲーム状態
     * @returns {boolean} 使用成功/失敗
     */
    useItem(itemType, gameState) {
        if (gameState.items[itemType] <= 0) {
            return false;
        }
        
        this.activeItem = itemType;
        console.log(`[ItemManager] Activated item: ${itemType}`);
        return true;
    },

    /**
     * アクティブアイテムを実行
     * @param {string} itemType - アイテムタイプ
     * @param {Object} gameState - ゲーム状態
     * @param {Object} clickData - クリックデータ(必要に応じて)
     * @returns {Object} 実行結果
     */
    executeItem(itemType, gameState, clickData = null) {
        switch (itemType) {
            case 'hint':
                return this._executeHint(gameState);
            case 'expose':
                return this._executeExpose(gameState, clickData);
            case 'drill':
                return this._executeDrill(gameState, clickData);
            case 'shuffle':
                return this._executeShuffle(gameState);
            default:
                return { success: false };
        }
    },

    /**
     * ヒント: 外せるネジをハイライト
     * @private
     */
    _executeHint(gameState) {
        const removableScrews = [];
        
        for (const plate of gameState.currentStage.plates) {
            for (const screw of plate.screws) {
                if (screw.removed) continue;
                
                const result = CollisionDetector.isScrewCovered(
                    screw, plate, gameState.currentStage.plates
                );
                
                if (!result.covered) {
                    removableScrews.push({ screw, plate });
                }
            }
        }
        
        console.log(`[ItemManager] Hint: Found ${removableScrews.length} removable screws`);
        
        return {
            success: true,
            type: 'hint',
            data: removableScrews
        };
    },

    /**
     * 露出チェック: 選択したネジを覆っているプレートを強調表示
     * @private
     */
    _executeExpose(gameState, clickData) {
        if (!clickData || !clickData.screw) {
            return { success: false, reason: 'No screw selected' };
        }
        
        const result = CollisionDetector.isScrewCovered(
            clickData.screw, clickData.plate, gameState.currentStage.plates
        );
        
        console.log(`[ItemManager] Expose: Found ${result.coveringPlates.length} covering plates`);
        
        return {
            success: true,
            type: 'expose',
            data: {
                screw: clickData.screw,
                coveringPlates: result.coveringPlates
            }
        };
    },

    /**
     * ドリル: 覆われていても1回だけ外せる
     * @private
     */
    _executeDrill(gameState, clickData) {
        if (!clickData || !clickData.screw) {
            return { success: false, reason: 'No screw selected' };
        }
        
        console.log(`[ItemManager] Drill: Forcing screw removal`);
        
        return {
            success: true,
            type: 'drill',
            data: {
                screw: clickData.screw,
                plate: clickData.plate,
                forceRemove: true
            }
        };
    },

    /**
     * シャッフル: 同難易度で再生成
     * @private
     */
    _executeShuffle(gameState) {
        console.log(`[ItemManager] Shuffle: Regenerating stage ${gameState.stageNumber}`);
        
        return {
            success: true,
            type: 'shuffle',
            data: {
                stageNumber: gameState.stageNumber
            }
        };
    },

    /**
     * アイテムを消費
     * @param {string} itemType - アイテムタイプ
     * @param {Object} gameState - ゲーム状態
     */
    consumeItem(itemType, gameState) {
        if (gameState.items[itemType] > 0) {
            gameState.items[itemType]--;
            console.log(`[ItemManager] Consumed ${itemType}, remaining: ${gameState.items[itemType]}`);
        }
        this.activeItem = null;
    },

    /**
     * アイテムをクリア報酬として付与
     * @param {Object} gameState - ゲーム状態
     */
    grantClearReward(gameState) {
        // 各アイテムを1つずつ付与
        for (const itemType in gameState.items) {
            gameState.items[itemType]++;
        }
        console.log('[ItemManager] Granted clear reward items');
    },

    /**
     * アクティブアイテムをキャンセル
     */
    cancelActiveItem() {
        this.activeItem = null;
    }
};
