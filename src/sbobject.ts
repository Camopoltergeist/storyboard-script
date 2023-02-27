import { SBKeyframe } from "./sbkeyframe";

export class SBObject{
	readonly textureName: string;
	readonly keyframes: SBKeyframe[] = [];

	constructor(textureName: string){
		this.textureName = textureName;
	}

	toSBString(): string{
		if(this.keyframes.length < 2){
			return "";
		}

		const firstKf = this.keyframes[0];
		let ret = `Sprite,4,2,"${this.textureName}",${firstKf.position.x.toFixed(2)},${firstKf.position.y.toFixed(2)}\n`;

		for(let i = 0; i < this.keyframes.length - 1; i++){
			const kf = this.keyframes[i];
			const nextKf = this.keyframes[i + 1];

			ret += kf.toSBString(nextKf);
		}

		return ret;
	}
}