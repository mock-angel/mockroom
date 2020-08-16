(function ($, _, amplify) {
    'use strict';

    function ResolutionManager() {
        this.init();
    }

    ResolutionManager.prototype.RESOLUTION_MOBILE = 0;
    ResolutionManager.prototype.RESOLUTION_MOBILE_WIDE = 5;
    ResolutionManager.prototype.RESOLUTION_TABLET = 10;
    ResolutionManager.prototype.RESOLUTION_TABLET_WIDE = 20;
    ResolutionManager.prototype.RESOLUTION_DESKTOP = 30;
    ResolutionManager.prototype.RESOLUTION_DESKTOP_WIDE = 40;
    ResolutionManager.prototype.RESOLUTION_DESKTOP_WIDER = 50;

    ResolutionManager.prototype.RESOLUTION_MIN = 0;
    ResolutionManager.prototype.RESOLUTION_MAX = 50;

    ResolutionManager.prototype.init = function() {
        this.oldState = this.getCurrentState();
        $(window).on('resize.resolution', _.bind(_.debounce(this.resizeHandler, 100), this));
    };

    ResolutionManager.prototype.getCurrentState = function() {
        return Number($('.support').css('z-index'));
    };

    ResolutionManager.prototype.resizeHandler = function() {
        var currentState = this.getCurrentState();

        if (currentState !== this.oldState) {
            amplify.publish('resolution:statechanged', currentState);
            this.oldState = currentState;
        }
    };

    window.ResolutionManager = new ResolutionManager();

})(jQuery, _, amplify);
