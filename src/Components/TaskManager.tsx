import React, { useState } from "react";
import Form from "./Form";
import TaskList from "./TaskList";
import type { Task } from "@/Data/Interfaces/taskTypes";


const TaskManager: React.FC = () => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  return (
    <div>
      
      <Form
        editingTask={editingTask}
        onSaved={() => setEditingTask(null)}
      />
      <TaskList onEditTask={(t) => setEditingTask(t)} />
    </div>
  );
}

export default TaskManager;
