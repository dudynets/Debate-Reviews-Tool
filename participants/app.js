/*
    Debate Reviews Tool v0.9.1
    Copyright 2021 Oleksandr Dudynets

    Permission is hereby granted, free of charge,
    to any person obtaining a copy of this software
    and associated documentation files (the "Software"),
    to deal in the Software without restriction,
    including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit
    persons to whom the Software is furnished to do so,
    subject to the following conditions:

    The above copyright notice and this permission notice
    shall be included in all copies or substantial
    portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY
    OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
    LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
    FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
    EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
    FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
    AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.

    Date: 2021-02-26
*/

let RECIPIENTS = {};
let SPREADSHEET_ID = '';

let isConnected = false;
onlineListener();

firebase.initializeApp(FIREBASE_CONFIG);
let database = firebase.database();

let authorizeButton = document.getElementById('authorize');
let signoutButton = document.getElementById('signout');

let sendButton = document.getElementById('send');
let downloadButton = document.getElementById('download');
let clearTableButton = document.getElementById('clearTable');

let userImageUrl, userName, userEmail;
let userImage = document.getElementById('userImage');
let userNameText = document.getElementById('name');
let userEmailText = document.getElementById('email');
let userInfoDiv = document.getElementById('userInfoDiv');

let changeIDButton = document.getElementById('changeID');
let showRecipientsButton = document.getElementById('showRecipients');
let changeRecipientsButton = document.getElementById('changeRecipients');
let getBotUpdatesButton = document.getElementById('getBotUpdates');
let loader = document.getElementById('loader');
let section = document.getElementById('section');
let loadingText = document.getElementById('loadingText');

let popupBoxDiv = document.getElementById('popupBox');
let popupHeading = document.getElementById('popupHeading');
let popupContent = document.getElementById('popupPre');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
        loadingText.style.display = 'none';
        isConnected = true;
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        let profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        userName = profile.getName();
        userImageUrl = profile.getImageUrl();
        userEmail = profile.getEmail();
        userImage.src = userImageUrl;
        userNameText.innerHTML = userName;
        userEmailText.innerHTML = `<a href="mailto:${userEmail}">${userEmail}</a>`;

        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'inline';
        sendButton.style.display = 'inline';
        downloadButton.style.display = 'inline';
        clearTableButton.style.display = 'inline';
        userInfoDiv.style.display = 'table';
        changeIDButton.style.display = 'block';
        showRecipientsButton.style.display = 'block';
        changeRecipientsButton.style.display = 'block';
        getBotUpdatesButton.style.display = 'block';
        loader.style.display = 'none';
        section.style.display = 'inline';

        database.ref('participants/recipients').get().then(function(snapshot) {
            alertify.success("Recipients database connected");
            RECIPIENTS = snapshot.val();
        }).catch(function(error) {
            alertify.error("Database error");
            console.error(error);
        });

        database.ref('participants/spreadsheet_id').get().then(function(snapshot) {
            alertify.success("Spreadsheet ID database connected");
            SPREADSHEET_ID = snapshot.val();
        }).catch(function(error) {
            alertify.error("Database error");
            console.error(error);
        });
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        sendButton.style.display = 'none';
        downloadButton.style.display = 'none';
        clearTableButton.style.display = 'none';
        userInfoDiv.style.display = 'none';
        changeIDButton.style.display = 'none';
        showRecipientsButton.style.display = 'none';
        changeRecipientsButton.style.display = 'none';
        getBotUpdatesButton.style.display = 'none';
    }
}

function handleAuthClick(event) {
    loader.style.display = 'flex';
    section.style.display = 'none';
    gapi.auth2.getAuthInstance().signIn().catch(() => {
        alertify.error("Sign In error")
    })
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut().catch(() => {
        alertify.error("Sign Out error")
    });
}

function cancelLogIn() {
    loader.style.display = 'none';
    section.style.display = 'inline';
    location.reload();
    return false;
}

