(function() {
    let isSelecting = false;
    let startX, startY;
    let selectionBox = null;
    let selectedLinks = new Set();
    let activationKey = 'Shift';
    let isKeyPressed = false;

    chrome.storage.sync.get(['activationKey'], (result) => {
      if (result.activationKey) {
        activationKey = result.activationKey;
      }
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.activationKey) {
        activationKey = changes.activationKey.newValue;
      }
    });

    function createSelectionBox() {
      const box = document.createElement('div');
      box.className = 'telnyx-selection-box';
      document.body.appendChild(box);
      return box;
    }

    function updateSelectionBox(x1, y1, x2, y2) {
      if (!selectionBox) return;

      const left = Math.min(x1, x2);
      const top = Math.min(y1, y2);
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);

      selectionBox.style.left = left + 'px';
      selectionBox.style.top = top + 'px';
      selectionBox.style.width = width + 'px';
      selectionBox.style.height = height + 'px';
    }

    function getLinksInSelection(x1, y1, x2, y2) {
      const links = document.querySelectorAll('a[href]');
      const selected = new Set();

      const selectionRect = {
        left: Math.min(x1, x2),
        top: Math.min(y1, y2),
        right: Math.max(x1, x2),
        bottom: Math.max(y1, y2)
      };

      links.forEach(link => {
        const rect = link.getBoundingClientRect();
        const linkRect = {
          left: rect.left + window.scrollX,
          top: rect.top + window.scrollY,
          right: rect.right + window.scrollX,
          bottom: rect.bottom + window.scrollY
        };

        if (!(linkRect.right < selectionRect.left ||
              linkRect.left > selectionRect.right ||
              linkRect.bottom < selectionRect.top ||
              linkRect.top > selectionRect.bottom)) {
          selected.add(link);
          link.classList.add('telnyx-selected-link');
        } else {
          link.classList.remove('telnyx-selected-link');
        }
      });

      return selected;
    }

    function clearSelection() {
      selectedLinks.forEach(link => {
        link.classList.remove('telnyx-selected-link');
      });
      selectedLinks.clear();

      if (selectionBox) {
        selectionBox.remove();
        selectionBox = null;
      }
    }

    function openSelectedLinks() {
      const urls = Array.from(selectedLinks).map(link => link.href);
      if (urls.length > 0) {
        chrome.runtime.sendMessage({
          action: 'openLinks',
          urls: urls
        });
      }
    }

    function getKeyFromEvent(e) {
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;

      const keyMap = {
        ' ': 'Space',
        'Enter': 'Enter',
        'Tab': 'Tab',
        'Escape': 'Escape',
        'Backspace': 'Backspace',
        'Delete': 'Delete',
        'ArrowUp': 'ArrowUp',
        'ArrowDown': 'ArrowDown',
        'ArrowLeft': 'ArrowLeft',
        'ArrowRight': 'ArrowRight',
        'Control': 'Control',
        'Shift': 'Shift',
        'Alt': 'Alt',
        'Meta': 'Meta'
      };

      return keyMap[e.key] || key;
    }

    function isKeyPressedAlone(e, targetKey) {
      // Check if any modifier keys are pressed when they shouldn't be
      if (targetKey === 'Control') {
        // Control key should be pressed alone - no other modifiers or keys
        return e.key === 'Control' && !e.shiftKey && !e.altKey && !e.metaKey;
      } else if (targetKey === 'Shift') {
        // Shift key should be pressed alone
        return e.key === 'Shift' && !e.ctrlKey && !e.altKey && !e.metaKey;
      } else if (targetKey === 'Alt') {
        // Alt key should be pressed alone
        return e.key === 'Alt' && !e.ctrlKey && !e.shiftKey && !e.metaKey;
      } else if (targetKey === 'Meta') {
        // Meta key should be pressed alone
        return e.key === 'Meta' && !e.ctrlKey && !e.shiftKey && !e.altKey;
      } else {
        // For non-modifier keys, ensure no modifiers are pressed
        const pressedKey = getKeyFromEvent(e);
        return pressedKey === targetKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey;
      }
    }

    document.addEventListener('keydown', (e) => {
      // Only activate if the key is pressed alone (no combinations)
      if (isKeyPressedAlone(e, activationKey) && !isKeyPressed) {
        isKeyPressed = true;
        document.body.style.cursor = 'crosshair';
      }
    });

    document.addEventListener('keyup', (e) => {
      const releasedKey = getKeyFromEvent(e);
      // Only deactivate if it's our activation key being released
      if (releasedKey === activationKey && isKeyPressed) {
        isKeyPressed = false;
        document.body.style.cursor = '';

        // Reset start coordinates when key is released
        startX = undefined;
        startY = undefined;

        if (isSelecting) {
          openSelectedLinks();
          clearSelection();
          isSelecting = false;
        }
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (!isKeyPressed || e.button !== 0) return;

      e.preventDefault();
      startX = e.pageX;
      startY = e.pageY;

      // Don't start selecting immediately, wait for mouse movement
      clearSelection();
    });

    document.addEventListener('mousemove', (e) => {
      // Only start selecting if key is pressed, mouse is down, and we have start coordinates
      if (!isKeyPressed || startX === undefined || startY === undefined) {
        return;
      }

      // If not already selecting, start selection on first movement
      if (!isSelecting) {
        isSelecting = true;
        selectionBox = createSelectionBox();
      }

      e.preventDefault();
      const currentX = e.pageX;
      const currentY = e.pageY;

      updateSelectionBox(startX, startY, currentX, currentY);
      selectedLinks = getLinksInSelection(startX, startY, currentX, currentY);
    });

    document.addEventListener('mouseup', (e) => {
      // Reset start coordinates when mouse is released
      if (startX !== undefined || startY !== undefined) {
        startX = undefined;
        startY = undefined;
      }

      if (!isSelecting) return;

      e.preventDefault();

      // If key is still pressed, don't open links yet (wait for key release)
      if (isKeyPressed) {
        return;
      }

      openSelectedLinks();
      clearSelection();
      isSelecting = false;
    });

    window.addEventListener('blur', () => {
      if (isSelecting) {
        clearSelection();
        isSelecting = false;
        isKeyPressed = false;
        document.body.style.cursor = '';
        startX = undefined;
        startY = undefined;
      }
    });
  })();
