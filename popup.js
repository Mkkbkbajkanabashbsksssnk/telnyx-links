let isListening = false;
let currentKey = 'Shift';

const keyButton = document.getElementById('activation-key');
const keyStatus = document.getElementById('key-status');
const resetButton = document.getElementById('reset-button');

chrome.storage.sync.get(['activationKey'], (result) => {
  if (result.activationKey) {
    currentKey = result.activationKey;
    keyButton.textContent = currentKey;
  }
});

function formatKeyName(key) {
  const keyMap = {
    ' ': 'Space',
    'Control': 'Ctrl',
    'Meta': 'Cmd/Win',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→'
  };
  
  return keyMap[key] || key;
}

keyButton.addEventListener('click', () => {
  if (!isListening) {
    isListening = true;
    keyButton.textContent = '...';
    keyButton.classList.add('listening');
    keyStatus.textContent = 'Press any key';
    keyStatus.classList.add('active');
    
    document.addEventListener('keydown', captureKey);
    
    setTimeout(() => {
      if (isListening) {
        stopListening();
      }
    }, 5000);
  }
});

function captureKey(e) {
  e.preventDefault();
  
  let key;
  
  if (e.key === 'Control') key = 'Control';
  else if (e.key === 'Shift') key = 'Shift';
  else if (e.key === 'Alt') key = 'Alt';
  else if (e.key === 'Meta') key = 'Meta';
  else if (e.key === ' ') key = 'Space';
  else if (e.key === 'Enter') key = 'Enter';
  else if (e.key === 'Tab') key = 'Tab';
  else if (e.key === 'Escape') {
    stopListening();
    return;
  }
  else if (e.key.length === 1) {
    key = e.key.toUpperCase();
  }
  else {
    key = e.key;
  }
  
  currentKey = key;
  keyButton.textContent = formatKeyName(key);
  
  chrome.storage.sync.set({ activationKey: key }, () => {
    keyStatus.textContent = 'Key saved!';
    keyStatus.classList.add('success');
    
    setTimeout(() => {
      keyStatus.textContent = 'Press to change';
      keyStatus.classList.remove('success');
    }, 2000);
  });
  
  stopListening();
}

function stopListening() {
  isListening = false;
  keyButton.classList.remove('listening');
  keyStatus.classList.remove('active');
  document.removeEventListener('keydown', captureKey);
  
  if (keyButton.textContent === '...') {
    keyButton.textContent = formatKeyName(currentKey);
    keyStatus.textContent = 'Press to change';
  }
}

resetButton.addEventListener('click', () => {
  currentKey = 'Shift';
  keyButton.textContent = 'Shift';
  
  chrome.storage.sync.set({ activationKey: 'Shift' }, () => {
    keyStatus.textContent = 'Reset to default!';
    keyStatus.classList.add('success');
    
    setTimeout(() => {
      keyStatus.textContent = 'Press to change';
      keyStatus.classList.remove('success');
    }, 2000);
  });
});

document.addEventListener('click', (e) => {
  if (isListening && e.target !== keyButton) {
    stopListening();
  }
});