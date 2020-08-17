wgsdk.InputWatcher = (function($) {
    var obj = function($selector, preprocessor, onChange, postprocessor, events) {
        var instance = this,
            defaultEvents = 'input.iw propertychange.iw change.iw forceCheck.iw';

        if (typeof(events) !== 'string' || events.length === 0) {
            events = defaultEvents;
        }

        this.oldValue = '';
        this.$selector = $selector;

        // public interfaces
        this.getValue = function() {
            return this.$selector.val();
        };
        this.setValue = function(value, apply) {
            if (typeof postprocessor === 'function') {
                value = postprocessor(value, apply, this.oldValue);
            }
            this.$selector.val(value);
            if (apply) {
                instance.oldValue = value;
            }
        };
        this.restoreValue = function() {
            this.setValue(instance.oldValue, false);
        };
        this.destroy = function() {
            this.$selector.off('.iw');
        };
        this.processChange = function(e) {
            var value = instance.getValue(), v;

            if (preprocessor) {
                v = preprocessor(value);
                if (v != value) {
                    instance.setValue(v, false);
                    value = instance.getValue();
                }
            }
            if (value != instance.oldValue || e.type === 'forceCheck') {
                if (onChange) {
                    onChange(value, instance.oldValue);
                }
                instance.oldValue = value;
            }
        };
        this.stopWatch = function() {
            this.$selector.off(events);
        };
        this.startWatch = function() {
            this.$selector.on(events, this.processChange);
        };

        this.startWatch();
    }

    return obj;
})($);

wgsdk.AjaxFetcher = (function($){

    var obj = function (defAjaxSettings, requestStarted, requestFinished, delay){
        var instance = this;
        var curAjax;
        var curAjaxTimer;

        function onError(XMLHttpRequest, textStatus, errorThrown){
            requestFinished(null);
            instance.cleanRequest();
        }
        function onSuccess(data, textStatus, XMLHttpRequest){
            requestFinished(data);
            instance.cleanRequest();
        }

        this.sendRequest = function(data, instant){
            instance.cancelRequest();

            var settings = {    'dataType': 'json',
                                'success': onSuccess,
                                'error': onError};

            $.extend(true, settings, defAjaxSettings, {'data': data});

            function sendIt(){
                if(requestStarted)
                    requestStarted(settings);

                curAjax = $.ajax(settings);
            }
            if( !instant && delay && (delay > 0))
                curAjaxTimer = window.setTimeout(sendIt, delay);
            else
                sendIt();
        };

        this.cancelRequest = function(){
            if(curAjax || curAjaxTimer)
                onError();  //   cleanRequest is called from it
        };
        this.cleanRequest = function(){
            if(curAjaxTimer){
                window.clearTimeout(curAjaxTimer);
                curAjaxTimer = null;
            }

            if(curAjax){
                curAjax.abort();
                curAjax = null;
            }
        };
    }
    return obj;

})($)

wgsdk.NoAjaxFetcher = (function ($){
    var obj = function(getDataCallback, requestStarted, requestFinished){
        this.sendRequest = function(data, instant){
            requestFinished(getDataCallback(data));
        };

        this.cancelRequest = function(){
            requestFinished(null);
        };
    }
    return obj
})($)

