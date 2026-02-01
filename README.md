## Project Structure

This project follows a modular structure located in the `src/` directory:

- `src/app/`: Expo Router pages and layouts.
- `src/features/`: Feature-specific logic and components (Auth, Medication, Progress, etc.).
- `src/components/common/`: Shared/Reusable UI components.
- `src/services/`: External services (Firebase, AsyncStorage, Notifications).
- `src/context/`: Global state management.
- `src/hooks/`: Shared React hooks.
- `src/types/`: Global TypeScript definitions.
- `src/utils/`: Pure utility functions.
- `src/constants/`: App-wide constants and theme configuration.

## Testing

We use [Jest](https://jestjs.io/) and [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) for testing.

### Running Tests

```bash
npm test
```

### Writing Tests

- Unit tests: Place in `__tests__` folders next to the implementation or use `.test.ts` suffix.
- Component tests: Use `@testing-library/react-native` to render and interact with components.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

[... existing expo links ...]

