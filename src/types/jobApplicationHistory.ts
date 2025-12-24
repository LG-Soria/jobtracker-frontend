import { JobStatus } from './jobApplication';

export type JobApplicationHistoryType = 'CREATED' | 'STATUS_CHANGED';

export type JobApplicationHistoryEntry = {
  id: string;
  jobApplicationId: string;
  type: JobApplicationHistoryType;
  meta: {
    from?: JobStatus;
    to?: JobStatus;
    [key: string]: unknown;
  };
  createdAt: string;
  actorUserId?: string | null;
};
