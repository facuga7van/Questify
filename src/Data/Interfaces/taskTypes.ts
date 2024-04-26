export interface Task {
    idTask: any;
    TaskName: string;
    TaskDesc: string;
    TaskStatus: any;
  }

  export interface TaskListProps {
    tasksProp: Task[]; // Cambia el nombre del prop para evitar la duplicación
  }