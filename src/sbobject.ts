import { degToRad } from "three/src/math/MathUtils";
import { Cullable, SBAlpha, SBPositionKeyframe, SBPosition, SBRotation, SBScale } from "./sbkeyframe";

export class SBObject{
	readonly textureName: string;
	readonly posKeyframes: SBPositionKeyframe[] = [];
	readonly alphaKeyframes: SBAlpha[] = [];
	readonly center: boolean;

	constructor(textureName: string, center: boolean){
		this.textureName = textureName;
		this.center = center;
	}

	clearKeyframes(){
		this.posKeyframes.length = 0;
		this.alphaKeyframes.length = 0;
	}

	toSBString(): string{
		if(this.posKeyframes.length < 2){
			return "";
		}

		let posFrames = [];
		let rotFrames = [];
		let scaleFrames = [];

		for(const kf of this.posKeyframes){
			const split = kf.split();

			posFrames.push(split.pos);
			rotFrames.push(split.rot);
			scaleFrames.push(split.scale);
		}

		posFrames = cullFrames(posFrames, 0.1) as SBPosition[];
		rotFrames = cullFrames(rotFrames, degToRad(0.1)) as SBRotation[];
		scaleFrames = cullFrames(scaleFrames, 0.005) as SBScale[];

		const firstKf = posFrames[0];
		let ret = `Sprite,4,${this.center ? "1" : "2"},"${this.textureName}",${firstKf.position.x.toFixed(2)},${firstKf.position.y.toFixed(2)}\n`;

		for(let i = 0; i < posFrames.length - 1; i++){
			const kf = posFrames[i];
			const nextKf = posFrames[i + 1];

			ret += SBPosition.genSBString(kf, nextKf);
		}

		for(let i = 0; i < rotFrames.length - 1; i++){
			const kf = rotFrames[i];
			const nextKf = rotFrames[i + 1];

			ret += SBRotation.genSBString(kf, nextKf);
		}

		for(let i = 0; i < scaleFrames.length - 1; i++){
			const kf = scaleFrames[i];
			const nextKf = scaleFrames[i + 1];

			ret += SBScale.genSBString(kf, nextKf);
		}

		for(let i = 0; i < this.alphaKeyframes.length - 1; i++){
			const kf = this.alphaKeyframes[i];
			const nextKf = this.alphaKeyframes[i + 1];

			ret += SBAlpha.genSBString(kf, nextKf);
		}

		return ret;
	}
}

function cullFrames(frameArr: Cullable[], threshold: number): Cullable[]{
	const ret = [];
	ret.push(frameArr[0]);

	for(let i = 1; i < frameArr.length - 1; i++){
		const prev = ret[ret.length - 1];
		const current = frameArr[i];
		const next = frameArr[i + 1];

		if(current.cullable(prev, next, threshold)){
			continue;
		}

		ret.push(current);
	}

	ret.push(frameArr[frameArr.length - 1]);

	return ret;
}