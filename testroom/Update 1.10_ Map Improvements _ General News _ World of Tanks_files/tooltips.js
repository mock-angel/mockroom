(function($, Modernizr, amplify, _) {

'use strict';

var TOOLTIP_Z_INDEX = 11000,
    TOOLTIP_TIME_DELAY = 300,
    TOOLTIP_FADE_TIME = 100,
    TOOLTIP_OFFSET_X = 15,
    TOOLTIP_OFFSET_Y = 20,
    POPUP_OFFSET_X = 10,
    POPUP_OFFSET_Y = 20;

var hlCurrentTooltipId = '';

window.tooltipReset = function() {
    $('#js-tooltip-container').html('');
};

if ((Modernizr.pointermq && !Modernizr.hovermq) || (!Modernizr.pointermq && Modernizr.touchevents)) {
    return;
}

function getTooltipId(elem, prefix, id) {
    var tooltipId = '',
        cls = elem.prop('className'),
        patt = /js-tooltip-id_([-\w]+)/,
        result = patt.exec(cls);

    if (result && result.length > 0) {
        tooltipId = result[1];
        return tooltipId;
    }

    if (id != null) {
        tooltipId = id + prefix;
    } else if (elem.prop('id') != '') {
        tooltipId = elem.prop('id') + prefix;
    }

    return tooltipId;
}

$(function() {
    $(document).on('mouseenter.tooltip', '.js-tooltip', function(e) {
        var $element = $(this),
            TOOLTIP_MOUSEENTER_THRESHOLD = 2;

        if ($element.is('input[type=text]')) {

            /* IE 9-11 triggers mouseenter even outside input element if left mouse button was pressed in input */
            if (e.offsetX < -TOOLTIP_MOUSEENTER_THRESHOLD ||
                e.offsetY < -TOOLTIP_MOUSEENTER_THRESHOLD ||
                e.offsetX > $element.outerWidth() + TOOLTIP_MOUSEENTER_THRESHOLD ||
                e.offsetY > $element.outerHeight() + TOOLTIP_MOUSEENTER_THRESHOLD) {

                return false;
            }
        }

        tooltip.call(this, e);
    });

    $(document).on('mouseenter.popup', '.js-popup', popup);

    if (!$('#js-tooltip-container').length) {
        $('body').append('<div id="js-tooltip-container"></div>');
    }
});

function tooltip(event) {
    tooltipBasic(event, {
        'popup': false,
        'target': this
    });
}

function popup(event) {
    tooltipBasic(event, {
        'popup': true,
        'target': this
    });
}

function tooltipBind(target_obj, tooltip_obj) {
    target_obj.on('mouseenter', function(event) {
        tooltipBasic(event, {
            'popup': false,
            'tooltip': tooltip_obj,
            'target': this
        });
    });
}

function tooltipBasic(event, param) {
    var url = param.url,
        id, strar,
        tooltip, tooltipName, tooltipId,
        html, errorText;

    // do not spam with selectors
    var container = $('#js-tooltip-container'),
        target = $(param.target);

    if (url != null) {
        id = '';
        strar = url.substring(0, id.lastIndexOf('?')).split('/');

        for (var idx in strar) {
            if (strar[idx].length > 0)
                id = id + strar[idx] + '_';
        }

        id = id.substring(0, id.lastIndexOf('_'));
        param.id = id;
    } else if (param.id != null) {
        id = param.id;
    } else {
        id = target.prop('id');
    }

    if (param.popup == null) {
        param.popup = false;
    }

    if (param.tooltip) {
        tooltip = param.tooltip;
    } else {
        tooltipName = getTooltipId(target, param.popup ? '_popup' : '_tooltip', id);
        tooltipId = '#' + tooltipName;
        tooltip = $(tooltipId);

        if (tooltip.length) {
            tooltip = tooltip.clone();
        } else if (target.data('tooltipText') !== undefined) {
            tooltip = $('<div />').addClass('b-tooltip-main').text(target.data('tooltipText'));
        } else if (target.hasClass('js-tooltip-only-overflow')) {
            tooltip = $('<div />').addClass('b-tooltip-main').html(target.html());
        }
    }

    container.html(tooltip.detach());

    tooltip
        .hide()
        .css({'position': 'absolute',
              'z-index': TOOLTIP_Z_INDEX});

    if (typeof id == 'string') {
        if (url == null) {
            url = '';
            strar = id.split('_');

            for (id in strar) {
                url = url + '/' + strar[id];
            }

            if (param.popup) {
                url = url + '/?info=popup';
            } else {
                url = url + '/?info=tooltip';
            }
        }
    } else {
        return;
    }

    var showTooltip = function(isLoaded) {
        var popupTimeout,
            savedMouseMove,
            fadeInCb = function($source) {
                tooltip.css('opacity', 1);
                amplify.publish('tooltip:show', {namespace: ($source ? $source.data('tooltipNamespace') : undefined)});
            };

        if (hlCurrentTooltipId != '' && hlCurrentTooltipId != tooltipId) {
            clearTimeout(popupTimeout);
            $(hlCurrentTooltipId).fadeOut(0);
        }

        if (param.popup && hlCurrentTooltipId == tooltipId) {
            $(tooltipId).hide();
        }

        if ($(target).hasClass('js-tooltip-only-overflow') && target.get(0).offsetWidth >= target.get(0).scrollWidth) {
            return;
        }

        hlCurrentTooltipId = tooltipId;

        if (isLoaded) {
            tooltip.fadeIn(0, _.bind(fadeInCb, this, target));
        } else {
            tooltip
                .delay(TOOLTIP_TIME_DELAY)
                .queue(function(next) {
                    if (savedMouseMove && param.popup) {
                        setPosition(savedMouseMove);
                    }

                    next();
                })
                .fadeIn(TOOLTIP_FADE_TIME, _.bind(fadeInCb, this, target));
        }

        var tipSize = { x: tooltip.width(), y: tooltip.height() + 15 };

        var setPosition = function(event) {
            var $window  = $(window),
                offset   = { x: 0, y: 0 },
                mouse    = { x: event.pageX, y: event.pageY },
                coord    = { x: 0, y: 0 },
                scroll   = { x: $window.scrollLeft(), y: $window.scrollTop() },
                winSize = { x: $window.width(), y: $window.height() };

            if (param.popup) {
                offset = { x: POPUP_OFFSET_X, y: POPUP_OFFSET_Y };
            } else {
                offset = { x: TOOLTIP_OFFSET_X, y: TOOLTIP_OFFSET_Y };
            }

            if (mouse.x + tipSize.x + (offset.x * 3) > winSize.x + scroll.x) {
                coord.x = mouse.x  - tipSize.x - (offset.x * 2);
            } else {
                coord.x = mouse.x + offset.x;
            }

            if (mouse.y + tipSize.y + offset.y > winSize.y + scroll.y) {
                coord.y = Math.max(mouse.y - offset.y - tipSize.y, scroll.y + offset.y);
            } else {
                coord.y = mouse.y + offset.y;
            }

            tooltip.css({'left': Math.max(0, coord.x), 'top': coord.y});
        };

        setPosition(event);

        target
            .trigger('tooltipshow', [tooltip])
            .on('mousemove', function(event){
                if (param.popup) {
                    savedMouseMove = event;
                } else {
                    setPosition(event);
                }
            });

        var leave = function(event) {
            tooltip.clearQueue();

            if (param.popup) {
                clearTimeout(popupTimeout);

                popupTimeout = setTimeout(function() {
                    tooltip.delay(200).fadeOut(0);
                    target.off('mousemove');
                });

                tooltip.on('mouseenter', function() {
                    clearTimeout(popupTimeout);
                    tooltip.clearQueue();
                });

                tooltip.on('mouseleave', function(e) {
                    if (!$(e.target).hasClass('js-tooltip-no-leave')) {
                        clearTimeout(popupTimeout);

                        popupTimeout = setTimeout(function() {
                            tooltip
                                .fadeOut(0)
                                .off('mouseleave mouseenter');

                            target.off('mousemove');
                        }, 1000);
                    }
                });
            } else {
                if (hlCurrentTooltipId == tooltipId) {
                    hlCurrentTooltipId = '';
                }

                tooltip.fadeOut(0);
                target.off('mousemove');
            }

        };

        target.one('mouseleave', leave);
        $(window).one('unload', leave);
    };

    if (tooltip.length == 0) {
        html = '<div class="b-tooltip-main" id="' + tooltipName + '" style="position:absolute; z-index:' + TOOLTIP_Z_INDEX + ';"></div>';
        errorText = "<span style='color:#cd5c5c;font-weight:bold;'>" + translate('TOOLTIP_DOES_NOT_FOUND') + '</span>';

        $().add(html).appendTo(container).hide();
        tooltip.text(translate('TOOLTIP_LOADING'));

        try {
            $.ajax({
                'type': 'get',
                'url': url,
                'success': function(data) {
                    if (data && data != '')
                        tooltip.html(data);
                    else
                        tooltip.html(errorText);

                    showTooltip(true);
                },
                'error': function() {
                    tooltip.html(errorText);
                    showTooltip(true);
                }
            });
        }
        catch(er) {
            tooltip.html(errorText);
            showTooltip(true);
        }
    } else {
        showTooltip(false);
    }
}

})(jQuery, Modernizr, amplify, _);
