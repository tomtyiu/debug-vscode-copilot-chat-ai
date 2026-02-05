/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { describe, expect, it } from 'vitest';
import { TRAJECTORY_SCHEMA_VERSION, type IAgentTrajectory } from '../../../platform/trajectory/common/trajectoryTypes';
import { collectTrajectoryWithSubagents } from './trajectoryExport';

function trajectory(sessionId: string, subagentRefs: string[] = []): IAgentTrajectory {
	return {
		schema_version: TRAJECTORY_SCHEMA_VERSION,
		session_id: sessionId,
		agent: { name: 'copilot-agent', version: 'test' },
		steps: [{
			step_id: 1,
			source: 'agent',
			message: 'step',
			observation: {
				results: [{
					subagent_trajectory_ref: subagentRefs.map(id => ({ session_id: id }))
				}]
			}
		}]
	};
}

describe('collectTrajectoryWithSubagents', () => {
	it('collects recursively referenced subagent trajectories', () => {
		const main = trajectory('main', ['sub-1']);
		const sub1 = trajectory('sub-1', ['sub-2']);
		const sub2 = trajectory('sub-2');

		const all = new Map([
			[main.session_id, main],
			[sub1.session_id, sub1],
			[sub2.session_id, sub2]
		]);

		const collected = collectTrajectoryWithSubagents(main, all);
		expect([...collected.keys()]).toEqual(['main', 'sub-1', 'sub-2']);
	});

	it('handles cycles and missing references deterministically', () => {
		const main = trajectory('main', ['sub-1', 'missing']);
		const sub1 = trajectory('sub-1', ['main']);
		const all = new Map([
			[main.session_id, main],
			[sub1.session_id, sub1]
		]);

		const collected = collectTrajectoryWithSubagents(main, all);
		expect([...collected.keys()]).toEqual(['main', 'sub-1']);
	});
});
