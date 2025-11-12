# Boreal Staff Portal

This project is a Vite-powered React + TypeScript scaffold for the Boreal staff portal. It includes a
basic application shell, global styling entry points, and starter utilities for data fetching and state
management.

## Getting started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:5173](http://localhost:5173) by default.

## Available scripts

- `npm run dev` – Start the Vite development server.
- `npm run build` – Type-check and create a production build.
- `npm run lint` – Run the ESLint configuration included with the scaffold.
- `npm run preview` – Preview the production build locally.

## Project structure

- `src/components` – Place presentational and layout components here.
- `src/pages` – Route-level pages for the portal.
- `src/hooks/api` – API hooks powered by Axios and TanStack Query.
- `src/store` – Global state managed with Zustand.
- `src/styles` – Global and layout style entry points.
- `public/icons` & `public/images` – Asset buckets for shared media.

## Environment variables

Environment configuration lives in `.env`. The default base URL targets the local backend running on
`http://localhost:5000` and can be adjusted per environment.
