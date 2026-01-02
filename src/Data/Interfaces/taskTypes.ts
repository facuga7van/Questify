export type FirestoreTimestampLike = {
  seconds: number;
  nanoseconds: number;
};

export interface Task {
    id: string | undefined;
    TaskName: string;
    TaskDesc: string;
    TaskStatus: boolean;
    TaskDiff: number;
    TaskUser: string;
    TaskDueDate: Date | FirestoreTimestampLike | null;
    TaskClass:string;
    TaskDate: FirestoreTimestampLike | null | string | number;
    TaskOrder:number;
  }

  export interface TaskListProps {
    tasksProp: Task[];
  }

  export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
  }