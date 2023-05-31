/**
 * CoinMarketCap
 * Crypto Price Parser
 *
 * @param {string} crypto The crypto name from CoinMarketCap
 * @param {number} cache_duration Caching duration in minutes (default: 10 minutes)
 * @param {bool} live Set to true if you want to skip the caching (default: false)
 * @return The price of crypto in USD
 * @customfunction
 */
function CoinMarketCap(crypto="bitcoin", cache_duration=5, live=false) {
    const url = "https://coinmarketcap.com/currencies/" + crypto + "/";

    Logger.log(url)

    if (!crypto || crypto === "") {
        return "crypto is mandatory";
    }

    // If there is data in cache, return directly.
    const cacheId = "CoinMarketCap_" + crypto;
    let cache = CacheService.getDocumentCache();

    var cached = cache.get(cacheId);
    if ((cached != null) && (live == false)) {
        let value = parseFloat(cached);
        if (!Number.isNaN(value)) {
            // For this API the value is returned in this format.
            Logger.log("OFFLINE");
            Logger.log(value)
            return value;
        }
    }
    var response = UrlFetchApp.fetch(url);

    if (response.getResponseCode() != 200) {
        return "No Success";
    }

    var html = response.getContentText();
    var searchstring_start = "price today is $";
    var searchstring_end = " USD";
    var index_start = html.indexOf(searchstring_start);
    // Logger.log(index_start);
    if (index_start >= 0) {
        var index_end = html.indexOf(searchstring_end, index_start);
        var pos = index_start + searchstring_start.length;
        var price = html.substring(pos, index_end);
        var price = Number(price.replace(/[^0-9.-]+/g, ""));

        let cacheDuration = 60 * cache_duration;
        cache.put(cacheId, price, cacheDuration);

        Logger.log("ONLINE");
        Logger.log(parseFloat(price));
        let value = parseFloat(price);
        return value;
    } else {
        return "NaN";
    }
}
