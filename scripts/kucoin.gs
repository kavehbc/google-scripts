/**
 * KuCoin
 * Account Balance Checker
 *
 * @param {string} currency The crypto symbol (e.g. BTC, ETH, SOL, ADA)
 * @param {string} acc_type The account type: "main", "trade", "margin" (default: main)
 * @param {number} cache_duration Caching duration in minutes (default: 30 minutes)
 * @param {bool} live Set to true if you want to skip the caching (default: false)
 * @return KuCoin account balance
 * @customfunction
 */
function kuCoin(currency = "OUSD", acc_type = "main", cache_duration = 30, live = false) {
    var key = "kuCoin_key";
    var secret = "kuCoin_secret";
    var passphrase = "kuCoin_passphrase";

    let cacheDuration = 60 * cache_duration;

    // If there is data in cache, return directly.
    const cacheId = "KuCoin_" + currency + '_' + acc_type;
    let cache = CacheService.getDocumentCache();
    var cached = cache.get(cacheId);

    if ((cached != null) && (live == false)) {
        Logger.log("Cache");
        var balance = parseFloat(cached);
    } else {
        var payload = {
            'currency': "OUSD",
            'type': 'main'
        };

        var data = JSON.stringify(payload);
        //Logger.log(data);

        var host = 'https://api.kucoin.com';
        var endpoint = '/api/v1/accounts?currency=' + currency + '&type=' + acc_type;

        var timeStamp = '' + new Date().getTime();

        var strForSign = timeStamp + "GET" + endpoint; // + data;
        //Logger.log(strForSign);

        var signature = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, strForSign, secret);
        var encodedPass = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, passphrase, secret);

        var url = host + endpoint;
        //Logger.log(url);

        var options = {
            "method": "GET",
            'headers': {
                'KC-API-KEY': key,
                'KC-API-TIMESTAMP': timeStamp,
                'KC-API-SIGN': Utilities.base64Encode(signature),
                'KC-API-KEY-VERSION': '2',
                'KC-API-PASSPHRASE': Utilities.base64Encode(encodedPass)
            },
            //"contentType": "application/json",
            //"payload": data,
            //"muteHttpExceptions": true,
        };

        //var result = UrlFetchApp.getRequest(url, options);
        //Logger.log(result); // a better way to debug
        var result = UrlFetchApp.fetch(url, options); // works perfectly in my case
        json_result = JSON.parse(result);
        Logger.log(result);

        balance = parseFloat(json_result.data[0].balance);
        cache.put(cacheId, balance, cacheDuration);
    }

    return (balance);
}
