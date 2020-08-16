(function ($, _, Hammer, Modernizr) {
    'use strict';

    function ImageComparison(options) {
        this.options = _.extend({}, this.defaults, options);

        this.$container = $(this.options.container);
        this.$compareInner = $(this.options.compareInnerSelector, this.$container);
        this.$compareHolder = $(this.options.compareHolderSelector, this.$container);
        this.$compareImages = $(this.options.compareImagesSelector, this.$container);
        this.$compareControl = $(this.options.compareControlSelector, this.$container);
        this.$compareLink = $(this.options.compareLinkSelector, this.$container);
        this.sliderHolderTransitionClass = this.$compareHolder.data('sliderTransitionClass');
        this.sliderControlTransitionClass = this.$compareControl.data('sliderTransitionClass');
        this.samsungPrefix = _.uniqueId('.samsungfix_');

        this.isTransformSupported = Modernizr.csstransforms;
        this.isTransitionSupported = Modernizr.csstransitions;

        this.previousSliderOffset = this.options.initialSliderOffset;
        this.windowInnerWidth = window.innerWidth;

        this.hammerSlider = new Hammer(this.$compareControl[0], {touchAction: 'pan-y'});

        this.init();
    }
    
    ImageComparison.prototype.defaults = {
        compareInnerSelector: '.js-compare-inner',
        compareHolderSelector: '.js-compare-holder',
        compareImagesSelector: '.js-compare-image',
        compareControlSelector: '.js-compare-control',
        compareLinkSelector: '.js-compare-link',
        initialSliderOffset: 50,// % - middle of image
        imageMargin: 0.01// % - need small margin to show slider control at the beginning and the end of image

    };

    ImageComparison.prototype.init = function() {
        this.initDimensions();
        this.panHandler = _.bind(this.onPanEvent, this);
        this.addSliderEvents();
    };

    ImageComparison.prototype.initDimensions = function() {
        this.compareInnerWidth = this.$compareInner.innerWidth();
        this.offsetSlider(this.previousSliderOffset);
    };

    ImageComparison.prototype.offsetSlider = function(offset) {
        if (offset < 0) {
            offset = this.options.imageMargin;
        } else if (offset > 2 * this.options.initialSliderOffset) {
            offset = 2 * this.options.initialSliderOffset - this.options.imageMargin;
        }
        this.$compareHolder.css('width', offset + '%');
        this.$compareControl.css('left', offset + '%');
    };

    ImageComparison.prototype.addSliderEvents = function() {
        /* Samsung mobile browser workaround */
        $(document).off(this.samsungPrefix).on('touchstart' + this.samsungPrefix, $.noop);

        this.hammerSlider.on('panstart panleft panright swipe panend', this.panHandler);

        this.$compareLink.on('click.imagecomparison', _.bind(this.onShowFullImage, this));
        this.$compareImages.on('click.imagecomparison', _.bind(this.onMoveToPoint, this));
        this.$compareControl.on('dragstart.imagecomparison', function() {
            return false;
        });

        $(window).on('resize.imagecomparison', _.bind(_.debounce(this.resizeHandler, 100), this));
    };

    ImageComparison.prototype.onShowFullImage = function(e) {
        var offset = $(e.currentTarget).data('compareOffset');

        e.preventDefault();
        this.offsetSlider(offset);
        this.previousSliderOffset = offset;
    };

    ImageComparison.prototype.onMoveToPoint = function(e) {
        var offset = e.offsetX / this.compareInnerWidth * 100;

        this.offsetSlider(offset);
        this.previousSliderOffset = offset;
    };

    ImageComparison.prototype.onPanEvent = function(e) {
        var offset;
        
        e.srcEvent.preventDefault();
        e.srcEvent.stopPropagation();
        e.srcEvent.stopImmediatePropagation();

        switch (e.type) {
            case 'panstart':
                if (this.isTransitionSupported) {
                    this.$compareHolder.removeClass(this.sliderHolderTransitionClass);
                    this.$compareControl.removeClass(this.sliderControlTransitionClass);
                }
                break;
            case 'panleft':
            case 'panright':
                this.offsetSlider(this.previousSliderOffset + (100 * e.deltaX / this.compareInnerWidth));
                break;
            case 'swipe': 
                offset = (e.deltaX > 0 ? (2 * this.options.initialSliderOffset - this.options.imageMargin) : this.options.imageMargin);
                if (this.isTransitionSupported) {
                    this.$compareHolder.addClass(this.sliderHolderTransitionClass);
                    this.$compareControl.addClass(this.sliderControlTransitionClass);
                }

                this.offsetSlider(offset);
                this.previousSliderOffset = offset;
                break;
            case 'panend':
                offset = this.previousSliderOffset + (100 * e.deltaX / this.compareInnerWidth);
                if (offset < 0) {
                    offset = this.options.imageMargin;
                } else if (offset > 2 * this.options.initialSliderOffset) {
                    offset = 2 * this.options.initialSliderOffset - this.options.imageMargin;
                }

                if (this.isTransitionSupported) {
                    this.$compareHolder.addClass(this.sliderHolderTransitionClass);
                    this.$compareControl.addClass(this.sliderControlTransitionClass);
                }
                this.offsetSlider(offset);
                this.previousSliderOffset = offset;

                return false;
        }
    };

    ImageComparison.prototype.resizeHandler = function() {
        if (this.windowInnerWidth !== window.innerWidth) {
            this.initDimensions();
            this.windowInnerWidth = window.innerWidth;
        }
    };

    window.ImageComparison = ImageComparison;

})(jQuery, _, window.Hammer, Modernizr);