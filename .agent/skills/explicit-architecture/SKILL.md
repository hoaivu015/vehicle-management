---
name: Implement Explicit Architecture
description: A step-by-step guide to implementing features using Explicit Architecture. Focuses on strict decoupling of Components and separation of Core vs. Infrastructure.
---

# Explicit Architecture Implementation Guide

Use this skill when working on a project following **Explicit Architecture** (Herberto Graça), particularly for PHP/Symfony applications.

## 1. Goal & Context
To implement features where the code **explicitly** reveals the business intent and is organized by **Component** (Bounded Context).

*   **Trigger**: "Add a new component", "Implement a use case in Core", "Create a new Adapter".
*   **Key Principle**: **Vertical Slicing** (Components) first, then Layers.

## 2. Step-by-Step Implementation Workflow

### Step 1: Create the Component (If new)
1.  Create a folder in `src/Core/Component/[ComponentName]`.
2.  This folder represents a **Bounded Context** (e.g., `Billing`).
3.  **Rule**: It should not depend on other Components directly (use Events/SharedKernel).

### Step 2: Implement the Core (Application & Domain)
1.  **Domain**: Create Entities and Value Objects in `Domain/`.
2.  **Ports**: Define what the Core needs (e.g., `UserRepositoryInterface`) in `Application/Repository/`.
3.  **Use Case**: Create an Application Service in `Application/Service/`.
    *   It orchestrates the flow.
    *   It uses the `RepositoryInterface`.
    *   It returns DTOs or Domain Objects.

### Step 3: Implement the Adapters
1.  **Infrastructure (Secondary)**: Implement the Port.
    *   Go to `src/Infrastructure/Persistence/Doctrine/Repository/`.
    *   Implement `UserRepositoryInterface`.
2.  **Presentation (Primary)**: Create the Entry Point.
    *   Go to `src/Presentation/Web/Controller/`.
    *   Inject the Application Service.
    *   Handle request/response.

## 3. Strict Rules (Enforced by Deptrac)

1.  **Core Isolation**: `Core` depends on **NOTHING** outside of itself (and SharedKernel).
2.  **Controller Ban**: NO class in `Core` or `Infrastructure` can depend on specific `Controller` or `Presentation` classes.
3.  **Service/Repository**:
    *   `Service` can depend on `Repository Interface`.
    *   `Repository Interface` CANNOT depend on `Service`.

## 4. File Structure Template

```
src/
  Core/
    Component/
      [Name]/            <-- Bounded Context
        Application/
          Service/       <-- Use Cases
          Repository/    <-- Interfaces (Ports)
        Domain/          <-- Entities
  Infrastructure/
    Persistence/         <-- Implementations
  Presentation/
    Web/Controller/      <-- Entry Points
```
