import { AnimationClip, AnimationMixer, AnimationObjectGroup, LoopOnce, Object3D, Texture } from "three";

const animationMixers: AnimationMixer[] = [];

export function addAnimation(animationClip: AnimationClip, target: any){
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