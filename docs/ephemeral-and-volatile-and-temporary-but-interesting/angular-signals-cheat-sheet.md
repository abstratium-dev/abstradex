# Angular Signals Cheat Sheet

## Summary

Angular Signals provide a reactive state management system that tracks value changes and automatically updates the DOM. Signals are lightweight wrappers around values that notify consumers when changes occur, enabling fine-grained reactivity without the complexity of RxJS for simple state management.

**Key Concepts:**
- **Writable Signals**: Mutable state containers with `set()` and `update()` methods
- **Computed Signals**: Read-only derived values that automatically recalculate when dependencies change
- **Linked Signals**: Writable signals whose values are initialized and reset by reactive computations
- **Effects**: Side effects that run when signal dependencies change
- **Reactive Context**: Runtime state where Angular tracks signal reads to establish dependencies

---

## Creating Signals

### Writable Signal
```typescript
import { signal } from '@angular/core';

const count = signal(0);
const user = signal({ name: 'Morgan', age: 30 });

// Read value by calling the signal
console.log(count()); // 0
```

### Set New Value
```typescript
count.set(5);
user.set({ name: 'Jaime', age: 25 });
```

### Update Based on Previous Value
```typescript
count.update(value => value + 1);
user.update(u => ({ ...u, age: u.age + 1 }));
```

---

## Computed Signals

Computed signals derive values from other signals and are **read-only**, **lazily evaluated**, and **memoized**.

```typescript
import { signal, computed } from '@angular/core';

const firstName = signal('Morgan');
const lastName = signal('Smith');

const fullName = computed(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // "Morgan Smith"

firstName.set('Jaime');
console.log(fullName()); // "Jaime Smith" - automatically updated
```

### Dynamic Dependencies
Dependencies are tracked only when actually read:

```typescript
const showCount = signal(false);
const count = signal(0);

const conditionalCount = computed(() => {
  if (showCount()) {
    return `The count is ${count()}.`;
  }
  return 'Nothing to see here!';
});

// count is only a dependency when showCount is true
```

---

## Linked Signals

Linked signals are **writable signals** whose values are initialized and automatically reset when their dependencies change. Use `linkedSignal` when you need writable state that depends on other signals.

### When to Use Linked Signals

Use `linkedSignal` instead of `computed` when:
- You need a **writable** signal that depends on other state
- The value should reset automatically when dependencies change
- Users can manually override the value, but it should reset when source data changes

### Basic Linked Signal

```typescript
import { signal, linkedSignal } from '@angular/core';

const shippingOptions = signal(['Ground', 'Air', 'Sea']);

// Initialize to first option, reset when shippingOptions changes
const selectedOption = linkedSignal(() => shippingOptions()[0]);

console.log(selectedOption()); // 'Ground'

// User can manually change the selection
selectedOption.set(shippingOptions()[2]);
console.log(selectedOption()); // 'Sea'

// When source changes, linkedSignal resets to computation result
shippingOptions.set(['Email', 'Will Call', 'Postal service']);
console.log(selectedOption()); // 'Email' - automatically reset!
```

### Advanced: Preserving Previous State

Use the `source` and `computation` form to access previous values:

```typescript
interface ShippingMethod {
  id: number;
  name: string;
}

@Component({ /* ... */ })
export class ShippingMethodPicker {
  shippingOptions = signal<ShippingMethod[]>([
    { id: 0, name: 'Ground' },
    { id: 1, name: 'Air' },
    { id: 2, name: 'Sea' },
  ]);

  selectedOption = linkedSignal<ShippingMethod[], ShippingMethod>({
    source: this.shippingOptions,
    computation: (newOptions, previous) => {
      // Try to preserve user's selection if it still exists
      return newOptions.find(opt => opt.id === previous?.value.id) 
        ?? newOptions[0];
    },
  });

  changeShipping(index: number) {
    this.selectedOption.set(this.shippingOptions()[index]);
  }
}
```

**Key Points:**
- `source`: The signal to watch for changes
- `computation`: Function receiving `(newSourceValue, previous)` where:
  - `previous.source`: Previous value of the source signal
  - `previous.value`: Previous value of the linked signal
- When using `previous`, explicitly provide generic types: `linkedSignal<SourceType, OutputType>`

### Linked Signal vs Computed

| Feature | `computed` | `linkedSignal` |
|---------|-----------|----------------|
| Writable | ❌ No | ✅ Yes |
| Auto-updates | ✅ Yes | ✅ Yes |
| Manual override | ❌ No | ✅ Yes (via `set()`/`update()`) |
| Access to previous value | ❌ No | ✅ Yes (with `source` form) |
| Use case | Derived read-only state | Dependent writable state |

---

## Using Signals in Components

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ doubleCount() }}</p>
    <button (click)="increment()">Increment</button>
  `
})
export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update(n => n + 1);
  }
}
```

---

## Read-Only Signals

Convert writable signals to read-only to prevent external modifications:

```typescript
@Injectable({ providedIn: 'root' })
export class CounterState {
  private readonly _count = signal(0);
  readonly count = this._count.asReadonly(); // public readonly

  increment() {
    this._count.update(v => v + 1);
  }
}

@Component({ /* ... */ })
export class AwesomeCounter {
  state = inject(CounterState);
  count = this.state.count; // can read but not modify

  increment() {
    this.state.increment();
  }
}
```

---

## Reactive Contexts

Angular automatically enters a reactive context when:
- Executing an `effect` or `afterRenderEffect` callback
- Evaluating a `computed` signal
- Evaluating a `linkedSignal`
- Evaluating a `resource`'s params or loader function
- Rendering a component template

During these operations, Angular tracks signal reads and creates live connections.

---

## Signal Types

```typescript
import { WritableSignal, Signal } from '@angular/core';

// Writable signal type
const count: WritableSignal<number> = signal(0);

// Read-only signal type
const doubleCount: Signal<number> = computed(() => count() * 2);
```

---

## Quick Reference

| Operation | Syntax | Description |
|-----------|--------|-------------|
| Create writable signal | `signal(value)` | Creates a mutable signal |
| Read signal | `mySignal()` | Returns current value |
| Set value | `mySignal.set(newValue)` | Replaces value |
| Update value | `mySignal.update(fn)` | Updates based on previous value |
| Create computed | `computed(() => ...)` | Creates derived read-only signal |
| Create linked signal | `linkedSignal(() => ...)` | Creates writable signal that resets on dependency changes |
| Linked with previous | `linkedSignal({ source, computation })` | Access previous values in computation |
| Make read-only | `mySignal.asReadonly()` | Returns read-only version |

---

## Important Notes

- **Signals are functions**: Call them to read their value
- **Computed signals are lazy**: They don't calculate until first read
- **Computed signals are memoized**: Cached values are reused until dependencies change
- **No deep mutation protection**: Read-only signals don't prevent deep mutations of objects
- **Automatic tracking**: Angular tracks signal reads in reactive contexts
- **OnPush compatible**: Reading signals in OnPush component templates automatically marks components for update

---

## References

- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Angular Essentials: Signals](https://angular.dev/essentials/signals)
- [Dependent State with linkedSignal](https://angular.dev/guide/signals/linked-signal)
- [linkedSignal API](https://angular.dev/api/core/linkedSignal)
