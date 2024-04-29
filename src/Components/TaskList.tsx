import React, { useEffect, useState } from 'react';
import type { IpcRendererEvent } from '../../electron/preload';
import '../Styles/TaskList.css';
import { Task } from '../Data/Interfaces/taskTypes';
import delImg from '../Assets/Trash.png';
import editImg from '../Assets/edit.png'
import divider from '../Assets/divider2.png';

function TaskList() {
  const ipcRenderer = (window as any).ipcRenderer;
  const [taskList, setTasks] = useState<Task[]>([]);
  const [tasksToDelete, setTasksToDelete] = useState<number[]>([]);
  const [getTasks, setGetTasks] = useState(false);
  const hasConfirmedTasks = taskList.some(task => task.idTask !== undefined && task.TaskStatus);

  useEffect(() => {
    setGetTasks(true);
  }, [])

  useEffect(() => {
    const handleShowTasks = (event: IpcRendererEvent, tasks: Task[]) => {
      setTasks(tasks.reverse());
      setGetTasks(false);
      console.log(event)
    };
    ipcRenderer.send('getTasks');
    ipcRenderer.on('showTasks', handleShowTasks);

    return () => {
      ipcRenderer.removeAllListeners('showTasks', handleShowTasks);
    };
  }, [getTasks]);

  const handleDeleteBtnClick = () => {
    if (tasksToDelete.length > 0) {
      ipcRenderer.send('deleteTask', tasksToDelete);
    }
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

  const handleEditBtnClick = async (task: Task) => {
    try {
      await ipcRenderer.send('editTask', task.idTask); // Await the promise for synchronous behavior
      console.log('Task edit request sent successfully'); // Optional success message
    } catch (error) {
      console.error('Error sending edit request:', error); // Handle errors gracefully
    }
  };

  const handleCompleteBtnClick = async (task: Task) => {
    try {
      await setTasksToDelete(tasksToDelete.filter(id => id !== task.idTask));
      await ipcRenderer.send('changeStatusTask', task.idTask); // Await the promise for synchronous behavior
      console.log('Task edit request sent successfully'); // Optional success message
    } catch (error) {
      console.error('Error sending edit request:', error); // Handle errors gracefully
    }
  };

  const handleEditTask = (event: IpcRendererEvent) => {
    setGetTasks(true)
    if (1 < 2) {
      console.log(event)
    }
    ipcRenderer.removeAllListeners('taskAdded');
  };

  ipcRenderer.on('taskAdded', handleEditTask);

  useEffect(() => {
    const handleDeleteTaskSuccess = (event: IpcRendererEvent, deletedIds: number[]) => {
      const updatedTaskList = taskList.filter(task => !deletedIds.includes(task.idTask || 0));
      setTasks(updatedTaskList);
      if (1 < 2) {
        console.log(event)
      }

      setTasksToDelete([]);
    };

    ipcRenderer.on('deleteTaskSuccess', handleDeleteTaskSuccess);

    return () => {
      ipcRenderer.removeAllListeners('deleteTaskSuccess', handleDeleteTaskSuccess);
    };
  }, [taskList]);

  return (
    <div>

      <div className="w-full flex justify-end items-center mx-auto space-y-2 max-w-lg">
        <div className='DeleteBtn'>
          <img
            src={delImg}
            className={
              tasksToDelete.length > 0
                ? "DeleteOn"
                : "DeleteOff"
            }
            onClick={handleDeleteBtnClick}
          />
        </div>
      </div>

      <div id="taskList" className="w-full items-center mx-auto space-y-2 max-w-lg">

        {taskList
          .filter(task => task.idTask !== undefined && !task.TaskStatus)
          .map((task, index) => (
            <div className="taskContainer" key={index}>
              <div className="taskImgCont">
                <label className="imgBtn">
                  <input type="checkbox" checked={false} className="checkFinish" onClick={() => handleCompleteBtnClick(task)} />
                  <div className="taskImage"></div>
                </label>
              </div>
              <div className="taskContent">
                <h1 className="taskName">{task.TaskName}</h1>
                <div className="taskDesc"><h3>{task.TaskDesc}</h3></div>
              </div>
              <div className='taskControls'>
                <div className='taskCheckCont'>
                  <img
                    src={editImg}
                    className='imgBtn editBtn'
                    onClick={() => handleEditBtnClick(task)}
                  />
                </div>
                <div className="taskCheckCont">
                  <label className="imgBtn">
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
            </div>
          ))}
        {hasConfirmedTasks && <div className='divider'><img src={divider} className="dividerImg" alt="Divider"></img></div>}
        {taskList
          .filter(task => task.idTask !== undefined && task.TaskStatus)
          .map((task, index) => (
            <div className="taskContainerFinished" key={index}>
              <div className="taskImgCont">
                <label className="imgBtn">
                  <input type="checkbox" checked={true} className="checkFinish" onClick={() => handleCompleteBtnClick(task)} />
                  <div className="taskImage"></div>
                </label>
              </div>
              <div className="taskContent">
                <h1 className="taskName">{task.TaskName}</h1>
                <div className="taskDesc"><h3>{task.TaskDesc}</h3></div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default TaskList;
