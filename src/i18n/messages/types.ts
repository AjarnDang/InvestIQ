/**
 * Flat string-valued message schema.
 * Both en.ts and th.ts must satisfy this interface.
 */
export interface Messages {
  nav: {
    home:        string;
    market:      string;
    news:        string;
    learn:       string;
    search:      string;
    searchShort: string;
    planning:    string;
    services:    string;
    about:       string;
    openMenu:    string;
    closeMenu:   string;
  };

  auth: {
    login:        string;
    register:     string;
    logout:       string;
    profile:      string;
    dashboard:    string;
    portfolio:    string;
    transactions: string;
    watchlist:    string;
    settings:     string;
    loggedInAs:   string;
  };

  common: {
    viewAll:       string;
    loading:       string;
    error:         string;
    noData:        string;
    retry:         string;
    add:           string;
    remove:        string;
    cancel:        string;
    confirm:       string;
    save:          string;
    back:          string;
    close:         string;
    search:        string;
    filter:        string;
    all:           string;
    from:          string;
    to:            string;
    readMore:      string;
    minute:        string;
    baht:          string;
    usd:           string;
    updated:       string;
    today:         string;
    yesterday:     string;
    change:        string;
    changePercent: string;
    price:         string;
    volume:        string;
    high:          string;
    low:           string;
    open:          string;
    marketClose:   string;
  };

  home: {
    heroTitle:     string;
    heroSubtitle:  string;
    heroCta:       string;
    mainIndices:   string;
    news:          string;
    newsViewAll:   string;
    hotStocks:     string;
    hotStocksUS:   string;
    learn:         string;
    learnSubtitle: string;
    articles:      string;
    ctaTitle:      string;
    ctaSubtitle:   string;
    ctaButton:     string;
    fearGreed:     string;
    globalMarkets: string;
  };

  dashboard: {
    title:        string;
    totalValue:   string;
    dayChange:    string;
    totalReturn:  string;
    holdings:     string;
    performance:  string;
    allocation:   string;
    noHoldings:   string;
    addHolding:   string;
    topHoldings:  string;
    sector:       string;
    shares:       string;
    avgCost:      string;
    currentPrice: string;
    gainLoss:     string;
    weight:       string;
  };

  transactions: {
    title:             string;
    recent:            string;
    date:              string;
    type:              string;
    symbol:            string;
    shares:            string;
    price:             string;
    total:             string;
    status:            string;
    notes:             string;
    allTypes:          string;
    buy:               string;
    sell:              string;
    dividend:          string;
    allStatuses:       string;
    completed:         string;
    pending:           string;
    cancelled:         string;
    searchPlaceholder: string;
    noResults:         string;
  };

  watchlist: {
    title:             string;
    addStock:          string;
    searchPlaceholder: string;
    addButton:         string;
    emptyTitle:        string;
    emptySubtitle:     string;
    alertPrice:        string;
    removeConfirm:     string;
  };

  market: {
    title:          string;
    overview:       string;
    topGainers:     string;
    topLosers:      string;
    mostActive:     string;
    screener:       string;
    allStocks:      string;
    filterSector:   string;
    filterExchange: string;
    searchStocks:   string;
    noResults:      string;
    prevClose:      string;
    marketCap:      string;
    peRatio:        string;
    eps:            string;
    dividend:       string;
    week52High:     string;
    week52Low:      string;
    exchangeFilter: string;
  };

  news: {
    title:       string;
    latestNews:  string;
    noNews:      string;
    source:      string;
    readMore:    string;
    minuteRead:  string;
  };

  learn: {
    title:        string;
    beginner:     string;
    intermediate: string;
    advanced:     string;
    articles:     string;
    guides:       string;
    videos:       string;
  };

  settings: {
    title:           string;
    profile:         string;
    preferences:     string;
    language:        string;
    languageDesc:    string;
    theme:           string;
    themeLight:      string;
    themeDark:       string;
    themeSystem:     string;
    notifications:   string;
    notifPrice:      string;
    notifNews:       string;
    notifEmail:      string;
    displayName:     string;
    email:           string;
    saveChanges:     string;
    changePassword:  string;
    dangerZone:      string;
    deleteAccount:   string;
    currentPassword: string;
    newPassword:     string;
    confirmPassword: string;
    updatePassword:  string;
    privacy:         string;
    showPortfolio:   string;
    dataExport:      string;
    exportDesc:      string;
    exportCsv:       string;
  };

  stocks: {
    detail:          string;
    overview:        string;
    chart:           string;
    addWatchlist:    string;
    removeWatchlist: string;
    buy:             string;
    sell:            string;
    exchange:        string;
    sector:          string;
    industry:        string;
    type:            string;
    currency:        string;
    description:     string;
    keyStats:        string;
    relatedNews:     string;
    range1D:         string;
    range5D:         string;
    range1M:         string;
    range6M:         string;
    rangeYTD:        string;
    range1Y:         string;
    range5Y:         string;
    rangeMax:        string;
    noChart:         string;
    noDescription:   string;
    employees:       string;
    website:         string;
  };

  footer: {
    tagline:   string;
    product:   string;
    company:   string;
    legal:     string;
    aboutUs:   string;
    careers:   string;
    blog:      string;
    privacy:   string;
    terms:     string;
    cookies:   string;
    copyright: string;
    disclaimer: string;
  };
}
