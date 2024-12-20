# Stack AI File Picker - Implementation Guide

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/               # Shadcn components
│   │   ├── button.tsx
│   │   ├── checkbox.tsx
│   │   └── ...
│   ├── file-picker/     # Our main components
│   │   ├── file-picker.tsx
│   │   ├── file-explorer.tsx
│   │   ├── file-list.tsx
│   │   ├── file-item.tsx
│   │   ├── breadcrumb-navigation.tsx
│   │   ├── toolbar/
│   │   │   ├── index.tsx
│   │   │   ├── search-bar.tsx
│   │   │   ├── sort-dropdown.tsx
│   │   │   └── filter-dropdown.tsx
│   │   └── status-indicator.tsx
│   └── shared/          # Shared components
│       ├── error-boundary.tsx
│       ├── loading-skeleton.tsx
│       └── error-message.tsx
├── hooks/
│   ├── api/            # API related hooks
│   │   ├── use-connection.ts
│   │   ├── use-resources.ts
│   │   └── use-knowledge-base.ts
│   └── ui/            # UI related hooks
│       ├── use-file-selection.ts
│       ├── use-navigation.ts
│       └── use-sort-filter.ts
├── lib/
│   ├── api/           # API utilities
│   │   ├── client.ts
│   │   └── endpoints.ts
│   ├── utils/         # Helper functions
│   │   ├── file-utils.ts
│   │   └── sort-utils.ts
│   └── types/         # TypeScript types
│       ├── api.ts
│       └── file.ts
├── store/             # Zustand store
│   ├── slices/
│   │   ├── file-slice.ts
│   │   └── ui-slice.ts
│   └── index.ts
└── styles/
    └── globals.css
```

## Phase 1: Core Structure and Basic Navigation

### Step 1: Base Components Setup

1. Create FilePicker (Main Container)

   - This will be your page-level component
   - Initialize basic layout structure
   - Set up error boundaries

2. Create FileExplorer Component

   - Props:
     - files: FileItem[]
     - selectedFiles: string[]
     - onFileSelect: (fileId: string) => void
     - onFolderOpen: (folderId: string) => void
     - isLoading: boolean
     - error?: string
   - Initially render just a container for FileList

3. Create FileList Component

   - Props:
     - files: FileItem[]
     - selectedFiles: string[]
     - onFileSelect: (fileId: string) => void
     - onFolderOpen: (folderId: string) => void
   - Implement basic list structure

4. Create FileItem Component
   - Props:
     - id: string
     - name: string
     - type: 'file' | 'folder'
     - isSelected: boolean
     - isIndexed: boolean
     - metadata: { size?, modifiedDate, type }
     - onSelect: () => void
     - onOpen?: () => void
     - onIndex: () => void
     - onDeindex: () => void
   - Implement basic file/folder display

### Step 2: API Integration Foundation

1. Create API Hooks

   - useConnection() for connection management
   - useResources(connectionId, path) for file listing
   - useKnowledgeBase() for KB operations

2. Implement Basic Error Handling

   - Create error types and handlers
   - Implement retry logic
   - Add error states to components

3. Add Loading States
   - Create loading indicators
   - Implement skeleton loading states
   - Add loading state handling to components

## Phase 2: Navigation and Selection

### Step 3: Navigation Implementation

1. Create BreadcrumbNavigation Component

   - Props:
     - currentPath: string
     - onNavigate: (path: string) => void
     - pathHistory: string[]
   - Implement path display
   - Add click navigation

2. Enhance FileExplorer

   - Add folder navigation logic
   - Implement history tracking
   - Add back/forward navigation

3. Update FileItem for Navigation
   - Add folder click handling
   - Implement double-click navigation
   - Add keyboard navigation support

### Step 4: Selection Mechanism

1. Implement Selection Logic

   - Add selection state management
   - Implement single/multi-select
   - Add keyboard selection support

2. Update FileItem Selection UI
   - Add selection indicators
   - Implement selection styling
   - Add selection checkboxes

## Phase 3: Indexing and Status

### Step 5: Indexing Implementation

1. Create StatusIndicator Component

   - Props:
     - status: 'indexed' | 'pending' | 'not-indexed'
     - onStatusChange: (newStatus: string) => void
   - Implement status display
   - Add status transitions

2. Enhance FileItem with Indexing

   - Add index/deindex controls
   - Implement status updates
   - Add indexing feedback

3. Implement Knowledge Base Integration
   - Add KB creation flow
   - Implement sync functionality
   - Add progress tracking

## Phase 4: Search, Sort, and Filter

### Step 6: Toolbar Implementation

1. Create Toolbar Component

   - Props:
     - onSearch: (searchTerm: string) => void
     - onSort: (sortType: 'name' | 'date') => void
     - onFilter: (filterType: string) => void
     - currentSort: string
     - currentFilter: string
   - Implement basic layout

2. Create SearchBar Component

   - Add search input
   - Implement search logic
   - Add search results handling

3. Implement Sort Functionality

   - Add sort dropdown
   - Implement sort logic
   - Add sort indicators

4. Add Filter Functionality
   - Create filter controls
   - Implement filter logic
   - Add filter indicators

## Phase 5: Enhancement and Polish

### Step 7: Performance Optimization

1. Implement List Virtualization

   - Add virtual scrolling
   - Optimize large lists
   - Add scroll position recovery

2. Add Caching Layer

   - Implement data caching
   - Add cache invalidation
   - Optimize refetching

3. Add Prefetching
   - Implement hover prefetch
   - Add background loading
   - Optimize navigation

### Step 8: UI Polish

1. Enhance Visual Feedback

   - Add hover states
   - Implement transitions
   - Polish loading states

2. Add Keyboard Shortcuts

   - Implement navigation shortcuts
   - Add selection shortcuts
   - Create shortcut help

3. Improve Error UX
   - Enhance error messages
   - Add recovery options
   - Implement retry mechanisms

## Testing Checkpoints

After each phase, ensure to test:

1. Core functionality works
2. Error states are handled
3. Loading states look good
4. Performance is acceptable
5. UI is responsive
6. Browser compatibility

## State Management Checkpoints

For each component, verify:

1. Props are properly typed
2. State updates are optimized
3. Side effects are cleaned up
4. Event handlers are memoized
5. Callbacks are stable

## Error Handling Checkpoints

For each feature, verify:

1. API errors are caught
2. User errors are handled
3. Network issues are managed
4. Recovery paths work
5. User feedback is clear

## Performance Checkpoints

For each implementation:

1. Check render cycles
2. Verify memoization
3. Test with large datasets
4. Measure load times
5. Verify CLS scores
