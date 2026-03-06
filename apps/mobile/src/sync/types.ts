export const SYNC_ENTITY_TYPES = [
  'gyms',
  'sessions',
  'session_exercises',
  'exercise_sets',
  'exercise_definitions',
  'exercise_muscle_mappings',
  'exercise_tag_definitions',
  'session_exercise_tags',
] as const;

export type SyncEntityType = (typeof SYNC_ENTITY_TYPES)[number];

export const SYNC_EVENT_TYPES = ['upsert', 'delete', 'attach', 'detach', 'reorder', 'complete'] as const;

export type SyncEventType = (typeof SYNC_EVENT_TYPES)[number];

export const SYNC_ENTITY_EVENT_TYPES: Record<SyncEntityType, readonly SyncEventType[]> = {
  gyms: ['upsert', 'delete'],
  sessions: ['upsert', 'delete', 'complete'],
  session_exercises: ['upsert', 'delete', 'reorder'],
  exercise_sets: ['upsert', 'delete', 'reorder'],
  exercise_definitions: ['upsert', 'delete'],
  exercise_muscle_mappings: ['attach', 'detach'],
  exercise_tag_definitions: ['upsert', 'delete'],
  session_exercise_tags: ['attach', 'detach'],
};

export type SyncEventEnvelope = {
  event_id: string;
  sequence_in_device: number;
  occurred_at_ms: number;
  entity_type: SyncEntityType;
  entity_id: string;
  event_type: SyncEventType;
  payload: Record<string, unknown>;
  schema_version?: number;
  trace_id?: string;
};

export type SyncIngestRequest = {
  device_id: string;
  batch_id: string;
  sent_at_ms: number;
  events: SyncEventEnvelope[];
};

export type SyncIngestSuccessResponse = {
  status: 'SUCCESS';
};

export type SyncIngestFailureResponse = {
  status: 'FAILURE';
  error_index: number;
  should_retry: boolean;
  message: string;
  error_event_id?: string;
};

export type SyncIngestResponse = SyncIngestSuccessResponse | SyncIngestFailureResponse;

export const assertSyncEntityEventType = (entityType: SyncEntityType, eventType: SyncEventType) => {
  if (!SYNC_ENTITY_EVENT_TYPES[entityType].includes(eventType)) {
    throw new Error(`Unsupported sync event type "${eventType}" for entity "${entityType}"`);
  }
};
