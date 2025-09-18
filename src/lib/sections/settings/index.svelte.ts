import { PUB_VERTD_URL } from "$env/static/public";
import type { ConversionBitrate } from "$lib/converters/ffmpeg.svelte";
import type { ConversionSpeed } from "$lib/converters/vertd.svelte";
import { VertdInstance } from "./vertdSettings.svelte";

export { default as Appearance } from "./Appearance.svelte";
export { default as Conversion } from "./Conversion.svelte";
export { default as Vertd } from "./Vertd.svelte";
export { default as Privacy } from "./Privacy.svelte";

export interface ISettings {
	filenameFormat: string;
	plausible: boolean;
	vertdURL: string;
	vertdSpeed: ConversionSpeed; // videos
	magickQuality: number; // images
	ffmpegQuality: ConversionBitrate; // audio (or audio <-> video)
	ffmpegSampleRate: string; // audio (or audio <-> video)
	ffmpegCustomSampleRate: number; // audio (or audio <-> video) - only used when ffmpegSampleRate is "custom"
}

export class Settings {
	public static instance = new Settings();

	public settings: ISettings = $state({
		filenameFormat: "VERT_%name%",
		plausible: true,
		vertdURL: PUB_VERTD_URL,
		vertdSpeed: "slow",
		magickQuality: 100,
		ffmpegQuality: "auto",
		ffmpegSampleRate: "auto",
		ffmpegCustomSampleRate: 44100,
	});

	public save() {
		localStorage.setItem("settings", JSON.stringify(this.settings));
		VertdInstance.instance.save();
	}

	public load() {
		VertdInstance.instance.load();
		const ls = localStorage.getItem("settings");
		if (!ls) return;
		const settings: ISettings = JSON.parse(ls);
		this.settings = {
			...this.settings,
			...settings,
		};
	}
}
