/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, test } from 'vitest';
import { parseReplay } from './replayParser';

describe('replay file parsing', function () {
	test('full parsing example', async function () {
		const content = fs.readFileSync(path.join(__dirname, 'spec.chatreplay.json'), 'utf8');
		const parsed = parseReplay(content);

		assert.strictEqual(parsed.length, 9, 'should have 9 steps');
		assert.strictEqual(parsed[0].kind, 'userQuery', 'should start with userQuery');
		parsed.forEach(step => {
			assert(step.line > 0, 'should have line value assigned to each step');
		});
	});

	test('parses single-prompt exports without prompts wrapper', () => {
		const content = JSON.stringify({
			prompt: 'single prompt',
			logs: [
				{ kind: 'request', id: 'req-1', messages: 'message', response: ['ok'] }
			]
		}, null, 2);

		const parsed = parseReplay(content);

		expect(parsed.map(step => step.kind)).toEqual(['userQuery', 'request']);
		expect(parsed[0]).toMatchObject({ kind: 'userQuery', query: 'single prompt' });
		expect(parsed[1]).toMatchObject({ kind: 'request', id: 'req-1', result: 'ok' });
	});

	test('skips invalid prompts while preserving valid prompts', () => {
		const content = JSON.stringify({
			prompts: [
				{ prompt: 'valid prompt', logs: [{ kind: 'request', id: 'req-1', messages: 'x', response: ['a'] }] },
				{ notPrompt: true }
			]
		}, null, 2);

		const parsed = parseReplay(content);
		expect(parsed.length).toBe(2);
		expect(parsed[0]).toMatchObject({ kind: 'userQuery', query: 'valid prompt' });
		expect(parsed[1]).toMatchObject({ kind: 'request', id: 'req-1', result: 'a' });
	});
});
