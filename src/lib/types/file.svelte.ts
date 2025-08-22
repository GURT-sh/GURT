import { converters } from "$lib/converters";
import type { Converter } from "$lib/converters/converter.svelte";
import { error } from "$lib/logger";
import { addToast } from "$lib/store/ToastProvider";

export class VertFile {
	public id: string = Math.random().toString(36).slice(2, 8);
	public readonly file: File;

	public get from() {
		return ("." + this.file.name.split(".").pop() || "").toLowerCase();
	}

	public get name() {
		return this.file.name;
	}

	public progress = $state(0);
	public result = $state<VertFile | null>(null);

	public to = $state("");

	public blobUrl = $state<string>();

	public processing = $state(false);

	public converters: Converter[] = [];

	public findConverters(supportedFormats: string[] = [this.from]) {
		const converter = this.converters.filter((converter) =>
			converter.formatStrings().map((f) => supportedFormats.includes(f)),
		);
		return converter;
	}

	public findConverter() {
		const converter = this.converters.find(
			(converter) =>
				converter.formatStrings().includes(this.from) &&
				converter.formatStrings().includes(this.to),
		);
		return converter;
	}

	constructor(file: File, to: string, blobUrl?: string) {
		const ext = file.name.split(".").pop();
		const newFile = new File(
			[file.slice(0, file.size, file.type)],
			`${file.name.split(".").slice(0, -1).join(".")}.${ext?.toLowerCase()}`,
		);
		this.file = newFile;
		this.to = to;
		this.converters = converters.filter((c) =>
			c.formatStrings().includes(this.from),
		);
		this.convert = this.convert.bind(this);
		this.download = this.download.bind(this);
		this.blobUrl = blobUrl;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public async convert(...args: any[]) {
		if (!this.converters.length) throw new Error("No converters found");
		const converter = this.findConverter();
		if (!converter) throw new Error("No converter found");
		this.result = null;
		this.progress = 0;
		this.processing = true;
		let res;
		try {
			res = await converter.convert(this, this.to, ...args);
			this.result = res;
		} catch (err) {
			const castedErr = err as Error;
			error(["files"], castedErr.message);
			addToast(
				"error",
				`Error converting file ${this.file.name}: ${castedErr.message || castedErr}`,
			);
			this.result = null;
		}
		this.processing = false;
		return res;
	}

	public async download() {
		if (!this.result) throw new Error("No result found");

		// give the freedom to the converter to set the extension (ie. pandoc uses this to output zips)
		let to = this.result.to;
		if (!to.startsWith(".")) to = `.${to}`;

		const settings = JSON.parse(localStorage.getItem("settings") ?? "{}");
		const filenameFormat = settings.filenameFormat || "VERT_%name%";

		const format = (name: string) => {
			const date = new Date().toISOString();
			const baseName = this.file.name.replace(/\.[^/.]+$/, "");
			const originalExtension = this.file.name.split(".").pop()!;
			return name
				.replace(/%date%/g, date)
				.replace(/%name%/g, baseName)
				.replace(/%extension%/g, originalExtension);
		};

		const blob = URL.createObjectURL(
			new Blob([await this.result.file.arrayBuffer()], {
				type: to.slice(1),
			}),
		);
		const a = document.createElement("a");
		a.href = blob;
		a.download = `${format(filenameFormat)}${to}`;
		// force it to not open in a new tab
		a.target = "_blank";
		a.style.display = "none";
		a.click();
		URL.revokeObjectURL(blob);
		a.remove();
	}
}

export interface Categories {
	[key: string]: {
		formats: string[];
		canConvertTo?: string[];
	};
}
