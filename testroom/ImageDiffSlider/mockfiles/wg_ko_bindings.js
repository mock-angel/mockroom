(function(window, ko, wgsdk, _, $, Spinner) {

'use strict';

ko.bindingHandlers.thousands = {
    update: function(element, valueAccessor) {
        var options = valueAccessor(),
            value = ko.unwrap(options),
            needReduce = false,
            reduceFrom = false;

        // Additional options (eg. needReduce/reduceFrom).
        if (options && typeof(options) === 'object') {
            value = ko.unwrap(options.value);
            needReduce = options.needReduce;
            reduceFrom = options.reduceFrom;
        }

        // Format number using wgSDK.
        value = wgsdk.thousands(parseFloat(value) || 0, needReduce, reduceFrom);

        // Update element text content using already defined function.
        ko.utils.setTextContent(element, value);
    }
};

ko.bindingHandlers.paramThousandsOrDash = {
    update: function(element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());

        if (value === 0) {
            value = '–';
        } else {
            if (value % 1 !== 0) {
                value = value.toFixed(2);
            }

            // Format number using wgSDK.
            value = wgsdk.thousands(parseFloat(value) || 0);
        }

        // Update element text content using already defined function.
        ko.utils.setTextContent(element, value);
    }
};

ko.bindingHandlers.cssmod = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());

        if (value !== null && typeof value === 'object') {

            ko.utils.objectForEach(value, function(classPrefix, value) {
                var classes = element.className.split(' '),
                    postfix = ko.utils.unwrapObservable(value);

                classes = _.filter(classes, function(item) {
                    return (item.indexOf(classPrefix) !== 0);
                });

                if (postfix) {
                    classes.push(classPrefix + postfix);
                }

                element.className = classes.join(' ');
            });
        }
    }
};

ko.bindingHandlers.roman = {
    update: function(element, valueAccessor, allBindings) {
        var value = valueAccessor(),
            num = ko.unwrap(value);

        $(element).text(wgsdk.roman(num));
    }
};

ko.bindingHandlers.formatShortDate = {
    update: function(element, valueAccessor) {
        var timeStamp = ko.unwrap(valueAccessor()),
            value;

        // Format timestamp using Date extension from wgSDK.time.
        value = new Date(timeStamp).formatShortDate();

        // Update element text content using already defined function.
        ko.utils.setTextContent(element, value);
    }
};

ko.bindingHandlers.formatShortTimeDate = {
    update: function(element, valueAccessor) {
        var dateTime = new Date(ko.unwrap(valueAccessor())),
            now = new Date(),
            isYearVisible = (dateTime.getYear() !== now.getYear()),
            value;

        value = dateTime.wotFormatTimeHM() + ', ' + (isYearVisible ? dateTime.wotToLocaleDateStringShort() : dateTime.wotToLocaleDateStringShortWithoutYear());

        ko.utils.setTextContent(element, value);
    }
};

ko.bindingHandlers.formatDateTime = {
    update: function(element, valueAccessor) {
        var dateTime = new Date(ko.unwrap(valueAccessor()));

        ko.utils.setTextContent(element, dateTime.wotDateTimeString());
    }
};

ko.bindingHandlers.formatDate = {
    update: function(element, valueAccessor) {
        var date = new Date(ko.unwrap(valueAccessor()));

        ko.utils.setTextContent(element, date.wotDateString());
    }
};

ko.bindingHandlers.leadingZero = {
    update: function(element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());

        if (value !== undefined && String(value).length === 1) {
            value = '0' + value;
        }

        ko.utils.setTextContent(element, value);
    }
};

ko.bindingHandlers.formatDateRange = {
    update: function(element, valueAccessor) {
        var values = ko.unwrap(valueAccessor()), // startDate, endDate, options
            formatOptions = values[2] || {},
            _delimiter = formatOptions.delimiter,
            startDate = new Date(values[0]),
            endDate = new Date(values[1]),
            value;

        // Update element text content using already defined function.
        ko.utils.setTextContent(element, wgsdk.time.formatDatesRange(startDate, endDate, _delimiter));
    }
};

ko.bindingHandlers.relativeTime = {
    update: function(element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());

        if (!_.isFinite(parseInt(value, 10))) {
            return;
        }

        $(element).datetime({'timestamp': value, 'style': 'relative'});
    }
};

