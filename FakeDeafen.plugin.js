/**
 * @name FakeDeafen
 * @invite undefined
 * @authorLink undefined
 * @donate undefined
 * @patreon undefined
 * @website https://github.com/TheSainEyereg/BD-FakeDeafen-plugin
 * @source https://raw.githubusercontent.com/TheSainEyereg/BD-FakeDeafen-plugin/master/FakeDeafen.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
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
    const config = {"info":{"name":"Fake Deafen","authors":[{"name":"Olejka","discord_id":"388353045500657674","github_username":"TheSainEyereg","twitter_username":"olejka_top4ik"}],"version":"2.5.0","description":"Plugin that allows you to fake your mute and deafen.\n\nPlease note that code is still peace of crap, and I'm not going to fix this, because I'm not wirking with BD anymore. You can stil contact me if you want help with this plugin.","github":"https://github.com/TheSainEyereg/BD-FakeDeafen-plugin","github_raw":"https://raw.githubusercontent.com/TheSainEyereg/BD-FakeDeafen-plugin/master/FakeDeafen.plugin.js"},"changelog":[{"title":"Fixes","type":"fixed","items":["Now button does not disappears for some reason."]},{"title":"On-going","type":"progress","items":["Send Discord API request to mute/deafen user."]}],"main":"index.js"};

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
	//Fixes:"fixed", Improvements:"improved", Added:"new", On-going:"progress"
	const {Logger, WebpackModules, Patcher, DiscordModules, Settings} = Library;
	const {React} = DiscordModules;
	const Flex = WebpackModules.getModule(m => m.default && m.default.displayName == "Flex");
	const PanelButton = WebpackModules.getModule(m => m.default && m.default.displayName == "PanelButton");

	class FD_Button extends React.Component {
		constructor(props) {
			super(props);
			this.handleClick = this.handleClick.bind(this);
		}

		handleClick() {
			if (!BdApi.getData("FakeDeafen", "enabled")) {
				replaceWS();
				changeColor(true);
			}
			else {
				restoreWS();
				changeColor(false);
			}
			
		}

		render() {
			return React.createElement("button", {
				role: "switch",
				type: "button",
				className: "button-12Fmur enabled-9OeuTA button-f2h6uQ lookBlank-21BCro colorBrand-I6CyqQ grow-2sR_-F FD",
				onClick: this.handleClick
			}, "FD");
		}
	}

	function changeColor(bool) {
		const button = document.querySelector(".container-YkUktl .horizontal-112GEH button.FD");
		if (bool) button.style.color = "var(--status-positive-background)" //--status-danger-background
		else button.style.color = "";
	}

	function onAriaChange(arg, callback) {
		const buttons = document.querySelectorAll(".container-YkUktl .horizontal-112GEH button");
		const button = buttons[this.settings.action == "mute"?buttons.length-3:buttons.length-2]; //some plugins adding another buttons
		if (button.getAttribute("aria-checked") == arg) {
			if (callback) setTimeout(callback, 100);
		} else {
			button.click();
			function check() {
				if(button.getAttribute("aria-checked")==arg) {
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

	function replaceWS() {
		onAriaChange("true", _ => {
			const Decoder = new TextDecoder("utf-8");
			WebSocket.prototype.original = WebSocket.prototype.send;
			WebSocket.prototype.send = function(data) {
				if (Object.prototype.toString.call(data) === "[object ArrayBuffer]") {
					if (Decoder.decode(data).includes("self_deaf")) {
						data = data.replace("\"self_mute\":false", "NiceOneDiscord");
					}
				}
				WebSocket.prototype.original.apply(this, [data]);
			}
			BdApi.setData("FakeDeafen", "enabled", true);
			onAriaChange("false");
		})
	};
	function restoreWS() {
		onAriaChange("true", _ => {
			console.log("Enabled mute!");
			WebSocket.prototype.send = WebSocket.prototype.original;
			BdApi.setData("FakeDeafen", "enabled", false);
			onAriaChange("false")
		})
	};

	return class FakeDeafen extends Plugin {
		constructor() {
			super();
			this.defaultSettings = {};
			this.defaultSettings.action = "mute"; // "mute" or "deafen"
			onAriaChange = onAriaChange.bind(this);
		}

		onStart() {
			Patcher.before(Logger, "log", (t, a) => {
				a[0] = "Patched Message: " + a[0];
			});

			this.path();
			
			if (BdApi.getData("FakeDeafen", "enabled")) {
				restoreWS();
			}
			
			Logger.log("Started");
		}

		onStop() {
			if (BdApi.getData("FakeDeafen", "enabled")) {
				restoreWS();
			}

			Patcher.unpatchAll();
			Logger.log("Stopped");
		};

		getSettingsPanel() {
			return Settings.SettingPanel.build(this.saveSettings.bind(this), 
				new Settings.RadioGroup("Select a button action", "What should be done when \"FD\" button is pressed", this.settings.action, [
					{name: "Fake mute", value: "mute"},
					{name: "Fake deafen", value: "deafen"},
				], (e) => {this.settings.action = e;}),
			);
		}

		path() {
			Patcher.after(Flex, "default", (_, [props], ret) => {
				if (props.basis != "auto" || props.children?.length != 3 || props.grow != 0 || props.shrink != 1) return;
				ret.props.children = [
                    React.createElement(FD_Button, { className: "FD-button" }),
                    props.children
                ]
			});
		}
	};
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/