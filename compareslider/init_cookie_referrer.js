(function($, URI) {
    var MILLISECONDS = 1000,
        SECONDS = 60,
        MINUTES = 30,
        ADD_REFERRER_LINK_SELECTOR = '.js-referer',
        REFERRER_COOKIE_NAME = 'ref_domain',
        NONE_LINK_PARAMETER = 'direct',
        TRIGGER_NAME = 'linkChanged',
        linkParameter = '';

    var referrer = document.referrer,
        notOverrideDomain = window.location.hostname,
        referrerHostName;

    referrerHostName = URI(referrer).hostname();

    if (referrerHostName !== undefined && referrerHostName.length && referrerHostName.indexOf(notOverrideDomain) === -1) {
        var cookieLifeTime = MINUTES * SECONDS * MILLISECONDS,
            currentTime = (new Date()).getTime(),
            expireTime = new Date(currentTime + cookieLifeTime);

        if (referrerHostName.length > 0) {
            $.cookie(REFERRER_COOKIE_NAME, referrerHostName, { expires: expireTime, path: '/' });
        }
    }

    if ($.cookie(REFERRER_COOKIE_NAME) !== undefined) {
        linkParameter = $.cookie(REFERRER_COOKIE_NAME);
    } else {
        linkParameter = NONE_LINK_PARAMETER;
    }

    updateHref = function(link) {
        var $link = $(link),
            href = $link.attr('href');
        $link.attr('href', href + linkParameter);
    };

    $.fn.updateLinkReferrer = function() {

        return this.each(function() {
            var $link = $(this);

            if ($link.data('referrerinitialized') !== true) {
                updateHref($link);
                $link.data('referrerinitialized', true);
            }

            $link.on(TRIGGER_NAME, function() {
                updateHref($link);
            });
        });
    };

    $(function() {
        $(ADD_REFERRER_LINK_SELECTOR).updateLinkReferrer();
    });

})(jQuery, URI);