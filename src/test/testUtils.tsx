import { act } from "react-dom/test-utils";

export async function actAsync(fn: () => Promise<void> | void) {
  await act(async () => {
    await fn();
  });
}
