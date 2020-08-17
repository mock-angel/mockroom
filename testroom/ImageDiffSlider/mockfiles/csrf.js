/**
 * Created by y_shatrov on 24.10.14.
 *
 * Requires:
 *   jquery
 *   jquery.cookie
 *
 * Rationale:
 *   Server-generated HTML is cached, so it's not possible to insert valid csrf tokens into HTML on the server.
 *
 * Solution:
 *   If client has no CSRF cookie set, this script performs an AJAX request to a view which sets the cookie.
 *   When the CSRF cookie is present, it is appended to forms (on submit) as a hidden input, and to AJAX requests as
 *   a HTTP header.
 *
 * Usage:
 *  on document ready, add csrf.init()
 */

(function ($) {

    var debug = window.debug || function() {};

    var csrf = window.csrf = {
        settings: {  // default settings should be fine
            COOKIE_NAME: "csrftoken",
            COOKIE_URL: "/",
            FORM_FIELD_NAME: "csrfmiddlewaretoken",
            FORM_NO_CSRF_ATTRIBUTE: "no-csrf-token"
        },

        token: null,

        /** Initialize CSRF token handler (usually on load)
         *
         * @param options object : optional, with keys corresponding to csrf.settings
         */
        init: function(options) {
            options && $.extend(csrf.settings, options);
            csrf.install(true);
        },

        getToken: function(initial) {
            var csrfCookie = $.cookie(csrf.settings.COOKIE_NAME);
            if (! csrfCookie) {
                if (! initial) {
                    debug("getToken(): Token not ready");
                    return;
                }
                // this AJAX call must set CSRF cookie
                debug("getToken(): Try to fetch token");
                $.get(csrf.settings.COOKIE_URL).done(csrf.install);
                return;
            }
            csrf.token = csrfCookie;
            return csrf.token;
        },

        /** Install the CSRF token into AJAX request headers and form input, when the CSRF cookie is present
         *
         */
        install: function(initial) {
            var token = csrf.getToken(initial);
            if (! token) {
                debug("install(): token empty");
                return;
            }
            csrf.addCSRFTokenRequestHeaderToAJAX(token);
            $("body").on("submit", "form", function() {
                var frm = this;
                try {
                    return csrf.addCSRFTokenToForm(token, frm);
                } catch (ex) {
                    debug("Failed to submit form: CSRF token could not be added");
                    return false;
                }
            });
        },

        addCSRFTokenRequestHeaderToAJAX: function(token) {
            $.ajaxSetup({
                beforeSend: function (xhr, settings) {
                    if (!(/^http[s]?:/.test(settings.url))) {
                        // Only send the token to relative URLs i.e. locally.
                        xhr.setRequestHeader("X-CSRFToken", token);
                        debug("Set X-CSRFToken request header");
                    }
                }
            });
        },

        addCSRFTokenToForm: function(token, form) {
            if (form.method.toUpperCase() == "GET" || form.hasAttribute(csrf.FORM_NO_CSRF_ATTRIBUTE)) {
                return true;
            }
            var formToken = form[csrf.settings.FORM_FIELD_NAME];
            if (! formToken || formToken != token) {
                var csrfField = $("<input type=hidden name=" + csrf.settings.FORM_FIELD_NAME + ">");
                csrfField.val(token);
                $(form).append(csrfField);
            }
            return true;
        }
    };

})(jQuery);
