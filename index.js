let botName = prompt("bot names?");
let ws;
let parseStr = "";
let parseIdx = 1;
let i3 = 1;
let i2 = 0;
let Val = "0";
let timer = 0;
let _encode = [
    'thing', ' ', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
    '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
    '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
    'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '{', '|', '}', '~'
];

let cloudData = [];
let getVM = () => app._reactRootContainer._internalRoot.current.child.stateNode.store.getState().scratchGui.vm;
let itemNumOf = (arr, targetValue) => 1 + arr.findIndex((value, index) => value.toLowerCase() == targetValue);
let letterOf = (arr, index) => arr[index - 1];
let mathMod = (a, b) => ((a % b) + Math.abs(b)) % Math.abs(b);

function getGameVersion () {
    let cloudSpriteVars = getVM().runtime.targets.find(sprite => sprite?.sprite?.name == "Cloud").variables;
    return Object.values(cloudSpriteVars).find(variable => variable?.name == "gameversion").value;
}

function initReader (text) {
    parseStr = text;
    parseIdx = 1;
}

function writeNumber (val) {
    if (val < 0) {
        if (val < -99999999) {
            Val =  "0";
        } else {
            Val = "0" + Math.abs(Math.round(val));
        }
    } else {
        if (val > 99999999) {
            Val = "0";
        } else {
            Val = String(Math.round(val));
        }
    }
    parseStr = parseStr + (Val.length + Val);
}

function readNumber () {
    Val = "0";
    let cached = parseInt(letterOf(parseStr, parseIdx));
    for (let i = 0; i < cached; i++) {
        parseIdx += 1;
        Val = parseInt(String(Val) + parseInt(letterOf(parseStr, parseIdx)))
    }
    
    if (Val[2] == 0) {
        Val = 0 - Val;
    }
    
    parseIdx += 1;
}

function writeString (txt) {
    writeNumber(txt.length);
    Val = "";
    i3 = 0;
    Object.values(txt).forEach(char => {
        i2 = itemNumOf(_encode, txt[i3].toLowerCase());
        if (i2 < 10) {
            Val = Val + "0" + i2;
        } else {
            Val = Val + i2;
        }
        i3 += 1;
    })
    parseStr = parseStr + Val;
}

function readString () {
    readNumber();

    if (parseIdx + (Val * 2) > parseStr.length + 1) {
        i2 = ((parseStr.length + 1) - parseIdx) / 2;
    } else {
        i2 = Val;
    }
    
    Val = "";

    let cachedI2 = i2;
    for (let i = 0; i < parseInt(cachedI2); i++) {
        i2 = parseInt(letterOf(parseStr, parseIdx) + letterOf(parseStr, parseIdx + 1));
        Val = Val + letterOf(_encode, i2);
        parseIdx += 2;
    }
}

function skipString () {
    readNumber();
    parseIdx += (Val * 2);
}

function writeChange (val) {
    if (Math.abs(val) < 50) {
        if (val < -40) {
            parseStr = parseStr + "0" + (val + 50);
        } else {
            parseStr = parseStr + (val + 50);
        }
    } else {
        parseStr = parseStr + "00";
        timer += 100;
    }
}

function connectWebSocket() {
    ws = new WebSocket(`wss://clouddata.${location.hostname}/`);

    ws.onopen = function () {
        ws.send(JSON.stringify({
            method: "handshake",
            user: getVM().runtime.ioDevices.userData._username,
            project_id: "843162693"
        }) + "\n");

        let playerCount = 50;
        let players = [];

        for (let i = 0; i < playerCount; i++) {
            let playerID = Math.floor(Math.random() * 6000);
            initReader("");
            writeString(botName + i);
            writeNumber(playerID);

            players.push({
                name: botName + i,
                encodedNameAndVersion: String(mathMod(getGameVersion(), 10) + parseStr),
                id: playerID,
                x: 1000 + i * 5,
                y: 1040,
                helmet: 0,
                chestplate: 0,
                talk: 0,
                claimIdx: 0,
                ngidx: 0,
                encodedStr: ""
            });
        }

        setInterval(() => {
            if (ws.readyState !== WebSocket.OPEN) return;

            let player = players[Math.floor(Math.random() * playerCount)];

            player.x = Math.floor(Math.random() * 8000);
            player.y = Math.floor(Math.random() * 2000);

            initReader(player.encodedNameAndVersion);
            writeNumber(player.helmet);
            writeNumber(player.chestplate);
            writeNumber(player.talk);
            writeNumber(player.claimIdx);
            writeNumber(player.x);
            writeNumber(player.y);
            writeNumber(player.ngidx);

            player.encodedStr = parseStr;

            let cloudVarIndex = Math.floor(Math.random() * 9) + 1;
            ws.send(JSON.stringify({
                method: "set",
                user: getVM().runtime.ioDevices.userData._username,
                project_id: "843162693",
                name: "☁ CLOUD" + cloudVarIndex,
                value: player.encodedStr
            }) + "\n");
        }, 100);
    };

    ws.onclose = function () {
        setTimeout(connectWebSocket, 1000);
    };

}

connectWebSocket();
