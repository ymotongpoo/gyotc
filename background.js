//    Copyright 2017 Yoshi Yamaguchi
// 
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
// 
//        http://www.apache.org/licenses/LICENSE-2.0
// 
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.


/**
 * gyotcURL returns web gyotaku link of url page.
 * @param {string} url URL of target page.
 * @return {string} Corresponding gyotaku URL page to url.
 */
function gyotcUrl(url) {
    return "http://gyo.tc/" + url;
}

/**
 * gyotcApiUrl returns target URL for gyotc API request.
 * The response from the API is as following structure:
 * {[
 *   {
 *     "datetime": "YYYY-mm-dd HH:MM:SS",
 *     "title": "<the title of target page>",
 *     "url": "<gyotc URL>"
 *   }, ...
 * ]}
 * @param {string} url request URL
 * @return {string} gyo.tc target URL to get JSON.
 */
function gyotcApiUrl(url) {
    const data = {
        "type": "json",
        "url": url
    };

    let params = [];
    for (let key in data) {
        params.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
    }
    return "http://megalodon.jp/?" + params.join("&");
}


chrome.webNavigation.onCommitted.addListener((details) => {
    if (["link", "typed", "start_page", "reload"].indexOf(details.transitionType) >= 0) {
        console.log(details.tabId, details.url);
        const xhr = new XHR(details.tabId);
        const protocol = new URL(details.url).protocol;
        if (["http:", "https:", "ftp:"].indexOf(protocol) >= 0) {
            xhr.call(details.url);
        }
    }
});

/**
 * TODO(ymotongpoo): change to use gyotacku API
 * eg) http://megalodon.jp/?type=json&url=http%3A%2F%2Fyahoo.co.jp%2F
 */

const activeIcons = {
    "16": "img/active16.png",
    "24": "img/active24.png",
    "32": "img/active32.png",
    "64": "img/active64.png"
}

const inactiveIcons = {
    "16": "img/icon16.png",
    "24": "img/icon24.png",
    "32": "img/icon32.png",
    "64": "img/icon64.png"
}

/**
 * XHR handles XMLHttpRequest tasks.
 * @param {number} tabId active tag id to call XHR.
 * @constructor
 */
class XHR {
    constructor(tabId) {
        this.tabId = tabId;
        this.hasGyotc = false;
    } 

    /**
     * call send XHR to the url.
     * @param url target URL.
     */
    call(url) {
        var xhr = new XMLHttpRequest();
        xhr.onload = this.callback_.bind(this);
        gyotcApiUrl()
        xhr.open("GET", gyotcApiUrl(url), true);
        xhr.responseType = "json";
        xhr.send();
    }

    /**
     * _callback is callback function for call.
     * @param {ProgressEvent} ev XHR callback event.
     */
    callback_(ev) {
        const resp = ev.target;
        const ret = resp.response; // JSON result
        if (ret.length === 0) {
            chrome.browserAction.setIcon({
                    "tabId": this.tabId,
                    "path": inactiveIcons
            }, () => {
                chrome.tabs.get(this.tabId, (tab) => {
                    // TODO(ymotongpoo): add appropriate tasks.
                });
            });
            return;
        } else {            
            chrome.browserAction.setIcon({
                "tabId": this.tabId,
                "path": activeIcons
            }, () => {
                chrome.tabs.get(this.tabId, (tab) => {
                    chrome.browserAction.onClicked.addListener((tab) => {
                        chrome.tabs.update(tab.id, {"url": ret[0].url});            
                    });
                });
                this.hasGyotc = true;
            });
        }
    }
}