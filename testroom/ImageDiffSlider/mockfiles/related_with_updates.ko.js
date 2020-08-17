(function(ko, _, UpdatesStorage) {
    'use strict';

    var ARTICLE_ARCHIVED_STATUS = 'archive';

    ko.components.get('related', function(definition) {
        ko.components.register('relatedWithUpdates', {
            viewModel: function(params) {
                var baseViewModel = definition.createViewModel(params);

                _.extend(this, baseViewModel);

                this.isArticleUpdated = function(articleData) {
                    var slug = articleData.slug,
                        lastArticlePromotedTimeStamp,
                        lastVisitedTimestamp;

                    if (!slug) {
                        return false;
                    }

                    lastVisitedTimestamp = parseInt(UpdatesStorage.get()[slug], 10);

                    if ((_.isString(articleData.status) && articleData.status.toLowerCase() === ARTICLE_ARCHIVED_STATUS) || !_.isFinite(lastVisitedTimestamp)) {
                        return false;
                    }

                    lastArticlePromotedTimeStamp = parseInt(articleData.promoted_at, 10) || 0;
                    lastArticlePromotedTimeStamp *= 1000;

                    return (lastVisitedTimestamp < lastArticlePromotedTimeStamp);
                };
            },
            template: definition.template
        });
    });
})(ko, _, UpdatesStorage);
