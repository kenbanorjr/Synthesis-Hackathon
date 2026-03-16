import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("sonner", () => ({
  Toaster: () => null,
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn()
  }),
  usePathname: () => "/dashboard"
}));
