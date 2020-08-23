function is_auth_user() {
    var IS_AUTH_COOKIE_NAME = 'hlauth';

    return $.cookie(IS_AUTH_COOKIE_NAME);
}

function get_lang() {
    return wgsdk.vars.CURRENT_REQUEST_LANGUAGE ||
           $.cookie(wgsdk.vars.LANG_COOKIE_NAME) ||
           wgsdk.vars.DEFAULT_LANGUAGE;
}


wgsdk.account_info = (function($) {
    var obj = function() {
        var dataFromCookie = null,
            oldCookieRawMode = $.cookie.raw,
            instance = {},
            data;

        $.cookie.raw = true;
        data = $.cookie(wgsdk.vars.ACCOUNT_INFO_COOKIE_NAME);
        $.cookie.raw = oldCookieRawMode;

        if (data) {
            if (data.indexOf('"') === 0) {
                /* This is a quoted cookie as according to RFC2068, unescape */
                data = data.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }

            try {
                /* UTF-8 base64 decode */
                data = decodeURIComponent(Array.prototype.map.call(atob(data), function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                dataFromCookie = JSON.parse(data);
            } catch (e) {
                data = undefined;
                dataFromCookie = null;
            }
        }

        instance.hasData = function() {
            if (dataFromCookie) {
                return true;
            }
            return false;
        };

        instance.queue = function(callback) {
            if (instance.hasData()) {
                callback(instance);
            } else {
                instance.update_cookie_from_server(callback);
            }
        };

        instance.getByKey = function (key, defaultValue) {
            defaultValue = (typeof default_value !== 'undefined' ? defaultValue : '');
            if (!dataFromCookie || !dataFromCookie[key]) {
                return defaultValue;
            }
            return dataFromCookie[key];
        };

        instance.hasFriends = function() {
            return instance.getByKey('has_friends', false);
        };
        instance.hasClanmates = function() {
            return instance.getByKey('has_clanmates', false);
        };
        instance.get_loginname = function() {
            return instance.getByKey('loginname');
        };
        instance.get_clan_id = function() {
            return instance.getByKey('clan_id');
        };
        instance.get_clan_tag = function() {
            return instance.getByKey('clan_tag');
        };
        instance.get_clan_leader_id = function() {
            return instance.getByKey('clan_leader_id', null);
        };
        instance.get_clan_color = function() {
            return instance.getByKey('clan_color', null);
        };
        instance.get_clan_name = function() {
            return instance.getByKey('clan_name', null);
        };
        instance.is_premium_active = function() {
            return instance.getByKey('is_premium_active', false);
        };
        instance.get_battles_count = function() {
            return instance.getByKey('battles_count', 0);
        };
        instance.get_spa_id = function() {
            return instance.getByKey('spa_id') || 0;
        };
        instance.get_nickname = function() {
            return instance.getByKey('nickname');
        };
        instance.is_staff = function() {
            return instance.getByKey('is_staff', 0);
        };
        instance.get_game_ban = function() {
            return instance.getByKey('game_ban');
        };

        instance.update_cookie_from_server = function(callback) {
            var intervalId;

            if (wgsdk.vars.AJAX_ACCOUNT_INFO_REQUEST) {
                intervalId = setInterval(function() {
                    var accountInfo;

                    if (!wgsdk.vars.AJAX_ACCOUNT_INFO_REQUEST) {
                        accountInfo = wgsdk.account_info();

                        clearInterval(intervalId);

                        if (typeof callback === 'function') {
                            callback(accountInfo);
                        }
                    }
                }, 300);

                return;
            }

            wgsdk.vars.AJAX_ACCOUNT_INFO_REQUEST = $.ajax({
                url: wgsdk.vars.ACCOUNT_AJAX_INFO_URL,
                cache: false,
                type: 'GET',
                success: function() {
                    var accountInfo = wgsdk.account_info();

                    wgsdk.vars.AJAX_ACCOUNT_INFO_REQUEST = null;

                    if (typeof callback === 'function') {
                        callback(accountInfo);
                    }
                },
                error: function() {
                    wgsdk.vars.AJAX_ACCOUNT_INFO_REQUEST = null;
                }
            });
        };

        return instance;

    };
    return obj;
}(jQuery));
