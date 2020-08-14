(function($, _, URI, CropManager, wgsdk) {
    'use strict';

    var REGION_SELECTOR_COOKIE_EXPIRES = 365, // One year
        POPUP_INIT_DURATION = 1500,
        POPUP_BODY_HIDDEN_DURATION = 400,
        SESSION_PREFIX = 'sess_',
        COOKIE_PREFIX = 'csw_';

    var RegionWidget = function(calling, url, template) {
        var params = {
                tpl: template,
                calling: calling
            },
            uri = new URI(location.href),
            cookieDomain = (uri.is('ip') ? '' : '.') + uri.hostname(),
            $body = $('body'),
            $popupContainer,
            $popupBody,
            popupHiddenClass,
            popupBodyHiddenBottomClass,
            popupBodyHiddenTopClass;

        this.onData = function(data) {
            this.templateHandlerPopup(template.toLowerCase(), data);
        };

        this.setCookie = function(template, isSessionCookie) {
            if (!isSessionCookie) {
                $.cookie(COOKIE_PREFIX + template, 1,
                    {
                        expires: REGION_SELECTOR_COOKIE_EXPIRES,
                        path: '/',
                        domain: cookieDomain
                    }
                );
            } else {
                $.cookie(SESSION_PREFIX + COOKIE_PREFIX + template, 1,
                    {
                        path: '/',
                        domain: cookieDomain
                    }
                );
            }
        };

        this.hidePopup = function(isSessionCookie) {
            $popupBody.addClass(popupBodyHiddenTopClass);

            setTimeout(_.bind(function() {
                $popupContainer.addClass(popupHiddenClass);
                CropManager.revoke('regionpopup');
                this.setCookie(template, isSessionCookie);
                wgsdk.ga({eventCategory: 'Navigation', eventAction: 'click', eventLabel: 'region_suggest_stayhere'});

                $popupContainer.find('.js-popup-leave, .js-popup-close, .js-popup-action').off('click.region');
                $(document).off('keydown.region');
                $popupContainer.remove();
            }, this), POPUP_BODY_HIDDEN_DURATION);
        };

        this.templateHandlerPopup = function(template, data) {
            if (_.isObject(data) && data.msg) {
                $body.append($(data.msg));

                $popupContainer = $('.js-cluster-popup');
                $popupBody = $popupContainer.find('.js-popup-body');
                popupHiddenClass = $popupContainer.data('popupHiddenClass');
                popupBodyHiddenBottomClass = $popupContainer.data('popupBodyHiddenBottomClass');
                popupBodyHiddenTopClass = $popupContainer.data('popupBodyHiddenTopClass');

                $(document).on('keydown.region', _.bind(function(e) {
                    if (e.which === 27) { // Hide popup on clicking 'escape'
                        this.hidePopup(false);
                    }
                }, this));

                $popupContainer.find('.js-popup-leave').on('click.region', _.bind(function(e) {
                    e.preventDefault();

                    this.hidePopup(false);
                }, this));

                $popupContainer.find('.js-popup-close').on('click.region', _.bind(function(e) {
                    e.preventDefault();
                    
                    this.hidePopup(true);
                }, this));

                $popupContainer.find('.js-popup-action').on('click.region', _.bind(function(e) {
                    var destinationRealm = $(e.currentTarget).data('realm');

                    wgsdk.ga({eventCategory: 'Navigation', eventAction: 'click', eventLabel: 'region_suggest_go_' + destinationRealm});
                }, this));

                setTimeout(function() {
                    CropManager.requestFullCrop('regionpopup');
                    $popupContainer.removeClass(popupHiddenClass);
                    setTimeout(function() {
                        $popupBody.removeClass(popupBodyHiddenBottomClass);
                        wgsdk.ga({eventCategory: 'Navigation', eventAction: 'click', eventLabel: 'region_suggest_appear'});
                    }, POPUP_BODY_HIDDEN_DURATION);
                }, POPUP_INIT_DURATION);
            }
        };

        if (!navigator.cookieEnabled || !template || !url || $.cookie(SESSION_PREFIX + COOKIE_PREFIX + template) !== undefined || $.cookie(COOKIE_PREFIX + template) !== undefined) {
            return;
        }

        $.getJSON(url + '?jsoncallback=?', params, _.bind(this.onData, this));
    };

    window.RegionWidget = RegionWidget;
})($, _, URI, CropManager, wgsdk);
