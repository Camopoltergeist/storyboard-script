const cullKeyframesElement = document.getElementById("cullKeyframes") as HTMLInputElement | null;
const useVariableCompressionElement = document.getElementById("useVariableCompression") as HTMLInputElement | null;
const generateButton = document.getElementById("generateButton") as HTMLButtonElement | null;
const storyboardOutputElement = document.getElementById("storyboardOutput") as HTMLDivElement | null;

if(cullKeyframesElement === null || useVariableCompressionElement === null || generateButton === null || storyboardOutputElement === null){
	throw new Error("Could not find option elements in document!");
}

type GenerateListener = (options: GenerateOptions) => any;

let generateListener: GenerateListener;

export function setGenerateListener(eventListener: GenerateListener){
	generateListener = eventListener;
	(generateButton as HTMLButtonElement).addEventListener("click", generateListenerWrapper);
}

export interface GenerateOptions{
	cullKeyframes: boolean;
	useVariableCompression: boolean;
}

function generateListenerWrapper(e: MouseEvent){
	const cullKeyframes = (cullKeyframesElement as HTMLInputElement).checked;
	const useVariableCompression = (useVariableCompressionElement as HTMLInputElement).checked;

	const options = {
		cullKeyframes,
		useVariableCompression
	}

	generateListener(options);
}

export function setOutput(output: string){
	(storyboardOutputElement as HTMLDivElement).innerText = output;
}