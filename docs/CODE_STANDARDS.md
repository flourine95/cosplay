# Code Standards

## Naming Conventions

### Files & Folders

- **kebab-case**: `user-profile.ts`, `auth-service.ts`, `/user-profile`

### Variables & Functions

- **camelCase**: `getUserById`, `isLoading`, `handleSubmit`
- **Boolean**: prefix với `is`, `has`, `can`, `should`
  ```ts
  const isLoading = true
  const hasPermission = false
  const canEdit = true
  ```

### Components, Classes, Types, Interfaces

- **PascalCase**: `UserCard`, `AuthService`, `UserDto`
  ```ts
  interface UserProfile {}
  class AuthService {}
  const UserCard = () => {}
  ```

### Constants

- **UPPER_SNAKE_CASE**: chỉ cho constants thật sự
  ```ts
  const MAX_RETRY_COUNT = 3
  const API_BASE_URL = "https://api.example.com"
  ```

## Modern JavaScript/TypeScript

### ✅ Dùng (Modern)

```ts
// const/let thay vì var
const name = "John"
let count = 0

// Arrow functions
const getUser = (id: number) => {}

// Template literals
const message = `Hello ${name}`

// Destructuring
const { id, name } = user
const [first, second] = array

// Spread operator
const newUser = { ...user, age: 30 }
const newArray = [...array, newItem]

// Optional chaining
const userName = user?.profile?.name

// Nullish coalescing
const displayName = name ?? "Anonymous"

// Array methods
const users = data.map((item) => item.user)
const active = users.filter((u) => u.isActive)
```

### ❌ Không dùng (Legacy)

```ts
// ❌ var
var name = "John"

// ❌ function keyword (dùng arrow function)
function getUser(id) {}

// ❌ String concatenation
const message = "Hello " + name

// ❌ Manual property access
const id = user.id
const name = user.name

// ❌ Object.assign
const newUser = Object.assign({}, user, { age: 30 })

// ❌ && cho default value
const displayName = name || "Anonymous" // Sai với "", 0, false
```

## TypeScript Rules

### ✅ Bắt buộc

```ts
// Type annotations
const getUser = (id: number): Promise<User> => {}

// Interface cho objects
interface User {
  id: number
  name: string
  email?: string
}

// Type cho unions
type Status = "pending" | "active" | "inactive"

// Generics
const getData = <T>(url: string): Promise<T> => {}
```

### ❌ Cấm

```ts
// ❌ any
const data: any = {}

// ❌ Implicit any
const getData = (id) => {} // Missing type

// ❌ Non-null assertion (trừ khi chắc chắn)
const name = user!.name

// ❌ Type casting không cần thiết
const id = userId as number
```

## Code Quality

### Imports

```ts
// ✅ Absolute imports
import { Button } from "@/components/ui/button"

// ❌ Relative imports nhiều cấp
import { Button } from "../../../components/ui/button"
```

### Error Handling

```ts
// ✅ Try-catch cho async
try {
  const data = await fetchData()
} catch (error) {
  console.error("Failed to fetch:", error)
}

// ✅ Type error
if (error instanceof Error) {
  console.error(error.message)
}
```

### Console

```ts
// ❌ console.log (sẽ bị warning)
console.log("Debug")

// ✅ console.error, console.warn
console.error("Error occurred")
console.warn("Deprecated feature")
```

## Enforcement

### Pre-commit Hooks

- ESLint auto-fix
- Prettier format
- TypeScript check

### CI/CD

```bash
npm run lint       # ESLint check
npm run typecheck  # TypeScript check
npm run format:check # Prettier check
```

### VSCode

- Format on save: enabled
- ESLint auto-fix on save: enabled
- Organize imports on save: enabled

## Bypass (Khi thực sự cần)

```ts
// Disable ESLint cho 1 dòng
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = legacyApi()

// Disable TypeScript check
// @ts-expect-error: Legacy API
const result = oldFunction()
```

**Lưu ý:** Chỉ bypass khi thực sự cần và phải có comment giải thích.
