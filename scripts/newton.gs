/**
 * Newton.co
 * Crypto Price Parser (CAD)
 *
 * @param {string} crypto The crypto symbol from Newton.co (e.g. BTC, ETH, SOL, ADA)
 * @param {string} price It is either "spot", "bid", "ask", "change", or "supply" (default: spot)
 * @param {number} cache_duration Caching duration in minutes (default: 30 minutes)
 * @param {bool} live Set to true if you want to skip the caching (default: false)
 * @return The price of crypto in CAD
 * @customfunction
 */
function newton(crypto = "BTC", price = "spot", cache_duration = 30, live = false) {
    const url = "https://api.newton.co/dashboard/api/rates/";

    let cacheDuration = 60 * cache_duration;

    if (!crypto || crypto === "") {
        return "crypto is mandatory"
    }

    // If there is data in cache, return directly.
    const cacheId = "Newton_json";
    let cache = CacheService.getDocumentCache();
    var cached = cache.get(cacheId);

    if ((cached != null) && (live == false)) {
        Logger.log("Cache");
        var json_text = cached;
    } else {
        var response_code = 0;
        var counter = 0;

        do {
            counter++;
            if (counter > 1)
                Utilities.sleep(counter * 100);

            Logger.log("Try: " + counter);
            Logger.log("Live");
            try {
                var response = UrlFetchApp.fetch(url);
                response_code = response.getResponseCode();
                Logger.log("Code: " + response_code);
            } catch {
                Logger.log("Except");
                response_code = 0;
            }
        } while (response_code != 200 && counter < 15);

        if (response_code != 200) {
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
