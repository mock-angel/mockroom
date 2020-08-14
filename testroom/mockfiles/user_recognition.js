(function($) {

    'use strict';

    var AUTO_VETERAN_VISIT_DIFF = 5 * 24 * 60 * 60 * 1000; /* 5 days in milliseconds */

    var newbieLifetimeCookieValue = $.cookie(NEWBIE_LIFETIME_COOKIE_NAME),
        currentTimestamp = new Date().getTime(),
        isVeteran = Boolean($.cookie(VETERAN_COOKIE_NAME)),
        firstVisit;

    if (window.is_auth_user()) {
        isVeteran = true;
    }

    if (newbieLifetimeCookieValue === undefined) {
        newbieLifetimeCookieValue = currentTimestamp;

        $.cookie(NEWBIE_SESSION_COOKIE_NAME, currentTimestamp, {path: '/'});
    } else {
        firstVisit = newbieLifetimeCookieValue.split('-')[0];
        newbieLifetimeCookieValue = firstVisit + '-' + currentTimestamp;
        if (currentTimestamp - firstVisit > AUTO_VETERAN_VISIT_DIFF) {
            isVeteran = true;
        }
    }

    if (isVeteran) {
        $.cookie(VETERAN_COOKIE_NAME, 1, {
            path: '/',
            expires: VETERAN_COOKIE_EXPIRATION_PERIOD
        });
    }

    $.cookie(NEWBIE_LIFETIME_COOKIE_NAME, newbieLifetimeCookieValue, {
        path: '/',
        expires: NEWBIE_LIFETIME_COOKIE_EXPIRATION_PERIOD
    });

})(jQuery);