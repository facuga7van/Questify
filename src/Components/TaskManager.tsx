import React, { useState } from 'react';
import Form from './Form';
import TaskList from './TaskList';
import { Task } from '../Data/Interfaces/taskTypes';

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask: (newTask: Task) => void = (newTask) => {
    setTasks([newTask]); // Reemplaza el array existente con el nuevo array que contiene la tarea recién agregada
  };
  
  return (
    <div>
      <Form onAddTask={handleAddTask} />
      <TaskList tasksProp={tasks} />
    </div>
  );
}

export default TaskManager;
