/**
 * Anchor Protocol
 * AnchorUST/UST Exchange Rate
 *
 * @param {number} cache_duration Caching duration in minutes (default: 30 minutes)
 * @param {bool} live Set to true if you want to skip the caching (default: false)
 * @return aUST/UST exchange rate
 * @customfunction
 */
function AnchorUST(cache_duration = 30, live = false) {
  const url = "https://api.anchorprotocol.com/api/v1/market/ust";

    let cacheDuration = 60 * cache_duration;

    // If there is data in cache, return directly.
    const cacheId = "AnchorUST_json";
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
    let value = parseFloat(data.exchange_rate);
    if (Number.isNaN(value)) {
        return "NaN";
    } else {
        Logger.log(value);
        return value;
    }
}
