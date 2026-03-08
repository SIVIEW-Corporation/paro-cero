---
name: nextjs-v16
description: >
  Next.js 16+ patterns including App Router, Server Actions, React Compiler, and the new Caching API.
  Trigger: When managing Next.js 16+ projects, using App Router, or writing Server Actions.
license: Apache-2.0
metadata:
  author: Purple-Code-sh
  version: '1.0'
  auto_invoke: 'Next.js 16 development'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## When to Use

Use this skill when:

- Developing with Next.js 16.1.1+
- Using the App Router (`app/` directory)
- Implementing Server Actions for mutations
- Using the new `use cache` directive (replacing PPR)
- Optimizing images with stable `next/image`

---

## Critical Patterns

### Async APIs (BREAKING CHANGE)

In Next.js 16, dynamic APIs are async. You MUST await them.

```typescript
// ✅ Correct
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { query } = await searchParams;
  // ...
}

import { cookies, headers } from 'next/headers';
const cookieStore = await cookies();
const headerStore = await headers();
```

### Server Actions

Use Server Actions for mutations.

```typescript
// actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createItem(formData: FormData) {
  const title = formData.get('title');
  // ... db mutation ...
  revalidatePath('/items');
}
```

### Caching with `use cache`

Next.js 16 introduces `use cache` for explicit caching control.

```typescript
'use cache'
// Mark a component or function to be cached
export async function CachedData() {
  const data = await db.query('...');
  return <div>{data.title}</div>;
}
```

---

## Decision Tree

```
Need interactivity? → "use client"
Need SEO/Initial Load? → Server Component (default)
Need to mutate data? → Server Action ('use server')
Need to cache data? → "use cache"
Need global state? → URL search params or React Context (in Client Comp)
```

---

## Code Examples

### Example 1: Async Page with Metadata

```typescript
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.id);
  return { title: product.name };
}

export default async function Page(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  return (
    <div>
      <h1>Product: {params.id}</h1>
      <p>Query: {searchParams.q}</p>
    </div>
  );
}
```

### Example 2: Server Action in Client Component

```typescript
// form-client.tsx
'use client'

import { useActionState } from 'react';
import { submitForm } from './actions';

export function Form() {
  const [state, action, isPending] = useActionState(submitForm, null);

  return (
    <form action={action}>
      <input name="email" />
      <button disabled={isPending}>Subscribe</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

---

## Commands

```bash
# Upgrade/Install Next.js 16
npm install next@latest react@latest react-dom@latest

# Run codemods
npx @next/codemod@canary upgrade latest
```

---

## Resources

- **Documentation**: [Next.js Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
