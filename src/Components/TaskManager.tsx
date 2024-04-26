import React from 'react';
import Form from './Form';
import TaskList from './TaskList';

const TaskManager: React.FC = () => {
  
  return (
    <div>
      <Form />
      <TaskList />
    </div>
  );
}

export default TaskManager;
