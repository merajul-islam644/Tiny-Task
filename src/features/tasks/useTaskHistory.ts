import { useQuery } from "@tanstack/react-query";
import { blocksClient } from "../../lib/blocks/client";

export type TaskHistoryRecord = {
  ItemId: string;
  TaskId: string;
  TaskTitle?: string;
  Action: string;
  ChangedFields?: string;
  Actor: string;
  Owner: string;
  OccurredOn: string;
};

type ListResponse = {
  data?: { getTaskHistories?: { items?: TaskHistoryRecord[] } };
};

const history = blocksClient.data.collection<TaskHistoryRecord>("TaskHistory", {
  fields: ["TaskId", "TaskTitle", "Action", "ChangedFields", "Actor", "Owner", "OccurredOn"]
});

export function useTaskHistory(taskId: string | undefined) {
  return useQuery({
    enabled: Boolean(taskId),
    queryFn: async () => {
      const response = (await history.list({
        pageNo: 1,
        pageSize: 50,
        filter: { TaskId: taskId },
        sort: { OccurredOn: -1 }
      })) as unknown as ListResponse;
      return response.data?.getTaskHistories?.items ?? [];
    },
    queryKey: ["task-history", taskId]
  });
}
