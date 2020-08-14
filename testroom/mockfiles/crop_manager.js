(function ($, _, amplify, ResolutionManager) {
'use strict';

var uniqId = 0;

function CropManager() {
    this.init();
}

CropManager.prototype.init = function() {
    this.cropClass = $('html').data('globalCropClass');
    this.activeCrops = [];
    this.isCropActive = false;
    this.savedScrollPosition = 0;

    amplify.subscribe('resolution:statechanged', this, function(newState) {
        this.updateState(newState);
    });
};

CropManager.prototype.request = function(requesterId, options) {
    var obj = new Crop(requesterId, options),
        top = $(window).scrollTop();

    this.activeCrops.push(obj);
    if (!this.isCropActive) {
        this.savedScrollPosition = top;
    }
    this.updateState(ResolutionManager.getCurrentState());

    return obj.id;
};

CropManager.prototype.revoke = function(requesterId) {
    _.remove(this.activeCrops, function(cropItem) { return (cropItem.requesterId === requesterId);});
    this.updateState(ResolutionManager.getCurrentState());
};

CropManager.prototype.updateState = function(newResolutionState) {
    var isAnyActiveCrop = false;

    _.each(this.activeCrops, function(cropObj) {
        if (newResolutionState >= cropObj.minResolution && newResolutionState <= cropObj.maxResolution) {
            isAnyActiveCrop = true;
        }
    }, this);

    this.changeCropActive(isAnyActiveCrop);
};

CropManager.prototype.changeCropActive = function(newIsCropActive) {
    var isScrollActive, scrollWidth, $pageWrapper, $body;

    if (this.isCropActive !== newIsCropActive) {
        $pageWrapper = $('.js-page-wrapper');
        $body = $('body');
        isScrollActive = (document.body.scrollHeight > document.body.clientHeight);

        this.isCropActive = newIsCropActive;

        amplify.publish('mainmenu:stopscrolldetect');
        $('html, body').toggleClass(this.cropClass, this.isCropActive);

        if (this.isCropActive) {
            $pageWrapper.css('top', -this.savedScrollPosition);
            if (isScrollActive) {
                scrollWidth = this.getScrollbarWidth();
                if (scrollWidth > 0) {
                    $pageWrapper.css('width', 'calc(100% - ' + scrollWidth + 'px)');
                }
            }
        } else {
            $pageWrapper.css({
                top: '',
                width: ''
            });

            $(window).scrollTop(this.savedScrollPosition);
        }

        amplify.publish('mainmenu:resumescrolldetect');
    }
};

CropManager.prototype.requestFullCrop = function(requesterId) {
    return this.request(requesterId);
};

CropManager.prototype.requestMobileCrop = function(requesterId) {
    return this.request(requesterId, {maxResolution: ResolutionManager.RESOLUTION_MOBILE_WIDE});
};

CropManager.prototype.requestTabletCrop = function(requesterId) {
    return this.request(requesterId, {maxResolution: ResolutionManager.RESOLUTION_TABLET});
};

CropManager.prototype.getScrollbarWidth = function() {
    var outer = document.createElement('div'),
        inner, widthNoScroll, widthWithScroll;

    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.msOverflowStyle = 'scrollbar';

    document.body.appendChild(outer);

    widthNoScroll = outer.offsetWidth;
    outer.style.overflow = 'scroll';

    inner = document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);

    widthWithScroll = inner.offsetWidth;
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
};

function Crop(requesterId, options) {
    var defaultOptions = {
            minResolution: ResolutionManager.RESOLUTION_MIN,
            maxResolution: ResolutionManager.RESOLUTION_MAX,
            id: uniqId++
        };

    this.options = $.extend({}, defaultOptions, options);

    this.requesterId = requesterId;
    this.id = this.options.id;
    this.minResolution = this.options.minResolution;
    this.maxResolution = this.options.maxResolution;
}

window.CropManager = new CropManager();

})(jQuery, _, amplify, ResolutionManager);
