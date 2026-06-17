(function(){
  // Loader to fetch canonical ARTICLES from Apps Script via JSONP, cache in localStorage, and fallback to articles.js
  if (window.ARTICLES && Array.isArray(window.ARTICLES)) return;

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxQtCPmuRAcvLMjUsWsaeF4DjtwoPz9rtM9JJLc-gGb2VwDwpZegnhN-VqvZxACcak/exec';
  const CALLBACK = '__YUNITY_ARTICLES_JSONP_CB__';
  const CACHE_KEY = 'YUNITY_ARTICLES_CACHE_V1';
  const TIMEOUT_MS = 3500;

  function applyArticles(list){
    try{
      if (!list || !Array.isArray(list)) return false;
      window.ARTICLES = list;
      try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ts:Date.now(), articles:list})); }catch(e){}
      window.dispatchEvent(new CustomEvent('articles:loaded', {detail: {source: 'remote'}}));
      return true;
    }catch(e){return false;}
  }

  // JSONP callback
  window[CALLBACK] = function(resp){
    if (resp && resp.success && Array.isArray(resp.articles)){
      applyArticles(resp.articles);
    } else {
      // fallback to cache or bundled file
      fallbackToCacheOrBundled();
    }
    cleanup();
  };

  function cleanup(){
    try{ delete window[CALLBACK]; }catch(e){}
  }

  function fallbackToCacheOrBundled(){
    // Try cache
    try{
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw){
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.articles)){
          window.ARTICLES = parsed.articles;
          window.dispatchEvent(new CustomEvent('articles:loaded', {detail:{source:'cache'}}));
          return;
        }
      }
    }catch(e){}
    // Load bundled articles.js as last resort
    loadBundledArticles();
  }

  function loadBundledArticles(){
    if (document.querySelector('script[data-bundled-articles]')) return;
    const s = document.createElement('script');
    s.src = 'javascript/articles.js';
    s.setAttribute('data-bundled-articles','1');
    s.onload = function(){ window.dispatchEvent(new CustomEvent('articles:loaded',{detail:{source:'bundled'}})); };
    s.onerror = function(){ window.dispatchEvent(new CustomEvent('articles:loaded',{detail:{source:'error'}})); };
    document.head.appendChild(s);
  }

  // Insert JSONP script
  const script = document.createElement('script');
  script.src = APPS_SCRIPT_URL + '?action=getArticles&callback=' + CALLBACK + '&_=' + Date.now();
  script.async = true;
  script.onerror = function(){ fallbackToCacheOrBundled(); cleanup(); };
  document.head.appendChild(script);

  // Timeout -> fallback
  setTimeout(function(){
    if (!window.ARTICLES || !Array.isArray(window.ARTICLES)){
      fallbackToCacheOrBundled(); cleanup();
    }
  }, TIMEOUT_MS);
})();