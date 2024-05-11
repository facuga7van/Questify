export interface Task {
    idTask: any;
    TaskName: string;
    TaskDesc: string;
    TaskStatus: any;
    TaskDiff: number;
  }

  export interface TaskListProps {
    tasksProp: Task[];
  }

  export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  }