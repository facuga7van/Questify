export interface Task {
    idTask: any;
    TaskName: string;
    TaskDesc: string;
  }

  export interface TaskListProps {
    tasksProp: Task[]; // Cambia el nombre del prop para evitar la duplicación
  }