/**
 * Metals-API.com
 * Precious Metal Price
 *
 * @param {string} sympol (e.g. 'XAU': Gold) For more details, check metals-api.com
 * @param {number} cache_duration Caching duration in minutes (default: 60 minutes)
 * @return The metal price in USD
 * @customfunction
 */
function metals(symbol = "XAU", cache_duration = 24) {

    //Google Script for https://www.metals-api.com/ with 24 hours cache
    //replace your access_key
    const access_key = "your_access_key";
    const base = "USD";
    const symbols = "XAU,XAG,XPT";

    if (!symbol || symbol === "") {
        return "symbol is mandatory";
    }
    var json_text = "";

    // If there is data in cache, return directly.
    const cacheId = "Metals_raw";
    let cache = CacheService.getDocumentCache();
    var cached = cache.get(cacheId);
    if (cached != null) {
        var json_text = cached;

    } else {

        const url = "https://www.metals-api.com/api/latest?base=" + base + "&symbols=" + symbols + "&access_key=" + access_key;

        var response = UrlFetchApp.fetch(url);

        Logger.log(response);
        if (response.getResponseCode() != 200) {
            return "No Success";
        }

        var json_text = response.getContentText();

        // Put API response text to cache with timeout of 24 hours
        // Note: this value can be made as a variable too with some default value for
        // different cache duration.
        let cacheDuration = 60 * 60 * cache_duration;
        cache.put(cacheId, json_text, cacheDuration);

    }

    var data = JSON.parse(json_text);
    var price = 1 / data.rates[symbol];

    let value = parseFloat(price);
    if (Number.isNaN(value)) {
        return "NaN";
    }

    Logger.log(value);
    return value;
}
