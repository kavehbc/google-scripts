/**
 * CoinGecko.com
 * Public API - Crypto Price Parser (Multi-Currency)
 * https://www.coingecko.com/en/api/documentation
 * 
 * @param {string} crypto The crypto symbol from CoinGecko (e.g. bitcoin)
 * @param {string} currency Currency of the return price (default: cad)
 * @param {number} cache_duration Caching duration in minutes (default: 10 minutes)
 * @param {bool} live Set to true if you want to skip the caching (default: false)
 * @return The price of crypto in the selected currency
 * @customfunction
 */
function CoinGecko(crypto="bitcoin", currency="cad", cache_duration=30, live=false) {
  url = "https://api.coingecko.com/api/v3/simple/price?ids=" + crypto + "&vs_currencies=" + currency;
  Logger.log(url);

  let cacheDuration = 60 * cache_duration;

  // If there is data in cache, return directly.
  const cacheId = "CoinGecko_" + currency + '_' + currency;
  let cache = CacheService.getDocumentCache();
  var cached = cache.get(cacheId);

  if ((cached != null) && (live == false)) {
    Logger.log("OFFLINE");
    var price = cached;
  } else {
    try{
      var response = UrlFetchApp.fetch(url);

      if (response.getResponseCode() != 200) {
        Logger.log("FAILED");
        return "No Success";
      }
    } catch {
      Logger.log("FAILED");
      return "No Success";
    }
    
    Logger.log("ONLINE");
    var json_text = response.getContentText();
    var data = JSON.parse(json_text);
    price = data["bitcoin"]["cad"]

    cache.put(cacheId, price, cacheDuration);
  }

  let value = parseFloat(price);
  if (Number.isNaN(value)) {
    return "NaN";
  } else {
    Logger.log(value);
    return value;
  }
}
