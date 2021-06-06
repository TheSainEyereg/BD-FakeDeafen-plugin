//META{"name":"FDPlugin", "author": "Olejka", "authorId":"388353045500657674", "website":"https://olejka.ru/", "source":"https://github.com/TheSainEyereg/BD-fake-deafen-plugin", "updateUrl":"https://raw.githubusercontent.com/TheSainEyereg/BD-fake-deafen-plugin/master/FakeDeafen.plugin.js"}*//

const Api = BdApi;

function mute(arg, callback) {
    let buttons = $('.container-3baos1 .horizontal-1ae9ci button');
    let mute = buttons.eq(buttons.length-3); //some shitty shit adding another shit to the tray
    //console.log(mute);
    //console.log(mute.attr('aria-checked') + '?=' + arg);
    
    if (mute.attr('aria-checked') == arg) {
        if (callback) setTimeout(callback, 100);
    } else {
        mute.click();
        //console.log('Clicked!')
        function check() {
            if(mute.attr('aria-checked')==arg) {
                //console.log('Matched! (' + mute.attr('aria-checked') + '?=' + arg + ')');
                //console.log('Changed to '+mute.attr('aria-checked'));
                if (callback) setTimeout(callback, 100);
                return
            } else {
                //console.log('Not matched! (' + mute.attr('aria-checked') + '?=' + arg + ')');
                //console.log('RECHECKING...')
                setTimeout(check, 100);
                return
            }
        }
        check();
    }
};

function FuckUpWS() {
    mute('true', _ => {
        //console.log('Enabled mute!');
        const Decoder = new TextDecoder("utf-8");
        WebSocket.prototype.original = WebSocket.prototype.send;
        WebSocket.prototype.send = function(data) {
            if (Object.prototype.toString.call(data) === "[object ArrayBuffer]") {
                if (Decoder.decode(data).includes("self_deaf")) {
                    data = data.replace('"self_mute":false', 'NiceOneDiscord');
                    //console.log('Replaced data!')
                }
            }
            WebSocket.prototype.original.apply(this, [data]);
            //console.log('Applied data!')
        }
        //console.log('Broken som things!')
        Api.setData('FakeDeafen', 'enabled', true);
        mute('false', _ => {/*console.log('Returned back!')*/});
    })
};
function restoreWS() {
    mute('true', _ => {
        //console.log('Enabled mute!');
        WebSocket.prototype.send = WebSocket.prototype.original;
        Api.setData('FakeDeafen', 'enabled', false);
        mute('false', _ => {/*console.log('Returned back!')*/})
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
};

class FDPlugin {
    getName() {return 'FakeDeafen';}
    getShortName() {return 'FD';}
    getDescription() {return 'Plugin that allows you to fake your deafen.';}
    getVersion() {return '1.0.1';}
    //getSettingsPanel() {return '}

    start() {
        if (!global.ZeresPluginLibrary) return window.BdApi.alert("Library Missing",`The library plugin needed for ${this.getName()} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), "https://raw.githubusercontent.com/TheSainEyereg/BD-fake-deafen-plugin/master/FakeDeafen.plugin.js");
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