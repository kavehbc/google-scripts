/**
 * Returns the value of given {@param symbol} for Mutual Funds.
 */
function RBCFund(symbol) {
  if (!symbol || symbol === "") {
    return "symbol is mandatory"
  }

  // If there is data in cache, return directly.
  const cacheId = "RBCFundCache_" + symbol;
  let cache = CacheService.getDocumentCache();
  var cached = cache.get(cacheId);
  if (cached != null) {
    let value = parseFloat(cached);
    if (!Number.isNaN(value)) {
        // For this API the value is returned in this format.
        return value;
    }
  }

  const url = "https://www.rbcgam.com/en/ca/products/mutual-funds/" + symbol + "/detail";
  var response = UrlFetchApp.fetch(url);

  Logger.log(response);
  if (response.getResponseCode() != 200) {
      return "No Success";
  }

  var html = response.getContentText();
  var searchstring_start = '"nav":';
  var searchstring_end = ',';
  var index_start = html.indexOf(searchstring_start);
  if (index_start >= 0) {
    var index_end = html.indexOf(searchstring_end,index_start);
    var pos = index_start + searchstring_start.length
    var mf_price = html.substring(pos, index_end);

    // Put API response text to cache with timeout of 12 hours
    // Note: this value can be made as a variable too with some default value for
    // different cache duration.
    let cacheDuration = 60 * 60 * 12;
    cache.put(cacheId, mf_price, cacheDuration);

    let value = parseFloat(mf_price);
    if (Number.isNaN(value)) {
        return "NaN";
    }

    return value;

  }else{
    return "NaN";
  }
}
