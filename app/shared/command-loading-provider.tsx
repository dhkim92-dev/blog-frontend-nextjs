"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CommandLoadingHandle = {
  dismiss: () => Promise<void>;
  redirect: (
    href?: string,
    options?: {
      replace?: boolean;
    },
  ) => Promise<void>;
};

type CommandLoadingContextValue = {
  startCommand: () => CommandLoadingHandle;
};

const CommandLoadingContext = createContext<CommandLoadingContextValue | null>(
  null,
);
const COMMAND_LOADING_REDIRECT_DELAY_MS = 1000;

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function CommandLoadingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [activeCount, setActiveCount] = useState(0);

  const contextValue = useMemo<CommandLoadingContextValue>(
    () => ({
      startCommand() {
        const startedAt = Date.now();
        let settled = false;

        setActiveCount((currentCount) => currentCount + 1);

        async function settle(minVisibleMs: number) {
          if (settled) {
            return;
          }

          settled = true;

          const elapsedMs = Date.now() - startedAt;
          const remainingMs = Math.max(minVisibleMs - elapsedMs, 0);

          if (remainingMs > 0) {
            await delay(remainingMs);
          }

          setActiveCount((currentCount) => Math.max(currentCount - 1, 0));
        }

        return {
          dismiss() {
            return settle(0);
          },
          async redirect(href, options) {
            await settle(COMMAND_LOADING_REDIRECT_DELAY_MS);

            if (!href) {
              window.location.reload();
              return;
            }

            if (options?.replace) {
              window.location.replace(href);
              return;
            }

            window.location.assign(href);
          },
        };
      },
    }),
    [],
  );

  return (
    <CommandLoadingContext.Provider value={contextValue}>
      {children}
      {activeCount > 0 ? (
        <div className="command-loading-overlay" aria-hidden="true">
          <div className="command-loading-bar-track">
            <div className="command-loading-bar" />
          </div>
          <div className="command-loading-spinner" />
        </div>
      ) : null}
    </CommandLoadingContext.Provider>
  );
}

export function useCommandLoading() {
  const context = useContext(CommandLoadingContext);

  if (!context) {
    throw new Error("useCommandLoading must be used within CommandLoadingProvider.");
  }

  return context;
}
