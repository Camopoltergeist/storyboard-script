import { AnimationAction, AnimationClip, AnimationMixer, LoopOnce } from "three";

const animationMixers: AnimationMixer[] = [];
const animationActions: AnimationAction[] = [];

export function addAnimation(animationClip: AnimationClip, target: any){
	const mixer = new AnimationMixer(target);
	const action = mixer.clipAction(animationClip);

	action.setLoop(LoopOnce, 0);
	action.play();
	action.reset();

	animationMixers.push(mixer);
	animationActions.push(action);
}

export function updateAnimations(time: number){
	const scaledTime = time / 1000;

	for(const action of animationActions){
		action.enabled = true;
		action.play();
		action.reset();
	}

	for(const mixer of animationMixers){
		mixer.setTime(scaledTime);
	}
}
