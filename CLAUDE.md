# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> Per `AGENTS.md`: this is **Next.js 16.2.6** (React 19, App Router). APIs and conventions may differ from your training data — read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js-specific code.

## Commands

```bash
npm run dev      # start dev server (Turbopack) at http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint (flat config, eslint.config.mjs)
```

There is **no test runner** configured. `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so `next build` will NOT catch type errors — run `npx tsc --noEmit` separately to type-check.

## What this is

`awshta-portal` is a client-rendered admin dashboard (super-admin / company / salesman roles) for a pharmacy/inventory commerce backend. The entire UI is `"use client"`; there is no server-side data fetching, no API routes, and no Server Components doing work. The Next app is essentially an SPA talking to a remote REST API at `BASE_URL` (`https://awshta.devsment.com`, hardcoded in `config/url-config.ts`).

## Architecture

### Data layer — the `api/<domain>/` convention

Every backend domain (`products`, `orders`, `category`, `user`, `review`, `ledger`) follows the same two-file split. **Always follow this pattern when adding endpoints:**

- **`fetchers.ts`** — raw axios calls. Each is an `async` arrow named `asyncXxx`, wrapped in try/catch that re-throws via `axiosError(error)` (from `config/axios-error.ts`, which unwraps `error.response.data.error` into a string message). Request/response payload types are co-located here.
- **`queries.ts`** — TanStack Query hooks (`useGetXxx` → `useQuery`, `useCreateXxx`/`useUpdateXxx`/`useDeleteXxx` → `useMutation`) wrapping the fetchers. Each file exports a `XxxQueryKeys` **enum** used for both query keys and manual cache invalidation.

Cache invalidation is **manual and caller-driven**: mutation hooks do not invalidate on their own. Pages call `queryClient.invalidateQueries({ queryKey: [XxxQueryKeys.FOO] })` inside the mutation's `onSuccess`. Default `staleTime` is 60s (`utils/queryProvider.tsx`).

### HTTP / auth

`config/url-config.ts` exports two preconfigured axios instances:
- `API_URL` — JSON requests.
- `API_FORM_URL` — `multipart/form-data` (file uploads).

A request interceptor reads the JWT from the Zustand store via `useAuthStore.getState().token` and attaches `Authorization: Bearer <token>`. Auth state lives in `stores/useAuthstore.ts` (Zustand + `persist` middleware → `localStorage` key `auth-storage`), holding `user`, `token`, `refreshToken`, `isAuthenticated`. Login flow: `asyncAuthLogin` → `setAuth(user, access_token, refresh_token)` → redirect to `/dashboard`.

**There is no route protection / middleware.** Auth is purely client-side store state; routes are not guarded server-side.

### Routing — App Router route groups

`app/` uses parenthesized route groups for distinct shells:
- `(auth)` — login, register, forgot/reset-password, otp (centered card, no chrome).
- `(superadminLayout)` — the main authenticated dashboard: `dashboard`, `user`, `category`, `product`, `orders`, `review`. Shell = `Sidebar` + header in `app/(superadminLayout)/layout.tsx`. Nav items live in the `menuItems` array in `components/common/_components/sidebar/index.tsx`.
- `(userBuyerLayout)` — buyer-facing shell.

`next.config.ts` sets `trailingSlash: true` and `images.unoptimized: true`. There's a committed `out/` directory (static export output) — treat it as a build artifact, not source.

### Page composition pattern

Pages (e.g. `app/(superadminLayout)/product/page.tsx`) are large client components that consistently combine:
- local state for `page`, `search` (+ `useDebounce` from `hooks/useDebounce.ts`), and per-row modal targets;
- a `useEffect` resetting `page` to 1 when filters change;
- query hooks for lists/details + mutation hooks for CRUD;
- `DataTable` (`components/common/table`, wraps `@tanstack/react-table`) with inline `ColumnDef` cell renderers, `Pagination` (`components/common/paginations`), and one `Modal` (`components/common/modal`) per action;
- forms built with `react-hook-form` + `zod` (`zodResolver`), submitting through the shared `TextInput`/`selectInput` controlled inputs;
- user feedback via `useToast()` (`components/common/toast`, context provider mounted in `app/layout.tsx`).

Reusable, domain-specific form/cell components live under `components/common/_components/<domain>Components/`.

### Shared UI

`app/layout.tsx` wraps everything in `QueryProvider` → `ToastProvider`. Radix primitives + Tailwind v4 (CSS-first config in `app/globals.css` via `@theme inline`; no `tailwind.config`). Use the theme color tokens directly as utilities: `primary` (`#5b45ff`), `secondary`, `accent` → e.g. `bg-primary`, `text-primary`, `text-secondary`. Import path alias is `@/*` → repo root.

## Gotchas

- **Type drift between `types/index.ts` and live API data.** Domain types (`TProduct`, `TOrder`, …) are camelCase, but actual API responses are **snake_case** (`title`, `sale_price`, `avg_rating`, `is_featured`, `image_path`, `per_page`). Page code accesses the snake_case fields on `any`-typed rows. Don't trust the declared types as the response shape — verify against the fetcher/API.
- **Defensive response unwrapping.** List data arrives in inconsistent envelopes; pages fall back through chains like `productData?.items || productData?.data?.items || productData?.data || []`. Match this when consuming new list endpoints.
- **Image URLs** must be prefixed with `BASE_URL` or `IMAGE_URL` (`config/url-config.ts`) — stored values are bare relative paths.
- `BASE_URL` is hardcoded (no env var). Switching to local API means editing `config/url-config.ts`.
