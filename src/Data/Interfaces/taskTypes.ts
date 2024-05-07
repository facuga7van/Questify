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
