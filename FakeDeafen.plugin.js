/**
 * @name FakeDeafen
 * @authorLink https://olejka.ru/
 * @website https://olejka.ru/
 * @source https://github.com/TheSainEyereg/BD-FakeDeafen-plugin
 */
/*@cc_on
@if (@_jscript)
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%/BetterDiscord/plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else@*/

module.exports = (() => {
    const config = {
        "info":{
            "name":"Fake Deafen",
            "authors":[
                {
                    "name":"Olejka",
                    "discord_id":"388353045500657674",
                    "github_username":"TheSainEyereg",
                    "twitter_username":"olejka_top4ik"
                }
            ],
            "version":"2.1.0",
            "description":"Plugin that allows you to fake your mute and deafen.",
            "github":"https://github.com/TheSainEyereg/BD-FakeDeafen-plugin",
            "github_raw":"https://raw.githubusercontent.com/TheSainEyereg/BD-FakeDeafen-plugin/master/FakeDeafen.plugin.js"
        },
        "changelog":[ //Fixes:"fixed", Improvements:"improved", Improvements:"type"
            {
                "title":"Improvements",
                "type":"improved",
                "items":[
                    "Removed jQuery which caused poor performance"
                ]
            },
            {
                "title":"On-going",
                "type":"progress",
                "items":[
                    "Use React component to mute/unmute user."
                ]
            }
        ],
        "main":"index.js"
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {

    const {Logger, Patcher, Settings} = Library;

    return class FakeDeafen extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {};
            this.defaultSettings.action = "mute"; // "mute" or "deafen"
        }


        aria_check(arg, callback) {
            const buttons = document.querySelectorAll('.container-3baos1 .horizontal-1ae9ci button');
            const button = buttons[this.settings.action == "mute"?buttons.length-3:buttons.length-2]; //some plugins adding another buttons
            if (button.getAttribute('aria-checked') == arg) {
                if (callback) setTimeout(callback, 100);
            } else {
                button.click();
                function check() {
                    if(button.getAttribute('aria-checked')==arg) {
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

        replaceWS() {
            this.aria_check('true', _ => {
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
                BdApi.setData('FakeDeafen', 'enabled', true);
                this.aria_check('false');
            })
        };
        restoreWS() {
            this.aria_check('true', _ => {
                //console.log('Enabled mute!');
                WebSocket.prototype.send = WebSocket.prototype.original;
                BdApi.setData('FakeDeafen', 'enabled', false);
                this.aria_check('false')
            })
        };


        onStart() {
            if (BdApi.getData('FakeDeafen', 'enabled')) {
                this.restoreWS();
            }
            const button = new DOMParser().parseFromString(`
                <button 
                    aria-label="FakeDeafen"
                    role="switch" 
                    type="button" 
                    class="button-14-BFJ enabled-2cQ-u7 button-38aScr"
                    id="fdButton"
                >
                    <div class="contents-18-Yxp">FD</div>
                </button>
            `, 'text/html').body.childNodes[0];
            const panel = document.querySelector('.container-3baos1 .horizontal-1ae9ci');
            panel.prepend(button);

            button.on('click', _ => {
                if (!BdApi.getData('FakeDeafen', 'enabled')) {
                    this.replaceWS();
                    button.style.color = 'var(--status-positive-background)' //--status-danger-background
                }
                else {
                    this.restoreWS();
                    button.style.color = ''
                }
            })

            Logger.log("Started");
            Patcher.before(Logger, "log", (t, a) => {
                a[0] = "Patched Message: " + a[0];
            });
        }

        onStop() {
            if (BdApi.getData('FakeDeafen', 'enabled')) {
                this.restoreWS();
            }
    
            let button = document.getElementById('fdButton');
            button.remove();

            Logger.log("Stopped");
            Patcher.unpatchAll();
        };

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this), 
                new Settings.RadioGroup("Select a button action", "What should be done when \"FD\" button is pressed", this.settings.action, [
                    {name: "Fake mute", value: "mute"},
                    {name: "Fake deafen", value: "deafen"},
                ], (e) => {this.settings.action = e;}),
            );
        }
    };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/