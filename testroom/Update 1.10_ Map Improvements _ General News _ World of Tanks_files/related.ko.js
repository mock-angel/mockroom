(function($, ko, _, amplify) {
    'use strict';

    var SUCCESS_STATUS = 'ok';

    $(function() {
        $('.js-related-component').each(function() {
            if (!ko.dataFor(this)) {
                ko.applyBindings({}, this);
            }
        });
    });

    ko.components.register('related', {
        viewModel: function(params) {
            this.relatedObjects = ko.observableArray();
            this.categoryLink = ko.observable('');

            if (!params.url) {
                if (params.relations) {
                    this.relatedObjects(params.relations);

                    ko.tasks.schedule(function() {
                        amplify.publish('relatedcontent:ready', params.type, params.widget_id || '0');
                    });
                }

                return;
            }

            $.ajax({
                url: params.url,
                dataType: 'json',
                context: this,
                success: function(response) {
                    if (response.status !== SUCCESS_STATUS || response.results.length === 0) {
                        return;
                    }

                    // Set default value for category
                    _.each(response.results, function(item) {
                        item.category = item.category || '';
                    });

                    // BE can't pass link for all items separately
                    // so we get it from item (any item)
                    if (response.results.length && response.results[0].category_url) {
                        this.categoryLink(response.results[0].category_url);
                    }

                    this.relatedObjects(response.results);

                    amplify.publish('relatedcontent:ready', params.type, params.widget_id || '0');
                }
            });
        },
        template: '<!-- ko template: {nodes: $componentTemplateNodes, data: $data} --><!-- /ko -->'
    });
})(jQuery, ko, _, amplify);
