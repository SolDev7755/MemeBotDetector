let debounceTimer;

document.addEventListener('DOMContentLoaded', () => {
  const popup = document.getElementById('popup');
  const logoImage = document.getElementById('logoImage');
  const colorPicker = document.getElementById('colorPicker');
  const copyBtn = document.getElementById('copyWallet');
  const walletText = "6gjWt9rHX1ZE7kwMHgW6rUnekrpz12FPQcyNCqqCPvJR";

  chrome.storage.sync.get(['alertColor'], data => {
    colorPicker.value = data.alertColor ?? '#e60000';
  });

  colorPicker.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      chrome.storage.sync.set({ alertColor: colorPicker.value });
    }, 50);
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(walletText);
  });

  logoImage.addEventListener('load', () => {
    popup.style.display = 'flex';
  });

  if (logoImage.complete) {
    popup.style.display = 'flex';
  }
});
