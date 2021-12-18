function newton(crypto = "BTC", price = "spot", cache_duration = 60, live = false) {
    const url = "https://api.newton.co/dashboard/api/rates/";

    // Put API response text to cache with timeout in minutes
    // Note: this value can be made as a variable too with some default value for
    // different cache duration.
    let cacheDuration = 60 * cache_duration;

    if (!crypto || crypto === "") {
        return "crypto is mandatory"
    }

    // If there is data in cache, return directly.
    const cacheId = "Newton_json";
    let cache = CacheService.getDocumentCache();
    if (live) {
        cache.remove(cacheId);
    }

    var cached = cache.get(cacheId);

    if (cached != null) {
        Logger.log("Cache");
        var json_text = cached;
    } else {
        Logger.log("Live");
        var response = UrlFetchApp.fetch(url);
        if (response.getResponseCode() != 200) {
            return "No Success";
        }
        var json_text = response.getContentText();
        cache.put(cacheId, json_text, cacheDuration);
    }

    var data = JSON.parse(json_text);

    for (let i = 0; i < data.rates.length; i++) {
        const coin = data.rates[i];
        if (coin["from"] === 'CAD' && coin["to"] === crypto) {
            price = coin[price];
        }
    }
    let value = parseFloat(price);
    if (Number.isNaN(value)) {
        return "NaN";
    } else {
        Logger.log(value);
        return value;
    }
}
