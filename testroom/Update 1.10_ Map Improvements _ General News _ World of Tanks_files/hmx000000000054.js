;var hmx_privacy='{}';(function () {
    var hmxtagidcust = '2';
    var gobj = 'hmx';
    window['ObjHmx'] = 'hmx';
    window['hmx'] = window['hmx'] || function() {
        (window['hmx'].cmd = window['hmx'].cmd || []).push(arguments)
    };

	var Base64 = {
		_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
		encode: function(e) {
			var t = "";
			var n, r, i, s, o, u, a;
			var f = 0;
			e = Base64._utf8_encode(e);
			while (f < e.length) {
				n = e.charCodeAt(f++);
				r = e.charCodeAt(f++);
				i = e.charCodeAt(f++);
				s = n >> 2;
				o = (n & 3) << 4 | r >> 4;
				u = (r & 15) << 2 | i >> 6;
				a = i & 63;
				if (isNaN(r)) {
					u = a = 64;
				} else if (isNaN(i)) {
					a = 64;
				}
				t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);
			}
			return t;
		},

        decode: function (input) {
            var str = String(input).replace(/=+$/, '');
            if (str.length % 4 == 1) {
                return ''; // failed: The string to be decoded is not correctly encoded
            }
            for (
                // initialize result and counters
                var bc = 0, bs, buffer, idx = 0, output = '';
                // get next character
                buffer = str.charAt(idx++);
                // character found in table? initialize bit storage and add its ascii value;
                ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                    // and if not first of each 4 characters,
                    // convert the first 8 bits to one ascii character
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
            ) {
                // try to find character in table (0-63, not found => -1)
                buffer = this._keyStr.indexOf(buffer);
            }
            return output;
        },

		_utf8_encode: function(e) {
			e = e.replace(/\r\n/g, "\n");
			var t = "";
			for (var n = 0; n < e.length; n++) {
				var r = e.charCodeAt(n);
				if (r < 128) {
					t += String.fromCharCode(r);
				} else if (r > 127 && r < 2048) {
					t += String.fromCharCode(r >> 6 | 192);
					t += String.fromCharCode(r & 63 | 128);
				} else {
					t += String.fromCharCode(r >> 12 | 224);
					t += String.fromCharCode(r >> 6 & 63 | 128);
					t += String.fromCharCode(r & 63 | 128);
				}
			}
			return t;
		}
	};

	var b_table = [],
        // c360ImprovedCookie is: c360 value|{created: timestamp, updated: timestamp, tag: template tag id, count: number of times the cookie has been regenerated, etag: etag}
        c360ImprovedCookie = [],
        c360ConflictValues = [];

	for (var n = 0 ; n < 256 ; n++) {
		var c = n;
		for (var k = 0 ; k < 8 ; k++) {
			c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
		}
		b_table[n] = c;
	}

	function b_crc32 (str) {
	    var crc = crc ^ (-1);
	    for(var i=0, iTop=str.length; i<iTop; i++) {
		crc = ( crc >>> 8 ) ^ b_table[( crc ^ str.charCodeAt( i ) ) & 0xFF];
	    }
	    return (crc ^ (-1)) >>> 0;
    }

    function getrnd() {
		return (("000000" + Math.floor(Math.random() * 16777215).toString(16)).slice(-6));
	}

    function getCookiesByName(name){
        var cookies = [];

        if (document.cookie) {
            var split = document.cookie.split(';');
            for (var i = 0, len = split.length; i < len; i++) {
                var name_value = split[i].split("=");
                name_value[0] = name_value[0].replace(/^ /, '');
                if(name === name_value[0].replace(/^ /, '')) {
                    cookies.push(name_value[1]);
                }
            }
        }

        return cookies;
    }

    function validateCrc(cookie) {
        var offset = cookie.indexOf('|') !== -1 ? cookie.indexOf('|') : cookie.length;
        return b_crc32(cookie.substring(0, 24)).toString(16).toUpperCase() === cookie.substring(24, offset); // 24 is the cookie size
    }

    function uniqPush(arr, value) {
        if(arr.indexOf(value) === -1) {
            arr.push(value);
        }
    }

    function writeCookie(name, value, hostname, path, expDate) {
        document.cookie = name + "=" + value + "; domain=" + hostname + " ; path=" + path + " ; expires=" + expDate;
    }

    function getImprovedCookieValue() {
        var cookieValue = '';
        try {
            cookieValue =  JSON.stringify(c360ImprovedCookie[1]);
        } catch(e) { // support for IE7
            cookieValue = '{"created":' + c360ImprovedCookie[1].created + ',"updated":' + c360ImprovedCookie[1].updated + ',"tag":"' + hmxtagidcust + '-2.19-6","count":' + nbGenerated + ',"etag":' + c360ImprovedCookie[1].etag + '}';
        }
        try {
            cookieValue = c360ImprovedCookie[0] + "|" + Base64.encode(cookieValue);
        } catch(e) {
            cookieValue = c360ImprovedCookie[0] + "|";
        }
        return cookieValue;
    }

    function getLang() {
        var lang = '';
        try {
            if(typeof navigator.languages !== 'undefined' && navigator.languages.length > 0) {
                lang = navigator.languages[0].indexOf('-') !== -1 || navigator.languages.length < 2 ? navigator.languages[0] : navigator.languages[1];
            } else {
                lang = navigator.language || navigator.browserLanguage;
            }
            lang = Base64.encode(lang);
        }
        catch(e) {}
        return lang;
    }

	// called on "send" method
	function pixelrequest() {
        var cookieGenerated = 0,
            conflict = false;

		//if first call
		if (typeof customvar_holimetrix === 'undefined') {
			var c360Value = "",
                cleanup = false;

			if (document.cookie) {
                var improvedCookies = getCookiesByName('C360i'),
                    i, len;

                for(i = 0, len = improvedCookies.length; i < len; i++) {
                    // Check the CRC
                    if (validateCrc(improvedCookies[i])) {
                        var tempC360Improved = improvedCookies[i].split('|'); // Valid CRC
                        try {
                            tempC360Improved[1] = Base64.decode(tempC360Improved[1]);
                        } catch(e) {
                            tempC360Improved[1] = '{}';
                        }
                        // if we already have a valid c360i cookie
                        if(c360ImprovedCookie.length > 0) {
                            if(c360ImprovedCookie[0] !== tempC360Improved[0]) { // if the value that we have is different then we have a conflict
                                conflict = true;
                                // we want to keep the oldest created value
                                try {
                                    var temp1 = JSON.parse(c360ImprovedCookie[1]);
                                    var temp2 = JSON.parse(tempC360Improved[1]);
                                    // if this cookie is older than the other one
                                    if(temp2.created < temp1.created) {
                                        uniqPush(c360ConflictValues, c360ImprovedCookie[0]);
                                        c360ImprovedCookie = tempC360Improved;
                                        c360Value = c360ImprovedCookie[0];
                                    } else { // this cookie is more recent than the other one, we don't keep it
                                        uniqPush(c360ConflictValues, tempC360Improved[0]);
                                    }
                                } catch(e) {
                                    uniqPush(c360ConflictValues, tempC360Improved[0]);
                                }
                            }
                        } else {
                            c360ImprovedCookie = tempC360Improved;
                            c360Value = c360ImprovedCookie[0];
                        }
                    }
                }

                // check for the old cookie
                var cookies = getCookiesByName('C360');
                if(cookies.length > 0) {
                    cleanup = true; // we will need to clean up those old cookies
                    for(i = 0, len = cookies.length; i < len; i++) {
                        // Check the CRC
                        if(validateCrc(cookies[i])) {
                            // if we already have a valid c360 or c360i cookie
                            if(c360Value !== '') {
                                if(c360Value !== cookies[i]) { // if the value that we have is different then we have a conflict
                                    conflict = true;
                                    uniqPush(c360ConflictValues, cookies[i]);
                                }
                            } else { // if we don't have a value yet
                                c360Value = cookies[i]; // Valid CRC
                                c360ImprovedCookie[0] = c360Value;
                            }
                        }
                    }
                }
			}

            // if we don't have any existing cookie
			if (c360Value === "") {
				cookieGenerated = 1; // new cookie
				c360Value = (getrnd() + getrnd() + getrnd() + getrnd()).toUpperCase();
				var padded_crc32 = ("00000000" + b_crc32(c360Value).toString(16).toUpperCase()).slice(-8);
				c360Value = c360Value + padded_crc32;
                c360ImprovedCookie[0] = c360Value;
			}

            // let's set the data for the cookie
            var currentDate = new Date();
            var hostname = document.domain.split('.');

            if(typeof c360ImprovedCookie[1] === 'undefined') {
                c360ImprovedCookie[1] = {};
            } else {
                try {
                    c360ImprovedCookie[1] = JSON.parse(c360ImprovedCookie[1]);
                } catch(e) { // will bug in IE7 because of the missing JSON lib, we will loose the created date in this case
                    c360ImprovedCookie[1] = {};
                }
            }

            // just in case we get some weird JSON.parse edge case that doesn't throw an error, like parsing null or a number
            if(typeof c360ImprovedCookie[1] !== "object") {
                c360ImprovedCookie[1] = {};
            }

            var nbGenerated = typeof c360ImprovedCookie[1].count === "number" ? parseInt(c360ImprovedCookie[1].count, 10) + 1 : 1;
            c360ImprovedCookie[1].created = c360ImprovedCookie[1].created || currentDate.getTime(); // date of creation
            c360ImprovedCookie[1].updated = currentDate.getTime(); // date of update
            c360ImprovedCookie[1].tag = '' + hmxtagidcust + '-2.19-6'; // tag version
            c360ImprovedCookie[1].count = nbGenerated; // nb of times the cookie was generated

            var expirationDate = new Date(currentDate.getTime() + (380 * 24 * 60 * 60 * 1000)).toGMTString();

            // let's (re)generate the cookie(s), we put a cookie on every parent domain and current domain
            for (var iteration = hostname.length - 1 ; iteration >= 0 ; iteration--) {
                // c360Improved is: c360 value|{created: timestamp, updated: timestamp, tag: template tag id, count: number of times the cookie has been regenerated, etag: etag}
                writeCookie("C360i", getImprovedCookieValue(), '.' + hostname.slice(iteration).join('.'), "/", expirationDate);
                // delete the old C360 cookie
                if(cleanup) {
                    writeCookie("C360", c360Value, hostname.slice(iteration).join('.'), "/", "Thu, 01 Jan 1970 00:00:01 GMT");
                }
            }

            // delete the old C360 cookie
            if(cleanup) {
                document.cookie = "C360=" + c360Value + "; path=/ ; expires=Thu, 01 Jan 1970 00:00:01 GMT;"; // delete the old C360 cookie
            }

            customvar_holimetrix = c360Value + "-" + getrnd() + getrnd();// page identification
		}

		var pixelargsrv = '&cgen=' + cookieGenerated;
		var hmx_url = '';
		var hmx_ref = '';
		var is_customref_defined = 0;
		var is_step_defined = 0;

		for (var key in (gwin.pixelarg)) {
			if(typeof gwin.pixelarg[key] !== 'function'){
                try {
                    pixelargsrv = pixelargsrv + '&' + key + '=' + Base64.encode(gwin.pixelarg[key]);
                } catch (e) {
                    // if error we send the parameter empty
                    // todo add a parameter "error" to track this
                    pixelargsrv = pixelargsrv + '&' + key + '=';
                }
				if (key === "step") {
                    is_step_defined = 1;
                } else if (key === "custom_referrer") {
                    is_customref_defined = 1;
                }
			}
		}

        if(conflict) { // if we had a conflict with multiple valid cookies of different values
            try {
                pixelargsrv = pixelargsrv + '&cold=' + Base64.encode(c360ConflictValues.join(','));
            } catch(e) {}
        }

		// if we are in a frame, get the referrer of the parent
		try{
			if (window.self !== window.top){
				hmx_ref = parent.document.referrer;
			} else {
				hmx_ref = document.referrer;
			}
		} catch(e) {
            hmx_ref = document.referrer;
        }
		// however, if it is undefined, set it to empty string
		if(typeof hmx_ref === 'undefined'){
			hmx_ref = '';
		}
		// handle apple security rule to set the REFERER in header
		var current_url = '';
		try{
			if (window.self !== window.top){
				current_url = window.top.location.href;
			} else {
				current_url = window.location.href;
			}
		} catch(e) {
            current_url = window.location.href;
        }
		if(typeof current_url === 'undefined'){
			current_url = '';
		}
		
		if (!is_step_defined) {
            // the url is defined to detect the step
            if (is_customref_defined) {
                hmx_url = gwin.pixelarg["custom_referrer"];
            } else {
                try {
                    hmx_url = parent.document.URL;
                } catch(e) {
                    hmx_url = document.URL;
                }
            }
			pixelargsrv = pixelargsrv + '&step=' + stepfallback(hmx_url, hmx_ref);
		}

		try {
			if (hmx_ref.length) {
                hmx_ref = Base64.encode(hmx_ref);
            }
		} catch (e) {
			hmx_ref = '';
		}
		try {
			if (current_url.length) {
                current_url = Base64.encode(current_url);
            }
		} catch (e) {
			current_url = '';
		}

        var lang = getLang();

		try {
			var img = new Image(1,1);
            // keep r= as the last parameter
			img.src = '//u360.d-bi.fr/000000000054.gif?c=' + customvar_holimetrix + pixelargsrv + '&hmxtagid=' + hmxtagidcust + '-2.19-6&u=' + current_url +'&hmxts=' + (new Date()).getTime() + '&navlang=' + lang + '&r=' + hmx_ref;
        } catch (e) {
            if (window.opener) {
                var hmx_debug_target = 'https://portal.holimetrix.com/';
                // send the exception
                if (location.search.indexOf('hmxdebug=on') != -1 || document.cookie.indexOf('hmxdebug=on') != -1) {
                    var hmx_postData = {'action': 'exception', 'exception':e};
                    try {window.opener.postMessage(hmx_postData, hmx_debug_target);} catch (e) {}
                }
            }
        } finally {
            // let's check the etag and update it if necessary
            etagRequest();


			// hmx debug security
            if (window.opener) {
                var hmx_debug_target = 'https://portal.holimetrix.com/';
                // hmx debug  off
                if (location.search.indexOf('hmxdebug=off') != -1) {
                    // delete cookie
                    var hmx_date = new Date();
                    hmx_date.setTime(hmx_date.getTime() - 1); // in msec
                    document.cookie = "hmxdebug=on; path=/ ; expires=" + hmx_date.toGMTString();

                    // post desactivation
                    var hmx_postData = {'action': 'debugOff', 'active_sec':0};
                    try {window.opener.postMessage(hmx_postData, hmx_debug_target);} catch (e) {}
                } 
                // hmx debug on
                else if (location.search.indexOf('hmxdebug=on') != -1 || document.cookie.indexOf('hmxdebug=on') != -1) {
                    // set or reset the cookie
                    var hmx_date = new Date();
                    var hmx_active_sec = 30 * 60; // in sec
                    hmx_date.setTime(hmx_date.getTime() + (hmx_active_sec * 1000)); // in msec
                    document.cookie = "hmxdebug=on; path=/ ; expires=" + hmx_date.toGMTString();

                    // cookie & pageId
                    var hmx_cookie_page_id = customvar_holimetrix.split('&', 2);
                    hmx_cookie_page_id = hmx_cookie_page_id[0].split('-', 2);
                    var hmx_cookie = hmx_cookie_page_id[0];
                    var hmx_page_id = hmx_cookie_page_id[1];
                    
                    // post data to opener window
                    var hmx_postData = {
                        'action': 'logPixel', 
                        'active_sec': hmx_active_sec,
                        'pixel': img ? img.src : 'undefined',
                        'cookie': hmx_cookie,
                        'args': {
                            'url': current_url,
                            'referer': hmx_ref,
                            'page_id': hmx_page_id
                        }
                    };
                    
                    // setted args
                    var hmx_args = pixelargsrv.split('&');
                    for (var key in hmx_args) {
                        if (hmx_args.hasOwnProperty(key) && hmx_args[key].length > 0) {
                            var hmx_keyValue = hmx_args[key].split('=', 2);
                            if (hmx_keyValue[0] != 'cgen' && hmx_keyValue[0] != 'perfSite' && hmx_keyValue[0] != 'perfScript') {
                                hmx_postData.args[hmx_keyValue[0]] = hmx_keyValue[1];
                            }
                        }
                    }

                    // send message
                    try {window.opener.postMessage(hmx_postData, hmx_debug_target);} catch (e) {}

                    // set method for unload event
                    window.addEventListener('beforeunload', function() {
                        var hmx_postData = {'action': 'changePage'};
                        try {window.opener.postMessage(hmx_postData, hmx_debug_target);} catch (e) {}
                    });
                }
            }
        } // finally
	}

    // check the etag and link to the cookie if needed
    function etagRequest() {
        // it only works if c360ImprovedCookie is not empty and has been decoded
        if(c360ImprovedCookie.length > 1 && typeof c360ImprovedCookie[1] === 'object') {
            // let's insert the etag script and wait for etagCallback to be called
            var jsasync = gwin.document.createElement('script'),
                jsloc = gwin.document.getElementsByTagName('script')[0];
            jsasync.async = 1;
            jsasync.src = 'https://u360.d-bi.fr/e.js'; // todo in unit tests: check if 2 consecutive calls give the same etag
            jsloc.parentNode.insertBefore(jsasync, jsloc);
        }
    }

    // share info with exelator
    function exelator() {
        if(c360ImprovedCookie.length > 0) {
            try {
                // create a blank iframe
                var iframeTag = document.createElement('iframe');
                iframeTag.src = "about:blank";
                iframeTag.style = "display: none; visibility: hidden;";
                iframeTag.width = 0;
                iframeTag.height = 0;
                document.body.appendChild(iframeTag);

                // get the iframe document
                var iframeDocument = iframeTag.contentWindow ? iframeTag.contentWindow.document : iframeTag.contentDocument;

                // create the pixel for exelator
                var img = iframeDocument.createElement('img');
                img.src = 'https://loadm.exelator.com/load/?p=204&g=1010&j=0&buid=' + c360ImprovedCookie[0] + '-000000000054';
                iframeDocument.body.appendChild(img);
            } catch(e) {}
        }
    }

    // called on "e" method
    function etagCallback(etag) {
        // it only works if c360ImprovedCookie is not empty and has been decoded and if the etag is different from the one in the cookie, or every 50 calls
        if(c360ImprovedCookie.length > 1 && typeof c360ImprovedCookie[1] === 'object' && typeof etag !== 'undefined' && (c360ImprovedCookie[1].etag !== etag || c360ImprovedCookie[1].count % 50 === 0)) {
            var eold,
                updateCookie = false;

            if(c360ImprovedCookie[1].etag !== etag) {
                eold = c360ImprovedCookie[1].etag; // old etag, if exists
                updateCookie = true;
            }
            c360ImprovedCookie[1].etag = etag; // updating with the new value

            try {
                var img = new Image(1,1);
                img.src = 'https://u360.d-bi.fr/e.gif?aid=000000000054'
                    + '&c=' + c360ImprovedCookie[0]
                    + '&e=' + c360ImprovedCookie[1].etag
                    + '&d=' + Base64.encode(document.domain)
                    + (typeof eold !== 'undefined' ? '&eold=' + eold : '')
                    + (c360ConflictValues.length > 0 ? '&cold=' + c360ConflictValues.join(',') : '');
            } catch(e) {}

            if(updateCookie) { // we need to update the cookie with the new etag
                // let's set the data for the cookie
                var expirationDate = new Date();
                expirationDate.setTime(expirationDate.getTime() + (380 * 24 * 60 * 60 * 1000));
                var hostname = document.domain.split('.');

                // let's (re)generate the cookie(s), we put a cookie on every parent domain and current domain
                for(var iteration = hostname.length - 1; iteration >= 0; iteration--) {
                    // c360Improved is: c360 value|{created: timestamp, updated: timestamp, tag: template tag id, count: number of times the cookie has been regenerated, etag: etag}
                    writeCookie("C360i", getImprovedCookieValue(), '.' + hostname.slice(iteration).join('.'), "/", expirationDate.toGMTString());
                }
            }
        }
    }

	function stepfallback(hmx_url, hmx_ref) {
		var tmpa = document.createElement("a");
		tmpa.href = hmx_url;
		var tmpreferer = document.createElement("a");
		tmpreferer.href = hmx_ref;



        try {
            return Base64.encode('other');
        } catch(e) {
            return '';
        }
	}

	var gwin = window;
	gwin['pixelarg'] = [];
	gwin['HmxEntryPoint'] = function (param) {
        if(param.length > 0) {
            if(param[0] === 'send') {
                pixelrequest();
            } else if(param[0] === 'set') {
                gwin.pixelarg[param[1]] = param[2];
            } else if(param[0] === 'e') {
                etagCallback(param[1]);
            }
        }
	};
	var objhmxcmd = gwin[gwin['ObjHmx']].cmd;
	// if the client just put our script but does nothing else (no set/no send), we should not crash
	if(typeof objhmxcmd !== 'undefined' && typeof objhmxcmd.length === 'number'){
		for (var i = 0; i < objhmxcmd.length; i++) {
			gwin['HmxEntryPoint'](objhmxcmd[i]);
		}
	}
	gwin[gwin['ObjHmx']] = function () {
		gwin['HmxEntryPoint'](arguments);
	};

    // Array.prototype.indexOf polyfill
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(searchElement, fromIndex) {

            var k;

            // 1. Let O be the result of calling ToObject passing
            //    the this value as the argument.
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var O = Object(this);

            // 2. Let lenValue be the result of calling the Get
            //    internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            var len = O.length >>> 0;

            // 4. If len is 0, return -1.
            if (len === 0) {
                return -1;
            }

            // 5. If argument fromIndex was passed let n be
            //    ToInteger(fromIndex); else let n be 0.
            var n = +fromIndex || 0;

            if (Math.abs(n) === Infinity) {
                n = 0;
            }

            // 6. If n >= len, return -1.
            if (n >= len) {
                return -1;
            }

            // 7. If n >= 0, then Let k be n.
            // 8. Else, n<0, Let k be len - abs(n).
            //    If k is less than 0, then let k be 0.
            k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            // 9. Repeat, while k < len
            while (k < len) {
                if (k in O && O[k] === searchElement) {
                    return k;
                }
                k++;
            }
            return -1;
        };
    }
})(window);
