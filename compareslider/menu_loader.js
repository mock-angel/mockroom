(function($) {

    'use strict';

    window.WG = window.WG || {};
    WG.vars = WG.vars || {};

    var accountInfo = wgsdk.account_info(),
        isUserLoggedIn = is_auth_user(),
        $fallbackTemplate = $('#js-common-menu-fallback'),
        commonMenuLoginUrl = $('.js-auth-openid-link').attr('href');

    $('.js-language-list-add-ga-events').on('click', function() {
        dataLayer.push({'event': 'GAevent', 'eventCategory': 'Language', 'eventAction': 'All'});
    });

    if (!isUserLoggedIn) {
        if (WG.vars.COMMON_MENU_ENABLED) {
            removeCommonMenuCookies();
        }
        wgsdk.ajaxInfo.showLoginLink();
    } else {
        wgsdk.ajaxInfo.showMyProfileLink();

        accountInfo.queue(updateMenuFromCookie);
    }

    function updateMenuFromCookie(receivedAccountInfo) {
        var spaId = receivedAccountInfo.get_spa_id(),
            nickname = receivedAccountInfo.get_nickname();

        if (spaId) {
            wgsdk.ajaxInfo.showMyProfileLink(nickname, spaId);
        
            if (WG.vars.COMMON_MENU_ENABLED) {
                $.cookie(WG.vars.COMMON_MENU_COOKIE_PREFIX + 'user_id', spaId, {path: WG.vars.COMMON_MENU_COOKIE_PATH});
                $.cookie(WG.vars.COMMON_MENU_COOKIE_PREFIX + 'user_name', nickname, {path: WG.vars.COMMON_MENU_COOKIE_PATH});
                if (window.WG && WG.CommonMenu) {
                    updateCommonMenu();
                }
            }

            $(function() {
                wgsdk.ajaxInfo.showClan(receivedAccountInfo.get_clan_id(), receivedAccountInfo.get_clan_tag(), receivedAccountInfo.get_clan_color());
            });
        } else {
            wgsdk.ajaxInfo.hideMyProfileLink();
            wgsdk.ajaxInfo.showLoginLink();

            if (WG.vars.COMMON_MENU_ENABLED) {
                removeCommonMenuCookies();
            }
        }
    }

    function updateCommonMenu() {
        var registrationUrl = $('.js-registration_url').find('a').attr('href'),
            commonMenuParameters = {
                login_url: commonMenuLoginUrl,
                registration_url: registrationUrl,
                logout_url: '#',
                user_id: $.cookie(WG.vars.COMMON_MENU_COOKIE_PREFIX + 'user_id'),
                user_name: $.cookie(WG.vars.COMMON_MENU_COOKIE_PREFIX + 'user_name')
            };

        WG.CommonMenu.on('login', function(e) {
            e.preventDefault();
            $('.js-auth-openid-link').get(0).click();
        });

        WG.CommonMenu.on('logout', function(e) {
            e.preventDefault();
            removeCommonMenuCookies();
            $('.js-auth-logout-link').get(0).click();
        });

        setTimeout(function() {
            WG.CommonMenu.update(commonMenuParameters);
        }, 0);
    }

    function removeCommonMenuCookies() {
        $.removeCookie(WG.vars.COMMON_MENU_COOKIE_PREFIX + 'user_name', {path: WG.vars.COMMON_MENU_COOKIE_PATH});
        $.removeCookie(WG.vars.COMMON_MENU_COOKIE_PREFIX + 'user_id', {path: WG.vars.COMMON_MENU_COOKIE_PATH});
    }

    $(function() {
        if (WG.vars.COMMON_MENU_ENABLED && window.WG && WG.CommonMenu) {
            updateCommonMenu();
        } else if (WG.vars.COMMON_MENU_ENABLED && !(window.WG && WG.CommonMenu)) {
            setTimeout(function() {
                if (!window.WG || !WG.CommonMenu) {
                    if ($fallbackTemplate.length) {
                        $fallbackTemplate.addClass($fallbackTemplate.data('visibleClass'));
                    }
                    $('#common_menu').remove();
                } else {
                    updateCommonMenu();
                }
            }, WG.vars.COMMON_MENU_LOADER_TIMEOUT || 3000);
        }

        if (!isUserLoggedIn && wgsdk.vars.CLANWARS_SECOND_GLOBALMAP_INTERGATION_ENABLED) {
            $('.js-portal-menu-clans-index-link').show();
        }

    });

})(jQuery);
