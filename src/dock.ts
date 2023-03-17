const cullKeyframesElement = document.getElementById("cullKeyframes") as HTMLInputElement | null;
const useVariableCompressionElement = document.getElementById("useVariableCompression") as HTMLInputElement | null;
const generateButton = document.getElementById("generateButton") as HTMLButtonElement | null;
const storyboardOutputElement = document.getElementById("storyboardOutput") as HTMLDivElement | null;
const startTimeElement = document.getElementById("startTime") as HTMLInputElement | null;
const endTimeElement = document.getElementById("endTime") as HTMLInputElement | null;
const frameRateElement = document.getElementById("frameRate") as HTMLInputElement | null;
const progressBarElement = document.getElementById("progressBar") as HTMLInputElement | null;
const optionsElement = document.getElementById("options") as HTMLDivElement | null;

if(cullKeyframesElement === null ||
	useVariableCompressionElement === null ||
	generateButton === null ||
	storyboardOutputElement === null ||
	startTimeElement === null ||
	endTimeElement === null ||
	frameRateElement === null ||
	progressBarElement === null ||
	optionsElement === null
	){
	throw new Error("Could not find option elements in document!");
}

type GenerateListener = (options: GenerateOptions) => any;

let generateListener: GenerateListener;

export function setGenerateListener(eventListener: GenerateListener){
	generateListener = eventListener;
	(generateButton as HTMLButtonElement).addEventListener("click", async (e) => { generateListenerWrapper(e); });
}

export interface GenerateOptions{
	cullKeyframes: boolean;
	useVariableCompression: boolean;
	startTime: number;
	endTime: number;
	frameRate: number;
}

function generateListenerWrapper(e: MouseEvent){
	const cullKeyframes = (cullKeyframesElement as HTMLInputElement).checked;
	const useVariableCompression = (useVariableCompressionElement as HTMLInputElement).checked;
	const startTime = Number((startTimeElement as HTMLInputElement).value);
	const endTime = Number((endTimeElement as HTMLInputElement).value);
	const frameRate = Number((frameRateElement as HTMLInputElement).value);

	const options = {
		cullKeyframes,
		useVariableCompression,
		startTime,
		endTime,
		frameRate
	};

	saveOptions(options);
	generateListener(options);
}

export function setOutput(output: string){
	(storyboardOutputElement as HTMLDivElement).innerText = output;
}

export function setProgressBar(progress: number){
	const percentage = progress * 100;
	(progressBarElement as HTMLDivElement).style.width = `${percentage}%`;
}

export function disableOptions(){
	(optionsElement as HTMLDivElement).classList.add("disableOptions");
}

export function enableOptions(){
	(optionsElement as HTMLDivElement).classList.remove("disableOptions");
}

const defaultOptions: GenerateOptions = {
	cullKeyframes: true,
	useVariableCompression: true,
	startTime: 0,
	endTime: 0,
	frameRate: 15
};

function loadOptions() {
	const optionsString = localStorage.getItem("generateOptions") as any;
	
	let options: Partial<GenerateOptions>;

	try{
		options = JSON.parse(optionsString);
	}
	catch(e){
		options = {};
	}

	const assignedOptions = Object.assign(defaultOptions, options);

	(cullKeyframesElement as HTMLInputElement).checked = assignedOptions.cullKeyframes;
	(useVariableCompressionElement as HTMLInputElement).checked = assignedOptions.useVariableCompression;
	(startTimeElement as HTMLInputElement).value = String(assignedOptions.startTime);
	(endTimeElement as HTMLInputElement).value = String(assignedOptions.endTime);
	(frameRateElement as HTMLInputElement).value = String(assignedOptions.frameRate);
}

function saveOptions(options: GenerateOptions){
	const optionsString = JSON.stringify(options);
	localStorage.setItem("generateOptions", optionsString);
}

loadOptions();