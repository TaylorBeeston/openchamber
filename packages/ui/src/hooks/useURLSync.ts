import { useEffect, useRef } from 'react';
import { useURLState, useURLActions } from '@/stores/useURLStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { useUIStore } from '@/stores/useUIStore';
import { useRouterContext } from '@/lib/router';

export function useURLSync() {
  const { isRouterActive } = useRouterContext();
  const urlState = useURLState();
  const { setURLState, syncFromURL } = useURLActions();
  const { currentSessionId, setCurrentSession, sessions } = useSessionStore();
  const { activeMainTab, setActiveMainTab } = useUIStore();

  const urlSessionId = (urlState as { sessionId: string | null }).sessionId;
  const urlTab = (urlState as { tab: 'chat' | 'git' | 'diff' | 'terminal' | 'files' }).tab;

  const prevUrlStateRef = useRef({ urlSessionId, urlTab });
  const prevStoreStateRef = useRef({ currentSessionId, activeMainTab });
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!isRouterActive) {
      return;
    }

    syncFromURL();
  }, [isRouterActive, syncFromURL]);

  useEffect(() => {
    if (!isRouterActive) {
      return;
    }

    const prevUrl = prevUrlStateRef.current;
    const prevStore = prevStoreStateRef.current;
    const isSyncing = isSyncingRef.current;

    if (isSyncing) {
      return;
    }

    let needsStoreUpdate = false;
    let needsUrlUpdate = false;

    if (urlSessionId !== prevUrl.urlSessionId) {
      if (urlSessionId && urlSessionId !== currentSessionId) {
        const sessionExists = sessions.some((s) => s.id === urlSessionId);
        if (sessionExists) {
          needsStoreUpdate = true;
        }
      }
    } else if (urlTab !== prevUrl.urlTab && urlTab !== activeMainTab) {
      needsStoreUpdate = true;
    }

    if (currentSessionId !== prevStore.currentSessionId && currentSessionId !== urlSessionId) {
      needsUrlUpdate = true;
    } else if (activeMainTab !== prevStore.activeMainTab && activeMainTab !== urlTab) {
      needsUrlUpdate = true;
    }

    if (needsStoreUpdate && !needsUrlUpdate) {
      isSyncingRef.current = true;
      const update = {};
      if (urlSessionId && urlSessionId !== currentSessionId) {
        setCurrentSession(urlSessionId);
      }
      if (urlTab && urlTab !== activeMainTab) {
        setActiveMainTab(urlTab);
      }
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    } else if (needsUrlUpdate && !needsStoreUpdate) {
      isSyncingRef.current = true;
      const update: { sessionId?: string | null; tab?: 'chat' | 'git' | 'diff' | 'terminal' | 'files' } = {};
      if (currentSessionId && currentSessionId !== urlSessionId) {
        update.sessionId = currentSessionId;
      }
      if (activeMainTab && activeMainTab !== urlTab) {
        update.tab = activeMainTab;
      }
      setURLState(update);
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    }

    prevUrlStateRef.current = { urlSessionId, urlTab };
    prevStoreStateRef.current = { currentSessionId, activeMainTab };
  }, [isRouterActive, urlSessionId, urlTab, currentSessionId, activeMainTab, setCurrentSession, setActiveMainTab, sessions, setURLState]);
}
