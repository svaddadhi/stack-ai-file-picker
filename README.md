**Stack AI File Picker**  
Because sometimes you just want to explore your files in style

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Running Locally](#running-locally)
4. [Technical Choices](#technical-choices)
5. [Core Features & Implementation](#core-features--implementation)
6. [API Hooks & Data Flow](#api-hooks--data-flow)
7. [Tradeoffs & Design Decisions](#tradeoffs--design-decisions)
8. [Future Enhancements](#future-enhancements)

---

## Overview

Welcome to the **Stack AI File Picker** codebase. This repository hosts a Next.js + React app that integrates with a Google Drive connection to let you:

- Browse and navigate your Drive files/folders
- Index or deindex them in a Knowledge Base
- Perform multi-selection and bulk actions
- Search, sort, and filter items
- Seamlessly see whether a file is “Indexed,” “Not Indexed,” or “Indexing...”

The code uses Tailwind CSS for styling, Shadcn UI components for buttons/cards, plus a handful of custom hooks to manage navigation, file selection, and indexing logic.

Everything is structured in a way that’s easy to expand—if you need new file actions or more advanced knowledge base functionality, the groundwork is already here.

---

## Project Structure

```
├── public/
│   ├── file.svg
│   ├── globe.svg
│   └── ...
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── AuthProvider.tsx
│   │   │   │   └── LoginForm.tsx
│   │   │   ├── file-picker/
│   │   │   │   ├── FilePicker.tsx
│   │   │   │   ├── FileExplorer.tsx
│   │   │   │   ├── FileList.tsx
│   │   │   │   ├── FileItem.tsx
│   │   │   │   ├── StatusIndicator.tsx
│   │   │   │   ├── toolbar/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── SearchBar.tsx
│   │   │   │   │   └── SortDropdown.tsx
│   │   │   │   └── BreadcrumbNavigation.tsx
│   │   │   ├── shared/
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── ErrorMessage.tsx
│   │   │   │   └── LoadingSkeleton.tsx
│   │   ├── hooks/
│   │   │   ├── api/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useConnection.ts
│   │   │   │   ├── useResources.ts
│   │   │   │   ├── useKnowledgeBase.ts
│   │   │   │   └── useIndexing.ts
│   │   │   └── ui/
│   │   │       ├── useFileSelection.ts
│   │   │       ├── useKeyboardSelection.ts
│   │   │       └── useNavigation.ts
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   │   ├── client.ts
│   │   │   │   └── endpoint.ts
│   │   │   └── types/
│   │   │       ├── api.ts
│   │   │       └── file.ts
│   │   ├── providers/
│   │   │   └── SWRProvider.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       └── input.tsx
│   └── lib/
│       └── utils.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── ...
```

### Notable Directories

- **`src/app/components/file-picker/`**: The File Picker’s heart (FilePicker.tsx, FileExplorer, toolbar, etc.).
- **`src/app/hooks/`**: Contains all the specialized hooks for data fetching and UI logic.
- **`src/app/lib/`**: Shared API logic (the singleton `apiClient`, endpoints, typed interfaces).
- **`src/app/components/shared/`**: Error handling, skeleton loading, etc.
- **`src/components/ui/`**: Shadcn-based UI primitives (buttons, cards, inputs, etc.).

---

## Running Locally

1. **Clone the repository** (or download the source).
2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
4. Open a browser to [http://localhost:3000](http://localhost:3000).  
   You should see the **Login Form**. Enter the provided password (the email is prefilled) and click **Login** to proceed.

That’s it. The application runs in dev mode and automatically refreshes on file changes.

---

## Technical Choices

- **Next.js + React**:  
  Offers server & client integration but here we keep most logic on the client side, focusing on an easier spin-up and direct usage of fetch-based calls with SWR.
- **SWR**:  
  Simplifies data fetching with built-in caching, revalidation, and easy error states. Perfect for a project that frequently queries an external API (like Google Drive connections).
- **Tailwind CSS**:  
  For quick styling, utility classes, and a consistent design pattern. Combining it with Shadcn’s UI library means we can build out custom components (buttons, cards) while retaining design consistency.
- **Shadcn UI**:  
  Provides a set of composable, unstyled, or lightly styled components built on Radix UI primitives. They’re easy to theme and adapt to your brand, plus they integrate nicely with Tailwind.
- **TypeScript**:  
  Boosts dev experience, giving us strong types for resources, knowledge base items, etc.
- **Singleton `apiClient`**:  
  Central place to store our auth token in memory. This is quick and easy for the sake of a minimal approach—tradeoff is that refreshing the page loses your session.

---

## Core Features & Implementation

1. **File Picker UI**

   - **FilePicker.tsx** is the main container. It fetches from Google Drive, merges knowledge-base states, and shows everything in a nice file explorer interface.
   - You can do multi-select or single-select, navigate back/forward in your path history, and see a breadcrumb for nested folders.

2. **Login & Auth**

   - **AuthProvider** decides whether to show the login form or the actual FilePicker.
   - **LoginForm** auto-fills the email. The password is typed in by the user. Auth tokens are stored in a global `apiClient` instance (in-memory).

3. **Indexing / De-indexing**

   - Each file shows a status indicator: **Indexed**, **Not Indexed**, or **Indexing...**
   - Toggling “Index” calls out to create or update the knowledge base with that file. Toggling “Remove” calls the endpoint to deindex (which just stops indexing it— doesn’t delete it from Drive).

4. **Search & Sorting**

   - The top toolbar includes a **SearchBar** that filters by name, plus a **SortDropdown** (sort by Name or Date). You can toggle ascending/descending.

5. **Multi-Select & Keyboard**
   - **useFileSelection** + **useKeyboardSelection** let you shift-click or ctrl/meta-click to select multiple files, press `ctrl+a` to select all, or `escape` to clear.
   - This is all done with minimal re-render overhead.

---

## API Hooks & Data Flow

- **`useConnection`**
  - Queries the first Google Drive connection your account has. The code expects a single GDrive connection for simplicity.
- **`useResources`**
  - Grabs the contents (files/folders) of the current folder from the backend endpoint: `/connections/{connection_id}/resources/children`.
- **`useKBChildren`**
  - Given a `knowledgeBaseId` and a path (`/some/folder`), fetches the knowledge base’s children to see which are already indexed.
- **`useIndexing`**
  - High-level hook that either creates a brand new knowledge base (if none exists) or updates the existing one when you index files.
  - Also includes a method to “deindex” a file, effectively removing it from the KB but leaving it in Google Drive.

Everything is orchestrated inside `FilePicker.tsx`, where we combine GDrive items with knowledge-base items to figure out each file’s status.

---

## Tradeoffs & Design Decisions

1. **In-Memory Token**

   - **Reason**: Quick to implement.
   - **Tradeoff**: If the page reloads, you’ll need to log in again since we’re not storing tokens in cookies or local storage. For a short-lifespan scenario, that’s acceptable. For production, you might prefer a refresh token or some secure cookie-based approach.

2. **Single GDrive Connection**

   - **Reason**: Simplifies logic; `useConnection()` always returns the first found connection.
   - **Tradeoff**: If multiple GDrive connections exist, only one is actually used. In a real multi-connection environment, you’d probably show a list of connections for the user to choose from.

3. **Re-Creating the Knowledge Base**

   - **Reason**: The backend’s design expects sending a full list of resource IDs each time we add or remove from the KB.
   - **Tradeoff**: We do extra merges on the client side, then re-sync. It’s conceptually simpler to do it all in one flow, but can be slightly more overhead. For large sets of files, we might prefer a smaller “delta-based” approach.

4. **SWR vs. React Query**

   - **Reason**: SWR is very lightweight, easy to configure.
   - **Tradeoff**: If we needed advanced caching or prefetching, React Query might have more built-in features. SWR still does a great job for these endpoints.

5. **FileItem UI**
   - **Reason**: We use a single `FileItem` component with a handle for indexing/deindexing.
   - **Tradeoff**: If we had drastically different UIs for folders vs. files, we might want separate components. Right now, we unify them with an icon switch, which is simpler.

---

## Future Enhancements

- **Persisting Auth**
  - Storing tokens securely (e.g., HttpOnly cookies) so you remain logged in on page reload.
- **Bulk Indexing**
  - Right now, “Index” is mostly single-file-based from the UI perspective, but we do have multi-select. Hooking them up for a true bulk call would reduce repeated calls to the backend.
- **Pagination / Virtual List**
  - For large folders, adding pagination or virtualized scrolling (e.g., `react-virtualized`) would keep the UI snappy.
- **Advanced KB Management**
  - Possibly show real-time status of indexing progress, or provide advanced chunking/embedding options.

---

### That’s All

So, that’s the run-down on how everything is put together, the reasoning behind each part, and some extra tidbits if you want to go further. If you have any questions or want to adapt something, just dive into the relevant hook or component. Enjoy exploring and picking files in style!