async function getSortedValues() {
    let response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: PARTICIPANTS_RANGES,
    });

    let receivedValues = response.result.values;
    let valuesArray = [];

    if (receivedValues) {
        for (row in receivedValues) {
            let formattedRow = {
                [receivedValues[row][4]]: {
                    timestamp: receivedValues[row][0],
                    topic: receivedValues[row][2],
                    judge: receivedValues[row][1],
                    position: receivedValues[row][3],
                    place: 1,
                    mark: receivedValues[row][5],
                },
                [receivedValues[row][6]]: {
                    timestamp: receivedValues[row][0],
                    topic: receivedValues[row][2],
                    judge: receivedValues[row][1],
                    position: receivedValues[row][3],
                    place: 1,
                    mark: receivedValues[row][7],
                },
                [receivedValues[row][9]]: {
                    timestamp: receivedValues[row][0],
                    topic: receivedValues[row][2],
                    judge: receivedValues[row][1],
                    position: receivedValues[row][8],
                    place: 2,
                    mark: receivedValues[row][10],
                },
                [receivedValues[row][11]]: {
                    timestamp: receivedValues[row][0],
                    topic: receivedValues[row][2],
                    judge: receivedValues[row][1],
                    position: receivedValues[row][8],
                    place: 2,
                    mark: receivedValues[row][12],
                },
                [receivedValues[row][14]]: {
                    timestamp: receivedValues[row][0],
                    topic: receivedValues[row][2],
                    judge: receivedValues[row][1],
                    position: receivedValues[row][13],
                    place: 3,
                    mark: receivedValues[row][15],
                },
                [receivedValues[row][16]]: {
                    timestamp: receivedValues[row][0],
                    topic: receivedValues[row][2],
                    judge: receivedValues[row][1],
                    position: receivedValues[row][13],
                    place: 3,
                    mark: receivedValues[row][17],
                },
                [receivedValues[row][19]]: {
                    timestamp: receivedValues[row][0],
                    topic: receivedValues[row][2],
                    judge: receivedValues[row][1],
                    position: receivedValues[row][18],
                    place: 4,
                    mark: receivedValues[row][20],
                },
                [receivedValues[row][21]]: {
                    timestamp: receivedValues[row][0],
                    topic: receivedValues[row][2],
                    judge: receivedValues[row][1],
                    position: receivedValues[row][18],
                    place: 4,
                    mark: receivedValues[row][22],
                }
            }
            valuesArray.push(formattedRow);
        }
    } else {
        alertify.error('The table is empty');
    }

    return valuesArray;
}

