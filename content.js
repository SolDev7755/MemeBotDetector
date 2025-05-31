let Settings = {
  AlertColor: '#e30f00',
  ScanInterval: 2000
};

const Url = window.location.href.toLowerCase();

const SiteConfig = {
  Axiom: {
    Match: Url.startsWith('https://axiom.trade/pulse'),
    ContainerSelector: 'div.flex.flex-1.w-full',
    GetTokens: (Container) => Container?.children?.[0]?.children?.[0],
    ParseCard: (Card) => {
      const Base = Card?.children?.[0]?.children?.[0]?.children?.[3]?.children?.[1]?.children?.[0];
      const Name = Base?.children?.[0]?.children?.[0];
      const Info = Base?.children?.[2];
      const Holders = Info?.children?.[0]?.children?.[1];
      const Pros = Info?.children?.[1]?.children?.[1];
      return { Name, Holders, Pros };
    },
    IsSus: (Holders, Pros) => Pros < Holders / 2
  },
  Padre: {
    Match: Url.startsWith('https://trade.padre.gg/trenches'),
    ContainerSelector: 'div.ReactVirtualized__Grid__innerScrollContainer',
    GetTokens: (Container) => Container,
    ParseCard: (Card) => {
      const Base = Card?.children?.[0]?.children?.[1]?.children?.[1];
      const Name = Base?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0];
      const Info = Base?.children?.[1]?.children?.[1]?.children?.[0]?.children?.[0];
      const Holders = Info?.children?.[1]?.children?.[1]?.children?.[1];
      const Pros = Info?.children?.[0]?.children?.[2]?.children?.[1];
      return { Name, Holders, Pros };
    },
    IsSus: (Holders, Pros) => Pros < Holders
  }
};

const ActiveSite = Object.values(SiteConfig).find(Site => Site.Match);

if (ActiveSite) {
  chrome.storage.sync.get(['alertColor'], (Data) => {
    Settings.AlertColor = Data.alertColor ?? Settings.AlertColor;
    StartScan();
  });
}

const ScanMap = new WeakMap();

function StartScan() {
  setInterval(() => {
    const Containers = Array.from(document.querySelectorAll(ActiveSite.ContainerSelector));
    Containers.forEach(Container => {
      const Tokens = ActiveSite.GetTokens(Container);
      if (Tokens) {
        ScanTokens(Tokens);
      }
    });
  }, Settings.ScanInterval);
}

function ScanTokens(Wrapper) {
  Array.from(Wrapper.children).forEach(Card => {
    try {
      const { Name, Holders, Pros } = ActiveSite.ParseCard(Card);
      if (!Name || !Holders || !Pros) return;

      const H = parseInt(Holders.textContent.replace(/\D/g, '')) || 0;
      const P = parseInt(Pros.textContent.replace(/\D/g, '')) || 0;

      const Last = ScanMap.get(Card);
      if (Last && Last.H === H && Last.P === P) return;

      ScanMap.set(Card, { H, P });

      const IsSus = ActiveSite.IsSus(H, P);

      Name.style.color = IsSus ? Settings.AlertColor : '';
      Name.style.fontWeight = IsSus ? 'bold' : '';
    } catch {}
  });
}

chrome.storage.onChanged.addListener((Changes, Area) => {
  if (Area === 'sync' && Changes.alertColor) {
    Settings.AlertColor = Changes.alertColor.newValue;
  }
});