import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PrivateLayout from "./private-layout";
import { ThemeProvider } from "next-themes";
import { useUser } from "@/lib/auth";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
  getInitials: (name: string) => name.substring(0, 2).toUpperCase(),
  cn: (...inputs: any[]) => inputs.join(" "),
}));

vi.mock("./app-sidebar", () => ({
  default: () => <div data-testid="app-sidebar">Sidebar</div>,
}));

// Mock sidebar components
vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: any) => <div>{children}</div>,
  SidebarInset: ({ children }: any) => <div>{children}</div>,
  SidebarTrigger: () => <button>Trigger</button>,
}));

vi.mock("react-router", () => ({
  useLocation: () => ({ pathname: "/" }),
  Link: ({ children }: any) => <a>{children}</a>,
}));

describe("Alternancia de tema en PrivateLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useUser as any).mockReturnValue({ user: { name: "Test User" } });

    // Reset theme
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";
  });

  it("TC-FE-THEME-001: debe alternar el tema al hacer clic en el botón", async () => {
    render(
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <PrivateLayout sections={[]}>
          <div>Content</div>
        </PrivateLayout>
      </ThemeProvider>,
    );

    // Initial state should be light (mocked default)
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Find the toggle button
    const toggleButton = screen.getByLabelText("Cambiar tema");
    expect(toggleButton).toBeInTheDocument();

    // Click to toggle to dark
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    // Click to toggle back to light
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(false);
    });
  });
});
