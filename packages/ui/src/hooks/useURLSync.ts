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
  const urlDirectory = (urlState as { directory: string | null }).directory;

  const updateSourceRef = useRef<'url' | 'store' | null>(null);

  useEffect(() => {
    if (!isRouterActive) {
      return;
    }

    syncFromURL();
    updateSourceRef.current = null;
  }, [isRouterActive, syncFromURL]);

  useEffect(() => {
    if (!isRouterActive || updateSourceRef.current === 'store') {
      return;
    }

    if (urlSessionId && urlSessionId !== currentSessionId) {
      const sessionExists = sessions.some((s) => s.id === urlSessionId);
      if (sessionExists) {
        updateSourceRef.current = 'url';
        setCurrentSession(urlSessionId);
      }
    } else if (urlTab && urlTab !== activeMainTab) {
      updateSourceRef.current = 'url';
      setActiveMainTab(urlTab);
    }
  }, [isRouterActive, urlSessionId, urlTab, currentSessionId, activeMainTab, setCurrentSession, setActiveMainTab, sessions]);

  useEffect(() => {
    if (!isRouterActive || updateSourceRef.current === 'store') {
      return;
    }

    let needsUpdate = false;
    const update: { sessionId?: string | null; tab?: 'chat' | 'git' | 'diff' | 'terminal' | 'files' } = {};

    if (currentSessionId && currentSessionId !== urlSessionId) {
      update.sessionId = currentSessionId;
      needsUpdate = true;
    }

    if (activeMainTab && activeMainTab !== urlTab) {
      update.tab = activeMainTab;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updateSourceRef.current = 'store';
      setURLState(update);
    }
  }, [isRouterActive, currentSessionId, activeMainTab, urlSessionId, urlTab, setURLState]);
}
