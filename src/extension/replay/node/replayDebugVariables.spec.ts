/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { describe, expect, it } from 'vitest';
import { chatStepToDebugVariables } from '../common/replayDebugVariables';
import { advanceReplay, beginReplay, createReplaySessionState, getCurrentStep } from '../common/replaySessionStepper';
import { parseReplay } from './replayParser';

const replayInput = JSON.stringify({
	prompts: [{
		prompt: 'Generate hello world',
		logs: [{
			kind: 'request',
			id: 'req-1',
			messages: 'system prompt + user prompt',
			response: ['model output']
		}, {
			kind: 'toolCall',
			id: 'tool-1',
			tool: 'write_file',
			args: JSON.stringify({ path: 'hello.ts', content: 'console.log("hello")' }),
			edits: [{
				path: 'hello.ts',
				edits: {
					replacements: [{
						replaceRange: { start: 0, endExclusive: 0 },
						newText: 'console.log("hello")'
					}]
				}
			}],
			response: ['wrote hello.ts']
		}]
	}]
}, null, 2);

describe('chat step debug variables', () => {
	it('surfaces useful fields and keeps previously read values stable as replay advances', () => {
		const steps = parseReplay(replayInput);
		const state = createReplaySessionState();
		beginReplay(state);

		const userStep = getCurrentStep(state, steps);
		expect(userStep?.kind).toBe('userQuery');
		const userVariables = chatStepToDebugVariables(userStep!);
		expect(userVariables.map(v => v.name)).toEqual(['kind', 'line', 'query']);

		advanceReplay(state);
		const requestStep = getCurrentStep(state, steps);
		expect(requestStep?.kind).toBe('request');
		const requestVariables = chatStepToDebugVariables(requestStep!);
		expect(requestVariables).toEqual(expect.arrayContaining([
			{ name: 'kind', value: 'request', type: 'string' },
			{ name: 'id', value: 'req-1', type: 'string' },
			{ name: 'payload.prompt', value: 'system prompt + user prompt', type: 'string' },
			{ name: 'payload.result', value: 'model output', type: 'string' }
		]));

		const requestSnapshot = [...requestVariables];
		advanceReplay(state);
		const toolStep = getCurrentStep(state, steps);
		expect(toolStep?.kind).toBe('toolCall');
		const toolVariables = chatStepToDebugVariables(toolStep!);
		expect(toolVariables).toEqual(expect.arrayContaining([
			{ name: 'kind', value: 'toolCall', type: 'string' },
			{ name: 'id', value: 'tool-1', type: 'string' },
			{ name: 'payload.toolName', value: 'write_file', type: 'string' },
			{ name: 'payload.args', value: '{"path":"hello.ts","content":"console.log(\\"hello\\")"}', type: 'object' },
			{ name: 'payload.results', value: '["wrote hello.ts"]', type: 'array' }
		]));

		expect(chatStepToDebugVariables(requestStep!)).toEqual(requestSnapshot);
	});
});
