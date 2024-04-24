import React, { useEffect, useState } from 'react';
import type { IpcRendererEvent } from '../../electron/preload';
import '../Styles/TaskList.css';

interface Task {
  TaskName: string;
  TaskDesc: string;
}

interface TaskListProps {
  tasksProp: Task[]; // Cambia el nombre del prop para evitar la duplicación
}

function TaskList({ tasksProp }: TaskListProps) {
  const ipcRenderer = (window as any).ipcRenderer;
  const [tasks, setTasks] = useState<Task[]>(tasksProp); // Utiliza tasksProp para inicializar el estado

  useEffect(() => {
    const handleShowTasks = (event: IpcRendererEvent, newTasks: Task[]) => {
      setTasks(newTasks.concat(tasksProp));
    };

    ipcRenderer.send('getTasks');
    ipcRenderer.on('showTasks', handleShowTasks);
    return () => {
      ipcRenderer.removeListener('showTasks', handleShowTasks);
    };
  }, [tasksProp]);

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('taskList');
      if (container) { // Verificar si el elemento existe
        const windowHeight = window.innerHeight;
        const minHeight = 0.01 * windowHeight;
        const maxHeight = 0.50 * windowHeight;
  
        const containerHeight = minHeight + (maxHeight - minHeight) * (windowHeight / screen.height);
  
        container.style.height = containerHeight + 'px';
      }
    };
  
    window.addEventListener('resize', handleResize);
    handleResize();
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  

  return (
    <div id="taskList" className="w-full items-center mx-auto space-y-2 max-w-lg">

        {tasks.slice().reverse().map((task, index) => (
          <div className="taskContainer" key={index}>
            <div className="taskImgCont">
              <div className="taskImage"></div>
            </div>
            <div className="taskContent">
              <h1 className="taskName">{task.TaskName}</h1>
              <h3 className="taskDesc">{task.TaskDesc}</h3>
            </div>
          </div>
        ))}

  </div>
  );
}

export default TaskList;
