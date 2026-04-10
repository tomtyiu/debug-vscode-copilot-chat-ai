/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { describe, expect, it } from 'vitest';
import { URI } from '../../../../util/vs/base/common/uri';
import { ClaudeSessionUri } from '../claudeChatSessionItemProvider';

describe('ClaudeSessionUri', () => {
	it('returns valid session ids', () => {
		const resource = URI.parse('claude-code:/4c289ca8-f8bb-4588-8400-88b78beb784d');
		expect(ClaudeSessionUri.getId(resource as any)).toBe('4c289ca8-f8bb-4588-8400-88b78beb784d');
	});

	it('rejects malicious session ids', () => {
		const maliciousResources = [
			'claude-code:/../../outside',
			'claude-code:/..%2f..%2foutside',
			'claude-code:/..%5C..%5Coutside',
			'claude-code:/%2e%2e/%2e%2e/outside',
			'claude-code:/normal/child'
		];

		for (const resourceString of maliciousResources) {
			const resource = URI.parse(resourceString);
			expect(() => ClaudeSessionUri.getId(resource as any)).toThrow('Invalid Claude Code session id');
		}
	});
});
