/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { IAgentTrajectory, IObservationResult, ITrajectoryStep } from '../../../platform/trajectory/common/trajectoryTypes';

/**
 * Recursively collect a trajectory and all referenced subagent trajectories.
 */
export function collectTrajectoryWithSubagents(
	mainTrajectory: IAgentTrajectory,
	allTrajectories: Map<string, IAgentTrajectory>
): Map<string, IAgentTrajectory> {
	const result = new Map<string, IAgentTrajectory>();
	const visited = new Set<string>();

	const collect = (trajectory: IAgentTrajectory) => {
		if (visited.has(trajectory.session_id)) {
			return;
		}
		visited.add(trajectory.session_id);
		result.set(trajectory.session_id, trajectory);

		const steps: ITrajectoryStep[] = Array.isArray(trajectory?.steps) ? trajectory.steps : [];
		for (const step of steps) {
			const results: IObservationResult[] = Array.isArray(step.observation?.results) ? step.observation.results : [];
			for (const observation of results) {
				for (const ref of observation.subagent_trajectory_ref ?? []) {
					const subagentTrajectory = allTrajectories.get(ref.session_id);
					if (subagentTrajectory) {
						collect(subagentTrajectory);
					}
				}
			}
		}
	};

	collect(mainTrajectory);
	return result;
}
