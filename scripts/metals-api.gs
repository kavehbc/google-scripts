function metals(symbol) { 

    //Google Script for https://www.metals-api.com/ with 24 hours cache
	  //replace your access_key
    const access_key = "your_access_key";
    const base = "USD";
    const symbols = "XAU,XAG,XPT";

    // Put API response text to cache with timeout of 24 hours
    // Note: this value can be made as a variable too with some default value for
    // different cache duration.
    let cacheDuration = 60 * 60 * 24;

    if (!symbol || symbol === "") {
        return "symbol is mandatory"
    }

    // If there is data in cache, return directly.
    const cacheId = "Metals_" + symbol;
    let cache = CacheService.getDocumentCache();
    var cached = cache.get(cacheId);
    if (cached != null) {
        let value = parseFloat(cached);
        if (!Number.isNaN(value)) {
            // For this API the value is returned in this format.
            return value;
        }
    }

    const url = "https://www.metals-api.com/api/latest?base=" + base + "&symbols=" + symbols + "&access_key=" + access_key;

    var response = UrlFetchApp.fetch(url);

    Logger.log(response);
    if (response.getResponseCode() != 200) {
        return "No Success";
    }

    var json_text = response.getContentText();
    var data = JSON.parse(json_text);
    var price = 1 / data.rates[symbol];

    cache.put(cacheId, price, cacheDuration);

    let value = parseFloat(price);
    if (Number.isNaN(value)) {
        return "NaN";
    }

    return value;
}