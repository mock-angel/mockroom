(function($, _, ResolutionManager, wgsdk, amplify, ComparisonManager) {
    'use strict';

    var HEIGHT_PERCENT = 90,
        DEBOUNCE_TIMEOUT = 10,
        ANIMATION_DURATION = 300;

    function BackToTop(options) {
        this.options = _.extend({}, this.options, options);

        this.$container = $(this.options.container);
        this.$header = $(this.options.headerSelector);
        this.$footer = $(this.options.footerSelector);

        if (!this.$header.length || !this.$container.length || !this.$footer.length) {
            return;
        }

        this.showButtonClass = this.$container.data('showButtonClass');
        this.showTransformButtonClass = this.$container.data('showTransformButtonClass');
        this.atBottomClass = this.$container.data('atBottomClass');

        if (ComparisonManager) {
            this.comparisonManager = new ComparisonManager();
        }

        this.init();
    }

    BackToTop.prototype.options = {
        headerSelector: '.js-header',
        footerSelector: '.js-footer'
    };

    BackToTop.prototype.checkButtonState = function(scrollY) {
        var isShown = (scrollY > (this.$header.offset().top + this.$header.outerHeight())),
            isAtBottom, isNeedToBeAtBottom;

        if (!isShown) {
            this.hide();
            return;
        }

        if (ResolutionManager.getCurrentState() >= ResolutionManager.RESOLUTION_TABLET) {
            isNeedToBeAtBottom = (scrollY + HEIGHT_PERCENT * $(window).height() / 100) >= (this.$footer.offset().top);
            isAtBottom = this.$container.hasClass(this.atBottomClass);

            this.show();

            if (!isNeedToBeAtBottom && isAtBottom) {
                this.$container.css('transition', 'none');
                this.$container.get(0).offsetHeight;
                this.$container.removeClass(this.atBottomClass);
                this.$container.get(0).offsetHeight;
                this.$container.css('transition', '');
            } else if (isNeedToBeAtBottom && !isAtBottom) {
                this.$container.addClass(this.atBottomClass);
            }
        } else {
            if (this.comparisonManager && (this.comparisonManager.getPlayersCount() > 0 || this.comparisonManager.getTanksCount() > 0)) {
                this.hide();
            } else {
                this.$container
                    .addClass(this.showButtonClass)
                    .removeClass(this.showTransformButtonClass)
                    .removeClass(this.atBottomClass);
            }
        }
    };

    BackToTop.prototype.hide = function() {
        this.$container
            .removeClass(this.showButtonClass)
            .removeClass(this.showTransformButtonClass);
    };

    BackToTop.prototype.show = function() {
        this.$container
            .addClass(this.showButtonClass)
            .addClass(this.showTransformButtonClass);
    };

    BackToTop.prototype.initEvents = function() {
        var checkButtonStateCallBack = _.bind(function() {
            this.checkButtonState($(window).scrollTop());
        }, this);

        this.$container.on('click.backtotop', _.bind(function() {
            wgsdk.ga({eventCategory: this.options.gaEventCategory, eventAction: 'click', eventLabel: 'gototop' });

            $('html, body').animate({
                scrollTop: 0
            }, ANIMATION_DURATION);
        }, this));

        $(window).on('resize.backtotop scroll.backtotop', _.throttle(checkButtonStateCallBack, DEBOUNCE_TIMEOUT));
        amplify.subscribe('playerscomparison:player-added', checkButtonStateCallBack);
        amplify.subscribe('playerscomparison:player-removed', checkButtonStateCallBack);
        amplify.subscribe('tankscomparison:tank-added', checkButtonStateCallBack);
        amplify.subscribe('tankscomparison:tank-removed', checkButtonStateCallBack);
    };

    BackToTop.prototype.init = function() {
        this.initEvents();
        this.checkButtonState($(window).scrollTop());
    };

    window.BackToTop = BackToTop;

})(jQuery, _, ResolutionManager, wgsdk, amplify, window.ComparisonManager);
