import React, { useEffect, useState } from 'react';
import type { IpcRendererEvent } from '../../electron/preload';
import '../Styles/TaskList.css';
import { Task, TaskListProps} from '../Data/Interfaces/taskTypes';

function TaskList({ tasksProp }: TaskListProps) {
  const ipcRenderer = (window as any).ipcRenderer;
  const [taskList, setTasks] = useState<Task[]>(tasksProp);
  const [tasksToDelete, setTasksToDelete] = useState<number[]>([]); 

  useEffect(() => {
    tasksProp = [];
  },[])

  useEffect(() => {
    const handleShowTasks = (event: IpcRendererEvent, tasks: Task[]) => {
      const updatedTasks = tasks.concat(tasksProp);
      setTasks(updatedTasks.reverse());
      tasksProp = [];
    };
    console.log('sexo')
    ipcRenderer.send('getTasks');
    ipcRenderer.on('showTasks', handleShowTasks);
    return () => {
      ipcRenderer.removeAllListeners('showTasks', handleShowTasks);
    };
  }, [tasksProp]);

  const handleDeleteBtnClick = () => {
    ipcRenderer.send('deleteTask', tasksToDelete);
  };

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('taskList');
      if (container) { 
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

  const handleCheckDeleteChange = async (event: React.ChangeEvent<HTMLInputElement>, task: Task) => {
    const taskId = task.idTask || 0; 
    if (event.target.checked) {
      await setTasksToDelete([...tasksToDelete, taskId]);
    } else {
      await setTasksToDelete(tasksToDelete.filter(id => id !== taskId)); 
    }
  };

  useEffect(() => {
    const handleDeleteTaskSuccess = (event: IpcRendererEvent, deletedIds: number[]) => {
      const updatedTaskList = taskList.filter(task => !deletedIds.includes(task.idTask || 0));
      setTasks(updatedTaskList);
      setTasksToDelete([]); 
    };

    ipcRenderer.on('deleteTaskSuccess', handleDeleteTaskSuccess);

    return () => {
      ipcRenderer.removeAllListeners('deleteTaskSuccess', handleDeleteTaskSuccess);
    };
  }, [taskList]); 

  return (
    <div>
    {tasksToDelete.length > 0 && ( 
      <div className="w-full flex justify-end items-center mx-auto space-y-2 max-w-lg">
        <button className="DeleteBtn" onClick={handleDeleteBtnClick}>DeleteBtn</button>
      </div>
    )}

    <div id="taskList" className="w-full items-center mx-auto space-y-2 max-w-lg">
       
      {taskList
        .filter(task => task.idTask !== undefined) 
        .map((task, index) => (
          <div className="taskContainer" key={index}>
            <div className="taskImgCont">
            <label className="checkbox-label">
            <input type="checkbox" className="checkFinish" />
              <div className="taskImage"></div>
              </label>
            </div>
            <div className="taskContent">
              <h1 className="taskName">{task.TaskName}</h1>
              <h3 className="taskDesc">{task.TaskDesc}</h3>
            </div>
            <div className="taskCheckCont">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkDelete"
                  onChange={(event) => handleCheckDeleteChange(event, task)}
                  checked={tasksToDelete.includes(task.idTask || 0)} 
                />
                <div className="taskCheck"></div>
              </label>
            </div>
          </div>
        ))}
    </div>
    </div>
  );
}

export default TaskList;
