export class AnimatorNumber{
	readonly target: any;
	readonly propertyPath: string[];
	readonly keyframes: Keyframe<number>[] = [];

	private needsSorting = false;

	constructor(target: any, propertyPath: string){
		this.target = target;
		this.propertyPath = propertyPath.split(".");
	}

	addKeyframe(keyframe: Keyframe<number>){
		this.keyframes.push(keyframe);
		this.needsSorting = true;
	}

	update(time: number){
		if(this.keyframes.length === 0){
			return;
		}

		if(this.needsSorting){
			this.keyframes.sort((a, b) => {
				return a.time - b.time;
			});

			this.needsSorting = false;
		}

		if(this.keyframes.length === 1){
			this.value = this.keyframes[0].value;
		}

		const {first, second} = this.findKeyframes(time);

		this.polate(first, second, time);
	}

	private polate(first: Keyframe<number>, second: Keyframe<number>, time: number){
		const interpolate = first.time <= time && second.time > time;

		const t = 1 - (second.time - time) / (second.time - first.time);

		if(interpolate){
			this.value = first.interpolationFunction(first.value, second.value, t);
			return;
		}

		if(second.time < time){
			this.value = second.extrapolationFunction(first.value, second.value, t);
			return;
		}

		this.value = first.extrapolationFunction(first.value, second.value, t);
	}

	private findKeyframes(time: number): { first: Keyframe<number>, second: Keyframe<number> }{
		if(this.keyframes.length === 2 || this.keyframes[0].time > time){
			return { 
				first: this.keyframes[0],
				second: this.keyframes[1]
			};
		}

		for(let i = 1; i < this.keyframes.length - 1; i++){
			const keyframe = this.keyframes[i];

			if(keyframe.time > time){
				return {
					first: this.keyframes[i - 1],
					second: keyframe
				};
			}
		}

		return {
			first: this.keyframes[this.keyframes.length - 2],
			second: this.keyframes[this.keyframes.length - 1]
		};
	}

	private get value(){
		return AnimatorNumber.getRefValue(this.target, [...this.propertyPath]);
	}

	private set value(value){
		AnimatorNumber.setRefValue(this.target, [...this.propertyPath], value);
	}

	private static getRefValue(target: any, propertyPath: string[]): number {
		const nextTarget = target[propertyPath[0]];

		if(propertyPath.length > 1){
			propertyPath.shift();
			return AnimatorNumber.getRefValue(nextTarget, propertyPath);
		}

		return nextTarget;
	}

	private static setRefValue(target: any, propertyPath: string[], value: number){
		if(propertyPath.length > 1){
			const nextTarget = target[propertyPath[0]];

			propertyPath.shift();
			AnimatorNumber.setRefValue(nextTarget, propertyPath, value);
		}

		target[propertyPath[0]] = value;
	}
}

export class Keyframe<T>{
	readonly time: number;
	readonly value: T;
	readonly interpolationFunction: PolationFunction<T>;
	readonly extrapolationFunction: PolationFunction<T>;

	constructor(time: number, value: T, interpolationFunction: PolationFunction<T>, extrapolationFunction: PolationFunction<T>){
		this.time = time;
		this.value = value;
		this.interpolationFunction = interpolationFunction;
		this.extrapolationFunction = extrapolationFunction;
	}
}

export type PolationFunction<T> = (a: T, b: T, t: number) => T;

export function linearPolation(a: number, b: number, t: number): number{
	return a + t * (b - a);
}

export function constantPolation(a: number, b: number, t: number): number{
	return t < 1 ? a : b;
}