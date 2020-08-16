wgsdk.thousands = (function ($) {

    var obj = function(number, reduce, startFrom) {
        'use strict';

        var result,
            i = 0;

        if (reduce && startFrom <= number) {
            var suffix = '';

            if (number > 1000000) {
                number /= 1000000;
                suffix = ' M';
            }
            if (number > 1000) {
                number /= 1000;
                suffix = ' K';
            }
            result = number;
            if (suffix) {
                result = number.toFixed(2) + suffix;
            }
            return result;
        }

        var dotted = '';
        number = number.toString();
        var dotPosition = number.search(/\./);
        if (dotPosition > -1) {
            dotted = get_format('DECIMAL_SEPARATOR') || '.';
            dotted += number.substr(dotPosition + 1);
            number = number.substr(0, dotPosition);
        }

        result = '';

        var sign = '';
        if (number.substr(0, 1) === '-') {
            number = number.substr(1);
            sign = '-';
        }

        var len = number.length;
        for (i = 0; i < len; ++i) {

            if (i !== 0 && (len - i) !== 0 && (len - i) % 3 === 0) {
                result += wgsdk.vars.THOUSAND_SEPARATOR;
            }
            result += number.charAt(i);
        }
        return sign + result + dotted;
    };
    return obj;
}(jQuery));


wgsdk.roman = function(num) {
    var digits, key, roman, i;

    if (!Number(num)) {
        return '';
    }

    digits = String(Number(num)).split('');
    key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
           "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
           "","I","II","III","IV","V","VI","VII","VIII","IX"];
    roman = '';
    i = 3;

    while (i--) {
        roman = (key[Number(digits.pop()) + (i * 10)] || '') + roman;
    }

    return Array(+digits.join('') + 1).join('M') + roman;
};

/* Google analytics */
wgsdk.ga = function(trackEvent) {
    var dataLayer = (window.dataLayer || []),
        defaultTrackEvent = {
            event: 'GAevent'
        };

    dataLayer.push($.extend({}, defaultTrackEvent, trackEvent));

    if (!window.dataLayer) {
        window.dataLayer = dataLayer;
    }
};

wgsdk.interactionEvents = function(namespace) {
    var hasAuxclick = false,
        namespace = (namespace === undefined ? '.ga' : (namespace.length ? '.' + namespace : '')),
        events = ['click'];

    try {
        hasAuxclick = ('onauxclick' in document.documentElement);
    }
    catch(e) {};

    if (hasAuxclick) {
        events.push('auxclick');
    } else {
        events.push('contextmenu');
    }
    
    return _.map(events, function(event) {return event + namespace;}).join(' ');
};

wgsdk.ajaxInfo = (function($) {
    var instance = {};

    instance.showLoginLink = function() {
        if (wgsdk.vars.REGISTRATION_URL) {
            $('.js-registration_url a')
                .attr('href',  wgsdk.vars.REGISTRATION_URL.replace('<lang>', get_lang()))
                .trigger('linkChanged');
            $('.js-registration_url').show();
        }
        $('#js-auth-wrapper').show();
    };

    instance.showMyProfileLink = function(nickname, spaId) {
        var link;

        $('#js-auth-wrapper-nickname').show();

        if (nickname) {
            $('.js-my_profile_nickname').html(nickname);
        }

        if (nickname && spaId) {
            if (!$('.js-my_profile_link').length) {
                return;
            }
            link = $('.js-my_profile_link').data('full_link').replace(wgsdk.vars.SPA_ID_KEY, spaId).replace(wgsdk.vars.NICKNAME_KEY, nickname);
            $('.js-my_profile_link').attr('href', link);
        }
    };

    instance.hideMyProfileLink = function() {
        $('#js-auth-wrapper-nickname').hide();
    };

    instance.showClan = function(clanId, clanTag, clanColor) {
        var $portalMenuClanLinkContainer = $('.js-portal-menu-clan-link'),
            $portalMenuRecruitstationLinkContainer = $('.js-portal-menu-recruitstation-link'),
            $topMenuClanlink = $('#js-sdk_top_right_menu .js-clan-link'),
            $clanTag = $('<span>', {
                'class': 'nav-detail_clantag',
            }),
            clanUrl;

        $('.js-portal-menu-clans-index-link').hide();
        if (clanId && clanTag) {
            clanUrl = wgsdk.vars.WGCC_FE_CLAN_URL.replace('clan_id', clanId);
            if (wgsdk.vars.CLANWARS_SECOND_GLOBALMAP_INTERGATION_ENABLED && $portalMenuClanLinkContainer.length > 0) {
                $portalMenuClanLinkContainer.find('a').attr('href', clanUrl);
                $clanTag.css({'color' : clanColor}).text(' ['+clanTag+']');
                $portalMenuClanLinkContainer.find('.js-portal-menu-link-text').prepend($clanTag);
                $portalMenuClanLinkContainer.show();
                $portalMenuRecruitstationLinkContainer.hide();
            }

            if (!$topMenuClanlink.length) {
                return;
            }
            $topMenuClanlink.attr('href', clanUrl);
            $topMenuClanlink.show();
        } else {
            $portalMenuRecruitstationLinkContainer.show();
        }
    };

    return instance;
}(jQuery));

wgsdk.getBodyZoom = (function($) {
    var $body;

    return function() {
        if (!$body || $body.length === 0) {
            $body = $('body');
        }

        return (Number($body.css('zoom')) || 1);
    };
}(jQuery));

wgsdk.getElementOffsetWithZoom = function(element) {
    var zoom = wgsdk.getBodyZoom(),
        currentElement = element,
        offset = 0;

    while (currentElement) {
        offset += currentElement.offsetTop;
        currentElement = currentElement.offsetParent;
    }

    return (offset * zoom);
};

wgsdk.preventGhostClick = (function (document) {

    var THRESHOLD = 25,
        TIMEOUT = 3000,
        coordinates = [];

    function preventGhostClick(e) {
        var x, y;

        for (var i = 0, max = coordinates.length; i < max; i++) {
            x = coordinates[i][0];
            y = coordinates[i][1];

            if (Math.abs(e.clientX - x) < THRESHOLD && Math.abs(e.clientY - y) < THRESHOLD) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }
    }

    function resetCoordinates() {
        coordinates = [];
    }

    function popCoordinates() {
        coordinates.splice(0, 1);
    }

    function registerCoordinates(e) {
        var touch, event = e.gesture;

        if (!event) {
            event = e;
        }

        if (event.pointers.length - event.changedPointers.length <= 0) {
            touch = event.changedPointers[0];
            coordinates.push([touch.clientX, touch.clientY]);

            setTimeout(popCoordinates, TIMEOUT);
        }
    }

    document.addEventListener('click', preventGhostClick, true);

    return function($el) {
        $el.on('panend', registerCoordinates);
        $el.on('panstart', resetCoordinates);
    };
})(document);
