# Example of React-annotate-image

## Quick start

1. Run `yarn` or `npm install` to install the other dependencies.
2. Run `yarn link` in `/react-annotate-image`, and then run `yarn link react-annotate-image` in `/example`.
3. Run `yarn start` or `npm run start` to launch the application.

## Recipe

We have already prepared some mock data, partial of the coco dataset, divided into two parts: rectangles and segmentations. You can toggle them via switch comment on the code segment of the lines 6-14 and the lines 16-24.

![image](https://user-images.githubusercontent.com/39087996/171361183-968a294f-2163-4276-946d-9b6839f9ea7b.png)

## Project structure

```bash
example
├── README.md # this documentation
├── node_modules
│   └── react-annotate-image -> ../../../../.config/yarn/link/react-annotate-image # the dependencies to react-annotate-image via yarn-link
├── package.json
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
├── src
│   ├── App.test.tsx
│   ├── App.tsx # root entrance
│   ├── index.css
│   ├── index.tsx
│   ├── react-app-env.d.ts
│   ├── rectangles.ts # mock data of rectangle
│   ├── segmentations.ts # mock data of segmentations
│   └── setupTests.ts
├── tailwind.config.js
├── tsconfig.json
└── yarn.lock
```
