---
name: tanstack-query
description: >
  Manage server state in React with TanStack Query v5. Matches project standards for data fetching.
  Trigger: When fetching data, mutating server state, or configuring caching strategies.
license: Apache-2.0
metadata:
  author: Purple-Code-sh
  version: '1.0'
  auto_invoke:
    - 'Fetching data in client components'
    - 'Optimistic updates'
    - 'Handling server state'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## When to Use

Use this skill when:

- Fetching data in client-side components (use `useQuery`).
- Mutating data (use `useMutation` + Server Actions).
- Implementing infinite scrolling (use `useInfiniteQuery`).
- Managing complex server state caching/invalidation.
- Handling loading (`isPending`) and error states.

---

## Critical Patterns

### 1. Object Syntax (REQUIRED)

v5 requires object syntax for all hooks.

```tsx
// ✅ Correct
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  staleTime: 5000
})

// ❌ Incorrect (v4 style)
useQuery(['todos'], fetchTodos)
```

### 2. Status Checks

- **`isPending`**: Query has no data yet (initial load).
- **`isLoading`**: Query has no data yet AND is currently fetching.
- **`isFetching`**: Query is fetching (background or initial).

```tsx
const { data, isPending, isError } = useQuery(...)

if (isPending) return <Skeleton />
if (isError) return <Error />
```

### 3. Caching & Garbage Collection

- **`staleTime`**: How long data is considered fresh (no refetch).
- **`gcTime`**: How long inactive data stays in memory (formerly `cacheTime`).

```tsx
useQuery({
  ...,
  staleTime: 1000 * 60 * 5, // 5 mins
  gcTime: 1000 * 60 * 60    // 1 hour
})
```

### 4. Mutations & Invalidation

Always invalidate queries after mutation to update UI.

```tsx
const queryClient = useQueryClient();

useMutation({
  mutationFn: createTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  }
})
```

---

## Decision Tree

```
Read data? → `useQuery`
Write data? → `useMutation`
Infinite list? → `useInfiniteQuery`
Read multiple endpoints? → `useQueries`
Need optimistic UI? → `onMutate` updates cache
Offline support? → Check `networkMode`
Wait for result? → `useSuspenseQuery`
```

---

## Code Examples

### Example 1: Basic Query (Client)

```tsx
'use client';
import { useQuery } from '@tanstack/react-query';

export function TodoList() {
  const { data, isPending, error } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await fetch('/api/todos');
      if (!res.ok) throw new Error('Network error');
      return res.json();
    }
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### Example 2: Infinite Query with v5 Strictness

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

export function ProjectList() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: ({ pageParam }) => fetchProjects(pageParam),
    initialPageParam: 0, // ✅ REQUIRED in v5
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <div>
      {data?.pages.map((page) => (
        <div key={page.id}>{/* ... */}</div>
      ))}
      <button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
        Load More
      </button>
    </div>
  );
}
```

---

## Commands

```bash
# Install v5 (if not already present)
npm install @tanstack/react-query@latest

# Devtools
npm install @tanstack/react-query-devtools@latest
```

---

## Resources

- **Migration Guide**: [Migrating to v5](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5)
- **Docs**: [TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/overview)
