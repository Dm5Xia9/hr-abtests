# Адаптационный трек

Интерактивный адаптационный трек для новых сотрудников, реализованный как одностраничное приложение на React.

## Особенности

- 🎯 Два типа этапов: презентация и задача
- 📱 Адаптивный дизайн для мобильных устройств
- 🎮 Игровой интерфейс с прогрессом и карточками
- 💾 Локальное хранение прогресса
- 🎨 Современный UI с использованием TailwindCSS

## Технологии

- React + TypeScript
- Vite
- TailwindCSS
- Lucide Icons

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
```bash
npm install
```
3. Запустите проект:
```bash
npm run dev
```

## Структура проекта

- `src/data/track.json` - данные трека
- `src/components/` - React компоненты
- `src/types/` - TypeScript типы

## Использование

1. Откройте приложение в браузере
2. Выберите этап из списка слева
3. Выполните задания в карточке справа
4. Прогресс сохраняется автоматически

## Разработка

Для добавления новых этапов отредактируйте файл `src/data/track.json`.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
