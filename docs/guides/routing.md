# Routing Guide

This document outlines the routing conventions and provides guidance on managing navigation within the SafraReport application.

## Mobile Navigation Fix: 404 on /perfil

**Issue:** A 404 error was occurring on mobile devices when users tried to access the profile/account page. The mobile navigation component (`MobileBottomNav`) was incorrectly linking to `/perfil` instead of the correct `/cuenta` route.

**Fix Details:**

1.  **Corrected Navigation Link:**
    - The `href` in `client/src/components/layout/mobile-nav.tsx` was updated from `/perfil` to `/cuenta`.

2.  **Type-Safe Routes:**
    - To prevent future errors and improve maintainability, a `ROUTES` constant was added to `client/src/lib/types.ts`.
    ```typescript
    export const ROUTES = {
      HOME: '/',
      ACCOUNT: '/cuenta',
      LOGIN: '/login',
    } as const;
    ```
    - The `MobileBottomNav` component was updated to use this constant for its navigation links.

3.  **Automated Testing:**
    - A Playwright test (`tests/mobile-nav.spec.ts`) was added to verify the mobile navigation.
    - The test ensures that an authenticated user on a mobile viewport can successfully navigate to the `/cuenta` page.

## Dominican Republic (DR) Specific Navigation Notes

- **Locale:** The primary locale is Spanish (Dominican Republic), `es-DO`.
- **Currency:** Prices and financial information should be displayed in Dominican Pesos (DOP).
- **Responsiveness:** Ensure all navigation elements are responsive and function correctly on 3G/4G networks, which are common in the DR.
- **Theming:** The application uses a green color scheme (`#047857`) which should be consistently applied to all navigation components.
