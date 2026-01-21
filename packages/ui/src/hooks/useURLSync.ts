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

  const isUpdatingFromURL = useRef(false);
  const isUpdatingFromStore = useRef(false);

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

    if (isUpdatingFromStore.current) {
      return;
    }

    if (urlSessionId && urlSessionId !== currentSessionId) {
      const sessionExists = sessions.some((s) => s.id === urlSessionId);
      if (sessionExists) {
        isUpdatingFromURL.current = true;
        setCurrentSession(urlSessionId);
        setTimeout(() => {
          isUpdatingFromURL.current = false;
        }, 0);
      }
    }
  }, [isRouterActive, urlSessionId, currentSessionId, setCurrentSession, sessions]);

  useEffect(() => {
    if (!isRouterActive) {
      return;
    }

    if (isUpdatingFromURL.current) {
      return;
    }

    if (urlTab && urlTab !== activeMainTab) {
      isUpdatingFromURL.current = true;
      setActiveMainTab(urlTab);
      setTimeout(() => {
        isUpdatingFromURL.current = false;
      }, 0);
    }
  }, [isRouterActive, urlTab, activeMainTab, setActiveMainTab]);

  useEffect(() => {
    if (!isRouterActive) {
      return;
    }

    if (isUpdatingFromURL.current) {
      return;
    }

    if (currentSessionId && currentSessionId !== urlSessionId) {
      isUpdatingFromStore.current = true;
      setURLState({ sessionId: currentSessionId });
      setTimeout(() => {
        isUpdatingFromStore.current = false;
      }, 0);
    }
  }, [isRouterActive, currentSessionId, urlSessionId, setURLState]);

  useEffect(() => {
    if (!isRouterActive) {
      return;
    }

    if (isUpdatingFromURL.current) {
      return;
    }

    if (activeMainTab && activeMainTab !== urlTab) {
      isUpdatingFromStore.current = true;
      setURLState({ tab: activeMainTab });
      setTimeout(() => {
        isUpdatingFromStore.current = false;
      }, 0);
    }
  }, [isRouterActive, activeMainTab, urlTab, setURLState]);
}
