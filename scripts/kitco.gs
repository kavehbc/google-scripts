/*
Kitco
Precious Metal Price

Parameters:
metal: 'AU': Gold, 'AG': Silver, 'PT': Platinum, 'PD': Paladium, or 'RH': Rhodium
price_type: 'bid', 'ask'
cache_duration: Caching duration in minutes (default: 60 minutes)
live: Set to true if you want to skip the caching (default: false)
*/

function Kitco(metal = "AU", price_type = "bid", cache_duration = 60, live = false) {
    const url = "https://www.kitco.com/market/";

    if (!metal || metal === "") {
        return "metal is mandatory";
    }

    // If there is data in cache, return directly.
    const cacheId = "Kitco_" + metal;
    let cache = CacheService.getDocumentCache();

    var cached = cache.get(cacheId);
    if ((cached != null) && (live == false)) {
        let value = parseFloat(cached);
        if (!Number.isNaN(value)) {
            Logger.log(parseFloat(value));
            // For this API the value is returned in this format.
            return value;
        }
    }

    var response = UrlFetchApp.fetch(url);

    if (response.getResponseCode() != 200) {
        return "No Success";
    }

    var html = response.getContentText();
    var searchstring_start = '<td id="' + metal + '-' + price_type + '">';
    var searchstring_end = '</td>';
    var index_start = html.indexOf(searchstring_start);
    if (index_start >= 0) {
        var index_end = html.indexOf(searchstring_end, index_start);
        var pos = index_start + searchstring_start.length;
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
