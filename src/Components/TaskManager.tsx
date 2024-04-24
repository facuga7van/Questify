import React, { useState } from 'react';
import Form from './Form';
import TaskList from './TaskList'; 

interface Task {
  TaskName: string;
  TaskDesc: string;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Task>({ TaskName: '', TaskDesc: '' });

  const handleAddTask: (newTask: Task) => void = (newTask) => {
    setTasks([newTask]); // Reemplaza el array existente con el nuevo array que contiene la tarea recién agregada
    setNewTask({ TaskName: '', TaskDesc: '' }); // Vacía el objeto newTask
  };

  return (
    <div>
      <Form onAddTask={handleAddTask} />
      <TaskList tasksProp={tasks} />
    </div>
  );
}

export default TaskManager;
