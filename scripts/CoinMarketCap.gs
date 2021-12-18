/*
CoinMarketCap
Crypto price extractor

Parameters:
crypto: It should match with coinmarketcap.com names. e.g. bitcoin, ethereum, solana, cardano, etc.
cache_duration: Caching duration in minutes (default: 60 minutes)
live: Set to true if you want to skip the caching (default: false)
*/

function CoinMarketCap(crypto = "bitcoin", cache_duration=60, live = false) {
    const url = "https://coinmarketcap.com/currencies/" + crypto + "/";

    if (!crypto || crypto === "") {
        return "crypto is mandatory"
    }

    // If there is data in cache, return directly.
    const cacheId = "CoinMarketCap_" + crypto;
    let cache = CacheService.getDocumentCache();

    var cached = cache.get(cacheId);
    if ((cached != null) && (live == false)) {
        let value = parseFloat(cached);
        if (!Number.isNaN(value)) {
            // For this API the value is returned in this format.
            return value;
        }
    }
    var response = UrlFetchApp.fetch(url);

    if (response.getResponseCode() != 200) {
        return "No Success";
    }

    var html = response.getContentText();
    var searchstring_start = 'class="priceValue "><span>';
    var searchstring_end = '</span>';
    var index_start = html.indexOf(searchstring_start);
    if (index_start >= 0) {
        var index_end = html.indexOf(searchstring_end, index_start);
        var pos = index_start + searchstring_start.length
        var price = html.substring(pos, index_end);
        var price = Number(price.replace(/[^0-9.-]+/g, ""));

        let cacheDuration = 60 * cache_duration;
        cache.put(cacheId, price, cacheDuration);

        Logger.log(parseFloat(price));
        let value = parseFloat(price);
        if (Number.isNaN(value)) {
            return "NaN";
        }

        return value;

    } else {
        return "NaN";
    }
}
