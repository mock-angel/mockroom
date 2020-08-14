(function($, amplify, ResolutionManager, CropManager, wgsdk) {
'use strict';

var STATE_UNKNOWN = 0,
    STATE_HIDDEN = 1,
    STATE_SHOWN = 2,
    STATE_TOP = 3,
    DIRECTION_UNKNOWN = 0,
    DIRECTION_TOP = 1,
    DIRECTION_BOTTOM = 2,
    SUBMENU_STATE_HIDDEN = 0,
    SUBMENU_STATE_SHOWN = 1;

$(function() {
    var currentState = STATE_UNKNOWN,
        submenuState = SUBMENU_STATE_HIDDEN,
        $menuWrapper = $('.js-mainmenu-wrapper'),
        $commonMenuHolder = $('.js-commonmenu-holder'),
        $commonMenuLink = $('.js-mobile-commonmenu-link'),
        $downloadGameLink = $('.js-download-game-link'),
        $downloadGameLinkMobile = $('.js-download-game-link-mobile'),
        commonMenuOpenedClass = $commonMenuHolder.data('mobileOpenedClass'),
        mobileMenuOpenedClass = $menuWrapper.data('mobileMenuOpenedClass'),
        scrollBottomClass = $menuWrapper.data('scrollBottomClass'),
        scrollBottomInitialClass = $menuWrapper.data('scrollBottomInitialClass'),
        scrollTopClass = $menuWrapper.data('scrollTopClass'),
        scrollTopInitialClass = $menuWrapper.data('scrollTopInitialClass'),
        oldScrollTop = $(window).scrollTop(),
        oldState = STATE_UNKNOWN,
        oldDirection = DIRECTION_UNKNOWN,
        isAlwaysVisible = false,
        isHandleScrollEnabled = true;

    function closeCommonMenu() {
        $commonMenuHolder.removeClass(commonMenuOpenedClass);
        $commonMenuLink
            .addClass($commonMenuLink.data('mobileOpenClass'))
            .removeClass($commonMenuLink.data('mobileCloseClass'));
    }

    $commonMenuLink.on('click.mainmenu', function(e) {
        e.preventDefault();

        if ($commonMenuHolder.hasClass(commonMenuOpenedClass)) {
            closeCommonMenu();
        } else {
            $commonMenuHolder.addClass(commonMenuOpenedClass);
            $(this)
                .removeClass($(this).data('mobileOpenClass'))
                .addClass($(this).data('mobileCloseClass'));
        }
    });

    $downloadGameLink.add($downloadGameLinkMobile).on(wgsdk.interactionEvents(), function() {
        wgsdk.ga({eventCategory: 'Navigation', eventAction: 'click', eventLabel: 'mp_download_game'});
    });

    $('.js-mobile-mainmenu-link').on('click.mainmenu', function(e) {
        e.preventDefault();

        closeCommonMenu();
        $menuWrapper.addClass(mobileMenuOpenedClass);

        CropManager.requestTabletCrop('mainmenu:mobile');
        amplify.publish('mainmenu:mobile:opened');
    });

    $('.js-mobile-mainmenu-close-link, .js-mainmenu-wrapper').on('click', function(e) {
        if (e.target === e.currentTarget) {
            e.preventDefault();

            $menuWrapper.removeClass(mobileMenuOpenedClass);

            CropManager.revoke('mainmenu:mobile');
        }
    });

    function closeMainSubMenus($currentItem) {
        $('.js-mainmenu-item').each(function() {
            var $item = $(this);

            if ($currentItem === undefined || ($currentItem !== undefined && !$item.is($currentItem))) {
                $item.removeClass($item.data('openedClass'));
            }
        });
    }

    /* Submenus */
    $('.js-mainmenu-arrow').on('click.mainmenu', function(e) {
        var $menuItem = $(this).parents('.js-mainmenu-item');

        e.preventDefault();

        closeMainSubMenus($menuItem);
        $menuItem.toggleClass($menuItem.data('openedClass'));

        if ($menuItem.hasClass($menuItem.data('openedClass'))) {
            $('body').off('.mainsubmenuclick').on('click.mainmenu', function(e) {
                if ($(e.target).parents('.js-mainmenu-wrapper').length === 0) {
                    submenuState = SUBMENU_STATE_HIDDEN;
                    closeMainSubMenus();
                    $('body').off('.mainsubmenuclick');
                }
            });
            submenuState = SUBMENU_STATE_SHOWN;
        } else {
            $('body').off('.mainsubmenuclick');
            submenuState = SUBMENU_STATE_HIDDEN;
        }
    });

    $('a, .js-mainmenu-arrow', $menuWrapper).on('click', function(e) {
        var eventLabel;

        if (e.target === e.currentTarget) { // arrows are part of links, so click on arrow will be click on link too
            eventLabel = ((currentState === STATE_TOP || currentState === STATE_UNKNOWN) ? 'menu_top' : 'menu_sticky');
            wgsdk.ga({eventCategory: 'Navigation', eventAction: 'click', eventLabel: eventLabel});
        }
    });

    function isMenuForcedFixed() {
        return (submenuState === SUBMENU_STATE_SHOWN || isAlwaysVisible);
    }

    $(window).on('scroll.mainmenu', function() {
        var scrollTop = $(window).scrollTop(),
            cmHeight = $commonMenuHolder.height(),
            totalHeight = cmHeight + $menuWrapper.height(),
            direction;

        /* If admin toolbar is present - do nothing */
        if (window.isDraftActualVersion !== undefined || !isHandleScrollEnabled) {
            return;
        }

        if (scrollTop < oldScrollTop) {
            direction = DIRECTION_TOP;
        } else if (scrollTop > oldScrollTop || oldDirection === DIRECTION_UNKNOWN) {
            direction = DIRECTION_BOTTOM;
        }

        if (currentState !== STATE_TOP && scrollTop < cmHeight) {

            $menuWrapper
                .removeClass(scrollBottomClass)
                .removeClass(scrollBottomInitialClass)
                .removeClass(scrollTopClass)
                .removeClass(scrollTopInitialClass);

            oldState = currentState;
            currentState = STATE_TOP;

        } else if (currentState !== STATE_HIDDEN
                   && direction === DIRECTION_BOTTOM
                   && scrollTop > totalHeight
                   && !isMenuForcedFixed()) {

            $menuWrapper
                .addClass((oldState !== STATE_HIDDEN ? scrollBottomInitialClass : scrollBottomClass))
                .removeClass(scrollTopInitialClass)
                .removeClass(scrollTopClass);

            oldState = currentState;
            currentState = STATE_HIDDEN;
            amplify.publish('mainmenu:hidefixed');

        } else if (currentState !== STATE_SHOWN &&
                   (
                    (direction === DIRECTION_TOP && oldDirection === DIRECTION_TOP && scrollTop > totalHeight)
                    ||
                    (isMenuForcedFixed() && scrollTop >= cmHeight)
                   )
                  ) {

            $menuWrapper
                .addClass((isMenuForcedFixed() ? scrollTopInitialClass : scrollTopClass))
                .removeClass(scrollBottomInitialClass)
                .removeClass(scrollBottomClass);

            oldState = currentState;
            currentState = STATE_SHOWN;
            amplify.publish('mainmenu:showfixed');
        }

        oldScrollTop = scrollTop;
        oldDirection = direction;
    })
    .trigger('scroll.mainmenu');

    amplify.subscribe('mainmenu:stopscrolldetect', function() {
        isHandleScrollEnabled = false;
    });

    amplify.subscribe('mainmenu:resumescrolldetect', function() {
        setTimeout(function() {
            isHandleScrollEnabled = true;
        }, 0);
    });

    amplify.subscribe('mainmenu:alwaysvisible:enable', function() {
        isAlwaysVisible = true;
        $(window).trigger('scroll.mainmenu');
    });

    amplify.subscribe('mainmenu:alwaysvisible:disable', function() {
        isAlwaysVisible = false;
        $(window).trigger('scroll.mainmenu');
    });

});

})(jQuery, amplify, ResolutionManager, CropManager, wgsdk);
