/**
 * MorningStar
 * Mutual Fund Price
 *
 * @param {string} symbol The symbol of mutual fund from Morning Star
 * @return The price of mutual fund
 * @customfunction
 */
function MutualFund(symbol) {
    if (!symbol || symbol === "") {
        return "symbol is mandatory";
    }

    // If there is data in cache, return directly.
    const cacheId = "MFApiCache_" + symbol;
    let cache = CacheService.getDocumentCache();
    var cached = cache.get(cacheId);
    if (cached != null) {
        let value = parseFloat(cached);
        if (!Number.isNaN(value)) {
            // For this API the value is returned in this format.
            return value;
        }
    }

    // IMPORTXML("https://quotes.morningstar.com/fund/c-header?t=" + symbol, "//span[@vkey='NAV']")

    const url = "https://quotes.morningstar.com/fund/c-header?t=" + symbol;
    var response = UrlFetchApp.fetch(url);

    Logger.log(response);
    if (response.getResponseCode() != 200) {
        return "No Success";
    }

    var html = response.getContentText();
    var searchstring_start = '<span vkey="NAV">';
    var searchstring_end = '</span>';
    var index_start = html.indexOf(searchstring_start);
    if (index_start >= 0) {
        var index_end = html.indexOf(searchstring_end, index_start);
        var pos = index_start + searchstring_start.length;
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

    } else {
        return "NaN";
    }
}