wgsdk.autocomplete = (function($, wgsdk) {
    'use strict';

    var globalAutocompleteCounter = 0,
        KEY_BACKSPACE = 8,
        KEY_ENTER = 13,
        KEY_ESCAPE = 27,
        KEY_DOWN = 40,
        KEY_UP = 38,
        ON_BLUR_HIDE_TIMEOUT = 200,
        CONTAINER_SELECTOR = '.js-autocomplete-container';

    var module = function (inputSelector, url, options) {

        var autocompleteContainerId = 'js-autocomplete-container-' + (++globalAutocompleteCounter),
            defaults = {
                'autosubmit': false,   /* Submit form on click/enter */
                'minlength': 0,
                'preprocessor': function(value, prefix) {
                    value = $.trim(value);
                    prefix = $.trim(prefix);
                    var matchedSubstrIndex = value.toLowerCase().indexOf(prefix.toLowerCase());
                    value = value.substr(0, matchedSubstrIndex) + '<span class="b-autocomplete_match">'+value.substr(matchedSubstrIndex, prefix.length)+'</span>'+value.substr(matchedSubstrIndex+prefix.length);
                    return value;
                },
                'zindex': null,
                'customWrapper': null,
                'postprocessor': null,
                'dataprocessor': null,  /* AJAX params processor before send */
                'changeCallback': null,
                'responseDataPreprocessor':null
            },
            $input, $lines, $wrapper, $wrapperContainer, $template, watcher, fetcher, searchValue, $form;

        options = $.extend({}, defaults, options);

        function getItemContainer() {
            if (options.customWrapper === null) {
                return $wrapper;
            } else {
                return $wrapperContainer;
            }
        }

        function updatePosition() {
            var inputOffset = $input.offset();

            $wrapper
                .outerWidth($input.outerWidth())
                .css({
                    'top' : inputOffset.top + $input.outerHeight(),
                    'left': inputOffset.left
                });
        }

        function getSelected() {
            return $('.b-autocomplete_item__selected:first');
        }

        function hasScroll() {
            var $container = getItemContainer(),
                scrollHeight = $container[$.fn.prop ? 'prop' : 'attr']('scrollHeight');

            return $container.height() < scrollHeight;
        }

        function setSelected($sel) {
            getSelected().removeClass('b-autocomplete_item__selected');

            if ($sel && $sel.length > 0) {
                $sel.addClass('b-autocomplete_item__selected');

                if (hasScroll()) {
                    var $container = getItemContainer(),
                        offset = $sel.offset().top - $container.offset().top,
                        scroll = $container.scrollTop(),
                        elementHeight = $container.height();

                    if (offset < 0) {
                        $container.scrollTop(scroll + offset);
                    } else if (offset >= elementHeight) {
                        $container.scrollTop(scroll + offset - elementHeight + $sel.height());
                    }
                }
            }
        }

        function updateInputWithSelected(applyFilter) {
            var $sel = getSelected();

            if ($sel.length) {
                watcher.setValue($sel.text(), applyFilter);
                if (typeof options.changeCallback === 'function') {
                    options.changeCallback();
                }
            }
        }

        function restoreInput() {
            watcher.restoreValue();
            if (typeof options.changeCallback === 'function') {
                options.changeCallback();
            }
        }

        function isSuggestionVisible(){
            return $wrapper.css('display') !== 'none';
        }

        function setVisibility(show) {
            if (show !== isSuggestionVisible()) {
                if (show && $lines && $lines.length) {
                    updatePosition();
                    $wrapper.show();
                } else {
                    $wrapper.hide();
                }
            }
        }

        function applySelected() {
            fetcher.cancelRequest();
            updateInputWithSelected(true);
            setVisibility(false);

            // value was set by .val() call, which doesn't trigger change event
            $input.change();
        }

        function onRequestComplete(data) {
            var template, i, len, content, $newElement;

            if (data && data.result) {
                // overwrite template with new value or add to DOM
                if (data.tmpl) {
                    template = $(data.tmpl).hide();
                    if ($template) {
                        $template.replaceWith(template);
                    } else {
                        $input.after(template);
                        $template = template;
                    }
                }
                if (!$template && !data.tmpl) {
                    $template = $('<div></div>');
                }

                $lines = undefined;
                getItemContainer().empty();

                if ($template) {

                    $('.js-autocomplete').remove();

                    if (typeof options.responseDataPreprocessor === 'function') {
                        data = options.responseDataPreprocessor(data);
                    }

                    for (i = 0, len = data.result.length; i < len; ++i) {
                        content = data.result[i].text;
                        if (typeof options.preprocessor === 'function') {
                            content = options.preprocessor(content, searchValue, data.result[i]);
                        }
                        $newElement = $template.clone().addClass('js-autocomplete b-autocomplete_item').html(content).show();

                        getItemContainer().append($newElement);

                    }
                    $lines = $('.js-autocomplete');
                    setVisibility(data.result.length > 0 ? true : false);
                }

                $lines
                    .on('click', function() {

                        applySelected();
                        $input.focus();
                        if (options.autosubmit) {
                            $form = $input.closest('form');
                            $form.submit();
                        }

                    })
                    .hover(
                        function(e) { setSelected($(this)); },
                        function(e) { setSelected(null); }
                    );

            } else {
                setVisibility(false);
            }
        }

        function preventAutocomplete() {
            fetcher.cancelRequest();
            setVisibility(false);
        }

        function destroy() {
            preventAutocomplete();
            if ($input.length) {
                $wrapper.remove();
                $input.off('.autocomplete');
                $input.parents('form:first').off('.autocomplete');
            }
            if (watcher) {
                watcher.destroy();
            }
        }

        function onValueChange(value, oldValue) {
            var data = {'fl': value};

            if (value.length === 0 || value.length < options.minlength) {
                fetcher.cancelRequest();
                setVisibility(false);
                return;
            }

            searchValue = value;

            if (!$template) {
                data.tmpl = 1;
            }

            if (typeof options.dataprocessor === 'function') {
                data = options.dataprocessor(data);
            }

            fetcher.sendRequest(data, false);
        }


        $(function() {

            $input = $(inputSelector);

            if ($input.length) {
                if (options.customWrapper === null) {
                    $wrapper = $('<div class="b-autocomplete"></div>');
                } else {
                    $wrapper = $(options.customWrapper);
                    $wrapperContainer = $wrapper.find(CONTAINER_SELECTOR);
                }

                if (options.zindex !== null) {
                    $wrapper.css('zIndex', options.zindex + globalAutocompleteCounter);
                }

                $wrapper
                    .attr('id', autocompleteContainerId)
                    .hide()
                    .appendTo('body');
                $wrapper.trigger('appended');

                $input.on('keydown.autocomplete', function(event) {
                    if (event.keyCode === KEY_BACKSPACE) {
                        setTimeout(function() { $input.trigger('input'); }, 1); // IE 9 doesn't trigger 'input' event on backspace
                    }

                    if (event.keyCode === KEY_ENTER) {
                        fetcher.cancelRequest();
                    }

                    if (!options.autosubmit && isSuggestionVisible() && event.keyCode === KEY_ENTER) {
                        applySelected();
                        event.preventDefault();
                    }
                });

                $input.on('keyup.autocomplete', function(event) {
                    var $selected;

                    if (!isSuggestionVisible()) {
                        return;
                    }

                    // suggestions navigation.
                    if(event.keyCode === KEY_ESCAPE) {
                        restoreInput();
                        setVisibility(false);
                    }

                    if ($lines && (event.keyCode === KEY_UP || event.keyCode === KEY_DOWN)) {
                        // select next element
                        $selected = getSelected();
                        if ($selected.length) {
                            setSelected((event.keyCode === KEY_UP) ? $selected.prev() : $selected.next());
                        } else {
                            setSelected((event.keyCode === KEY_UP) ? $lines.last() : $lines.first());
                        }

                        watcher.stopWatch(); /* IE 7/8 fires propertychange */
                        // if no selection. restore user's input
                        if (getSelected().length) {
                            updateInputWithSelected(false);
                        } else {
                            restoreInput();
                        }
                        watcher.startWatch();
                    }
                });

                $input.parents('form:first').on('submit.autocomplete', function(event) {
                    if (isSuggestionVisible()) {
                        applySelected();
                    }
                });

                $input.on('blur.autocomplete', function(event) {
                    if (isSuggestionVisible()) {
                        setTimeout(function() {
                            setVisibility(false);
                        }, ON_BLUR_HIDE_TIMEOUT);   // give some time to process click on suggestion element
                    }
                });

                watcher = new wgsdk.InputWatcher($input, null, onValueChange, options.postprocessor);
                if (typeof(url) === 'function') {
                    fetcher = new wgsdk.NoAjaxFetcher(url, null, onRequestComplete);
                } else {
                    fetcher = new wgsdk.AjaxFetcher({'url': url}, null, onRequestComplete, 600);
                }

            }

        });

        // API
        return {
            setVisibility: setVisibility,
            preventAutocomplete: preventAutocomplete,
            destroy: destroy
        };
    };

    module.helpers = {};

    module.helpers.clansPreprocessor = function(value, prefix) {
        var regex = /^(\[[^\]]*\])?\s*(.+)?/i,
            result = regex.exec($.trim(value)),
            tag = result[1],
            name = result[2];

        tag = tag.substr(1, tag.length - 2);
        prefix = $.trim(prefix).toLowerCase();

        function highlightAndEscape(inputString, searchString)  {
            var matchedIndex = inputString.toLowerCase().indexOf(searchString);

            if (matchedIndex !== -1) {
                inputString = _.escape(inputString.substr(0, matchedIndex)) +
                              '<span class="b-autocomplete_match">' +
                              _.escape(inputString.substr(matchedIndex, searchString.length)) +
                              '</span>' +
                              _.escape(inputString.substr(matchedIndex + searchString.length));
            } else {
                inputString = _.escape(inputString);
            }

            return inputString;
        }

        return '[' + highlightAndEscape(tag, prefix) + '] ' + highlightAndEscape(name, prefix);
    };

    return module;

})(jQuery, wgsdk);


wgsdk.clearer = (function($) {
    'use strict';

    var module = function(inputSelector, clrSelector, options) {
        var $instance = $(clrSelector),
            $input = $(inputSelector),
            defaults = {
                clearCallback: undefined
            };

        options = $.extend({}, defaults, options);

        if (!($input.length && $instance.length)) {
            return;
        }

        function show() {
            $instance.css('display', 'block');
        }

        function hide() {
            $instance.css('display', 'none');
        }

        function update() {
            if ($input.val() !== '') {
                show();
            } else {
                hide();
            }
        }

        $input.keyup(update);

        $instance.click(function(e) {
            $instance.css('display', 'none');
            if (typeof options.clearCallback === 'function') {
                options.clearCallback(e);
            }
        });

        // API
        return {
            'update': update,
            'hide': hide,
            'show': show
        };
    };

    return module;

})(jQuery);