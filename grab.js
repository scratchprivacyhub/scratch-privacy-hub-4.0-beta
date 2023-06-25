var data;
chrome.runtime.sendMessage({
    type: 'data'
}, respond => {
    data = respond;
    window['f$'+respond.type]();
    document.querySelector('.type-'+respond.type).style.display = '';
});

function f$user() {
    document.querySelector('.user-img').src = (
        data.privacy.img || data.img48
    );
    document.querySelector('.user-title').innerText = (
        data.username
    );
    document.querySelector('.user-author').innerText = (
        "ID "+data.id
    );
    document.querySelector('.user-track img').src = (
        data.privacy.track_level || 'unknown'
    );
    document.querySelector('.user-track-data').innerText = (
        data.privacy.track_record || 'No information is available for this user.'
    )
}

function f$project() {
    document.querySelector('.sb3-img').src = (
        data.privacy.img || data.author.img48
    );
    document.querySelector('.sb3-title').innerText = (
        data.title
    );
    document.querySelector('.sb3-author').innerText = (
        '@'+data.author.username
    );
    if(!data.privacy.ul) {
        document.querySelector('.sb3-unknown').style.display = '';
    } else {
        document.querySelector('.sb3-data').style.display = '';
        data.privacy.ul.forEach(li => {
            var s = document.createElement('li');
            s.innerText = li;
            document.querySelector('.sb3-data ul').appendChild(s);
        });
    }
}

function f$invalid () {
    return null;
}
