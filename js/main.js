/**
 * Main - エントリーポイント・イベントハンドラ
 */

// DOM読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] DOM loaded, initializing game...');
    
    // キャンバス初期化
    const canvas = document.getElementById('game-canvas');
    Renderer.init(canvas);
    
    // ゲームエンジン初期化
    GameEngine.init();
    
    // イベントリスナー設定
    setupEventListeners();
    
    console.log('[Main] Game ready!');
});

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
    // キャンバスクリック(PC)
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click', handleCanvasClick);
    
    // キャンバスタッチ(スマホ)
    canvas.addEventListener('touchstart', handleCanvasTouchStart);
    
    // アイテムボタン
    document.querySelectorAll('.item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemType = btn.getAttribute('data-item');
            GameEngine.handleItemButton(itemType);
        });
    });
    
    // 設定ボタン
    document.getElementById('settings-btn').addEventListener('click', () => {
        openSettingsModal();
    });
    
    // 設定モーダル閉じる
    document.getElementById('close-settings').addEventListener('click', () => {
        closeSettingsModal();
    });
    
    // BGM音量スライダー
    const bgmVolumeSlider = document.getElementById('bgm-volume');
    bgmVolumeSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        document.getElementById('bgm-volume-value').textContent = value + '%';
        AudioManager.setBGMVolume(value / 100);
        GameEngine.gameState.settings.bgmVolume = value;
        GameEngine.save();
    });
    
    // SE音量スライダー
    const seVolumeSlider = document.getElementById('se-volume');
    seVolumeSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        document.getElementById('se-volume-value').textContent = value + '%';
        AudioManager.setSEVolume(value / 100);
        GameEngine.gameState.settings.seVolume = value;
        GameEngine.save();
    });
    
    // BGM ON/OFFトグル
    document.getElementById('bgm-toggle').addEventListener('click', (e) => {
        const btn = e.target;
        const enabled = !btn.classList.contains('active');
        
        if (enabled) {
            btn.classList.add('active');
            btn.textContent = 'ON';
        } else {
            btn.classList.remove('active');
            btn.textContent = 'OFF';
        }
        
        AudioManager.toggleBGM(enabled);
        GameEngine.gameState.settings.bgmEnabled = enabled;
        GameEngine.save();
    });
    
    // SE ON/OFFトグル
    document.getElementById('se-toggle').addEventListener('click', (e) => {
        const btn = e.target;
        const enabled = !btn.classList.contains('active');
        
        if (enabled) {
            btn.classList.add('active');
            btn.textContent = 'ON';
        } else {
            btn.classList.remove('active');
            btn.textContent = 'OFF';
        }
        
        AudioManager.toggleSE(enabled);
        GameEngine.gameState.settings.seEnabled = enabled;
        GameEngine.save();
    });
    
    // BGMパック選択
    document.querySelectorAll('.pack-item').forEach(item => {
        item.addEventListener('click', () => {
            const packId = item.getAttribute('data-pack');
            const pack = AudioManager.audioPacks[packId];
            
            if (!pack.unlocked) {
                alert(`このパックは ${pack.cost} ポイントで購入できます(未実装)`);
                return;
            }
            
            AudioManager.changeBGMPack(packId);
            GameEngine.gameState.settings.currentBGMPack = packId;
            GameEngine.save();
            
            // UI更新
            document.querySelectorAll('.pack-item').forEach(p => {
                p.style.background = '#f9f9f9';
            });
            item.style.background = '#e8f5e9';
        });
    });
    
    // 次のステージボタン
    document.getElementById('next-stage-btn').addEventListener('click', () => {
        document.getElementById('clear-modal').classList.add('hidden');
        GameEngine.nextStage();
    });
    
    // リサイズ対応
    window.addEventListener('resize', () => {
        Renderer.resize();
        Renderer.init(canvas);
        GameEngine.loadStage(GameEngine.gameState.stageNumber);
    });
}

/**
 * キャンバスクリック処理
 */
function handleCanvasClick(event) {
    event.preventDefault();
    const coords = Renderer.getCanvasCoordinates(event);
    GameEngine.handleScrewClick(coords.x, coords.y);
}

/**
 * キャンバスタッチ処理
 */
function handleCanvasTouchStart(event) {
    event.preventDefault();
    const coords = Renderer.getCanvasCoordinates(event);
    GameEngine.handleScrewClick(coords.x, coords.y);
}

/**
 * 設定モーダルを開く
 */
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    
    // 現在の設定を反映
    const settings = GameEngine.gameState.settings;
    
    document.getElementById('bgm-volume').value = settings.bgmVolume;
    document.getElementById('bgm-volume-value').textContent = settings.bgmVolume + '%';
    
    document.getElementById('se-volume').value = settings.seVolume;
    document.getElementById('se-volume-value').textContent = settings.seVolume + '%';
    
    const bgmToggle = document.getElementById('bgm-toggle');
    if (settings.bgmEnabled) {
        bgmToggle.classList.add('active');
        bgmToggle.textContent = 'ON';
    } else {
        bgmToggle.classList.remove('active');
        bgmToggle.textContent = 'OFF';
    }
    
    const seToggle = document.getElementById('se-toggle');
    if (settings.seEnabled) {
        seToggle.classList.add('active');
        seToggle.textContent = 'ON';
    } else {
        seToggle.classList.remove('active');
        seToggle.textContent = 'OFF';
    }
}

/**
 * 設定モーダルを閉じる
 */
function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('hidden');
}

/**
 * モーダル外クリックで閉じる
 */
document.addEventListener('click', (event) => {
    const settingsModal = document.getElementById('settings-modal');
    const clearModal = document.getElementById('clear-modal');
    
    if (event.target === settingsModal) {
        closeSettingsModal();
    }
    
    // クリアモーダルは外クリックで閉じない
});
