(function ($, _, amplify, ResolutionManager) {
'use strict';

function PageWrapperManager() {
    $(_.bind(function() {
        this.init();
    }, this));
}

PageWrapperManager.prototype.init = function() {
    this.$pageWrapper = $('.js-page-wrapper');
    this.cropClass = this.$pageWrapper.data('popupMobileHidden');
    this.activeCrops = [];
    this.isCropActive = false;
    this.savedScrollPosition = 0;

    amplify.subscribe('resolution:statechanged', this, function(newState) {
        this.updateState(newState);
    });
};

PageWrapperManager.prototype.request = function(requesterId, options) {
    var obj = new Crop(requesterId, options);

    this.activeCrops.push(obj);
    if (!this.isCropActive) {
        this.savedScrollPosition = $(window).scrollTop();
    }
    this.updateState(ResolutionManager.getCurrentState());

    return obj.id;
};

PageWrapperManager.prototype.revoke = function(requesterId) {
    _.remove(this.activeCrops, function(cropItem) { return (cropItem.requesterId === requesterId);});
    this.updateState(ResolutionManager.getCurrentState());
};

PageWrapperManager.prototype.updateState = function(newResolutionState) {
    var isAnyActiveCrop = false;

    _.each(this.activeCrops, function(cropObj) {
        if (newResolutionState >= cropObj.minResolution && newResolutionState <= cropObj.maxResolution) {
            isAnyActiveCrop = true;
        }
    }, this);

    this.changeCropActive(isAnyActiveCrop);
};

PageWrapperManager.prototype.changeCropActive = function(newIsCropActive) {
    if (this.isCropActive !== newIsCropActive) {
        this.isCropActive = newIsCropActive;

        this.$pageWrapper.toggleClass(this.cropClass, this.isCropActive);

        if (!this.isCropActive) {
            amplify.publish('mainmenu:stopscrolldetect');
            $(window).scrollTop(this.savedScrollPosition);
            amplify.publish('mainmenu:resumescrolldetect');
        }
    }
};

PageWrapperManager.prototype.requestMobileCrop = function(requesterId) {
    return this.request(requesterId, {maxResolution: ResolutionManager.RESOLUTION_MOBILE_WIDE});
};

PageWrapperManager.prototype.requestTabletCrop = function(requesterId) {
    return this.request(requesterId, {maxResolution: ResolutionManager.RESOLUTION_TABLET});
};

function Crop(requesterId, options) {
    var defaultOptions = {
            minResolution: ResolutionManager.RESOLUTION_MIN,
            maxResolution: ResolutionManager.RESOLUTION_MAX,
            id: _.uniqueId('pageWrapperCrop_')
        };

    this.options = $.extend({}, defaultOptions, options);

    this.requesterId = requesterId;
    this.id = this.options.id;
    this.minResolution = this.options.minResolution;
    this.maxResolution = this.options.maxResolution;
}

window.PageWrapperManager = new PageWrapperManager();

})(jQuery, _, amplify, ResolutionManager);
