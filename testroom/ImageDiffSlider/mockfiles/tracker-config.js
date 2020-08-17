ReferTrackerCallbacks.callbackTrackerConfig({
    "campaigns": {
        "kr_all_wgni": "vxoqs7yn",
        "ru_wot_ptl": "vnwtd159",
        "sg_moo_ptl": "st4u7jav",
        "ru_wowp_frm": "oxolrlf6",
        "eu_all_wgcc": "13zu7s1n",
        "kr_all_spt": "5dpavct5",
        "us_all_spt": "dy8bxtyb",
        "ru_all_wgcc": "6ropl882",
        "us_all_papidev": "1rby8vke",
        "sg_all_wgni": "vxoqs7yn",
        "us_wows_frm": "h08cxaoe",
        "ru_wotb_frm": "lquj8mbs",
        "sg_wotb_ptl": "83ta2u2s",
        "sg_all_wgnp": "vxoqs7yn",
        "ru_all_wgq": "akw4vg4m",
        "us_wotb_frm": "f52zs3pv",
        "ru_wows_frm": "xvdbl44y",
        "eu_all_spt": "zy469mtf",
        "ru_all_spt": "144dffvh",
        "kr_all_wgnp": "vxoqs7yn",
        "ru_wowp_ptl": "ofodnuni",
        "sg_all_wgcwx": "e35kd6ma",
        "us_wot_frm": "obw5fegm",
        "eu_all_pss": "d9eyu485",
        "us_wot_ptl": "r3fvksbt",
        "ru_all_wgni": "uc74h6s9",
        "sg_all_wgcc": "iih3ljwm",
        "ru_moo_frm": "plejh8mj",
        "ru_moo_ptl": "q16df88y",
        "us_moo_frm": "of1l4fd9",
        "sg_wotb_frm": "pbg27y3o",
        "eu_wows_ptl": "zp6wfnag",
        "ru_wotb_ptl": "a9co18wu",
        "kr_all_papidev": "11o436cl",
        "sg_wot_ptl": "bhkp7a63",
        "us_wows_ptl": "553sawt3",
        "sg_all_papidev": "11o436cl",
        "eu_all_wgnp": "3ytbjmk1",
        "ru_all_wgcwx": "22y4g6qx",
        "us_all_wgcc": "ph11405l",
        "ru_all_wiki": "u3dm0951",
        "sg_moo_frm": "gbh8vvt8",
        "kr_wot_ptl": "bhkp7a63",
        "eu_wot_frm": "g6mqvfdi",
        "eu_wowp_ptl": "e6dfo0r0",
        "us_all_wgcwx": "jdl0k661",
        "eu_wot_ptl": "7hbx4i30",
        "sg_wot_frm": "gxwqmbzk",
        "sg_wowp_ptl": "rqp9yect",
        "eu_all_wgni": "3ytbjmk1",
        "kr_all_wiki": "0me5jx0j",
        "eu_wotb_ptl": "5uung0t8",
        "us_all_wgnp": "lv7keumo",
        "eu_moo_ptl": "8q5b3cny",
        "eu_wowp_frm": "2nkidc6t",
        "sg_all_spt": "5dpavct5",
        "ru_wows_ptl": "zzfwhma3",
        "us_all_wgni": "lv7keumo",
        "ru_all_pss": "d99v4ooe",
        "us_wotb_ptl": "7w380e9u",
        "sg_wows_ptl": "4bt620yh",
        "ru_all_tps": "v6p899av",
        "us_moo_ptl": "ih07zon5",
        "eu_moo_frm": "9r324nnf",
        "sg_wowp_frm": "pxhakk88",
        "us_all_wiki": "49h4p3uz",
        "eu_wows_frm": "e06aqmcp",
        "sg_wows_frm": "657bjz7v",
        "eu_wotb_frm": "w76qdlro",
        "ru_all_wgnp": "uc74h6s9",
        "ru_wot_frm": "5epcc9q1",
        "us_wowp_ptl": "gvwpqpnw",
        "us_all_pss": "7vmqcnki",
        "eu_all_papidev": "6w2ijo40",
        "sg_all_pss": "co2dkfpr",
        "eu_all_wiki": "ce4ahj7g",
        "sg_all_wiki": "0me5jx0j",
        "us_wowp_frm": "zrv7fd1z",
        "kr_all_trpg": "bhkp7a63",
        "ru_all_papidev": "d1q0841h",
        "eu_all_wgcwx": "vv4axd8i"
    },
    "selectors": {
        "wgnp_all_*": [{
            "place": "cmenu",
            "method": "replace",
            "selector": ".js-cm-reg-link"
        }, {
            "place": "cta",
            "method": "replace",
            "selector": "#home-button > a[href*=\"wargaming.net/registration\"]"
        }],
        "*_*_*": [{
            "place": "cmenu",
            "method": "replace",
            "selector": ".js-cm-reg-link"
        }],
        "ptl_wowp_us": [{
            "place": "pff",
            "method": "append",
            "selector": ".js-cds-content-item > a.js-referer"
        }, {
            "place": "cmenu",
            "method": "replace",
            "selector": ".js-cm-reg-link"
        }],
        "ptl_wowp_ru": [{
            "place": "pff",
            "method": "append",
            "selector": ".js-cds-content-item > a.js-referer"
        }, {
            "place": "cmenu",
            "method": "replace",
            "selector": ".js-cm-reg-link"
        }],
        "papidev_all_*": [{
            "place": "cmenu",
            "method": "replace",
            "selector": "a[data-cm-event='registration']"
        }, {
            "place": "cta",
            "method": "replace",
            "selector": ".js-dr-registration-btn"
        }],
        "wgni_all_*": [{
            "place": "cta",
            "method": "replace",
            "selector": ".login-info_link[href*=\"wargaming.net/registration\"]"
        }, {
            "place": "cmenu",
            "method": "replace",
            "selector": ".js-cm-reg-link"
        }],
        "ptl_wowp_eu": [{
            "place": "pff",
            "method": "append",
            "selector": ".js-cds-content-item > a.js-referer"
        }, {
            "place": "cmenu",
            "method": "replace",
            "selector": ".js-cm-reg-link"
        }],
        "wiki_all_*": [{
            "place": "pfftop",
            "method": "replace",
            "selector": "a#exp-cm-banner-cta"
        }, {
            "place": "pff",
            "method": "replace",
            "selector": ".js-cta-banner-link[href*=\"cpm.wargaming.net\"]"
        }, {
            "place": "cta",
            "method": "replace",
            "selector": ".js-main-banner-link[href*=\"cpm.wargaming.net\"]"
        }, {
            "place": "cmenu",
            "method": "replace",
            "selector": ".js-cm-reg-link"
        }]
    }
});