ko.bindingHandlers.interpolateText = {
    update: function(element, valueAccessor) {
        var data = ko.unwrap(valueAccessor()),
            plain = _.get(data, 'plain', {}),
            thousands = _.mapValues(_.get(data, 'thousands', {}), wgsdk.thousands),
            roman = _.mapValues(_.get(data, 'roman', {}), wgsdk.roman),
            formatDateTime = _.mapValues(_.get(data, 'formatDateTime', {}), function(date) { return ((new Date(date)).wotDateTimeString()); }),
            text;

        text = window.interpolate(data.text, _.merge(plain, thousands, roman, formatDateTime), true);

        ko.utils.setTextContent(element, text);
    }
};

ko.bindingHandlers.formatFloatToFixedTwo = {
    update: function(element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());

        if (isNaN(parseFloat(value)) || !isFinite(value)) {
            value = 0;
        }

        value = parseFloat(value).toFixed(2);
        // Format number using wgSDK
        value = wgsdk.thousands(value, false, false);

        // Update element text content using already defined function
        ko.utils.setTextContent(element, value);
    }
};

ko.bindingHandlers.outsideClick = {
    /**
     * Binds element to outside click
     *
     * @param {DOMElement} element
     * @param {Object} valueAccessor
     * @param {Object} valueAccessor.isVisible - observable which can tell is element visible or not
     * @param {Object} valueAccessor.callback - callback to be executed when element is visible and user clicks outside it
     */
    update: function(element, valueAccessor) {
        var data = valueAccessor(),
            isVisible = ko.unwrap(data.visible),
            callback = data.callback,
            unsubscribe = function() {
                if (element.__outsideClickHandler) {
                    $(document.body).off('click', element.__outsideClickHandler);

                    element.__outsideClickHandler = null;

                    ko.utils.domNodeDisposal.removeDisposeCallback(element, unsubscribe);
                }
            };

        if (isVisible) {
            element.__outsideClickHandler = function(e) {
                if (!$(e.target).closest(element).length) {
                    callback();
                }
            };

            setTimeout(function() {
                $(document.body).on('click', element.__outsideClickHandler);

                ko.utils.domNodeDisposal.addDisposeCallback(element, unsubscribe);
            }, 0);
        } else {
            unsubscribe();
        }
    }
};

ko.bindingHandlers.spinner = {
    init: function (element, valueAccessor, allBindings) {
        var deferred = $.Deferred();

        element.spinner = deferred.promise();

        // force this to the bottom of the event queue in the rendering thread,
        // so we can get the computed color of the containing element after other bindings
        // (e.g. class, style) have evalutated.
        // add some more delay as the class bindings of the parent fire asynchronously.
        setTimeout(function () {
            var options = {};
            options.color = $(element).css('color');
            $.extend(options, ko.bindingHandlers.spinner.defaultOptions, ko.unwrap(allBindings.get('spinnerOptions')));

            deferred.resolve(new Spinner(options));
        }, 30);
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        // when the spinner exists, pick up the existing one and call appropriate methods on it
        var result = ko.unwrap(valueAccessor());

        element.spinner.done(function(spinner) {
            if (result) {
                $(element).show();
                spinner.spin(element);
            } else {
                if (spinner.el) { // don't stop first time
                    spinner.stop();
                }

                $(element).hide();
            }
        });
    },
    defaultOptions: {
        lines: 11, // The number of lines to draw
        length: 20, // The length of each line
        width: 13, // The line thickness
        radius: 32, // The radius of the inner circle
        scale: 0.18, // Scales overall size of the spinner
        corners: 1, // Corner roundness (0..1)
        color: '#f25322', // #rgb or #rrggbb or array of colors
        opacity: 0.1, // Opacity of the lines
        rotate: 44, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        speed: 1.4, // Rounds per second
        trail: 79, // Afterglow percentage
        fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '7px', // Top position relative to parent
        left: '50%', // Left position relative to parent
        shadow: false, // Whether to render a shadow
        hwaccel: true, // Whether to use hardware acceleration
        className: 'js-spinner', // The CSS class to assign to the spinner
        position: 'absolute' // Element positioning
    }
};

ko.bindingHandlers.formatFloat = {
    update: function(element, valueAccessor) {
        var value = ko.unwrap(valueAccessor());

        if (!isNaN(parseFloat(value)) && isFinite(value)) {
            if ((value % 1) === 0) {
                value = parseFloat(value);
            } else if ((value * 10 % 1) === 0) {
                value = parseFloat(value).toFixed(1);
            } else {
                value = parseFloat(value).toFixed(2);
            }
        } else {
            value = 0;
        }

        // Format number using wgSDK.
        value = wgsdk.thousands(value, false, false);

        // Update element text content using already defined function.
        ko.utils.setTextContent(element, value);
    },
};

})(window, ko, wgsdk, _, jQuery, Spinner);
