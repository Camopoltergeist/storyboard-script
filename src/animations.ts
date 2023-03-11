import { AnimationClip, AnimationMixer, LoopOnce, Object3D } from "three";

const animationMixers: AnimationMixer[] = [];

export function addAnimation(animationClip: AnimationClip, target: Object3D){
	const mixer = new AnimationMixer(target);
	const action = mixer.clipAction(animationClip);

	action.setLoop(LoopOnce, 0);
	action.play();
	action.reset();

	animationMixers.push(mixer);
}

export function updateAnimations(time: number){
	const scaledTime = time / 1000;

	for(const mixer of animationMixers){
		mixer.setTime(scaledTime);
	}
}