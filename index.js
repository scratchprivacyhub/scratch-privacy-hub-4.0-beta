var url = "";
var data = {
    failed: true,
    reason: 'INVALID_URL',
    error: new Error()
};
var apidata = {};
chrome.tabs.onActivated.addListener(data => {
    chrome.tabs.get(data.tabId, tab => {
        if(tab) {
            UpdatePrivacyData(tab);
        }
    });
});

chrome.tabs.getCurrent(tab => {
    if(tab) {
        UpdatePrivacyData(tab);
    }
});

function UpdatePrivacyData(tab) {
    url = tab.url;
    var u = new URL(url);
    apidata = {};
    if(u.hostname != 'scratch.mit.edu') {
        return data = {
            failed: true,
            reason: 'INVALID_URL',
            error: new Error()
        }
    }
    if(
        (!u.pathname.startsWith('/users/')) && (!u.pathname.startsWith("/projects/"))
    ) {
        return data = {
            failed: true,
            reason: 'INVALID_URL',
            error: new Error()
        }
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (error) {
                    data = {
                        failed: true,
                        reason: "INVALID_JSON_DATA",
                        error: error,
                        asset: url.split("/")[2]
                    }
                }
            } else if(xhr.status == 429) {
                data = {
                    failed: true,
                    reason: "TOO_MANY_REQUESTS",
                    error: new Error(),
                    asset: url.split("/")[2]
                }
            } else if(xhr.status == 500) {
                data = {
                    failed: true,
                    reason: "INTERNAL_SERVER_ERROR",
                    error: new Error(),
                    asset: url.split("/")[2]
                }
            } else if(xhr.status == 403) {
                data = {
                    failed: true,
                    reason: "RESOURCE_FORBIDDEN",
                    error: new Error(),
                    asset: url.split("/")[2]
                }
            } else if(xhr.status == 404) {
                data = {
                    failed: true,
                    reason: "NOT_FOUND",
                    error: new Error(),
                    asset: url.split("/")[2]
                }
            } else {
                data = {
                    failed: true,
                    reason: "UNKNOWN_ERROR",
                    error: new Error(),
                    asset: url.split("/")[2]
                }
            }
        }
    }
    xhr.onerror = function () {
        data = {
            failed: true,
            reason: "XHR_ERROR",
            error: new Error(),
            asset: url.split("/")[2]
        }
    }
    xhr.open('GET', 'https://raw.githubusercontent.com/scratchprivacyhub/scratchprivacyhub.github.io/main/'+u.pathname.split("/")[1]+'/'+u.pathname.split("/")[2]+'.json');
    xhr.send();
    var aX = new XMLHttpRequest();
    aX.onreadystatechange = function () {
        if(aX.readyState == 4 && aX.status == 200) {
            try {
                apidata = JSON.parse(aX.responseText);
            } catch (error) {
                return null;
            }
        }
    }
    aX.open('GET', 'https://api.scratch.mit.edu/'+u.pathname.split("/")[1]+'/'+u.pathname.split("/")[2]+'/');
    aX.send();
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if(message.type === 'data') {
        var u = new URL(url);
        if(u.hostname!='scratch.mit.edu') {
            return respond({
                type: 'invalid'
            });
        }
        if(u.pathname.startsWith("/users/")) {
            respond({
                type: 'user',
                username: apidata.username,
                id: apidata.id,
                img24: `https://cdn2.scratch.mit.edu/get_image/user/${apidata.id}_24x24.png?v=`,
                img32: `https://cdn2.scratch.mit.edu/get_image/user/${apidata.id}_32x32.png?v=`,
                img48: `https://cdn2.scratch.mit.edu/get_image/user/${apidata.id}_48x48.png?v=`,
                img64: `https://cdn2.scratch.mit.edu/get_image/user/${apidata.id}_64x64.png?v=`,
                img128: `https://cdn2.scratch.mit.edu/get_image/user/${apidata.id}_128x128.png?v=`,
                privacy: data
            });
        } else if(u.pathname.startsWith('/projects/')) {
            if(!apidata.author) { apidata.author = {} }
            if(!apidata.stats) { apidata.stats = {} }
            respond({
                type: 'project',
                id: apidata.id,
                title: apidata.title,
                author: {
                    username: apidata.author.username,
                    img24: `https://cdn2.scratch.mit.edu/get_image/user/${apidata.author.id}_24x24.png?v=`,
                    img32: `https://cdn2.scratch.mit.edu/get_image/user/${apidata.author.id}_32x32.png?v=`,
                    img48: `https://cdn2.scratch.mit.edu/get_image/user/${apidata.author.id}_48x48.png?v=`,
                    img64: `https://cdn2.scratch.mit.edu/get_image/user/${apidata.author.id}_64x64.png?v=`,
                    img128: `https://cdn2.scratch.mit.edu/get_image/user/${apidata.author.id}_128x128.png?v=`
                },
                credits: apidata.description,
                instructions: apidata.instructions,
                public: apidata.public,
                visibility: apidata.visible,
                views: apidata.stats.views,
                loves: apidata.stats.loves,
                favorites: apidata.stats.favorites,
                remixes: apidata.stats.remixes,
                privacy: data
            })
        } else {
            respond({
                type: 'invalid'
            });
        }
    }
});
