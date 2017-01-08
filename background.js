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
function gyotcURL(url) {
    return "https://gyo.tc/" + url;
}

chrome.webNavigation.onCommitted.addListener((details) => {
    if (["link", "typed", "start_page", "reload"].indexOf(details.transitionType) >= 0) {
        console.log(details.tabId, details.url);
        const xhr = new XHR(details.tabId);
        const protocol = new URL(details.url).protocol;
        if (["http:", "https:", "ftp:"].indexOf(protocol) >= 0) {
            xhr.call(gyotcURL(details.url));
        }
    }
});

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
        xhr.open("GET", url, true);
        xhr.responseType = "document";
        xhr.send();
    }

    /**
     * _callback is callback function for call.
     * @param {ProgressEvent} ev XHR callback event.
     */
    callback_(ev) {
        const resp = ev.target;
        const doc = resp.responseXML;
        const links = doc.getElementsByClassName("col-xs-12 col-sm-12 col-md-12")[1];
        console.log(links);
        if (links === undefined) {
            chrome.browserAction.setIcon({
                    "tabId": this.tabId,
                    "path": inactiveIcons
            }, () => {
                chrome.tabs.get(this.tabId, (tab) => {
                    // TODO(ymotongpoo): add appropriate tasks.
                });
            });
            return;
        }

        const a = links.getElementsByTagName("a");
        if (a.length > 0) {
            chrome.browserAction.setIcon({
                "tabId": this.tabId,
                "path": activeIcons
            }, () => {
                chrome.tabs.get(this.tabId, (tab) => {
                    chrome.browserAction.onClicked.addListener((tab) => {
                        chrome.tabs.update(tab.id, {url: gyotcURL(tab.url)});            
                    });
                });
                this.hasGyotc = true;
            });
        }
    }
}