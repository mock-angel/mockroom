(function($, amplify, wgsdk) {
    'use strict';

    var LANG = wgsdk.vars.CURRENT_REQUEST_LANGUAGE,
        STORE_KEY = 'in_development:' + LANG;

    function getLastUserVisitTimestamp() {
        return amplify.store(STORE_KEY) || {};
    }

    function updateTimestamp(slug, timestamp) {
        var stamps = amplify.store(STORE_KEY) || {};

        stamps[slug] = timestamp;
        amplify.store(STORE_KEY, stamps);
    }

    function bulkUpdateTimestamp(stamps) {
        amplify.store(STORE_KEY, stamps);
    }

    window.UpdatesStorage = {
        get: getLastUserVisitTimestamp,
        set: updateTimestamp,
        setAll: bulkUpdateTimestamp
    };

})(jQuery, amplify, wgsdk);
