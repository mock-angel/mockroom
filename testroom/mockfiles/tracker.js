/**
 * ReferTracker script.
 *
 * See init examples below.
 * Note if data-attributes passed you don't need to call init.
 *
 * 1. Sync load, pass site identifications:
 *
 * <script src="refer-tracker.js"></script>
 * <script>
 *     WG.ReferTracker.init({'realm': 'ru', 'project': 'wowp', 'service': 'ptl'});
 * </script>
 *
 * 2. Sync load, pass campaign identifications:
 *
 * <script src="refer-tracker.js"></script>
 * <script>
 *     WG.ReferTracker.init({
 *         'campaign':'vnwtd159',
 *         'selectors': [
 *             { 'selector': '#js-cds-content-38667 > a', 'place': 'pff', 'method': 'append' },
 *             { 'selector': '.js-cm-reg-link', 'place': 'cmenu', 'method': 'replace' }]
 *         }
 *     );
 * </script>
 *
 * 3. Async load, pass site identifications:
 *
 * <script>
 *      (function(w,d,s,p) {
 *          var f=d.getElementsByTagName(s)[0],j=d.createElement(s),i;
 *          j.async=true;j.src=p['script'];j.setAttribute('id', 'wgtr-loader');
 *          for(i in p) {if (p.hasOwnProperty(i)) {j.setAttribute('data-'+i,p[i]);}}
 *          f.parentNode.insertBefore(j,f);
 *      })(window,document,'script',{'script':'refer-tracker.js','realm':'ru','project':'wowp','service':'ptl'});
 *  </script>
 *
 *  4. Async load, pass campaign identifications:
 *
 * <script>
 *      (function(w,d,s,p) {
 *          var f=d.getElementsByTagName(s)[0],j=d.createElement(s),i;
 *          j.async=true;j.src=p['script'];j.setAttribute('id', 'wgtr-loader');
 *          for(i in p) {if (p.hasOwnProperty(i)) {j.setAttribute('data-'+i,p[i]);}}
 *          f.parentNode.insertBefore(j,f);
 *      })(window,document,'script',{'script':'refer-tracker.js','campaign':'vnwtd159','selectors':
 *      '[{ "selector": "#js-cds-content-38667 > a", "place": "pff", "method": "replace" },
 *      { "selector": "[data-cm-event=\'registration\']", "place": "cmenu", "method": "replace" }]'});
 *  </script>

 */
