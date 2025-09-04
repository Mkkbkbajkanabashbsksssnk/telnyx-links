  (function() {
    let isSelecting = false;
    let startX, startY;
    let selectionBox = null;
    let selectedLinks = new Set();
    let activationKey = 'Shift';
    let isKeyPressed = false;
    let keyHoldTimer = null;
    let keyHoldStartTime = 0;
    let isActivationKeyActive = false;
    let statusCheckInterval = null;
    let lastKeyStates = { ctrl: false, shift: false, alt: false, meta: false };
    let stateValidationInterval = null;
    let autoScrollInterval = null;

    chrome.storage.sync.get(['activationKey'], (result) => {
      if (result.activationKey) {
        activationKey = result.activationKey;
      }
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.activationKey) {
        activationKey = changes.activationKey.newValue;

        // Deactivate extension if currently active with old key
        if (isKeyPressed || isActivationKeyActive) {
          deactivateExtension();
        }
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
      // Get the current pressed key
      const pressedKey = getKeyFromEvent(e);

      // Must match the target key exactly
      if (pressedKey !== targetKey) {
        return false;
      }

      // Count how many modifier keys are currently pressed
      let modifierCount = 0;
      if (e.ctrlKey) modifierCount++;
      if (e.shiftKey) modifierCount++;
      if (e.altKey) modifierCount++;
      if (e.metaKey) modifierCount++;

      // For modifier keys like Control, Shift, Alt, Meta
      if (targetKey === 'Control' || targetKey === 'Shift' || targetKey === 'Alt' || targetKey === 'Meta') {
        // Only that specific modifier should be pressed (count should be exactly 1)
        return modifierCount === 1;
      } else {
        // For non-modifier keys, no modifiers should be pressed at all
        return modifierCount === 0;
      }
    }

    function activateExtension() {
      isActivationKeyActive = true;
      document.body.style.cursor = 'crosshair';
    }


    function deactivateExtension() {
      isActivationKeyActive = false;
      isKeyPressed = false;
      document.body.style.cursor = '';

      // Clear ALL timers and intervals
      if (keyHoldTimer) {
        clearTimeout(keyHoldTimer);
        keyHoldTimer = null;
      }

      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        statusCheckInterval = null;
      }

      if (stateValidationInterval) {
        clearInterval(stateValidationInterval);
        stateValidationInterval = null;
      }

      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }

      // Reset coordinates
      startX = undefined;
      startY = undefined;

      // Handle any active selection
      if (isSelecting) {
        openSelectedLinks();
        clearSelection();
        isSelecting = false;
      }

      // Reset key states
      lastKeyStates = { ctrl: false, shift: false, alt: false, meta: false };
    }

    function updateKeyStates(e) {
      lastKeyStates.ctrl = e.ctrlKey;
      lastKeyStates.shift = e.shiftKey;
      lastKeyStates.alt = e.altKey;
      lastKeyStates.meta = e.metaKey;
    }

    function startAutoScroll(mouseY, mouseX) {
      // Stop any existing scroll
      stopAutoScroll();

      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const scrollZone = 100; // Pixels from edge to trigger scrolling

      let scrollSpeedY = 0;
      let scrollSpeedX = 0;

      // Vertical scrolling
      if (mouseY < scrollZone) {
        // Scroll up when near top
        const distance = scrollZone - mouseY;
        scrollSpeedY = -Math.min(20, Math.max(3, distance / 5));
      } else if (mouseY > windowHeight - scrollZone) {
        // Scroll down when near bottom
        const distance = mouseY - (windowHeight - scrollZone);
        scrollSpeedY = Math.min(20, Math.max(3, distance / 5));
      }

      // Horizontal scrolling (optional)
      if (mouseX < scrollZone) {
        // Scroll left when near left edge
        const distance = scrollZone - mouseX;
        scrollSpeedX = -Math.min(20, Math.max(3, distance / 5));
      } else if (mouseX > windowWidth - scrollZone) {
        // Scroll right when near right edge
        const distance = mouseX - (windowWidth - scrollZone);
        scrollSpeedX = Math.min(20, Math.max(3, distance / 5));
      }

      // Only start interval if we need to scroll
      if (scrollSpeedY !== 0 || scrollSpeedX !== 0) {
        autoScrollInterval = setInterval(() => {
          window.scrollBy(scrollSpeedX, scrollSpeedY);
        }, 30); // ~33fps
      }
    }

    function stopAutoScroll() {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    }

    document.addEventListener('keydown', (e) => {
      // Update key states first
      updateKeyStates(e);

      const pressedKey = getKeyFromEvent(e);

      // IMMEDIATE deactivation for ANY scenario that's not exactly our activation key alone
      if (isKeyPressed || isActivationKeyActive) {
        if (!isKeyPressedAlone(e, activationKey) || pressedKey !== activationKey) {
          deactivateExtension();
          return;
        }
      }

      // Check if this is our activation key
      if (pressedKey === activationKey) {
        // MUST be pressed completely alone
        if (!isKeyPressedAlone(e, activationKey)) {
          deactivateExtension();
          return;
        }

        // Only start timer if not already pressed
        if (!isKeyPressed) {
          isKeyPressed = true;
          keyHoldStartTime = Date.now();

          // Start timer for 0.5-second hold requirement
          keyHoldTimer = setTimeout(() => {
            // Only activate if key is still being held
            if (isKeyPressed) {
              activateExtension();
            }
          }, 500);
        }
      } else {
        // ANY other key = immediate deactivation
        if (isKeyPressed || isActivationKeyActive) {
          deactivateExtension();
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      // Update key states first
      updateKeyStates(e);

      const releasedKey = getKeyFromEvent(e);

      // ALWAYS deactivate on ANY key release if we're active or waiting
      if (isKeyPressed || isActivationKeyActive) {
        deactivateExtension();
      }

      // Double-check: if activation key specifically was released, definitely deactivate
      if (releasedKey === activationKey) {
        deactivateExtension();
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (!isActivationKeyActive || e.button !== 0) return;

      e.preventDefault();
      startX = e.pageX;
      startY = e.pageY;

      // Don't start selecting immediately, wait for mouse movement
      clearSelection();
    });

    document.addEventListener('mousemove', (e) => {
      // Only start selecting if extension is active, mouse is down, and we have start coordinates
      if (!isActivationKeyActive || startX === undefined || startY === undefined) {
        // Stop auto-scroll if not actively selecting
        stopAutoScroll();
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

      // Always update auto-scrolling based on current mouse position
      startAutoScroll(e.clientY, e.clientX);

      updateSelectionBox(startX, startY, currentX, currentY);
      selectedLinks = getLinksInSelection(startX, startY, currentX, currentY);
    });

    document.addEventListener('mouseup', (e) => {
      // Stop auto-scrolling when mouse is released
      stopAutoScroll();

      // Reset start coordinates when mouse is released
      if (startX !== undefined || startY !== undefined) {
        startX = undefined;
        startY = undefined;
      }

      if (!isSelecting) return;

      e.preventDefault();

      // If extension is still active, don't open links yet (wait for key release)
      if (isActivationKeyActive) {
        return;
      }

      openSelectedLinks();
      clearSelection();
      isSelecting = false;
    });

    window.addEventListener('blur', () => {
      // Always deactivate on window blur
      deactivateExtension();
    });

    // Add additional safety net: periodically check if we should be deactivated
    setInterval(() => {
      if ((isKeyPressed || isActivationKeyActive) && !document.hasFocus()) {
        // If extension is active but window doesn't have focus, deactivate
        deactivateExtension();
      }
    }, 250);
  })();
