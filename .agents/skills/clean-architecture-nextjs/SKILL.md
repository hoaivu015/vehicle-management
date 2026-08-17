---
name: Implement Clean Architecture Next.js & MVP
description: A step-by-step guide to implementing features in Next.js using Clean Architecture and MVP pattern. Focuses on strict layering and unidirectional data flow.
---

# Clean Architecture Next.js Implementation Guide

Use this skill when building features in the **Next.js** project with **Clean Architecture** and **MVP**.

## 1. Goal & Context
To implement UI features that are decoupled from business logic and data sources.

*   **Trigger**: "Add a screen", "Implement logic for dashboard", "Connect to API".
*   **Key Principle**: **MVP** (Model-View-Presenter). The View (React) is dumb. The Presenter holds the logic.

## 2. Step-by-Step Implementation Workflow

### Step 1: Domain Layer (The Logic)
1.  **Model**: Define the Business Entity (e.g., `User`).
2.  **Repo Interface**: Define `UserRepository` interface in `domain/repositories`.
3.  **Use Case**: Create `GetUserUseCase` in `domain/usecases`.
    *   It calls the Repo Interface.

### Step 2: Data Layer (The Fetching)
1.  **Implementation**: Create `UserRepositoryImpl` in `data/repositories`.
2.  **Mapper (Data->Domain)**: Create a mapper to convert API response to Domain Model.

### Step 3: Presentation Layer (The Connector)
1.  **Presenter**: Create `UserPresenter`.
    *   It calls `GetUserUseCase`.
    *   It manages state (if not using global store).
    *   **Mapper (Domain->Presentation)**: Convert Domain Model to View Model.

### Step 4: UI Layer (The View)
1.  **Component**: Create React component.
2.  **Connect**: Hook up the Presenter to the Component.
    *   Component calls Presenter methods on user interaction.
    *   Component renders data provided by Presenter.

## 3. Strict Rules

1.  **Layer Access**:
    *   `UI` -> `Presentation`
    *   `Presentation` -> `Domain`
    *   `Data` -> `Domain` (Implements interface)
    *   `Domain` -> **NOTHING**
2.  **No Logic in UI**: React components should only render. Logic goes to Presenter.

## 4. File Structure Template

```
src/
  domain/        <-- Start here
    models/
    usecases/
    repositories/
  data/          <-- Implement here
    repositories/
  presentation/  <-- Connect here
  ui/            <-- Render here App Router
```
