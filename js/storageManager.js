/**
 * StorageManager - ローカルストレージ管理
 */
const StorageManager = {
    STORAGE_KEY: 'screwPuzzleGameData',

    /**
     * ゲームデータを保存
     */
    save(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('[StorageManager] Save failed:', error);
            return false;
        }
    },

    /**
     * ゲームデータを読み込み
     */
    load() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('[StorageManager] Load failed:', error);
            return null;
        }
    },

    /**
     * デフォルトデータを取得
     */
    getDefaultData() {
        return {
            stageNumber: 1,
            points: 0,
            items: {
                hint: 2,
                expose: 2,
                drill: 2,
                shuffle: 2
            },
            settings: {
                bgmVolume: 50,
                seVolume: 70,
                bgmEnabled: true,
                seEnabled: true,
                currentBGMPack: 'default'
            },
            unlockedBGMPacks: ['default'],
            statistics: {
                totalStagesCleared: 0,
                totalScrewsRemoved: 0,
                totalPlayTime: 0
            }
        };
    },

    /**
     * データをリセット
     */
    reset() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('[StorageManager] Reset failed:', error);
            return false;
        }
    }
};
