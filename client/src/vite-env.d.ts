/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom" />

declare module '@testing-library/jest-dom/matchers' {
  interface CustomMatchers<R = unknown> {
    toBeInTheDocument(): R;
    toHaveClass(className: string): R;
    toHaveTextContent(text: string | RegExp): R;
    toBeVisible(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toHaveValue(value: string | number): R;
    toBeChecked(): R;
    toHaveFocus(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toBeInvalid(): R;
  }
}

declare namespace Vi {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
