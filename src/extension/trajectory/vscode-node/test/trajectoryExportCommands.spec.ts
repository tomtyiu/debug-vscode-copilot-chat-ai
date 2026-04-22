/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { describe, expect, it } from 'vitest';
import { TRAJECTORY_SCHEMA_VERSION, type IAgentTrajectory } from '../../../../platform/trajectory/common/trajectoryTypes';
import { collectTrajectoryWithSubagents } from '../../common/trajectoryExport';

function makeTrajectory(sessionId: string, subagentRefs: string[] = []): IAgentTrajectory {
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
					subagent_trajectory_ref: subagentRefs.map(id => ({ session_id: id, trajectory_path: `${id}.jsonl` }))
				}]
			}
		}]
	};
}

describe('trajectory export command helper', () => {
	it('exports the main trajectory and one referenced subagent trajectory', () => {
		const main = makeTrajectory('main', ['sub-a']);
		const sub = makeTrajectory('sub-a');
		const allTrajectories = new Map<string, IAgentTrajectory>([
			[main.session_id, main],
			[sub.session_id, sub]
		]);

		const collected = collectTrajectoryWithSubagents(main, allTrajectories);
		expect([...collected.keys()]).toEqual(['main', 'sub-a']);
	});

	it('exports all linked trajectories for multi-level recursion (A -> B -> C)', () => {
		const a = makeTrajectory('A', ['B']);
		const b = makeTrajectory('B', ['C']);
		const c = makeTrajectory('C');
		const allTrajectories = new Map<string, IAgentTrajectory>([
			[a.session_id, a],
			[b.session_id, b],
			[c.session_id, c]
		]);

		const collected = collectTrajectoryWithSubagents(a, allTrajectories);
		expect([...collected.keys()]).toEqual(['A', 'B', 'C']);
	});

	it('terminates safely for cycles (A -> B -> A) without infinite recursion', () => {
		const a = makeTrajectory('A', ['B']);
		const b = makeTrajectory('B', ['A']);
		const allTrajectories = new Map<string, IAgentTrajectory>([
			[a.session_id, a],
			[b.session_id, b]
		]);

		const collected = collectTrajectoryWithSubagents(a, allTrajectories);
		expect([...collected.keys()]).toEqual(['A', 'B']);
	});

	it('skips missing referenced subagent session IDs without failure', () => {
		const a = makeTrajectory('A', ['missing-subagent']);
		const allTrajectories = new Map<string, IAgentTrajectory>([
			[a.session_id, a]
		]);

		const collected = collectTrajectoryWithSubagents(a, allTrajectories);
		expect([...collected.keys()]).toEqual(['A']);
	});
});
