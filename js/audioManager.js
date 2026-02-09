/**
 * AudioManager - BGM/SE管理システム
 */
const AudioManager = {
    bgm: null,
    seCache: {},
    settings: {
        bgmVolume: 0.5,
        seVolume: 0.7,
        bgmEnabled: true,
        seEnabled: true
    },
    initialized: false,
    currentPack: 'default',

    /**
     * 音声パック定義
     */
    audioPacks: {
        default: {
            name: 'デフォルト',
            bgm: null, // Web Audio APIで生成
            se: {
                screw: null,
                plate: null,
                clear: null
            },
            unlocked: true,
            cost: 0
        },
        workshop: {
            name: '作業場',
            bgm: null,
            se: {},
            unlocked: false,
            cost: 1000
        },
        nature: {
            name: '自然',
            bgm: null,
            se: {},
            unlocked: false,
            cost: 1500
        }
    },

    /**
     * 初期化
     */
    async init() {
        if (this.initialized) return;
        
        console.log('[AudioManager] Initializing...');
        
        // Web Audio API コンテキスト作成
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // デフォルトSEを生成
        this._generateDefaultSounds();
        
        this.initialized = true;
        console.log('[AudioManager] Initialized');
    },

    /**
     * デフォルトサウンドを生成(Web Audio API)
     */
    _generateDefaultSounds() {
        // 実際の音声ファイルがない場合の代替として、
        // ここでは簡易的なビープ音を生成
        // 本番では実際の音声ファイルを使用することを推奨
    },

    /**
     * BGMを再生
     */
    playBGM() {
        if (!this.settings.bgmEnabled || !this.initialized) return;
        
        // 簡易実装: 実際のBGMファイルがないため、ログのみ
        console.log('[AudioManager] BGM would play here');
        
        // 実装例:
        // if (this.bgm) {
        //     this.bgm.volume = this.settings.bgmVolume;
        //     this.bgm.loop = true;
        //     this.bgm.play();
        // }
    },

    /**
     * BGMを停止
     */
    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
    },

    /**
     * SEを再生
     * @param {string} type - SE種類('screw', 'plate', 'clear')
     */
    playSE(type) {
        if (!this.settings.seEnabled || !this.initialized) return;
        
        // 簡易的なビープ音を生成
        this._playBeep(type);
    },

    /**
     * ビープ音を再生(Web Audio API)
     * @param {string} type - SE種類
     */
    _playBeep(type) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // SE種類に応じた周波数と長さ
        let frequency = 440;
        let duration = 0.1;
        
        switch (type) {
            case 'screw':
                frequency = 800;
                duration = 0.05;
                break;
            case 'plate':
                frequency = 600;
                duration = 0.1;
                break;
            case 'clear':
                frequency = 1000;
                duration = 0.3;
                break;
        }
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(this.settings.seVolume * 0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    /**
     * BGM音量を設定
     * @param {number} volume - 音量(0-1)
     */
    setBGMVolume(volume) {
        this.settings.bgmVolume = Math.max(0, Math.min(1, volume));
        if (this.bgm) {
            this.bgm.volume = this.settings.bgmVolume;
        }
    },

    /**
     * SE音量を設定
     * @param {number} volume - 音量(0-1)
     */
    setSEVolume(volume) {
        this.settings.seVolume = Math.max(0, Math.min(1, volume));
    },

    /**
     * BGM ON/OFF切替
     * @param {boolean} enabled - 有効/無効
     */
    toggleBGM(enabled) {
        this.settings.bgmEnabled = enabled;
        if (enabled) {
            this.playBGM();
        } else {
            this.stopBGM();
        }
    },

    /**
     * SE ON/OFF切替
     * @param {boolean} enabled - 有効/無効
     */
    toggleSE(enabled) {
        this.settings.seEnabled = enabled;
    },

    /**
     * BGMパックを変更
     * @param {string} packId - パックID
     * @returns {boolean} 成功/失敗
     */
    changeBGMPack(packId) {
        const pack = this.audioPacks[packId];
        if (!pack || !pack.unlocked) {
            console.warn(`[AudioManager] Pack '${packId}' is not unlocked`);
            return false;
        }
        
        this.currentPack = packId;
        console.log(`[AudioManager] Changed to pack '${packId}'`);
        
        // BGMを再読み込み
        this.stopBGM();
        this.playBGM();
        
        return true;
    },

    /**
     * BGMパックをアンロック
     * @param {string} packId - パックID
     */
    unlockBGMPack(packId) {
        const pack = this.audioPacks[packId];
        if (pack) {
            pack.unlocked = true;
            console.log(`[AudioManager] Unlocked pack '${packId}'`);
        }
    },

    /**
     * 設定を取得
     * @returns {Object} 設定オブジェクト
     */
    getSettings() {
        return { ...this.settings };
    },

    /**
     * 設定を適用
     * @param {Object} settings - 設定オブジェクト
     */
    applySettings(settings) {
        if (settings.bgmVolume !== undefined) {
            this.setBGMVolume(settings.bgmVolume / 100);
        }
        if (settings.seVolume !== undefined) {
            this.setSEVolume(settings.seVolume / 100);
        }
        if (settings.bgmEnabled !== undefined) {
            this.toggleBGM(settings.bgmEnabled);
        }
        if (settings.seEnabled !== undefined) {
            this.toggleSE(settings.seEnabled);
        }
    }
};
