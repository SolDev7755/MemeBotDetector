let settings = {
  alertColor: '#e30f00',
  scanInterval: 2000
};

const url = window.location.href.toLowerCase();

chrome.storage.sync.get(['alertColor'], (data) => {
  settings.alertColor = data.alertColor ?? '#e30f00';
  startTokenScanner();
});

function startTokenScanner() {
  setInterval(() => {
    triggerRescan();
  }, settings.scanInterval);

  triggerRescan();
}

function triggerRescan() {
  let containers = null;

  switch (true) {
    case url.startsWith('https://axiom.trade/pulse'):
      containers = Array.from(document.querySelectorAll('div.flex.flex-1.w-full'));
      break;

    case url.startsWith('https://trade.padre.gg/trenches'):
      containers = Array.from(document.querySelectorAll('div.ReactVirtualized__Grid__innerScrollContainer'));
      break;

    default: return;
  }

  containers.forEach(container => {
    let tokenList = null;

    switch (true) {
      case url.startsWith('https://axiom.trade/pulse'):
        tokenList = container?.children?.[0]?.children?.[0];
        break;

      case url.startsWith('https://trade.padre.gg/trenches'):
        tokenList = container;
        break;

      default: return;
    }

    if (tokenList) {
      scanTokens(tokenList);
    }
  });
}

function scanTokens(wrapper) {
  const tokenCards = wrapper.children;

  Array.from(tokenCards).forEach(card => {
    try {
      let nameEl = null;
      let holdersEl = null;
      let proEl = null;
      let baseToken = null;
      let numInfos = null;

      switch (true) {
        case url.startsWith('https://axiom.trade/pulse'):
          baseToken = card?.children?.[0]?.children?.[0]?.children?.[3]?.children?.[1]?.children?.[0];
          nameEl = baseToken?.children?.[0]?.children?.[0];
          numInfos = baseToken?.children?.[2];
          holdersEl = numInfos?.children?.[0]?.children?.[1];
          proEl = numInfos?.children?.[1]?.children?.[1];
          break;

        case url.startsWith('https://trade.padre.gg/trenches'):
          baseToken = card?.children?.[0]?.children?.[1]?.children?.[1];
          nameEl = baseToken?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0];
          numInfos = baseToken?.children?.[1]?.children?.[1]?.children?.[0]?.children?.[0];
          holdersEl = numInfos?.children?.[1]?.children?.[1]?.children?.[1];
          proEl = numInfos?.children?.[0]?.children?.[2]?.children?.[1];
          break;

        default: return;
      }

      if (!nameEl || !holdersEl || !proEl) return;

      const holders = parseInt(holdersEl.textContent.replace(/\D/g, '')) || 0;
      const proTraders = parseInt(proEl.textContent.replace(/\D/g, '')) || 0;

      const threshold = holders / 2;

      const Axiom = proTraders < threshold && url.startsWith('https://axiom.trade/pulse');
      const Padre = proTraders < holders && url.startsWith('https://trade.padre.gg/trenches');

      if (Axiom || Padre) {
        nameEl.style.color = settings.alertColor;
        nameEl.style.fontWeight = 'bold';
      } else {
        nameEl.style.color = '';
        nameEl.style.fontWeight = '';
      }
    } catch{}
  });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    if (changes.alertColor) {
      settings.alertColor = changes.alertColor.newValue;
      triggerRescan();
    }
  }
});
