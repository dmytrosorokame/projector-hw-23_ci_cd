import { describe, it, expect, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  it("should debounce a function", () => {
    vi.useFakeTimers();

    const fn = vi.fn();

    const debouncedFn = debounce(fn, 100);

    debouncedFn();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
