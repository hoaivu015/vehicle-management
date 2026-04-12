---
name: Implement Domain-Driven Hexagon Architecture
description: A step-by-step guide to implementing features using Domain-Driven Hexagon Architecture. Use this when starting a new module or refactoring existing code to strictly separate Domain, Application, and Infrastructure.
---

# Domain-Driven Hexagon Implementation Guide

Use this skill when you need to implement a feature or module following the **Domain-Driven Hexagon** architecture (Sairyss/domain-driven-hexagon).

## 1. Goal & Context
To create software that is independent of frameworks, UI, and databases by isolating the **Domain** (Business Logic) from the **Infrastructure** (External details).

*   **Trigger**: You are asked to "create a new feature", "add a module", or "refactor" using DDD/Hexagonal.
*   **Key Principle**: Dependencies point **INWARD**. Domain depends on nothing.

## 2. Step-by-Step Implementation Workflow

Follow these steps when implementing a new feature (e.g., "Create User"):

### Step 1: Define the Domain (The Core)
*Start here. Do not think about database or API yet.*

1.  **Create Entity**: Define the core business object (e.g., `User`).
    *   Use **Rich Domain Models** (logic inside the class).
    *   Use **Value Objects** for properties (e.g., `Email`, `UserId`) to enforce validation.
2.  **Define Domain Events**: If something important happens, define an event (e.g., `UserCreatedEvent`).

```typescript
// src/modules/user/domain/entities/user.entity.ts
export class User extends AggregateRoot<UserProps> {
  // Business logic methods (e.g. changeAddress, activate)
}
```

### Step 2: Define Application Logic (Use Cases)
*Orchestrate the flow.*

1.  **Create Command/Query**: Define the input data structure (DTO) for the operation (e.g., `CreateUserCommand`).
2.  **Define Ports**: Define the *interface* for any external data access the use case needs (e.g., `UserRepositoryPort`).
3.  **Create Service**: Implement the use case logic.
    *   Accept `Command`.
    *   Load/Save `Entity` using `Port`.
    *   Publish `DomainEvents`.

```typescript
// src/modules/user/application/use-cases/create-user.service.ts
export class CreateUserService {
  constructor(private readonly userRepo: UserRepositoryPort) {}
  
  async execute(command: CreateUserCommand): Promise<Result<UserId>> {
    // 1. Create Entity
    // 2. Persist using Repo
    // 3. Return result
  }
}
```

### Step 3: Implement Adapters (Interface & Infrastructure)
*Connect to the outside world.*

1.  **Interface Adapters (Driving)**: Create a Controller (e.g., `CreateUserController`).
    *   Convert HTTP Request -> Command.
    *   Call Service.
    *   Convert Result -> HTTP Response.
2.  **Infrastructure (Driven)**: Implement the Repository Port.
    *   Create `UserRepositoryImpl` (implementing `UserRepositoryPort`).
    *   Map Domain Entity <-> ORM Entity/Database Record.

## 3. Strict Rules (Do Not Violate)

1.  **Dependency Rule**: `Domain` imports NOTHING from `Infrastructure` or `InterfaceAdapters`.
2.  **No Anemic Models**: Do not just create data bags with getters/setters. Put logic in Entities.
3.  **Ports are in Application**: The interface (`UserRepositoryPort`) lives in `application/ports`. The implementation lives in `infrastructure`.

## 4. File Structure Template

Organize by **Module**:

```
src/modules/[module-name]/
├── domain/                  # CORE: Independent of everything
│   ├── entities/
│   ├── value-objects/
│   └── events/
├── application/             # LOGIC: Orchestration
│   ├── use-cases/
│   │   └── [use-case]/      # e.g. create-user
│   │       ├── *.command.ts
│   │       └── *.service.ts
│   └── ports/               # INTERFACES only
│       └── *.repository.port.ts
├── interface-adapters/      # INPUT: Controllers
│   ├── controllers/
│   └── dtos/
└── infrastructure/          # OUTPUT: DB, External APIs
    ├── database/
    │   ├── *.repository.impl.ts
    │   └── *.orm-entity.ts
    └── mappers/
```
