let DebounceTimer;

document.addEventListener('DOMContentLoaded', () => {
  const Popup = document.getElementById('popup');
  const LogoImage = document.getElementById('logoImage');
  const ColorPicker = document.getElementById('colorPicker');
  const CopyBtn = document.getElementById('copyWallet');
  const WalletText = "6gjWt9rHX1ZE7kwMHgW6rUnekrpz12FPQcyNCqqCPvJR";

  chrome.storage.sync.get(['alertColor'], data => {
    ColorPicker.value = data.alertColor ?? '#e30f00';
  });

  ColorPicker.addEventListener('input', () => {
    clearTimeout(DebounceTimer);
    DebounceTimer = setTimeout(() => {
      chrome.storage.sync.set({ alertColor: ColorPicker.value });
    }, 50);
  });

  CopyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(WalletText);
  });

  LogoImage.addEventListener('load', () => {
    Popup.style.display = 'flex';
  });

  if (LogoImage.complete) {
    Popup.style.display = 'flex';
  }
});
