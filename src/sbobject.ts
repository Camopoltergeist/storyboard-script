import { SBKeyframe } from "./sbkeyframe";

export class SBObject{
	readonly textureName: string;
	readonly keyframes: SBKeyframe[] = [];

	constructor(textureName: string){
		this.textureName = textureName;
	}
}