async function send() {
    try {
        let values = await getSortedValues()
            .catch(() => {
                throw new Error('Error retrieving data')
            });

        for (game in values) {
            let gameItem = values[game];
            for (player in Object.keys(gameItem)) {
                let playerItem = Object.keys(gameItem)[player];
                let text = formatMessage(gameItem[playerItem], playerItem, true, true);

                for (recipientItem in RECIPIENTS) {
                    if (recipientItem == playerItem || RECIPIENTS[recipientItem]["isAdmin"]) {
                        let url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${RECIPIENTS[recipientItem]["tID"]}&text=` + encodeURI(text) + `&parse_mode=markdown`;
                        try {
                            const request = await fetch(url);
                            const data = await request.json();
                            if (data.ok) {
                                alertify.success("Sent successfully");
                                let report = `■ Sender: ${data.result.from.first_name ? data.result.from.first_name : ""}${data.result.from.last_name ? " " + data.result.from.last_name : ""} (${data.result.from.id ? data.result.from.id : ""}${data.result.from.username ? ":" + data.result.from.username : ""})\n\n■ Recipient: ${data.result.chat.first_name ? data.result.chat.first_name : ""}${data.result.chat.last_name ? " " + data.result.chat.last_name : ""} (${data.result.chat.id ? data.result.chat.id : ""}${data.result.chat.username ? ":" + data.result.chat.username : ""})\n\n■ Message:\n\n${data.result.text}`;
                                console.log(report);
                            } else {
                                throw new Error('Error sending data');
                            }
                        } catch (e) {
                            throw new Error('Error sending data');
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error(e);
        alertify.error(e.message);
    }
}

async function download() {
    try {
        let isDownloadNeeded = confirm("Do you want to download report?");
        let fullText = '';

        let values = await getSortedValues()
            .catch(() => {
                throw new Error('Error retrieving data')
            });

        for (game in values) {
            let gameItem = values[game];
            for (player in Object.keys(gameItem)) {
                let playerItem = Object.keys(gameItem)[player];
                let text = formatMessage(gameItem[playerItem], playerItem, false, false);
                fullText = fullText.concat(text + '\n\n<hr noshade color="black" size="1px">\n');
                if (isDownloadNeeded) downloader(`${playerItem}.txt`,text);
            }
        }

        showPopup('Report:', fullText);
    } catch (e) {
        console.error(e);
        alertify.error(e.message);
    }
}

function clearTable() {
    let submitDelete = confirm("Are you sure want to clear the table?");
    if (submitDelete) {
        try {
            let request = gapi.client.sheets.spreadsheets.values.batchClear({
                spreadsheetId: SPREADSHEET_ID
            }, {
                ranges: PARTICIPANTS_RANGES
            });

            request.then(function() {
                alertify.success('Table has been cleaned');
            }, function(reason) {
                console.error('error: ' + reason.result.error.message);
                alertify.error('Table cleaning error');
            });
        } catch (e) {
            console.error(e);
            alertify.error('Error cleaning table');
        }
            
    }
}

function showPopup(heading, recipients) {
    popupBoxDiv.style.display = 'block';
    
    popupHeading.innerHTML = heading;

    if (typeof recipients == "object") {
        popupContent.innerHTML = JSON.stringify(recipients, undefined, 4);
    } else {
        popupContent.innerHTML = recipients;
    }

}

function closePopup() {
    popupBoxDiv.style.display = 'none';

}

function changeRecipients() {
    let newRecipients = prompt("Set recipients dataset (JSON):", JSON.stringify(RECIPIENTS));

    if (newRecipients) {
        try {
            let parsedNewRecipients = JSON.parse(newRecipients);
            showPopup('Recipients:', parsedNewRecipients);
            RECIPIENTS = parsedNewRecipients;
            database.ref('participants/recipients').set(RECIPIENTS);
            alertify.success("Recipients changed");
        } catch(e) {
            alertify.error("JSON parse error")
            console.log(e)
        }
    }
}

function changeSheetID() {
    let newSpreadsheetID = prompt("Enter sheet ID:", SPREADSHEET_ID);  

    if (newSpreadsheetID) {
        showPopup('Spreadsheet ID:', newSpreadsheetID);
        SPREADSHEET_ID = newSpreadsheetID;
        database.ref('participants/spreadsheet_id').set(SPREADSHEET_ID);
        alertify.success("Spreadsheet ID changed");
    }
}

function getBotUpdates() {
    let url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
    let fullText = '';

    loader.style.display = 'flex';
    section.style.display = 'none';

    fetch(url).then((response) => {
        return response.json();
    }).then((data) => {
        loader.style.display = 'none';
        section.style.display = 'inline';
        for (message in data.result) {
            if (data.result[message].message) {
                let messageItem = data.result[message].message;
                let timestamp = new Date(messageItem.date * 1000);
                let formattedMessage = `• Sender: ${messageItem.from.first_name ? messageItem.from.first_name : ""}${messageItem.from.last_name ? " " + messageItem.from.last_name : ""} (${messageItem.from.id ? messageItem.from.id : ""}${messageItem.from.username ? ':<a style="color: black;" href="https://t.me/'+ messageItem.from.username + '">' + messageItem.from.username + '</a>' : ""})\n• Date: ${formatDate(timestamp)}\n• Message: ${messageItem.text}\n\n<hr noshade color="black" size="1px">\n`;
                fullText = fullText.concat(formattedMessage);
            }
        }
        showPopup('Bot updates:', fullText);
    });
}

function formatMessage(values, recipient, isBold, isStickers) {
    let markdownChar = '';
    if (isBold) {
        markdownChar = '*';
    }

    let stickers = ['•', '•', '•', '•', '•', '•', '•', '■']
    if (isStickers) {
        stickers = ['⏰', '📝', '👨‍⚖️', '📢', '🥇', '📊', '📋'];
    }

    let text = `${markdownChar}${stickers[6]} ЗВІТ ДЛЯ ГРАВЦЯ: ${recipient}${markdownChar}

${stickers[0]} ${markdownChar}Дата:${markdownChar} ${values.timestamp}
${stickers[1]} ${markdownChar}Тема:${markdownChar} ${values.topic}
${stickers[2]} ${markdownChar}Суддя:${markdownChar} ${values.judge}
${stickers[3]} ${markdownChar}Позиція:${markdownChar} ${values.position}
${stickers[4]} ${markdownChar}Місце:${markdownChar} ${values.place}
${stickers[5]} ${markdownChar}Спікерський бал:${markdownChar} ${values.mark}`;

    return text;
}

function downloader(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function formatDate(date) {
    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
  
    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
  
    var yy = date.getFullYear() % 100;
    if (yy < 10) yy = '0' + yy;

    let hh = date.getHours();
    if (hh < 10) hh = '0' + hh;

    let mnmn = date.getMinutes();
    if (mnmn < 10) mnmn = '0' + mnmn;

    let ss = date.getSeconds();
    if (ss < 10) ss = '0' + ss;
  
    return hh + ':' + mnmn + ':' + ss + ' ' + dd + '.' + mm + '.' + yy;
}

function onlineListener() {
    window.addEventListener('load', event => {
        setTimeout(() => {
            if (isConnected == false) {
                loadingText.innerHTML = `<p>Loading took longer than expected. Maybe you're offline.<br><br><span onclick="location.reload();return false;">Try again?</span></p>`
            }
        }, 5000)
    })

    window.addEventListener('online', event => {
        alertify.dismissAll();
        alertify.notify('You are online again', 'success', 0);
    })

    window.addEventListener('offline', event => {
        alertify.dismissAll();
        alertify.notify('You are offline', 'error', 0);
    })
}