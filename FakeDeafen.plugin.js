//META{"name":"FDPlugin", "author": "Olejka", "authorId":"388353045500657674", "website":"https://olejka.ru/", "source":"https://github.com/TheSainEyereg/BD-fake-deafen-plugin", "updateUrl":"https://raw.githubusercontent.com/TheSainEyereg/BD-fake-deafen-plugin/master/FakeDeafen.plugin.js"}*//

const Api = BdApi;
const raw = 'https://raw.githubusercontent.com/TheSainEyereg/BD-fake-deafen-plugin/master/FakeDeafen.plugin.js'

function mute(arg, callback) {
    let buttons = $('.container-3baos1 .horizontal-1ae9ci button');
    let mute = buttons.eq(buttons.length-3); //some shitty shit adding another shit to the tray
    
    if (mute.attr('aria-checked') == arg) {
        if (callback) setTimeout(callback, 100);
    } else {
        mute.click();
        function check() {
            if(mute.attr('aria-checked')==arg) {
                if (callback) setTimeout(callback, 100);
                return
            } else {
                setTimeout(check, 100);
                return
            }
        }
        check();
    }
};

function FuckUpWS() {
    mute('true', _ => {
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
        mute('false');
    })
};
function restoreWS() {
    mute('true', _ => {
        //console.log('Enabled mute!');
        WebSocket.prototype.send = WebSocket.prototype.original;
        Api.setData('FakeDeafen', 'enabled', false);
        mute('false')
    })
};


function main() {
    if (Api.getData('FakeDeafen', 'enabled')) {
        restoreWS();
    }
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

    setTimeout(ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), raw), 60000)
};

class FDPlugin {
    getName() {return 'FakeDeafen';}
    getShortName() {return 'FD';}
    getDescription() {return 'Plugin that allows you to fake your deafen.';}
    getVersion() {return '1.0.3';}
    //getSettingsPanel() {return '}

    start() {
        if (!global.ZeresPluginLibrary) return window.BdApi.alert("Library Missing",`The library plugin needed for ${this.getName()} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), raw);
        
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