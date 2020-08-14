(function($, _, Modernizr, ResolutionManager) {
    'use strict';

    function BackgroundParallax(options) {
        var self = this;

        this.defaultOptions = {
            backgroundParallaxSpeed: 5,
            opacityDeceleration: 1.5,
            debounceRate: 100,
            parallaxSelector: '.js-parallax',
            parallaxImageSelector: '.js-parallax-image',
            parallaxOverlaySelector: '.js-parallax-overlay',
            isTop: true,
            speed: 2 // 2 - linear speed, higher number means slower parallax speed. Only for inner parallax blocks.
        };

        this.options = _.extend({}, this.defaultOptions, options);

        this.$container = $(this.options.container);
        this.$parallaxElem = $(this.options.parallaxSelector, this.$container);
        this.$parallaxElemImage = $(this.options.parallaxImageSelector, this.$container);
        this.$overlay = $(this.options.parallaxOverlaySelector, this.$container);
        this.$win = $(window);

        this.windowInnerWidth = window.innerWidth;
        this.currentResolution = ResolutionManager.getCurrentState();
        this.transformName = Modernizr.prefixed('transform');
        this.isIntersectionObserverSupported = (typeof IntersectionObserver === 'function');
        this.intersectionObserver = null;

        this.getMaxTopPosition = function() {
            return (this.$parallaxElemImage.height() - this.$container.height()) / this.options.speed;
        };

        this.adjustParallaxElemTopPosition = function() {
            if (!this.options.isTop) {
                this.$parallaxElem.css('top', -Math.abs(this.getMaxTopPosition()));
            }

            if (!$.browser.msie) {
                this.initParallaxStartEnd();
                this.onParallaxCallback();
            }
        };

        this.loadAndAdjustParallaxImage = function() {
            var $parallaxImage = this.$container.find(this.options.parallaxImageSelector);

            if ($parallaxImage.length) {
                $parallaxImage
                    .off('load.adjust')
                    .on('load.adjust', _.bind(function(e) {
                        if (e.target && e.target.complete) {
                            this.adjustParallaxElemTopPosition();
                        }
                    }, this))
                    .attr('src', this.$parallaxElem.attr('src'));
            }
        };

        this.initParallaxStartEnd = function() {
            this.parallaxStart = (this.options.isTop ? 0 : (this.$container.offset().top - this.$win.height()));
            this.parallaxEnd = (this.options.isTop ? this.$container.height() : (this.parallaxStart + this.$win.height() + this.$container.height()));
        };

        this.onParallaxCallback = function() {
            var scrollTop = this.$win.scrollTop(),
                backgroundPos,
                opacityValue;

            if (this.currentResolution < ResolutionManager.RESOLUTION_DESKTOP) {
                return;
            }

            if (!this.isIntersectionObserverSupported || this.intersectionRatio > 0) {
                this.initParallaxStartEnd();
            }

            // comparing scroll top with constant for optimization
            if (scrollTop >= this.parallaxStart && scrollTop <= this.parallaxEnd) {

                if (this.options.isTop) {
                    backgroundPos = Math.max(scrollTop / this.options.backgroundParallaxSpeed, 0);
                } else {
                    backgroundPos = this.getMaxTopPosition() * (scrollTop - this.parallaxStart) / this.$win.height();
                }

                opacityValue = Math.min((scrollTop - this.parallaxStart) / ((this.$win.height()) * this.options.opacityDeceleration), 1);

                this.$parallaxElem.css(this.transformName, 'translateY(' + backgroundPos + 'px)');
                if (this.$overlay.length) {
                    this.$overlay.css('opacity', opacityValue);
                }
            }
        };

        this.onResizeCallback = function() {
            if (this.windowInnerWidth !== window.innerWidth) {

                this.currentResolution = ResolutionManager.getCurrentState();

                if (this.currentResolution < ResolutionManager.RESOLUTION_DESKTOP) {
                    this.$parallaxElem.css(this.transformName, '');
                    this.$parallaxElem.css('top', '');
                    if (this.$overlay.length) {
                        this.$overlay.css('opacity', '');
                    }
                    this.loadAndAdjustParallaxImage();
                } else {
                    this.adjustParallaxElemTopPosition();
                }

                this.windowInnerWidth = window.innerWidth;
            }
        };

        this.bindedParallaxCallback = _.bind(this.onParallaxCallback, this);
        this.debouncedResizeCallback = _.debounce(_.bind(this.onResizeCallback, this), this.options.debounceRate);

        this.initEvents = function() {
            if (!$.browser.msie) {
                this.$win.on('scroll.bgparallax', this.bindedParallaxCallback);
            }

            this.$win.on('resize.bgparallax', this.debouncedResizeCallback);
        };

        this.destroy = function() {
            if (!$.browser.msie) {
                this.$win.off('scroll.bgparallax', this.bindedParallaxCallback);
            }

            this.$win.off('resize.bgparallax', this.debouncedResizeCallback);

            if (this.isIntersectionObserverSupported && this.intersectionObserver) {
                this.intersectionObserver.disconnect();
                this.intersectionObserver = null;
            }
        };

        if (!this.$parallaxElem.length || !Modernizr.csstransforms3d) {
            return;
        }

        this.initIntersectionObserver = function() {
            var intersectionOptions = {
                    rootMargin: '0px',
                    threshold: 0.01
                },
                target;

            function intersectionCallback(entries) {
                _.each(entries, _.bind(function(entry) {
                    this.intersectionRatio = entry.intersectionRatio;
                }, self));
            };

            this.intersectionObserver = new IntersectionObserver(intersectionCallback, intersectionOptions);

            target = this.$container.get(0);
            this.intersectionObserver.observe(target);
        };

        if (this.isIntersectionObserverSupported) {
            this.initIntersectionObserver();
        }

        this.loadAndAdjustParallaxImage();
        this.initParallaxStartEnd();
        this.initEvents();
    }

    window.BackgroundParallax = BackgroundParallax;

})(jQuery, _, Modernizr, ResolutionManager);
