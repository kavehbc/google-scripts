/**
 * RBC
 * Mutual Fund Price
 *
 * @param {string} symbol The symbol of mutual fund from RBC
 * @return The price of mutual fund
 * @customfunction
 */
function RBCFund(symbol = "RBF274") {
    if (!symbol || symbol === "") {
        return "symbol is mandatory";
    }
    symbol = String(symbol).trim().toUpperCase();

    // If there is data in cache, return directly.
    const cacheId = "RBCFundCache_" + symbol;
    let cache = CacheService.getDocumentCache();
    var cached = cache.get(cacheId);
    if (cached != null) {
        let value = parseFloat(cached);
        if (!Number.isNaN(value)) {
            return value;
        }
    }

    // RBC GAM's fund pages are now rendered client-side (Angular + dotCMS).
    // The NAV comes from the dotCMS content search API used by the page.
    const url = "https://retail.rbc-gam-prod-2.dotcms.cloud/api/content/_search";
    const payload = {
        query: "+contentType:FDSMFDetailsData +languageId:1 +live:true +FDSMFDetailsData.fundCode:" + symbol,
        render: false,
        limit: 1,
        offset: 0,
        depth: 0
    };
    var response = UrlFetchApp.fetch(url, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
        Logger.log("RBCFund HTTP " + response.getResponseCode() + ": " + response.getContentText().substring(0, 500));
        return "No Success";
    }

    try {
        var json = JSON.parse(response.getContentText());
        var contentlets = json.entity.jsonObjectView.contentlets;
        if (!contentlets || contentlets.length === 0) {
            return "Fund not found";
        }
        var data = contentlets[0].jsonFDSFundData;
        if (typeof data === "string") {
            data = JSON.parse(data);
        }
        let value = parseFloat(data.nav);
        if (Number.isNaN(value)) {
            return "NaN";
        }

        // Cache for 12 hours
        let cacheDuration = 60 * 60 * 12;
        cache.put(cacheId, String(value), cacheDuration);
        return value;
    } catch (e) {
        Logger.log(e);
        return "NaN";
    }
}


/**
 * Test helper: run this from the editor and check the Execution log.
 */
function testRBCFund() {
    const cache = CacheService.getDocumentCache();
    if (cache) cache.remove("RBCFundCache_RBF274");
    Logger.log("RBCFund(RBF274) = " + RBCFund("RBF274"));
}
