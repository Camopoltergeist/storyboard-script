export class AnimatorNumber{
	target: any;
	propertyPath: string[];

	constructor(target: any, propertyPath: string){
		this.target = target;
		this.propertyPath = propertyPath.split(".");
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