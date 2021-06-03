//META{"name":"FDPlugin", "author": "Olejka", "authorId":"388353045500657674", "website":"https://olejka.ru/", "source":"https://github.com/TheSainEyereg/BD-fake-deafen-plugin", "updateUrl":"https://raw.githubusercontent.com/TheSainEyereg/BD-fake-deafen-plugin/master/FakeDeafen.plugin.js"}*//

const Api = BdApi;

function mute(arg, callback) {
    let buttons = $('.container-3baos1 .horizontal-1ae9ci button');
    let mute = buttons.eq(buttons.length-3); //some shitty shit adding another shit to the tray
    console.log(mute);
    console.log(mute.attr('aria-checked') + '?=' + arg);
    
    if (mute.attr('aria-checked') != arg) {
        function checkFlag() {
            mute.click();
            if(mute.attr('aria-checked')==arg) {
                window.setTimeout(checkFlag, 100); //this checks the flag every 100 milliseconds
            } else {
                console.log('Matched!');
                if (callback) {callback()}
            }
        }
        checkFlag();
    } else {
        if (callback) {callback()}
    }
    console.log('Changed to '+mute.attr('aria-checked'));
};

function FuckUpWS() {
    mute('true', _ => {
        console.log('Enabled mute!');
        const Decoder = new TextDecoder("utf-8");
        WebSocket.prototype.original = WebSocket.prototype.send;
        WebSocket.prototype.send = function(data) {
            if (Object.prototype.toString.call(data) === "[object ArrayBuffer]") {
                if (Decoder.decode(data).includes("self_deaf")) {
                    data = data.replace('"self_mute":false', 'NiceOneDiscord');
                }
            }
            WebSocket.prototype.original.apply(this, [data]);
        }
        Api.setData('FakeDeafen', 'enabled', true);
        mute('false', _ => {console.log('Returned back!')});
    })
};
function restoreWS() {
    mute('true', _ => {
        console.log('Enabled mute!');
        WebSocket.prototype.send = WebSocket.prototype.original;
        Api.setData('FakeDeafen', 'enabled', false);
        mute('false', _ => {console.log('Returned back!')})
    })
};


function main() {
    let button = $(`
        <button 
            aria-label="FakeDeafen" 
            aria-checked="false" 
            role="switch" 
            type="button" 
            class="button-14-BFJ enabled-2cQ-u7 button-38aScr"
            id="fdButton"
        >
            <div class="contents-18-Yxp">FD</div>
        </button>
    `);
    let panel = $('.container-3baos1 .horizontal-1ae9ci');
    panel.prepend(button);

    button.on('click', _ => {
        if (!Api.getData('FakeDeafen', 'enabled')) {
            FuckUpWS();
            button.css('color', 'var(--status-positive-background)'); //--status-danger-background
        }
        else {
            restoreWS();
            button.removeAttr('style');
        }
    })
};

class FDPlugin {
    getName() {return 'FakeDeafen';}
    getShortName() {return 'FD';}
    getDescription() {return 'Plugin that allows you to fake your deafen.';}
    getVersion() {return '0.9.9';}
    //getSettingsPanel() {return '}

    start() {
        if (Api.getData('FakeDeafen', 'enabled')) {
            restoreWS();
        }
        let jquery_id = document.getElementById('jquery');
        if (!jquery_id) {
            Api.linkJS('jquery', 'https://code.jquery.com/jquery-3.5.1.min.js');
            jquery_id = document.querySelector('#jquery');
            jquery_id.addEventListener('load', _ => {
                main();
            })
        } else main();
    }
       
    stop() {
        if (Api.getData('FakeDeafen', 'enabled')) {
            restoreWS();
        }

        let button = $('#fdButton')
        button.remove();
    }
};