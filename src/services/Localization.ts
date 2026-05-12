import { StorageService } from './Storage';

type Dictionary = { [key: string]: string };

const dictionaries: { [lang: string]: Dictionary } = {
    ru: {
        'Play': 'Играть',
        'Best score': 'Лучший счет',
        'Score': 'Счет',
        'Time': 'Время',
        'Watch Ad for +15s': '+15 сек за рекламу',
        'Game over': 'Игра окончена',
        'Leaderboard': 'Таблица лидеров'
    },
    en: {
        'Play': 'Play',
        'Best score': 'Best score',
        'Score': 'Score',
        'Time': 'Time',
        'Watch Ad for +15s': 'Watch Ad for +15s',
        'Game over': 'Game over',
        'Leaderboard': 'Leaderboard'
    },
    tr: {
        'Play': 'Oyna',
        'Best score': 'En iyi skor',
        'Score': 'Skor',
        'Time': 'Zaman',
        'Watch Ad for +15s': 'Reklam izle +15s',
        'Game over': 'Oyun bitti',
        'Leaderboard': 'Lider tablosu'
    }
};

export class Localization {
    public static getText(key: string): string {
        const lang = StorageService.getInstance().getLanguage();
        const dict = dictionaries[lang] || dictionaries['en'];
        return dict[key] || key;
    }
}
