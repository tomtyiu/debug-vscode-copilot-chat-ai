/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { describe, expect, it } from 'vitest';
import { type ChatStep } from '../common/chatReplayResponses';
import { advanceReplay, beginReplay, createReplaySessionState, getCurrentStep } from '../common/replaySessionStepper';

const sampleSteps: ChatStep[] = [
	{ kind: 'userQuery', query: 'prompt', line: 1 },
	{ kind: 'request', id: 'req-1', prompt: 'p', result: 'r', line: 2 }
];

describe('replay session stepping', () => {
	it('returns current step and advances deterministically', () => {
		const state = createReplaySessionState();
		beginReplay(state);

		expect(getCurrentStep(state, sampleSteps)).toEqual(sampleSteps[0]);
		advanceReplay(state);
		expect(getCurrentStep(state, sampleSteps)).toEqual(sampleSteps[1]);
		advanceReplay(state);
		expect(getCurrentStep(state, sampleSteps)).toBeUndefined();
	});

	it('keeps completion state stable on repeated reads after completion', () => {
		const state = createReplaySessionState();
		beginReplay(state);

		advanceReplay(state);
		advanceReplay(state);
		expect(getCurrentStep(state, sampleSteps)).toBeUndefined();
		expect(getCurrentStep(state, sampleSteps)).toBeUndefined();
	});
});