(function() {

    /**
     * namespace
     */
    var WGRT = {};

    /**
     * @module utils
     * @namespace WGRT
     */
    (function(utils, global) {

        var arrayPrototype = Array.prototype,
            objectPrototype = Object.prototype,
            nativeForEach = arrayPrototype.forEach,
            slice = arrayPrototype.slice,
            hasOwnProp = objectPrototype.hasOwnProperty;

        utils.extend = function() {
            var args = slice.call(arguments),
                target = args[0] || {},
                length = args.length,
                i, obj, key;

            for (i = 1; i < length; i++) {
                obj = args[i];

                for (key in obj) {
                    if (obj[key] !== undefined) {
                        target[key] = obj[key];
                    }
                }
            }

            return target;
        };

        utils.getCookie = function (name) {
            var matches = global.document.cookie.match(new RegExp(
                '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
            ));

            return (matches ? decodeURIComponent(matches[1]) : undefined);
        };

        utils.setCookie = function(key, value, options) {
            var updatedCookie;

            options = (options || {});
            options.expires = options.expires.toUTCString();

            value = encodeURIComponent(value);
            updatedCookie = key + '=' + value;

            for (key in options) {
                if (options.hasOwnProperty(key)) {
                    updatedCookie += '; ' + key + '=' + options[key];
                }
            }

            global.document.cookie = updatedCookie;
        };

        utils.addQueryString = function(url, queryString) {
            var isQuestionMarkPresent, isHashMarkPresent, separator;

            if (queryString) {
                isQuestionMarkPresent = (url && url.indexOf('?') !== -1);
                isHashMarkPresent = (url && url.indexOf('#') !== -1);
                separator = (isQuestionMarkPresent ? '&' : '?');

                if (isHashMarkPresent) {
                    url = url.substr(0, url.indexOf('#')) + separator + queryString + url.substr(url.indexOf('#'));
                } else {
                    url += separator + queryString;
                }
            }

            return url;
        };

        utils.forEach = function(obj, callback, thisObj) {
            var length,
                key,
                i;

            if (!obj) {
                return;
            }

            if (utils.isArrayLike(obj)) {
                if (nativeForEach) {
                    nativeForEach.call(obj, callback, thisObj);
                    return;
                }

                for (i = 0, length = obj.length; i < length; i++) {
                    callback.call(thisObj, obj[i], i, obj);
                }
            } else {
                for (key in obj) {
                    if (hasOwnProp.call(obj, key)) {
                        callback.call(thisObj, obj[key], key, obj);
                    }
                }
            }
        };

        utils.isArrayLike = function(collection) {
            var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1,
                length;

            if (collection && collection.length) {
                length = collection.length;
            }

            return (typeof length === 'number' && length >= 0 && length <= MAX_ARRAY_INDEX);
        };

        utils.extractDomain = function(url) {
            var domain;

            if (url.indexOf("://") > -1) {
                domain = url.split('/')[2];
            } else {
                domain = url.split('/')[0];
            }

            return domain;
        };

        utils.extractQueryString = function(url) {
            return url.indexOf("?") !== -1 ? url.split("?")[1] : "";
        };

    }(WGRT.utils = {}, window));

    /**
     * @module courier
     * @namespace WGRT
     *
     * Usage example:
     *
        courier.deliver('some_url?callback=handleStuff', {
            callbackName: 'handleStuff',
            onSuccess: function(json) {
                console.log('success!', json);
            },
            onTimeout: function() {
                console.log('timeout!');
            },
            timeoutSec: 5
        });
     *
     */
    (function(exports) {

        exports.courier = {

            deliver: function(deliverUrl, deliverOptions) {
                var callbackName, onSuccess, onTimeout, timeoutSec, timeoutTrigger, script;

                deliverOptions = deliverOptions || {};
                callbackName = deliverOptions.callbackName || 'callback';
                onSuccess = deliverOptions.onSuccess || function(){};
                onTimeout = deliverOptions.onTimeout || function(){};
                timeoutSec = deliverOptions.timeoutSec || 10;
                window.ReferTrackerCallbacks = window.ReferTrackerCallbacks || {};

                timeoutTrigger = window.setTimeout(function() {
                    window.ReferTrackerCallbacks[callbackName] = function(){};
                    onTimeout();
                }, timeoutSec * 1000);

                window.ReferTrackerCallbacks[callbackName] = function(data) {
                    window.clearTimeout(timeoutTrigger);
                    onSuccess(data);
                };

                script = document.createElement('script');
                script.async = true;
                script.src = deliverUrl;

                document.getElementsByTagName('head')[0].appendChild(script);
            }
        };

    }(WGRT));

    /**
     * @module configurator
     * @namespace WGRT
     */
    (function(exports, courier) {

        exports.configurator = {

            loadConfiguration: function(configUrl, realm, project, service, callback) {
                var selectorsKey, campaignIdsKey, campaignId, selectors;

                courier.deliver(configUrl, {
                    callbackName: 'callbackTrackerConfig',
                    onSuccess: function(loadedConfig) {

                        selectorsKey = service + '_' + project + '_' + realm;
                        if (loadedConfig.selectors.hasOwnProperty(selectorsKey)) {
                            selectors = loadedConfig.selectors[selectorsKey];
                        } else {
                            selectorsKey = service + '_' + project + '_' + '*';
                            if (loadedConfig.selectors.hasOwnProperty(selectorsKey)) {
                                selectors = loadedConfig.selectors[selectorsKey];
                            } else {
                                selectorsKey = '*_*_*';
                                if (loadedConfig.selectors.hasOwnProperty(selectorsKey)) {
                                    selectors = loadedConfig.selectors[selectorsKey];
                                }
                            }
                        }

                        campaignIdsKey = realm + '_' + project + '_' + service;
                        if (loadedConfig.campaigns.hasOwnProperty(campaignIdsKey)) {
                            campaignId = loadedConfig.campaigns[campaignIdsKey];
                        }

                        callback({'campaignId': campaignId, 'selectors': selectors});
                    },
                    onTimeout: function() {
                        callback({'campaignId': '', 'selectors': ''});
                    },
                    timeoutSec: 5
                });
            }
        };

    }(WGRT, WGRT.courier));

    /**
     * @module main
     * @namespace WGRT
     */
    (function(utils, configurator, global) {

        var COOKIE_LIFE_TIME = 30 * 60 * 1000, // 30 min
            REPATCH_LINKS_INTERVAL = 2000,
            DEFAULT_REF_DOMAIN = 'direct',
            REF_DOMAIN_COOKIE_NAME = 'reg_ref_domain',
            LINK_PARSED_ATTR_NAME = 'data-referrer-initialized',
            CONFIG_PATH = '/assets/clicks/static/tracker-config.js',
            CPM_URL = 'http://redir.wargaming.net/';

        function ReferTracker() {}

        utils.extend(ReferTracker.prototype, {

            patchLinks: function(selectors, campaignId) {
                var foundLinks = [],
                    queryString = '',
                    i, j, refDomain;

                refDomain = (utils.getCookie(REF_DOMAIN_COOKIE_NAME) || DEFAULT_REF_DOMAIN);

                for (i = 0; i < selectors.length; i++) {
                    foundLinks = global.document.querySelectorAll(selectors[i].selector);

                    for (j = 0; j < foundLinks.length; j++) {
                        if (!foundLinks[j].hasAttribute(LINK_PARSED_ATTR_NAME)) {
                            queryString = 'pub_id=' + selectors[i].place + '_' + refDomain;

                            if (selectors[i].method === 'replace') {
                                queryString += '&' + utils.extractQueryString(foundLinks[j].href);
                                foundLinks[j].href = utils.addQueryString(CPM_URL + campaignId + '/', queryString);
                            } else {
                                foundLinks[j].href = utils.addQueryString(foundLinks[j].href, queryString);
                            }

                            foundLinks[j].setAttribute(LINK_PARSED_ATTR_NAME, '');
                        }
                    }
                }
            },

            storeReferrerHostName: function() {
                var referrerHostName = (global.document.referrer ? global.document.referrer.match(/:\/\/(.[^:|/]+)/)[1] : ''),
                    currentHostName = window.location.hostname,
                    expireDate;

                if (referrerHostName.length > 0 && referrerHostName.indexOf(currentHostName) === -1) {
                    expireDate = new Date();
                    expireDate.setTime(expireDate.getTime() + COOKIE_LIFE_TIME);

                    utils.setCookie(REF_DOMAIN_COOKIE_NAME, referrerHostName, {
                        expires: expireDate,
                        path: '/'
                    });
                }
            },

            init: function (options) {
                var self = this,
                    campaignId, selectors, doJob = function(campaignId, selectors) {
                        if (campaignId && selectors) {
                            self.storeReferrerHostName();
                            self.patchLinks(selectors, campaignId);

                            setInterval(function() {
                                self.patchLinks(selectors, campaignId);
                            }, REPATCH_LINKS_INTERVAL);
                        } else {
                            if (location.href.indexOf('wgrt-debug') > -1 && global.console) {
                                global.console.log('Wrong options passed to refer-tracker. Skipping running.');
                                global.console.log(options);
                            }
                        }
                    };

                if (options.hasOwnProperty('campaign') && options.hasOwnProperty('selectors')) {
                    campaignId = options.campaign;
                    selectors = options.selectors;

                    doJob(campaignId, selectors);

                } else if (options.hasOwnProperty('realm') &&
                    options.hasOwnProperty('project') &&
                    options.hasOwnProperty('service')) {

                    configurator.loadConfiguration(
                        '//' + options['domain'] + CONFIG_PATH,
                        options.realm,
                        options.project,
                        options.service,
                        function(configuration) {
                            campaignId = configuration.campaignId;
                            selectors = configuration.selectors;

                            doJob(campaignId, selectors)
                        }
                    );
                }


            }
        });

        WGRT.ReferTracker = ReferTracker;
    }(WGRT.utils, WGRT.configurator, window));

    /**
     * @module loader
     * @namespace WGRT
     */
    (function(ReferTracker, utils, global) {
        var referTrackerLoaderScript,
            passedOptions = {},
            runAutoInit = false,
            optionsList = [
                'realm',
                'project',
                'service',
                'campaign',
                'selectors'
            ];

        global.WG = global.WG || {};
        global.WG.ReferTracker = new ReferTracker();

        referTrackerLoaderScript = global.document.getElementById('wgtr-loader');
        if (referTrackerLoaderScript) {
            passedOptions['domain'] = utils.extractDomain(referTrackerLoaderScript.src);
            utils.forEach(optionsList, function(optionName) {
                if (referTrackerLoaderScript.hasAttribute('data-' + optionName)) {
                    passedOptions[optionName] = referTrackerLoaderScript.getAttribute('data-' + optionName);
                    if (optionName === 'selectors') {
                        passedOptions[optionName] = JSON.parse(passedOptions[optionName]);
                    }
                    runAutoInit = true;
                }
            });
        }

        if (runAutoInit) {
            WG.ReferTracker.init(passedOptions);
        }

    }(WGRT.ReferTracker, WGRT.utils, window));

}());