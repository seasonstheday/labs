// Why, Dad? Defender: the native bridge. Loaded only inside the Capacitor shell (see build.mjs).
// It gives the game three things it checks for at run time and never finds on the web:
//   window.rewardedAd()  -> Promise<boolean>   show a rewarded video; true only if it was watched through
//   window.iap           -> { products(), buy(id), restore() }   the grown-ups store, deterministic goods only
//   window.native        -> { platform, haptic(), saves }   saves: copies of the save on the phone and in iCloud
// Every ad or purchase the game offers sits behind its own adult gate; this file just talks to the SDKs.
(function () {
  const cap = window.Capacitor;
  if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return; // a plain browser: leave everything off
  const platform = cap.getPlatform();

  // ───── ad units: replace the Google test IDs with the real ones from your AdMob account before release ─────
  const AD_UNITS = {
    ios:     'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
  };
  const TESTING = true; // set false for release builds

  let admob = null, adReady = false;
  async function setupAds() {
    try {
      const mod = cap.Plugins && cap.Plugins.AdMob ? cap.Plugins.AdMob : null; if (!mod) return;
      admob = mod;
      // a family game: no tracking prompt, child-directed treatment on, no personalised ads
      // the game is made for children: every request is child-directed, under the age of consent, and rated General
      await admob.initialize({ requestTrackingAuthorization: false, initializeForTesting: TESTING, testingDevices: [], tagForChildDirectedTreatment: true, tagForUnderAgeOfConsent: true, maxAdContentRating: 'General' });
      await admob.setApplicationMuted({ muted: false });
      await preload();
    } catch (e) { console.warn('ads off:', e); admob = null; }
  }
  async function preload() {
    if (!admob) return; adReady = false;
    try { await admob.prepareRewardVideoAd({ adId: AD_UNITS[platform] || AD_UNITS.android, isTesting: TESTING, npa: true }); adReady = true; } catch (e) { console.warn('no ad loaded:', e); }
  }
  window.rewardedAd = () => new Promise(resolve => {
    if (!admob || !adReady) { preload(); return resolve(false); }
    let done = false, gotReward = false;
    const finish = ok => { if (done) return; done = true; resolve(ok); preload(); };
    const l1 = admob.addListener('onRewardedVideoAdReward', () => { gotReward = true; });
    const l2 = admob.addListener('onRewardedVideoAdDismissed', () => { finish(gotReward); cleanup(); });
    const l3 = admob.addListener('onRewardedVideoAdFailedToShow', () => { finish(false); cleanup(); });
    const cleanup = () => { [l1, l2, l3].forEach(p => p && p.then && p.then(h => h.remove && h.remove())); };
    admob.showRewardVideoAd().catch(() => { finish(false); cleanup(); });
  });

  // ───── purchases: cordova-plugin-purchase (CdvPurchase). Product IDs must match App Store Connect / Play Console ─────
  const PRODUCTS = ['com.whydad.defender.pass', 'com.whydad.defender.closet'];
  let store = null, catalog = {};
  function setupStore() {
    const CP = window.CdvPurchase; if (!CP) return;
    store = CP.store; const plat = platform === 'ios' ? CP.Platform.APPLE_APPSTORE : CP.Platform.GOOGLE_PLAY;
    store.register(PRODUCTS.map(id => ({ id, type: CP.ProductType.NON_CONSUMABLE, platform: plat })));
    store.when().productUpdated(p => { catalog[p.id] = p; }).approved(t => t.verify()).verified(r => r.finish());
    store.error(e => console.warn('store:', e));
    store.initialize([plat]);
  }
  window.iap = {
    products: async () => PRODUCTS.map(id => { const p = catalog[id], o = p && p.getOffer && p.getOffer(); return { id, title: p ? p.title : '', price: o && o.pricingPhases[0] ? o.pricingPhases[0].price : '' }; }),
    buy: id => new Promise(resolve => {
      const p = catalog[id], o = p && p.getOffer && p.getOffer(); if (!store || !o) return resolve(false);
      const off = store.when().finished(t => { if (t.products.some(x => x.id === id)) { resolve(true); } });
      o.order().then(err => { if (err) resolve(false); });
      setTimeout(() => resolve(!!(catalog[id] && catalog[id].owned)), 120000);
    }),
    restore: async () => { if (!store) return []; try { await store.restorePurchases(); } catch (e) {} return PRODUCTS.filter(id => catalog[id] && catalog[id].owned); },
    owned: () => PRODUCTS.filter(id => catalog[id] && catalog[id].owned),
  };

  // ───── saves: a copy in the phone's own storage (Preferences survives the web view clearing its storage), and one in
  // iCloud through Game Center saved games (the GameSaves plugin in app/native/ios). Android keeps the phone copy only.
  const P = () => cap.Plugins && cap.Plugins.Preferences, GS = () => cap.Plugins && cap.Plugins.GameSaves, KEY = 'whydad.defender.save';
  let gcIn = null; // Game Center sign-in, once per launch
  const signIn = () => gcIn || (gcIn = (async () => { try { const g = GS(); if (!g) return false; const r = await g.signIn(); return !!(r && r.signedIn); } catch (e) { return false; } })());
  const saves = {
    local: json => { try { const p = P(); if (p) p.set({ key: KEY, value: json }); } catch (e) {} },
    loadLocal: async () => { try { const p = P(); return p ? (await p.get({ key: KEY })).value : null; } catch (e) { return null; } },
    cloud: async json => { try { if (!(await signIn())) return false; const r = await GS().save({ data: json }); return !!(r && r.saved); } catch (e) { return false; } },
    loadCloud: async () => { try { if (!(await signIn())) return null; const r = await GS().load(); return r && r.data || null; } catch (e) { return null; } },
  };

  window.native = {
    platform, saves,
    haptic: async (style = 'LIGHT') => { try { const H = cap.Plugins && cap.Plugins.Haptics; if (H) await H.impact({ style }); } catch (e) {} }, // LIGHT, MEDIUM or HEAVY
  };

  document.addEventListener('deviceready', setupStore, { once: true });
  setupAds();
})();
