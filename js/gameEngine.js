/**
 * GameEngine - ゲーム全体の状態管理・制御
 */
const GameEngine = {
    gameState: null,
    highlightData: {},

    /**
     * ゲームを初期化
     */
    init() {
        console.log('[GameEngine] Initializing...');
        
        // 保存データを読み込み
        const savedData = StorageManager.load();
        
        if (savedData) {
            this.gameState = savedData;
            console.log('[GameEngine] Loaded saved data');
        } else {
            this.gameState = StorageManager.getDefaultData();
            console.log('[GameEngine] Created new game data');
        }
        
        // 音声システム初期化
        AudioManager.init();
        AudioManager.applySettings(this.gameState.settings);
        
        // 最初のステージを生成
        this.loadStage(this.gameState.stageNumber);
        
        console.log('[GameEngine] Initialized');
    },

    /**
     * ステージを読み込み
     * @param {number} stageNumber - ステージ番号
     */
    loadStage(stageNumber) {
        console.log(`[GameEngine] Loading stage ${stageNumber}...`);
        
        this.gameState.currentStage = StageGenerator.generateStage(
            stageNumber,
            Renderer.width,
            Renderer.height
        );
        
        this.gameState.stageNumber = stageNumber;
        this.highlightData = {};
        
        this.updateUI();
        this.render();
        
        console.log(`[GameEngine] Stage ${stageNumber} loaded`);
    },

    /**
     * ネジをクリック/タップ
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    handleScrewClick(x, y) {
        const result = CollisionDetector.findScrewAt(
            x, y, this.gameState.currentStage.plates
        );
        
        if (!result) {
            return; // ネジがない
        }
        
        const { screw, plate } = result;
        
        // アクティブアイテムがある場合
        if (ItemManager.activeItem) {
            this._handleItemClick(screw, plate);
            return;
        }
        
        // 通常のネジ外し処理
        this._tryRemoveScrew(screw, plate);
    },

    /**
     * アイテム使用時のクリック処理
     * @private
     */
    _handleItemClick(screw, plate) {
        const itemType = ItemManager.activeItem;
        
        const result = ItemManager.executeItem(itemType, this.gameState, { screw, plate });
        
        if (!result.success) {
            this.showMessage('アイテムを使用できませんでした');
            ItemManager.cancelActiveItem();
            this.updateUI();
            return;
        }
        
        // アイテムごとの処理
        switch (result.type) {
            case 'hint':
                this.highlightData.hintedScrews = result.data;
                this.showMessage(`外せるネジ: ${result.data.length}個`);
                break;
                
            case 'expose':
                this.highlightData.coveringPlates = result.data.coveringPlates;
                if (result.data.coveringPlates.length > 0) {
                    this.showMessage(`${result.data.coveringPlates.length}枚のプレートが覆っています`);
                } else {
                    this.showMessage('このネジは外せます!');
                }
                break;
                
            case 'drill':
                PlateSystem.removeScrew(screw);
                AudioManager.playSE('screw');
                this.showMessage('ドリルでネジを外しました!');
                this._checkPlateCleared(plate);
                break;
                
            case 'shuffle':
                this.loadStage(this.gameState.stageNumber);
                this.showMessage('ステージをシャッフルしました!');
                break;
        }
        
        // アイテムを消費
        ItemManager.consumeItem(itemType, this.gameState);
        
        this.updateUI();
        this.render();
        this.save();
    },

    /**
     * ネジを外す試行
     * @private
     */
    _tryRemoveScrew(screw, plate) {
        // 既に外されている
        if (screw.removed) {
            return;
        }
        
        // 覆われているか確認
        const coverResult = CollisionDetector.isScrewCovered(
            screw, plate, this.gameState.currentStage.plates
        );
        
        if (coverResult.covered) {
            this.showMessage('上にプレートがあります');
            AudioManager.playSE('plate');
            return;
        }
        
        // ネジを外す
        PlateSystem.removeScrew(screw);
        AudioManager.playSE('screw');
        
        // 統計更新
        this.gameState.statistics.totalScrewsRemoved++;
        
        this._checkPlateCleared(plate);
        
        this.updateUI();
        this.render();
        this.save();
    },

    /**
     * プレートがクリアされたか確認
     * @private
     */
    _checkPlateCleared(plate) {
        if (PlateSystem.isPlateCleared(plate)) {
            console.log(`[GameEngine] Plate ${plate.id} cleared`);
            AudioManager.playSE('plate');
            
            // 全プレートクリアチェック
            this._checkStageCleared();
        }
    },

    /**
     * ステージクリアチェック
     * @private
     */
    _checkStageCleared() {
        if (PlateSystem.areAllPlatesCleared(this.gameState.currentStage.plates)) {
            console.log(`[GameEngine] Stage ${this.gameState.stageNumber} cleared!`);
            
            AudioManager.playSE('clear');
            
            // 統計更新
            this.gameState.statistics.totalStagesCleared++;
            
            // ポイント付与
            const reward = PointSystem.calculateStageReward(this.gameState.stageNumber);
            this.gameState.points += PointSystem.grantPoints(reward, 'Stage Clear');
            
            // アイテム報酬
            ItemManager.grantClearReward(this.gameState);
            
            this.save();
            
            // クリア演出
            setTimeout(() => {
                this.showClearModal(reward);
            }, 500);
        }
    },

    /**
     * 次のステージへ
     */
    nextStage() {
        this.gameState.stageNumber++;
        this.loadStage(this.gameState.stageNumber);
        this.save();
    },

    /**
     * アイテムボタンクリック
     * @param {string} itemType - アイテムタイプ
     */
    handleItemButton(itemType) {
        // 既にアクティブな場合はキャンセル
        if (ItemManager.activeItem === itemType) {
            ItemManager.cancelActiveItem();
            this.highlightData = {};
            this.updateUI();
            this.render();
            return;
        }
        
        // アイテムを使用
        if (ItemManager.useItem(itemType, this.gameState)) {
            // シャッフルは即座に実行
            if (itemType === 'shuffle') {
                const result = ItemManager.executeItem(itemType, this.gameState);
                if (result.success) {
                    ItemManager.consumeItem(itemType, this.gameState);
                    this.loadStage(this.gameState.stageNumber);
                    this.showMessage('ステージをシャッフルしました!');
                    this.save();
                }
            } else if (itemType === 'hint') {
                // ヒントは即座に表示
                const result = ItemManager.executeItem(itemType, this.gameState);
                if (result.success) {
                    ItemManager.consumeItem(itemType, this.gameState);
                    this.highlightData.hintedScrews = result.data;
                    this.showMessage(`外せるネジ: ${result.data.length}個`);
                    this.render();
                    this.save();
                    
                    // 3秒後にハイライト解除
                    setTimeout(() => {
                        this.highlightData = {};
                        this.render();
                    }, 3000);
                }
            }
            
            this.updateUI();
        } else {
            this.showMessage('アイテムが不足しています');
        }
    },

    /**
     * UIを更新
     */
    updateUI() {
        // ステージ番号
        document.getElementById('stage-number').textContent = this.gameState.stageNumber;
        
        // 残りネジ数
        const remaining = PlateSystem.countRemainingScrews(this.gameState.currentStage.plates);
        document.getElementById('remaining-screws').textContent = remaining;
        
        // ポイント
        document.getElementById('points').textContent = this.gameState.points;
        
        // アイテム数
        document.getElementById('hint-count').textContent = this.gameState.items.hint;
        document.getElementById('expose-count').textContent = this.gameState.items.expose;
        document.getElementById('drill-count').textContent = this.gameState.items.drill;
        document.getElementById('shuffle-count').textContent = this.gameState.items.shuffle;
        
        // アクティブアイテムのハイライト
        document.querySelectorAll('.item-btn').forEach(btn => {
            const itemType = btn.getAttribute('data-item');
            if (itemType === ItemManager.activeItem) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    /**
     * 描画
     */
    render() {
        Renderer.drawStage(this.gameState.currentStage, this.highlightData);
    },

    /**
     * メッセージを表示
     * @param {string} message - メッセージ
     */
    showMessage(message) {
        const overlay = document.getElementById('message-overlay');
        const content = document.getElementById('message-content');
        
        content.textContent = message;
        overlay.classList.remove('hidden');
        
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 2000);
    },

    /**
     * クリアモーダルを表示
     * @param {number} earnedPoints - 獲得ポイント
     */
    showClearModal(earnedPoints) {
        const modal = document.getElementById('clear-modal');
        document.getElementById('cleared-stage').textContent = this.gameState.stageNumber;
        document.getElementById('earned-points').textContent = earnedPoints;
        modal.classList.remove('hidden');
    },

    /**
     * 保存
     */
    save() {
        StorageManager.save(this.gameState);
    }
};
