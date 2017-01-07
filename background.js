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
     * @param ev XHR callback event.
     */
    callback_(ev) {
        const resp = ev.target;
        const doc = resp.responseXML;
        const alertDom = doc.getElementsByClassName("alert alert-dismissible alert-info");
        if (alertDom.length === 0) {
            chrome.browserAction.setIcon({
                "tabId": this.tabId,
                "path": {
                    "16": "img/active16.png",
                    "24": "img/active24.png",
                    "32": "img/active32.png",
                    "64": "img/active64.png"
                }
            }, () => {
                chrome.tabs.get(this.tabId, (tab) => {
                    chrome.browserAction.onClicked.addListener((tab) => {
                        chrome.tabs.update(tab.id, {url: "http://gyo.tc/" + tab.url});            
                    });
                });
                this.hasGyotc = true;
            });
        }
    }
}