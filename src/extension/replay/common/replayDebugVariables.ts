/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ChatStep } from './chatReplayResponses';

export interface ReplayDebugVariable {
	name: string;
	value: string;
	type: string;
}

export function chatStepToDebugVariables(step: ChatStep): ReplayDebugVariable[] {
	const variables: ReplayDebugVariable[] = [];

	addVariable(variables, 'kind', step.kind);
	addVariable(variables, 'line', step.line);

	if ('id' in step) {
		addVariable(variables, 'id', step.id);
	}
	if ('query' in step) {
		addVariable(variables, 'query', step.query);
	}

	switch (step.kind) {
		case 'request':
			addVariable(variables, 'payload.prompt', step.prompt);
			addVariable(variables, 'payload.result', step.result);
			break;
		case 'toolCall':
			addVariable(variables, 'payload.toolName', step.toolName);
			addVariable(variables, 'payload.args', step.args);
			addVariable(variables, 'payload.edits', step.edits);
			addVariable(variables, 'payload.results', step.results);
			break;
		case 'userQuery':
			break;
	}

	return variables;
}

function addVariable(target: ReplayDebugVariable[], name: string, rawValue: unknown): void {
	target.push({
		name,
		value: formatValue(rawValue),
		type: getType(rawValue)
	});
}

function formatValue(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}
	if (value === undefined) {
		return 'undefined';
	}
	if (value === null) {
		return 'null';
	}
	if (typeof value === 'object') {
		return JSON.stringify(value);
	}
	return String(value);
}

function getType(value: unknown): string {
	if (Array.isArray(value)) {
		return 'array';
	}
	if (value === null) {
		return 'null';
	}
	return typeof value;
}
