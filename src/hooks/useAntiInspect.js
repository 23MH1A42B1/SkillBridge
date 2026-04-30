import { useEffect } from 'react';

/**
 * useAntiInspect — Adds browser-level deterrents:
 *   1. Disables right-click context menu
 *   2. Blocks common DevTools keyboard shortcuts
 *   3. Disables drag-and-drop on images
 *   4. Blocks Ctrl+P (Print)
 *   5. Console branding message
 *   6. Detects DevTools open via window-size diff and blurs the page
 */
export function useAntiInspect({ enabled = true, blurOnDetect = false } = {}) {
  useEffect(() => {
    if (!enabled) return;

    // ── Console branding (deters casual JS explorers) ─────────────
    console.clear();
    console.log(
      '%c🔒 SkillBridge',
      'color:#7c3aed;font-size:28px;font-weight:900;letter-spacing:-1px;',
    );
    console.log(
      '%cThis is a browser feature intended for developers.\nIf someone told you to paste something here, it is a scam.',
      'color:#f87171;font-size:14px;font-weight:600;line-height:1.6;',
    );
    console.log(
      '%c© SkillBridge Inc. — All rights reserved.',
      'color:#6b7280;font-size:11px;',
    );


    // 1. Disable right-click
    const onContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', onContextMenu);

    // 2. Block DevTools keyboard shortcuts
    const onKeyDown = (e) => {
      const blocked =
        e.key === 'F12' ||
        // Ctrl+Shift+I / Cmd+Option+I  (Elements panel)
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.metaKey && e.altKey  && e.key === 'i') ||
        // Ctrl+Shift+J / Cmd+Option+J  (Console panel)
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.metaKey && e.altKey  && e.key === 'j') ||
        // Ctrl+Shift+C  (Inspector picker)
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        // Ctrl+U  (View source)
        (e.ctrlKey && e.key === 'u') ||
        (e.metaKey && e.key === 'u') ||
        // Ctrl+P  (Print)
        (e.ctrlKey && e.key === 'p') ||
        (e.metaKey && e.key === 'p') ||
        // Ctrl+S (Save page)
        (e.ctrlKey && e.key === 's') ||
        (e.metaKey && e.key === 's');

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // 3. Disable drag on all images
    const onDragStart = (e) => {
      if (e.target.tagName === 'IMG') e.preventDefault();
    };
    document.addEventListener('dragstart', onDragStart);

    // 4. Disable text selection on selectstart (soft block)
    const onSelectStart = (e) => e.preventDefault();
    // Uncomment below if you also want to disable text selection:
    // document.addEventListener('selectstart', onSelectStart);

    // 4. DevTools open detection via window size threshold
    let devtoolsOpen = false;
    let detectionInterval = null;

    if (blurOnDetect) {
      detectionInterval = setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        const isOpen = widthThreshold || heightThreshold;

        if (isOpen && !devtoolsOpen) {
          devtoolsOpen = true;
          // Blur the page content
          document.body.style.filter = 'blur(12px)';
          document.body.style.userSelect = 'none';
          document.body.style.pointerEvents = 'none';
        } else if (!isOpen && devtoolsOpen) {
          devtoolsOpen = false;
          document.body.style.filter = '';
          document.body.style.userSelect = '';
          document.body.style.pointerEvents = '';
        }
      }, 1000);
    }

    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('selectstart', onSelectStart);
      if (detectionInterval) clearInterval(detectionInterval);
      // Restore body styles on cleanup
      document.body.style.filter = '';
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
    };
  }, [enabled, blurOnDetect]);
}
