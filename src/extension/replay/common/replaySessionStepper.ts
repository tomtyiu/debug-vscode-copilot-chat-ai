/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { ChatStep } from './chatReplayResponses';

export interface ReplaySessionState {
	currentIndex: number;
}

export function createReplaySessionState(): ReplaySessionState {
	return { currentIndex: -1 };
}

export function beginReplay(state: ReplaySessionState): void {
	state.currentIndex = 0;
}

export function getCurrentStep(state: ReplaySessionState, chatSteps: ChatStep[]): ChatStep | undefined {
	if (state.currentIndex >= 0 && state.currentIndex < chatSteps.length) {
		return chatSteps[state.currentIndex];
	}

	state.currentIndex++;
	return undefined;
}

export function advanceReplay(state: ReplaySessionState): void {
	state.currentIndex++;
}
