export interface Task {
    id: any;
    TaskName: string;
    TaskDesc: string;
    TaskStatus: any;
    TaskDiff: number;
    TaskUser:User;
    TaskDueDate:Date;
    TaskClass:string;
    TaskDate: any;
  }

  export interface TaskListProps {
    tasksProp: Task[];
  }

  export interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
  }